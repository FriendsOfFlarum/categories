import { jest } from '@jest/globals';
import { makeDiscussion, makeUser } from '@flarum/jest-config/factory';
import app from 'flarum/forum/app';
import mq from 'mithril-query';
import PageState from 'flarum/common/states/PageState';
import IndexPage from 'flarum/forum/components/IndexPage';
import RealtimeExtend from 'ext:flarum/realtime/forum/extenders/Realtime';
import RealtimeState from 'ext:flarum/realtime/forum/RealtimeState';
import type Tag from 'ext:flarum/tags/common/models/Tag';
import CategoriesPage from '../../../src/forum/components/CategoriesPage';
import categoriesExtend from '../../../src/forum/extend';
import realtime, { ACTIVITY_EVENTS } from '../../../src/forum/realtime';
import { bootForum, makeTag } from '../../support';

/** A stand-in for a Pusher channel, which collects what is bound to it so events can be fired. */
class FakeChannel {
  handlers: Record<string, ((data: unknown) => void)[]> = {};

  bind(event: string, handler: (data: unknown) => void) {
    (this.handlers[event] ??= []).push(handler);
  }

  fire(event: string, data: unknown) {
    (this.handlers[event] ?? []).forEach((handler) => handler(data));
  }
}

const publicChannel = new FakeChannel();
const userChannel = new FakeChannel();

/** The payload flarum/realtime pushes when a discussion is started in the General tag. */
const started = (id: string, title: string, counts: { discussionCount: number; postCount: number }) => ({
  data: makeDiscussion({
    id,
    attributes: { title, slug: `${id}-slug`, lastPostNumber: 1 },
    relationships: { tags: { data: [{ type: 'tags', id: '1' }] }, lastPostedUser: { data: { type: 'users', id: '2' } } },
  }),
  included: [
    makeTag('1', { name: 'General', slug: 'general', ...counts }, { lastPostedDiscussion: { data: { type: 'discussions', id } } }),
    makeUser({ id: '2' }),
  ],
});

const tag = () => app.store.getById<Tag>('tags', '1')!;

beforeAll(() => {
  bootForum({ resources: [makeTag('1', { name: 'General', slug: 'general', discussionCount: 107, postCount: 0 })] });

  app.bootExtensions({ 'fof-categories': { extend: realtime() } });
  RealtimeState.notifyPublicChannelReady(publicChannel as any);
  RealtimeState.notifyUserChannelReady(userChannel as any);
});

afterEach(() => jest.restoreAllMocks());

beforeEach(() => {
  // @flarum/jest-config stubs checkModule to return `true`, but PageState.matches() needs the module
  // a path resolves to, so look it up as the real registry does.
  jest
    .spyOn(flarum.reg, 'checkModule')
    .mockImplementation((namespace: string, id: string) => (flarum.reg as any).moduleExports.get(namespace)?.get(id) ?? false);
  flarum.reg.add('fof-categories', 'forum/components/CategoriesPage', CategoriesPage);
});

describe('flarum/realtime integration', () => {
  it('is only added when flarum/realtime is enabled', () => {
    // flarum.extensions is empty when this extension's extenders are loaded in these tests.
    expect(categoriesExtend.some((extender) => extender instanceof RealtimeExtend)).toBe(false);
  });

  it.each(ACTIVITY_EVENTS)('listens for %s on the public and user channels', (event) => {
    expect(publicChannel.handlers[event]).toHaveLength(1);
    expect(userChannel.handlers[event]).toHaveLength(1);
  });

  it('shows new activity on the categories page', () => {
    app.current = new PageState(CategoriesPage);
    app.data.apiDocument = { data: [makeTag('1', { name: 'General', slug: 'general', discussionCount: 107, postCount: 0 })] };
    const page = mq(CategoriesPage);
    const counts = () => page.find('.TagCategory-general > a .StatWidget-count').map((el: Element) => el.textContent);

    expect(counts()).toEqual(['107', '0']);

    const redraw = jest.spyOn(m, 'redraw');
    publicChannel.fire('Flarum\\Discussion\\Event\\Started', started('50', 'Hot off the press', { discussionCount: 108, postCount: 1 }));

    // flarum/realtime only redraws for the discussion list, so the page has to ask for it.
    expect(redraw).toHaveBeenCalled();
    page.redraw();

    expect(counts()).toEqual(['108', '1']);
    expect(page.first('.TagCategory-general .LastDiscussion-topRow').textContent).toBe('Hot off the press');
  });

  it('leaves other pages alone, which flarum/realtime handles itself', () => {
    app.current = new PageState(IndexPage);
    const before = tag().discussionCount();
    const redraw = jest.spyOn(m, 'redraw');

    publicChannel.fire('Flarum\\Discussion\\Event\\Started', started('51', 'Elsewhere', { discussionCount: 200, postCount: 9 }));

    expect(tag().discussionCount()).toBe(before);
    expect(app.store.getById('discussions', '51')).toBeUndefined();
    expect(redraw).not.toHaveBeenCalled();
  });
});
