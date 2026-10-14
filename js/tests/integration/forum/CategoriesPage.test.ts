import { jest } from '@jest/globals';
import app from 'flarum/forum/app';
import mq from 'mithril-query';
import CategoriesPage from '../../../src/forum/components/CategoriesPage';
import { bootForum, makeTag } from '../../support';

const tags = [
  makeTag('1', { name: 'Second', position: 2 }, { children: { data: [{ type: 'tags', id: '3' }] } }),
  makeTag('2', { name: 'First', position: 1 }),
  makeTag('3', { name: 'Child', position: 0, isChild: true }, { parent: { data: { type: 'tags', id: '1' } } }),
  makeTag('4', { name: 'Unpinned', slug: 'unpinned', position: null }),
];

beforeAll(() => bootForum({ attributes: { 'categories.fullPageDesktop': false, welcomeTitle: 'Welcome' } }));

beforeEach(() => {
  // As the backend preloads the tags on a visit to /categories.
  app.data.apiDocument = { data: tags };
});

afterEach(() => app.forum.pushAttributes({ 'categories.fullPageDesktop': false }));

/** The names of the categories in the list, in order. */
const listed = (page: any): string[] => page.find('.TagCategoryList > .TagCategory > a .TagCategory-name').map((el: Element) => el.textContent);

describe('CategoriesPage', () => {
  it('lists the pinned top-level tags in order, from the preloaded document', () => {
    expect(listed(mq(CategoriesPage))).toEqual(['First', 'Second']);
  });

  it('lists child tags under their parent, not at the top level', () => {
    expect(mq(CategoriesPage)).toHaveElement('.TagCategoryList > .TagCategory-tag-1 > .TagCategory-subTagList > .TagCategory-tag-3');
  });

  it('shows unpinned tags in a cloud', () => {
    const page = mq(CategoriesPage);

    expect(page).toHaveElement('.TagCloud');
    expect(page.first('.TagCloud').textContent).toContain('Unpinned');
    expect(listed(page)).not.toContain('Unpinned');
  });

  it('has the index sidebar and the welcome hero', () => {
    const page = mq(CategoriesPage);

    expect(page).toHaveElement('.CategoriesPage .IndexPage-nav');
    expect(page).toHaveElement('.Hero.WelcomeHero');
  });

  it('only stacks the sidebar above the list when fullPageDesktop is on', () => {
    expect(mq(CategoriesPage)).not.toHaveElement('.CategoriesPage.Page--vertical');

    app.forum.pushAttributes({ 'categories.fullPageDesktop': true });
    app.data.apiDocument = { data: tags };

    expect(mq(CategoriesPage)).toHaveElement('.CategoriesPage.Page--vertical');
  });

  it('loads the tags it needs when they were not preloaded', async () => {
    app.data.apiDocument = null;
    let resolve!: () => void;
    const load = jest.fn(() => new Promise<void>((r) => (resolve = r)));
    app.tagList = { load } as any;

    const page = mq(CategoriesPage);

    expect(load).toHaveBeenCalledWith(['parent', 'children', 'lastPostedDiscussion', 'lastPostedDiscussion.lastPostedUser']);
    expect(page).toHaveElement('.LoadingIndicator');

    // As the request does when it returns.
    app.store.pushPayload({ data: tags });
    resolve();
    await Promise.resolve();
    page.redraw();

    expect(page).not.toHaveElement('.LoadingIndicator');
    expect(listed(page)).toEqual(['First', 'Second']);
  });
});
