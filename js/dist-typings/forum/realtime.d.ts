import RealtimeExtend from 'ext:flarum/realtime/forum/extenders/Realtime';
/**
 * The events flarum/realtime pushes for new activity in a discussion. Their payload is the discussion
 * as the recipient sees it, including its tags with their updated counts and last discussion.
 */
export declare const ACTIVITY_EVENTS: string[];
/**
 * Show new activity on the categories page as it happens. flarum/realtime only puts it in the store
 * (and skips that when the last discussion list was searched or filtered), and only redraws the
 * discussion list.
 */
export declare function showActivity(data: unknown): void;
export default function realtime(): RealtimeExtend[];
