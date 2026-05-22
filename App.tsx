import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppNavigator, AppScreenKey} from './src/navigation/AppNavigator';
import {
  createDefaultPolicies,
  hydrateAppState,
  persistActivityEvent,
  persistAutomationProfiles,
  persistDevice,
  persistGlobalLimit,
  persistHotspotStatus,
  persistPolicies,
  persistTimer,
  persistUsageSnapshot,
} from './src/services/appStateService';
import {appendActivity} from './src/services/activityService';
import {buildBackupPayload, buildUsageCsv} from './src/services/exportService';
import {buildInsightsSummary} from './src/services/insightsService';
import {evaluatePolicies} from './src/services/policyEngineService';
import {
  initializeRevenueCat,
  purchasePremium,
  refreshEntitlement,
} from './src/services/subscriptionService';
import {computeTimerEnd} from './src/services/timerService';
import {createEstimatedUsageSnapshots} from './src/services/usageMonitoringService';
import {loadCapabilityState} from './src/services/capabilityService';
import {
  blockDevice,
  loadConnectedDevices,
  unblockDevice,
  updateDeviceDetails,
} from './src/services/deviceService';
import {getNativeHotspotStatus, nativeSetHotspotEnabled} from './src/native/hotspotNative';
import {store} from './src/store';
import {useAppDispatch, useAppSelector} from './src/store/hooks';
import {
  addActivity,
  addUsageSnapshot,
  hydrateHotspotState,
  setActivity,
  setCapability,
  setDevices,
  setGlobalLimit,
  setHotspotStatus,
  setTimer,
  upsertDevice,
  upsertAutomationProfile,
  upsertPolicy,
} from './src/store/slices/hotspotSlice';
import {setPremiumStatus, setSubscriptionMetadata} from './src/store/slices/subscriptionSlice';
import {
  ActivityEvent,
  AutomationProfile,
  CapabilityState,
  ConnectedDevice,
  ControlAttemptResult,
  DataLimit,
  DevicePolicy,
  HotspotStatus,
  HotspotTimer,
  UsageSnapshot,
} from './src/types/domain';

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <HotspotManagerApp />
      </SafeAreaProvider>
    </Provider>
  );
};

