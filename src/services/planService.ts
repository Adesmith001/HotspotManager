import {DevicePlan} from '../types/domain';

export const createDefaultPlan = (deviceId: string, index: number): DevicePlan => {
  return {
    id: `plan-${deviceId}-${index}`,
    deviceId,
    planName: `Custom Plan ${index + 1}`,
    byteCap: 1024 * 1024 * 1024,
    overageAction: 'warn',
  };
};
