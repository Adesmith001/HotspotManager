import React, {useEffect, useMemo, useState} from 'react';
import {Alert, StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppNavigator, AppScreenKey} from './src/navigation/AppNavigator';
import {createDefaultPlan} from './src/services/planService';
import {buildDeviceReports} from './src/services/reportService';
import {
  initializeRevenueCat,
  purchasePremium,
  refreshEntitlement,
} from './src/services/subscriptionService';
import {computeTimerEnd} from './src/services/timerService';
import {loadCapabilityState} from './src/services/capabilityService';
import {
  blockDevice,
  loadConnectedDevices,
  unblockDevice,
} from './src/services/deviceService';
import {store} from './src/store';
import {useAppDispatch, useAppSelector} from './src/store/hooks';
import {
  addDevicePlan,
  addSchedule,
  setCapability,
  setDevices,
  setGlobalLimit,
  setTimer,
} from './src/store/slices/hotspotSlice';
import {
  setPremiumStatus,
  setSubscriptionMetadata,
} from './src/store/slices/subscriptionSlice';
import {ConnectedDevice, DataLimit, HotspotTimer, ScheduleRule} from './src/types/domain';

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
  const [activeScreen, setActiveScreen] = useState<AppScreenKey>('overview');
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const capability = await loadCapabilityState();
      dispatch(setCapability(capability));

      const devices = await loadConnectedDevices();
      dispatch(setDevices(devices));

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
    };

    bootstrap().catch(() => {
      Alert.alert(
        'Setup warning',
        'Initial capability or billing sync failed. App will continue in fallback mode.',
      );
    });
  }, [dispatch]);

  const reports = useMemo(
    () => buildDeviceReports(hotspot.devices, hotspot.usageRecords),
    [hotspot.devices, hotspot.usageRecords],
  );

  const onToggleDeviceBlock = async (device: ConnectedDevice) => {
    const updated = device.blocked
      ? await unblockDevice(device)
      : await blockDevice(device);
    dispatch(
      setDevices(
        hotspot.devices.map(d => {
          if (d.id === updated.id) {
            return updated;
          }
          return d;
        }),
      ),
    );
  };

  const onUpdateGlobalLimit = (limit: DataLimit) => {
    dispatch(setGlobalLimit(limit));
  };

  const onStartTimer = (durationMinutes: number) => {
    const startedAt = Date.now();
    const timer: HotspotTimer = {
      startedAt,
      durationSeconds: durationMinutes * 60,
      endsAt: computeTimerEnd(startedAt, durationMinutes * 60),
      active: true,
    };
    dispatch(setTimer(timer));
  };

  const onStopTimer = () => {
    dispatch(setTimer(null));
  };

  const onAddSchedule = () => {
    const now = new Date();
    const sampleRule: ScheduleRule = {
      id: `schedule-${Date.now()}`,
      scope: hotspot.devices[0] ? 'device' : 'global',
      deviceId: hotspot.devices[0]?.id,
      dayOfWeek: now.getDay(),
      startHour: now.getHours(),
      endHour: Math.min(now.getHours() + 2, 23),
      cap: 500 * 1024 * 1024,
    };
    dispatch(addSchedule(sampleRule));
  };

  const onAddPlan = (deviceId: string) => {
    const nextIndex = hotspot.devicePlans.filter(p => p.deviceId === deviceId).length;
    dispatch(addDevicePlan(createDefaultPlan(deviceId, nextIndex)));
  };

  const onUpgradePress = async () => {
    const purchased = await purchasePremium();
    if (!purchased) {
      Alert.alert(
        'Premium purchase unavailable',
        'No purchasable package found. Configure RevenueCat products first.',
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
      globalUsageBytes={hotspot.globalUsageBytes}
      globalLimit={hotspot.globalLimit}
      devices={hotspot.devices}
      timer={hotspot.timer}
      schedules={hotspot.schedules}
      plans={hotspot.devicePlans}
      reports={reports}
      nowMs={nowMs}
      onToggleDeviceBlock={onToggleDeviceBlock}
      onUpdateGlobalLimit={onUpdateGlobalLimit}
      onStartTimer={onStartTimer}
      onStopTimer={onStopTimer}
      onAddSchedule={onAddSchedule}
      onAddPlan={onAddPlan}
      onUpgradePress={onUpgradePress}
    />
  );
};

export default App;