const HotspotManagerApp = () => {
  const dispatch = useAppDispatch();
  const hotspot = useAppSelector(state => state.hotspot);
  const subscription = useAppSelector(state => state.subscription);
  const [activeScreen, setActiveScreen] = useState<AppScreenKey>('dashboard');
  const [nowMs, setNowMs] = useState(Date.now());
  const handledTimerExpiry = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const commitActivity = useCallback(async (event: ActivityEvent) => {
    dispatch(addActivity(event));
    await persistActivityEvent(event);
  }, [dispatch]);

  const commitDevice = useCallback(async (device: ConnectedDevice) => {
    dispatch(upsertDevice(device));
    await persistDevice(device);
  }, [dispatch]);

  const applyPolicyEvaluation = useCallback(async (
    capability: CapabilityState,
    devices: ConnectedDevice[],
    usageSnapshots: UsageSnapshot[],
    policies: DevicePolicy[],
    globalLimit: DataLimit,
    existingActivity: ActivityEvent[],
  ) => {
    const result = evaluatePolicies({
      capability,
      devices,
      policies,
      usageSnapshots,
      globalLimit,
      now: new Date(),
    });

    dispatch(setDevices(result.deviceUpdates));
    for (const device of result.deviceUpdates) {
      await persistDevice(device);
    }

    if (result.activity.length > 0) {
      const merged = result.activity.reduce(
        (events, event) => appendActivity(events, event),
        existingActivity,
      );
      dispatch(setActivity(merged));
      for (const event of result.activity) {
        await persistActivityEvent(event);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    const bootstrap = async () => {
      const capability = await loadCapabilityState();
      const discoveredDevices = await loadConnectedDevices();
      const nativeHotspotStatus = await getNativeHotspotStatus();
      const hydrated = await hydrateAppState(discoveredDevices);

      let nextUsage = hydrated.usageSnapshots;
      let nextActivity = hydrated.activity;

      if (nextUsage.length === 0 && capability.canEstimateUsage && hydrated.devices.length > 0) {
        const estimated = createEstimatedUsageSnapshots(hydrated.devices, Date.now());
        nextUsage = estimated;
        for (const snapshot of estimated) {
          await persistUsageSnapshot(snapshot);
        }
        const event: ActivityEvent = {
          id: `activity-estimated-usage-${Date.now()}`,
          type: 'system',
          title: 'Approximate monitoring enabled',
          details: 'Usage insights are based on estimated device activity on this device.',
          timestamp: Date.now(),
          severity: 'info',
        };
        nextActivity = appendActivity(nextActivity, event);
        await persistActivityEvent(event);
      }

      dispatch(setCapability(capability));
      dispatch(
        hydrateHotspotState({
          ...hydrated,
          usageSnapshots: nextUsage,
          activity: nextActivity,
          hotspotStatus: {
            ...hydrated.hotspotStatus,
            ...nativeHotspotStatus,
            connectedDeviceCount: hydrated.devices.length,
            lastRefreshedAt: Date.now(),
          },
        }),
      );

      await initializeRevenueCat();
      const snapshot = await refreshEntitlement();
      dispatch(
        setPremiumStatus({
          active: snapshot.active,
          source: snapshot.source,
        }),
      );
      dispatch(
        setSubscriptionMetadata({
          expiresAt: snapshot.expiresAt,
          lastValidatedAt: snapshot.lastValidatedAt,
        }),
      );

      await applyPolicyEvaluation(
        capability,
        hydrated.devices,
        nextUsage,
        hydrated.policies.length > 0 ? hydrated.policies : createDefaultPolicies(),
        hydrated.globalLimit,
        nextActivity,
      );
    };

    bootstrap().catch(() => {
      Alert.alert(
        'Setup warning',
        'Initial capability, persistence, or billing sync failed. App will continue in fallback mode.',
      );
    });
  }, [applyPolicyEvaluation, dispatch]);

  useEffect(() => {
    if (!hotspot.timer?.active) {
      return;
    }
    if (nowMs < hotspot.timer.endsAt) {
      return;
    }
    if (handledTimerExpiry.current === hotspot.timer.startedAt) {
      return;
    }

    handledTimerExpiry.current = hotspot.timer.startedAt;
    const expire = async () => {
      dispatch(setTimer(null));
      await persistTimer(null);
      await commitActivity({
        id: `timer-expired-${hotspot.timer?.startedAt}`,
        type: 'timerExpired',
        title: 'Timer expired',
        details: 'The current hotspot timer reached zero.',
        timestamp: Date.now(),
        severity: 'warning',
      });
    };

    expire().catch(() => undefined);
  }, [commitActivity, dispatch, hotspot.timer, nowMs]);

  const insightsSummary = useMemo(
    () =>
      buildInsightsSummary(
        hotspot.devices,
        hotspot.usageSnapshots,
        hotspot.policies,
        hotspot.activity,
      ),
    [hotspot.activity, hotspot.devices, hotspot.policies, hotspot.usageSnapshots],
  );

  const usageCsv = useMemo(
    () => buildUsageCsv(hotspot.devices, hotspot.usageSnapshots),
    [hotspot.devices, hotspot.usageSnapshots],
  );

  const backupPayload = useMemo(
    () =>
      buildBackupPayload({
        devices: hotspot.devices,
        usageSnapshots: hotspot.usageSnapshots,
        activity: hotspot.activity,
        policies: hotspot.policies,
        automationProfiles: hotspot.automationProfiles,
      }),
    [
      hotspot.activity,
      hotspot.automationProfiles,
      hotspot.devices,
      hotspot.policies,
      hotspot.usageSnapshots,
    ],
  );

  const onToggleDeviceBlock = async (device: ConnectedDevice) => {
    const outcome = device.blocked ? await unblockDevice(device) : await blockDevice(device);
    await commitDevice(outcome.device);
    await commitActivity(
      controlResultToEvent(outcome.result, outcome.device, device.blocked ? 'unblock' : 'block'),
    );
  };

  const onRenameDevice = async (device: ConnectedDevice, nickname: string) => {
    const updated = updateDeviceDetails(device, {nickname});
    await commitDevice(updated);
    await commitActivity({
      id: `device-renamed-${device.id}-${Date.now()}`,
      type: 'system',
      title: 'Device nickname updated',
      details: `${device.displayName} is now labeled ${nickname || device.displayName}.`,
      timestamp: Date.now(),
      severity: 'info',
      deviceId: device.id,
    });
  };

  const onToggleTrusted = async (device: ConnectedDevice) => {
    const updated = updateDeviceDetails(device, {trusted: !device.trusted});
    await commitDevice(updated);
    await commitActivity({
      id: `device-trust-${device.id}-${Date.now()}`,
      type: 'system',
      title: updated.trusted ? 'Device marked trusted' : 'Device trust removed',
      details: `${updated.nickname || updated.displayName} trust state changed.`,
      timestamp: Date.now(),
      severity: 'info',
      deviceId: device.id,
    });
    await applyPolicyEvaluation(
      hotspot.capability,
      hotspot.devices.map(entry => (entry.id === updated.id ? updated : entry)),
      hotspot.usageSnapshots,
      hotspot.policies,
      hotspot.globalLimit,
      hotspot.activity,
    );
  };

  const onUpdateGlobalLimit = async (limit: DataLimit) => {
    dispatch(setGlobalLimit(limit));
    await persistGlobalLimit(limit);
    await commitActivity({
      id: `limit-updated-${Date.now()}`,
      type: 'system',
      title: 'Global budget updated',
      details: `Budget set to ${limit.periodType} ${limit.byteLimit} bytes with a ${limit.warningThresholdPct}% warning threshold.`,
      timestamp: Date.now(),
      severity: 'info',
    });
    await applyPolicyEvaluation(
      hotspot.capability,
      hotspot.devices,
      hotspot.usageSnapshots,
      hotspot.policies,
      limit,
      hotspot.activity,
    );
  };

  const onStartTimer = async (durationMinutes: number) => {
    const startedAt = Date.now();
    const timer: HotspotTimer = {
      startedAt,
      durationSeconds: durationMinutes * 60,
      endsAt: computeTimerEnd(startedAt, durationMinutes * 60),
      active: true,
      presetLabel: `${durationMinutes}m`,
    };
    dispatch(setTimer(timer));
    await persistTimer(timer);
    await commitActivity({
      id: `timer-start-${startedAt}`,
      type: 'timerStarted',
      title: 'Timer started',
      details: `A ${durationMinutes} minute timer is now active.`,
      timestamp: startedAt,
      severity: 'info',
    });
  };

  const onStopTimer = async () => {
    dispatch(setTimer(null));
    await persistTimer(null);
    await commitActivity({
      id: `timer-stop-${Date.now()}`,
      type: 'timerStopped',
      title: 'Timer stopped',
      details: 'The active hotspot timer was stopped.',
      timestamp: Date.now(),
      severity: 'info',
    });
  };

  const onToggleHotspot = async (enabled: boolean) => {
    const result = await nativeSetHotspotEnabled(enabled);
    const nextStatus: HotspotStatus = result.applied
      ? {
          ...hotspot.hotspotStatus,
          enabled,
          lastRefreshedAt: Date.now(),
        }
      : hotspot.hotspotStatus;

    dispatch(setHotspotStatus(nextStatus));
    await persistHotspotStatus(nextStatus);
    await commitActivity({
      id: `hotspot-toggle-${Date.now()}`,
      type: 'system',
      title: enabled ? 'Hotspot start attempted' : 'Hotspot stop attempted',
      details: result.message,
      timestamp: Date.now(),
      severity: result.applied ? 'info' : 'warning',
    });
  };

  const onCaptureUsage = async () => {
    if (hotspot.devices.length === 0) {
      Alert.alert('No devices', 'Connect a device before capturing a usage snapshot.');
      return;
    }

    const snapshots = createEstimatedUsageSnapshots(hotspot.devices, Date.now());
    for (const snapshot of snapshots) {
      dispatch(addUsageSnapshot(snapshot));
      await persistUsageSnapshot(snapshot);
    }
    await commitActivity({
      id: `usage-capture-${Date.now()}`,
      type: 'system',
      title: 'Approximate usage captured',
      details: 'A new approximate usage snapshot was recorded for connected devices.',
      timestamp: Date.now(),
      severity: 'info',
    });
    await applyPolicyEvaluation(
      hotspot.capability,
      hotspot.devices,
      [...hotspot.usageSnapshots, ...snapshots],
      hotspot.policies,
      hotspot.globalLimit,
      hotspot.activity,
    );
  };

  const onAddPolicy = async (deviceId?: string) => {
    const targetDevice = hotspot.devices.find(device => device.id === deviceId) ?? hotspot.devices[0];
    const policy: DevicePolicy = {
      id: `policy-${deviceId || 'global'}-${Date.now()}`,
      name: targetDevice
        ? `${targetDevice.nickname || targetDevice.displayName} cap`
        : 'Global automation',
      scope: targetDevice ? 'device' : 'global',
      deviceId: targetDevice?.id,
      enabled: true,
      byteCap: 1024 * 1024 * 1024,
      warningThresholdPct: 80,
      overageAction: hotspot.capability.canBlockClients ? 'block' : 'notify',
      allowTrustedBypass: true,
      fallbackBehavior: 'notify_only',
    };

    dispatch(upsertPolicy(policy));
    await persistPolicies([...hotspot.policies, policy]);
    await commitActivity({
      id: `policy-created-${policy.id}`,
      type: 'policyApplied',
      title: 'Automation policy created',
      details: `${policy.name} is now active.`,
      timestamp: Date.now(),
      severity: 'info',
      deviceId: policy.deviceId,
    });
  };

  const onToggleAutomationProfile = async (profile: AutomationProfile) => {
    const updated = {
      ...profile,
      enabled: !profile.enabled,
    };
    dispatch(upsertAutomationProfile(updated));
    await persistAutomationProfiles(
      hotspot.automationProfiles.map(entry =>
        entry.id === updated.id ? updated : entry,
      ),
    );
    await commitActivity({
      id: `automation-toggle-${updated.id}-${Date.now()}`,
      type: 'policyApplied',
      title: updated.enabled ? 'Automation enabled' : 'Automation disabled',
      details: `${updated.name} is now ${updated.enabled ? 'active' : 'inactive'}.`,
      timestamp: Date.now(),
      severity: 'info',
    });
  };

  const onUpgradePress = async () => {
    const purchased = await purchasePremium();
    if (!purchased) {
      Alert.alert(
        'Premium purchase unavailable',
        'No purchasable package was found. Configure RevenueCat products first.',
      );
      return;
    }
    const snapshot = await refreshEntitlement();
    dispatch(
      setPremiumStatus({
        active: snapshot.active,
        source: snapshot.source,
      }),
    );
    dispatch(
      setSubscriptionMetadata({
        expiresAt: snapshot.expiresAt,
        lastValidatedAt: snapshot.lastValidatedAt,
      }),
    );
  };

  return (
    <AppNavigator
      activeScreen={activeScreen}
      setActiveScreen={setActiveScreen}
      capability={hotspot.capability}
      premiumActive={subscription.active}
      hotspotStatus={hotspot.hotspotStatus}
      globalUsageBytes={hotspot.globalUsageBytes}
      globalLimit={hotspot.globalLimit}
      devices={hotspot.devices}
      timer={hotspot.timer}
      activity={hotspot.activity}
      policies={hotspot.policies}
      automationProfiles={hotspot.automationProfiles}
      insightsSummary={insightsSummary}
      usageCsv={usageCsv}
      backupPayload={backupPayload}
      nowMs={nowMs}
      onToggleHotspot={onToggleHotspot}
      onCaptureUsage={onCaptureUsage}
      onToggleDeviceBlock={onToggleDeviceBlock}
      onRenameDevice={onRenameDevice}
      onToggleTrusted={onToggleTrusted}
      onUpdateGlobalLimit={onUpdateGlobalLimit}
      onStartTimer={onStartTimer}
      onStopTimer={onStopTimer}
      onAddPolicy={onAddPolicy}
      onToggleAutomationProfile={onToggleAutomationProfile}
      onUpgradePress={onUpgradePress}
    />
  );
};

const controlResultToEvent = (
  result: ControlAttemptResult,
  device: ConnectedDevice,
  attemptedAction: 'block' | 'unblock',
): ActivityEvent => {
  return {
    id: `device-control-${device.id}-${Date.now()}`,
    type: attemptedAction === 'block' ? 'deviceBlocked' : 'deviceUnblocked',
    title: attemptedAction === 'block' ? 'Device block attempted' : 'Device unblock attempted',
    details: result.message,
    timestamp: Date.now(),
    severity: result.applied ? 'info' : 'warning',
    deviceId: device.id,
  };
};

export default App;
