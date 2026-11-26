import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { saveAppValue } from './src/db/repositories/settingsRepository';
import { openNetworkSettings } from './src/native/hotspotNative';
import { AppNavigator, AppScreenKey } from './src/navigation/AppNavigator';
import {
  hydrateAppState,
  persistActivityEvent,
  persistAutomationProfiles,
  persistDevice,
  persistGlobalLimit,
  persistPolicies,
  persistTimer,
  persistUsageSnapshot,
} from './src/services/appStateService';
import { loadCapabilityState } from './src/services/capabilityService';
import {
  blockDevice,
  loadConnectedDevices,
  unblockDevice,
} from './src/services/deviceService';
import {
  buildBackupPayload,
  buildUsageCsv,
} from './src/services/exportService';
import { buildInsightsSummary } from './src/services/insightsService';
import { evaluatePolicies } from './src/services/policyEngineService';
import {
  purchasePremium,
  refreshEntitlement,
  restorePurchases,
  SubscriptionSnapshot,
} from './src/services/subscriptionService';
import { computeTimerEnd } from './src/services/timerService';
import {
  getBudgetStart,
  getBudgetUsage,
} from './src/services/usageMonitoringService';
import { store } from './src/store';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import {
  addActivity,
  addUsageSnapshot,
  hydrateHotspotState,
  setGlobalLimit,
  setSchedules,
  setTimer,
  upsertAutomationProfile,
  upsertDevice,
  upsertPolicy,
} from './src/store/slices/hotspotSlice';
import {
  setPremiumStatus,
  setSubscriptionMetadata,
} from './src/store/slices/subscriptionSlice';
import {
  ActivityEvent,
  AutomationProfile,
  ConnectedDevice,
  DataLimit,
  DevicePolicy,
  ScheduleRule,
} from './src/types/domain';

const App = () => (
  <Provider store={store}>
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#101b35" />
      <HotspotManagerApp />
    </SafeAreaProvider>
  </Provider>
);

