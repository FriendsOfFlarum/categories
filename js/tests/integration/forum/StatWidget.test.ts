import app from 'flarum/forum/app';
import mq from 'mithril-query';
import StatWidget from '../../../src/forum/components/StatWidget';
import { bootForum } from '../../support';

beforeAll(() => bootForum());

afterEach(() => app.forum.pushAttributes({ 'categories.compactMobile': false }));

describe('StatWidget', () => {
  it('shows the count, the label and the icon for compact screens', () => {
    const widget = mq(StatWidget, { count: '1,234', label: 'Posts', icon: 'fas fa-comment' });

    expect(widget).toHaveElement('.StatWidget');
    expect(widget.first('.StatWidget-count').textContent).toBe('1,234');
    expect(widget.first('.Categories-hideOnMobile').textContent).toBe('Posts');
    expect(widget).toHaveElement('.Categories-showOnMobile i.fas.fa-comment');
  });

  it('enables the compact mobile styles only when the setting is on', () => {
    expect(mq(StatWidget, { count: 1, label: 'Posts', icon: 'fas fa-comment' })).not.toHaveElement('.Categories-compactMobileModeEnabled');

    app.forum.pushAttributes({ 'categories.compactMobile': true });

    expect(mq(StatWidget, { count: 1, label: 'Posts', icon: 'fas fa-comment' })).toHaveElement('.StatWidget.Categories-compactMobileModeEnabled');
  });
});
