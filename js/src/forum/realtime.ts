import app from 'flarum/forum/app';
import RealtimeExtend from 'ext:flarum/realtime/forum/extenders/Realtime';

/**
 * The events flarum/realtime pushes for new activity in a discussion. Their payload is the discussion
 * as the recipient sees it, including its tags with their updated counts and last discussion.
 */
export const ACTIVITY_EVENTS = ['Flarum\\Discussion\\Event\\Started', 'Flarum\\Post\\Event\\Posted', 'discussionRestored'];

/**
 * Show new activity on the categories page as it happens. flarum/realtime only puts it in the store
 * (and skips that when the last discussion list was searched or filtered), and only redraws the
 * discussion list.
 */
export function showActivity(data: unknown): void {
  if (!app.current.matches('ext:fof/categories/forum/components/CategoriesPage')) return;

  app.store.pushPayload(data as any);
  m.redraw();
}

export default function realtime() {
  const extender = new RealtimeExtend();

  for (const event of ACTIVITY_EVENTS) {
    extender.onBothChannelsEvent(event, showActivity);
  }

  return [extender];
}
