import {getDatabase} from '../index';
import {AutomationProfile, DevicePolicy} from '../../types/domain';

export const upsertDevicePolicy = async (policy: DevicePolicy): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO device_policies (
      id,
      name,
      scope,
      deviceId,
      enabled,
      byteCap,
      warningThresholdPct,
      overageAction,
      allowTrustedBypass,
      fallbackBehavior,
      scheduleRuleId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      policy.id,
      policy.name,
      policy.scope,
      policy.deviceId ?? null,
      policy.enabled ? 1 : 0,
      policy.byteCap,
      policy.warningThresholdPct,
      policy.overageAction,
      policy.allowTrustedBypass ? 1 : 0,
      policy.fallbackBehavior,
      policy.scheduleRuleId ?? null,
    ],
  );
};

export const getDevicePolicies = async (): Promise<DevicePolicy[]> => {
  const db = await getDatabase();
  const [resultSet] = await db.executeSql(`SELECT * FROM device_policies;`);
  const policies: DevicePolicy[] = [];
  for (let index = 0; index < resultSet.rows.length; index += 1) {
    const row = resultSet.rows.item(index);
    policies.push({
      id: row.id,
      name: row.name,
      scope: row.scope,
      deviceId: row.deviceId ?? undefined,
      enabled: row.enabled === 1,
      byteCap: row.byteCap,
      warningThresholdPct: row.warningThresholdPct,
      overageAction: row.overageAction,
      allowTrustedBypass: row.allowTrustedBypass === 1,
      fallbackBehavior: row.fallbackBehavior,
      scheduleRuleId: row.scheduleRuleId ?? undefined,
    });
  }
  return policies;
};

export const upsertAutomationProfile = async (
  profile: AutomationProfile,
): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO automation_profiles (id, name, kind, enabled, triggerDescription, reaction) VALUES (?, ?, ?, ?, ?, ?);`,
    [
      profile.id,
      profile.name,
      profile.kind,
      profile.enabled ? 1 : 0,
      profile.triggerDescription,
      profile.reaction,
    ],
  );
};

export const getAutomationProfiles = async (): Promise<AutomationProfile[]> => {
  const db = await getDatabase();
  const [resultSet] = await db.executeSql(`SELECT * FROM automation_profiles;`);
  const profiles: AutomationProfile[] = [];
  for (let index = 0; index < resultSet.rows.length; index += 1) {
    const row = resultSet.rows.item(index);
    profiles.push({
      id: row.id,
      name: row.name,
      kind: row.kind,
      enabled: row.enabled === 1,
      triggerDescription: row.triggerDescription,
      reaction: row.reaction,
    });
  }
  return profiles;
};
