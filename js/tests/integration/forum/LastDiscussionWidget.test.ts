import { makeDiscussion, makeUser } from '@flarum/jest-config/factory';
import app from 'flarum/forum/app';
import mq from 'mithril-query';
import type Discussion from 'flarum/common/models/Discussion';
import LastDiscussionWidget from '../../../src/forum/components/LastDiscussionWidget';
import { bootForum } from '../../support';

beforeAll(() =>
  bootForum({
    resources: [
      makeUser({ id: '2', attributes: { username: 'poster', slug: 'poster', displayName: 'Poster' } }),
      makeDiscussion({
        id: '7',
        attributes: { title: 'A discussion title that is far too long to show in full', slug: '7-long', lastPostNumber: 4 },
        relationships: { lastPostedUser: { data: { type: 'users', id: '2' } } },
      }),
      makeDiscussion({
        id: '8',
        attributes: { title: 'Orphaned', slug: '8-orphaned', lastPostNumber: 1 },
        relationships: { lastPostedUser: { data: null } },
      }),
    ],
  })
);

const discussion = (id: string) => app.store.getById<Discussion>('discussions', id)!;

describe('LastDiscussionWidget', () => {
  it('says so when the tag has no discussions yet', () => {
    const widget = mq(LastDiscussionWidget, { discussion: null });

    expect(widget).toContainRaw('No Discussions (Yet!)');
    expect(widget).not.toHaveElement('a.LastDiscussion');
  });

  it('links to the last post of the discussion', () => {
    const widget = mq(LastDiscussionWidget, { discussion: discussion('7') });

    expect(widget.first('a.LastDiscussion').getAttribute('href')).toMatch(/\/d\/7-long\/4$/);
  });

  it('truncates the title', () => {
    const widget = mq(LastDiscussionWidget, { discussion: discussion('7') });

    expect(widget.first('.LastDiscussion-topRow').textContent).toBe('A discussion title that is...');
  });

  it('shows who posted last, linking to their profile', () => {
    const widget = mq(LastDiscussionWidget, { discussion: discussion('7') });

    expect(widget).toContainRaw('Poster');
    expect(widget).toHaveElement('.LastDiscussion-avatar .Avatar');
    expect(widget.first('.LastDiscussion-usernameLink').getAttribute('href')).toMatch(/\/u\/poster$/);
  });

  it('does not link to a profile when the last poster is gone', () => {
    const widget = mq(LastDiscussionWidget, { discussion: discussion('8') });

    expect(widget).not.toHaveElement('.LastDiscussion-avatar .Avatar');
    expect(widget.first('.LastDiscussion-usernameLink').getAttribute('href')).not.toContain('/u/');
  });
});
