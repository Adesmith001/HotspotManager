import {ActivityEvent} from '../types/domain';

export const appendActivity = (
  existing: ActivityEvent[],
  incoming: ActivityEvent,
): ActivityEvent[] => {
  const next = [...existing.filter(event => event.id !== incoming.id), incoming];
  next.sort((left, right) => right.timestamp - left.timestamp);
  return next;
};

export const getRecentActivity = (
  activity: ActivityEvent[],
  limit = 5,
): ActivityEvent[] => {
  return [...activity]
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, limit);
};
