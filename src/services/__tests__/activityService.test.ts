import {appendActivity, getRecentActivity} from '../activityService';
import {ActivityEvent} from '../../types/domain';

describe('activity service', () => {
  const baseEvents: ActivityEvent[] = [
    {
      id: '1',
      type: 'timerStarted',
      title: 'Timer started',
      details: 'A 30 minute hotspot timer is now active.',
      timestamp: 1000,
      severity: 'info',
    },
    {
      id: '2',
      type: 'deviceJoined',
      title: 'Laptop joined',
      details: 'Work Laptop connected to the hotspot.',
      timestamp: 3000,
      severity: 'info',
      deviceId: 'device-2',
    },
  ];

  it('prepends new events and keeps them sorted by recency', () => {
    const next = appendActivity(baseEvents, {
      id: '3',
      type: 'limitWarning',
      title: 'Warning threshold reached',
      details: 'Global daily limit is at 80 percent.',
      timestamp: 2000,
      severity: 'warning',
    });

    expect(next.map(event => event.id)).toEqual(['2', '3', '1']);
  });

  it('returns a limited recent activity feed', () => {
    const recent = getRecentActivity(baseEvents, 1);
    expect(recent).toHaveLength(1);
    expect(recent[0].id).toBe('2');
  });
});