const HotspotManagerApp = () => {
  const dispatch = useAppDispatch();
  const hotspot = useAppSelector(state => state.hotspot);
  const premium = useAppSelector(state => state.subscription.active);
  const [activeScreen, setActiveScreen] = useState<AppScreenKey>('dashboard');
  const [nowMs, setNowMs] = useState(Date.now());
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [setupError, setSetupError] = useState(false);
  const [setupAttempt, setSetupAttempt] = useState(0);
  const runningAction = useRef(false);
  const expiringTimer = useRef<number | null>(null);
  const activityInFlight = useRef(new Set<string>());

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    const interval = setInterval(tick, 1000);
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') {
        tick();
      }
    });
    return () => {
      clearInterval(interval);
      listener.remove();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      const [capability, discovered] = await Promise.all([
        loadCapabilityState(),
        loadConnectedDevices(),
      ]);
      const hydrated = await hydrateAppState(discovered);
      if (active) {
        dispatch(hydrateHotspotState({ ...hydrated, capability }));
        setReady(true);
      }
    };

    bootstrap().catch(() => {
      if (active) {
        setSetupError(true);
      }
    });
    return () => {
      active = false;
    };
  }, [dispatch, setupAttempt]);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      const snapshot = await refreshEntitlement();
      if (active) {
        dispatch(setPremiumStatus(snapshot));
        dispatch(setSubscriptionMetadata(snapshot));
      }
    };
    sync().catch(() => undefined);
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') {
        sync().catch(() => undefined);
      }
    });
    return () => {
      active = false;
      listener.remove();
    };
  }, [dispatch]);

  useEffect(() => {
    const timer = hotspot.timer;
    if (
      !ready ||
      busy ||
      !timer?.active ||
      nowMs < timer.endsAt ||
      AppState.currentState === 'background' ||
      expiringTimer.current === timer.startedAt
    ) {
      return;
    }
    expiringTimer.current = timer.startedAt;
    const expire = async () => {
      const event: ActivityEvent = {
        id: 'timer-expired-' + timer.startedAt,
        type: 'timerExpired',
        title: 'Hotspot timer finished',
        details: 'Turn off the hotspot in system settings when you are ready.',
        timestamp: Date.now(),
        severity: 'warning',
      };
      await persistActivityEvent(event);
      await persistTimer(null);
      dispatch(addActivity(event));
      dispatch(setTimer(null));
      Alert.alert(event.title, event.details);
    };
    expire().catch(() => {
      expiringTimer.current = null;
    });
  }, [busy, dispatch, hotspot.timer, nowMs, ready]);

  // Budget dates and schedules change on minute boundaries.
  const minute = Math.floor(nowMs / 60000);
  const evaluation = useMemo(() => {
    const now = new Date(minute * 60000 + 59999);
    const result = evaluatePolicies({
      capability: hotspot.capability,
      devices: hotspot.devices,
      policies: premium ? hotspot.policies : [],
      schedules: premium ? hotspot.schedules : [],
      usageSnapshots: hotspot.usageSnapshots,
      globalLimit: hotspot.globalLimit,
      now,
    });
    if (
      premium &&
      now.getHours() === 23 &&
      hotspot.automationProfiles.some(
        profile => profile.enabled && profile.kind === 'bedtime',
      )
    ) {
      result.activity.push({
        id: 'bedtime-' + getBudgetStart('daily', now).getTime(),
        type: 'recommendation',
        title: 'Bedtime hotspot reminder',
        details: 'Check whether you still need your hotspot tonight.',
        timestamp: Date.now(),
        severity: 'info',
      });
    }
    return result;
  }, [
    hotspot.automationProfiles,
    hotspot.capability,
    hotspot.devices,
    hotspot.globalLimit,
    hotspot.policies,
    hotspot.schedules,
    hotspot.usageSnapshots,
    minute,
    premium,
  ]);

  useEffect(() => {
    const recordEvents = async () => {
      for (const event of evaluation.activity) {
        if (
          activityInFlight.current.has(event.id) ||
          store.getState().hotspot.activity.some(entry => entry.id === event.id)
        ) {
          continue;
        }
        activityInFlight.current.add(event.id);
        try {
          await persistActivityEvent(event);
          dispatch(addActivity(event));
        } finally {
          activityInFlight.current.delete(event.id);
        }
      }
    };
    if (ready) {
      recordEvents().catch(() => undefined);
    }
  }, [dispatch, evaluation, ready]);

  const globalUsageBytes = useMemo(
    () =>
      getBudgetUsage(
        hotspot.usageSnapshots,
        hotspot.globalLimit.periodType,
        new Date(nowMs),
      ),
    [hotspot.globalLimit.periodType, hotspot.usageSnapshots, nowMs],
  );
  const insightsSummary = useMemo(
    () =>
      buildInsightsSummary(
        hotspot.devices,
        hotspot.usageSnapshots,
        hotspot.policies,
        hotspot.activity,
      ),
    [
      hotspot.activity,
      hotspot.devices,
      hotspot.policies,
      hotspot.usageSnapshots,
    ],
  );

  const run = async (
    action: () => Promise<void>,
    title = 'Could not save change',
  ): Promise<boolean> => {
    if (runningAction.current) {
      return false;
    }
    runningAction.current = true;
    setBusy(true);
    try {
      await action();
      return true;
    } catch (error) {
      if (!(error as { userCancelled?: boolean } | null)?.userCancelled) {
        Alert.alert(title, 'Please try again.');
      }
      return false;
    } finally {
      runningAction.current = false;
      setBusy(false);
    }
  };

  const saveDevice = async (device: ConnectedDevice) => {
    await persistDevice(device);
    dispatch(upsertDevice(device));
  };

  const addDevice = (name: string) =>
    run(async () => {
      const now = Date.now();
      const device: ConnectedDevice = {
        id: 'manual-' + now,
        displayName: name,
        blocked: false,
        trusted: false,
        policyStatus: 'normal',
        firstSeenAt: now,
        lastSeenAt: now,
        connectionCount: 0,
      };
      await saveDevice(device);
      if (
        premium &&
        hotspot.automationProfiles.some(
          profile => profile.enabled && profile.kind === 'unknownDevice',
        )
      ) {
        const event: ActivityEvent = {
          id: 'new-' + device.id,
          type: 'recommendation',
          title: 'New device to review',
          details: name + ' was added to your tracked devices.',
          timestamp: now,
          severity: 'info',
          deviceId: device.id,
        };
        await persistActivityEvent(event);
        dispatch(addActivity(event));
      }
    });

  const logUsage = (device: ConnectedDevice, bytesUsed: number) =>
    run(async () => {
      const timestamp = Date.now();
      const snapshot = {
        id: 'manual-usage-' + device.id + '-' + timestamp,
        deviceId: device.id,
        timestamp,
        bytesUsed,
        periodKey: new Date(timestamp).toISOString().slice(0, 10),
        source: 'manual' as const,
      };
      await persistUsageSnapshot(snapshot);
      dispatch(addUsageSnapshot(snapshot));
    });

  const updateLimit = (limit: DataLimit) =>
    run(async () => {
      await persistGlobalLimit(limit);
      dispatch(setGlobalLimit(limit));
    });

  const startTimer = (minutes: number) =>
    run(async () => {
      if (expiringTimer.current === hotspot.timer?.startedAt) {
        return;
      }
      const startedAt = Date.now();
      const timer = {
        startedAt,
        durationSeconds: minutes * 60,
        endsAt: computeTimerEnd(startedAt, minutes * 60),
        active: true,
        presetLabel: minutes + 'm',
      };
      await persistTimer(timer);
      dispatch(setTimer(timer));
    });

  const stopTimer = () =>
    run(async () => {
      if (expiringTimer.current === hotspot.timer?.startedAt) {
        return;
      }
      await persistTimer(null);
      dispatch(setTimer(null));
    });

  const savePolicy = (policy: DevicePolicy) =>
    run(async () => {
      await persistPolicies([policy]);
      dispatch(upsertPolicy(policy));
    });

  const saveSchedules = (schedules: ScheduleRule[]) =>
    run(async () => {
      await saveAppValue('schedules', schedules);
      dispatch(setSchedules(schedules));
    });

  const toggleProfile = (profile: AutomationProfile) =>
    run(async () => {
      const updated = { ...profile, enabled: !profile.enabled };
      await persistAutomationProfiles([updated]);
      dispatch(upsertAutomationProfile(updated));
    });

  const syncSubscription = (snapshot: SubscriptionSnapshot) => {
    dispatch(setPremiumStatus(snapshot));
    dispatch(setSubscriptionMetadata(snapshot));
  };
  const upgrade = () =>
    run(async () => {
      if (await purchasePremium()) {
        syncSubscription(await refreshEntitlement());
      } else {
        Alert.alert(
          'Pro unavailable',
          'There is no purchase package available in this build.',
        );
      }
    }, 'Purchase could not be completed');

  const restore = () =>
    run(async () => {
      const snapshot = await restorePurchases();
      syncSubscription(snapshot);
      if (!snapshot.active) {
        Alert.alert('No active subscription found');
      }
    }, 'Purchases could not be restored');

  if (!ready) {
    return (
      <Text
        style={styles.setup}
        onPress={
          setupError
            ? () => {
                setSetupError(false);
                setSetupAttempt(attempt => attempt + 1);
              }
            : undefined
        }
      >
        {setupError
          ? 'Could not open local storage. Tap to retry.'
          : 'Opening Hotspot Manager…'}
      </Text>
    );
  }

  return (
    <AppNavigator
      activeScreen={activeScreen}
      setActiveScreen={setActiveScreen}
      capability={hotspot.capability}
      premiumActive={premium}
      globalUsageBytes={globalUsageBytes}
      globalLimit={hotspot.globalLimit}
      devices={evaluation.deviceUpdates}
      timer={hotspot.timer}
      activity={hotspot.activity}
      policies={hotspot.policies}
      automationProfiles={hotspot.automationProfiles}
      schedules={hotspot.schedules}
      insightsSummary={insightsSummary}
      getUsageCsv={() => buildUsageCsv(hotspot.devices, hotspot.usageSnapshots)}
      getBackupPayload={() =>
        buildBackupPayload({
          devices: hotspot.devices,
          usageSnapshots: hotspot.usageSnapshots,
          activity: hotspot.activity,
          policies: hotspot.policies,
          automationProfiles: hotspot.automationProfiles,
          schedules: hotspot.schedules,
          globalLimit: hotspot.globalLimit,
        })
      }
      nowMs={nowMs}
      busy={busy}
      onOpenSettings={() =>
        run(async () => {
          if (Platform.OS !== 'android' || !(await openNetworkSettings())) {
            Alert.alert(
              'Personal Hotspot',
              Platform.OS === 'ios'
                ? 'Open Settings and tap Personal Hotspot.'
                : 'Open Settings and look for Hotspot or Tethering under network settings.',
            );
          }
        }, 'Could not open settings')
      }
      onAddDevice={addDevice}
      onLogUsage={logUsage}
      onToggleDeviceBlock={device =>
        run(async () => {
          const outcome = await (device.blocked
            ? unblockDevice(device)
            : blockDevice(device));
          if (outcome.result.applied) {
            await saveDevice(outcome.device);
          } else {
            Alert.alert('Device access', outcome.result.message);
          }
        })
      }
      onRenameDevice={(device, nickname) =>
        run(() => saveDevice({ ...device, nickname }))
      }
      onToggleTrusted={device =>
        run(() => saveDevice({ ...device, trusted: !device.trusted }))
      }
      onUpdateGlobalLimit={updateLimit}
      onStartTimer={startTimer}
      onStopTimer={stopTimer}
      onSavePolicy={savePolicy}
      onSaveSchedules={saveSchedules}
      onToggleAutomationProfile={toggleProfile}
      onUpgradePress={upgrade}
      onRestorePress={restore}
    />
  );
};

const styles = StyleSheet.create({
  setup: { marginTop: 80, padding: 24, color: '#20253a' },
});

export default App;
