import { jest } from '@jest/globals';
import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import PageState from 'flarum/common/states/PageState';
import IndexPage from 'flarum/forum/components/IndexPage';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import LinkButton from 'flarum/common/components/LinkButton';
import TagsPage from 'ext:flarum/tags/forum/components/TagsPage';
import CategoriesPage from '../../../src/forum/components/CategoriesPage';
import { bootForum } from '../../support';
import '../../../src/forum';

// The nav items flarum/tags adds, which this extension prunes. Added from an initializer that runs
// before this extension's, as flarum/tags' does at runtime.
app.initializers.add(
  'flarum-tags',
  () => {
    extend(IndexSidebar.prototype, 'navItems', function (items) {
      items.add('tags', <LinkButton href="/tags">Tags</LinkButton>, -10);
      items.add('tag1', <LinkButton href="/t/general">General</LinkButton>, -14);
      items.add('moreTags', <LinkButton href="/tags">More...</LinkButton>, -16);
    });
  },
  100
);

beforeAll(() => {
  (flarum as any).extensions = {};
  bootForum({ attributes: { 'categories.keepTagsNav': false } });
});

beforeEach(() => {
  // @flarum/jest-config stubs checkModule to return `true`, but PageState.matches() needs the module
  // a path resolves to, so look it up as the real registry does.
  jest
    .spyOn(flarum.reg, 'checkModule')
    .mockImplementation((namespace: string, id: string) => (flarum.reg as any).moduleExports.get(namespace)?.get(id) ?? false);

  // The categories page chunk registers itself once loaded, as on a visit to /categories.
  flarum.reg.add('fof-categories', 'forum/components/CategoriesPage', CategoriesPage);
});

afterEach(() => app.forum.pushAttributes({ 'categories.keepTagsNav': false }));

const navItems = (page: Function) => {
  app.current = new PageState(page);

  return new (IndexSidebar as any)().navItems();
};

describe('the index nav', () => {
  it('links to the categories page', () => {
    const items = navItems(IndexPage);

    expect(items.has('categories')).toBe(true);
    expect(items.get('categories').attrs.href).toMatch(/\/categories$/);
  });

  it('points the more tags link at the categories page', () => {
    expect(navItems(IndexPage).get('moreTags').attrs.href).toMatch(/\/categories$/);
  });

  it('removes the tags page link unless keepTagsNav is on', () => {
    expect(navItems(IndexPage).has('tags')).toBe(false);

    app.forum.pushAttributes({ 'categories.keepTagsNav': true });

    expect(navItems(IndexPage).has('tags')).toBe(true);
  });

  it('keeps the tag links on the discussion list', () => {
    const items = navItems(IndexPage);

    expect(items.has('tag1')).toBe(true);
    expect(items.has('moreTags')).toBe(true);
  });

  it.each([
    ['the categories page', CategoriesPage],
    ['the tags page', TagsPage],
  ])('removes the tag links on %s', (_name, page) => {
    const items = navItems(page);

    expect(items.has('tag1')).toBe(false);
    expect(items.has('categories')).toBe(true);
    expect(items.has('allDiscussions')).toBe(true);
  });
});

describe('the categories page', () => {
  it('is prefetched', async () => {
    const loader = app.prefetch.get('fof-categories.categoriesPage');

    await expect(loader()).resolves.toMatchObject({ default: CategoriesPage });
  });

  it('is not registered with fof/forum-widgets-core when that is not enabled', () => {
    const addPage = jest.fn();
    app.widgets = { addPage } as any;

    app.initializers.get('fof-categories')(app);

    expect(addPage).not.toHaveBeenCalled();
  });

  it('shows widgets when fof/forum-widgets-core is enabled', () => {
    const addPage = jest.fn();
    app.widgets = { addPage } as any;
    (flarum as any).extensions = { 'fof-forum-widgets-core': {} };

    app.initializers.get('fof-categories')(app);

    expect(addPage).toHaveBeenCalledWith('ext:fof/categories/forum/components/CategoriesPage');
  });
});
