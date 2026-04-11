import {DataLimit} from '../types/domain';

export interface LimitStatus {
  usedBytes: number;
  remainingBytes: number;
  exceeded: boolean;
}

export const evaluateLimit = (
  limit: DataLimit,
  usedBytes: number,
): LimitStatus => {
  const remainingBytes = Math.max(limit.byteLimit - usedBytes, 0);
  return {
    usedBytes,
    remainingBytes,
    exceeded: usedBytes >= limit.byteLimit,
  };
};
