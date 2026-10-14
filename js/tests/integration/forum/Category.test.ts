import { makeDiscussion } from '@flarum/jest-config/factory';
import app from 'flarum/forum/app';
import mq from 'mithril-query';
import type Tag from 'ext:flarum/tags/common/models/Tag';
import Category from '../../../src/forum/components/Category';
import { bootForum, makeTag } from '../../support';

const settings = {
  'categories.compactMobile': false,
  'categories.parentRemoveIcon': false,
  'categories.parentRemoveDescription': false,
  'categories.parentRemoveStats': false,
  'categories.parentRemoveLastDiscussion': false,
  'categories.childBareIcon': false,
};

beforeAll(() =>
  bootForum({
    attributes: settings,
    resources: [
      makeTag(
        '1',
        { name: 'General', slug: 'general', color: '#ff0000', icon: 'fas fa-comments', discussionCount: 1234, postCount: 5678 },
        {
          children: { data: [{ type: 'tags', id: '2' }] },
          lastPostedDiscussion: { data: { type: 'discussions', id: '9' } },
        }
      ),
      makeTag(
        '2',
        { name: 'Support', slug: 'support', color: '#00ff00', icon: 'fas fa-life-ring', isChild: true },
        { parent: { data: { type: 'tags', id: '1' } } }
      ),
      makeTag('3', { name: 'Empty', slug: 'empty' }),
      makeDiscussion({ id: '9', attributes: { title: 'Latest news', slug: '9-latest-news', lastPostNumber: 2 } }),
    ],
  })
);

afterEach(() => app.forum.pushAttributes(settings));

const tag = (id: string) => app.store.getById<Tag>('tags', id)!;
const parent = (id = '1') => mq(Category, { model: tag(id) });
const child = () => mq(Category, { model: tag('2'), parent: tag('1') });

describe('Category for a top-level tag', () => {
  it('links to the tag in its colour', () => {
    const category = parent();

    expect(category).toHaveElement('li.TagCategory.ParentCategory.TagCategory-general');
    expect(category.first('a.TagCategory-content').getAttribute('href')).toMatch(/\/t\/general$/);
    expect(category.first('a.TagCategory-content').style.backgroundColor).toBe('#ff0000');
  });

  it('shows the icon, name and description', () => {
    const category = parent();

    expect(category).toHaveElement('.TagCategory-icon .fa-3x i.fas.fa-comments');
    expect(category.first('.TagCategory-name').textContent).toBe('General');
    expect(category.first('.TagCategory-description').textContent).toBe('About tag 1');
  });

  it('shows the discussion and post counts', () => {
    const category = parent();
    const counts = category
      .find('li.ParentCategory > a.TagCategory-content > .TagCategory-alignEnd .StatWidget-count')
      .map((el: Element) => el.textContent);

    expect(counts).toEqual(['1,234', '5,678']);
    expect(category).toContainRaw('Discussions');
    expect(category).toContainRaw('Posts');
  });

  it('shows the last discussion', () => {
    expect(parent().first('li.ParentCategory > a.TagCategory-content > .TagCategory-alignEnd .LastDiscussion-topRow').textContent).toBe(
      'Latest news'
    );
  });

  it('marks the last discussion as empty when there is none', () => {
    const category = parent('3');

    expect(category).toHaveElement('.TagCategory-lastDiscussion.empty');
    expect(category).toContainRaw('No Discussions (Yet!)');
  });

  it('lists its children below it', () => {
    const category = parent();

    expect(category).toHaveElement('li.ParentCategory > ol.TagCategory-subTagList > li.TagCategory.SubCategory.TagCategory-support');
  });

  it.each([
    ['categories.parentRemoveIcon', 'li.ParentCategory > a.TagCategory-content > .TagCategory-alignStart .TagCategory-icon i'],
    ['categories.parentRemoveDescription', 'li.ParentCategory > a.TagCategory-content > .TagCategory-alignStart .TagCategory-description'],
    ['categories.parentRemoveStats', 'li.ParentCategory > a.TagCategory-content > .TagCategory-alignEnd .StatWidget'],
    ['categories.parentRemoveLastDiscussion', 'li.ParentCategory > a.TagCategory-content > .TagCategory-alignEnd .LastDiscussion'],
  ])('hides what %s removes', (setting, selector) => {
    expect(parent()).toHaveElement(selector);

    app.forum.pushAttributes({ [setting]: true });

    expect(parent()).not.toHaveElement(selector);
  });
});

describe('Category for a child tag', () => {
  it('is a sub-category without its own children or background colour', () => {
    const category = child();

    expect(category).toHaveElement('li.TagCategory.SubCategory.TagCategory-support');
    expect(category).not.toHaveElement('.TagCategory-subTagList');
    expect(category.first('a.TagCategory-content').style.backgroundColor).toBe('');
  });

  it('keeps what the top-level settings remove', () => {
    app.forum.pushAttributes({
      'categories.parentRemoveIcon': true,
      'categories.parentRemoveDescription': true,
      'categories.parentRemoveStats': true,
      'categories.parentRemoveLastDiscussion': true,
    });

    const category = child();

    expect(category).toHaveElement('.TagCategory-icon i.fas.fa-life-ring');
    expect(category).toHaveElement('.TagCategory-description');
    expect(category).toHaveElement('.StatWidget');
    expect(category).toHaveElement('.LastDiscussion');
  });

  it('colours its icon with the tag colour', () => {
    const icon = child().first('i.fa-life-ring');

    expect(icon.classList.contains('NoBackgroundCategoryIcon')).toBe(false);
    expect(icon.style.color).toBe('#00ff00');
  });

  it('shows a bare icon on a coloured circle when childBareIcon is on', () => {
    app.forum.pushAttributes({ 'categories.childBareIcon': true });

    const category = child();

    expect(category).toHaveElement('i.fa-life-ring.NoBackgroundCategoryIcon');
    expect(category.first('i.fa-circle.icon-background').style.color).toBe('#00ff00');
  });
});

describe('Category in compact mobile mode', () => {
  beforeEach(() => app.forum.pushAttributes({ 'categories.compactMobile': true }));

  it('lists the children inside the tile, with a toggle', () => {
    const category = parent();

    expect(category).toHaveElement('a.TagCategory-content.compactMobile > ol.TagCategory-subTagList .TagCategory-support');
    expect(category).not.toHaveElement('li.ParentCategory > ol.TagCategory-subTagList');
    expect(category).toHaveElement('button.TagCategory-toggleArrow i.fa-caret-up');
  });

  it('collapses the children with the toggle', () => {
    const category = parent();

    category.click('button.TagCategory-toggleArrow');

    expect(category).not.toHaveElement('.TagCategory-subTagList');
    expect(category).toHaveElement('button.TagCategory-toggleArrow i.fa-caret-down');
  });

  it('has no toggle for a tag without children', () => {
    expect(parent('3')).not.toHaveElement('.TagCategory-toggleArrow');
  });
});

describe('Category for a tag protected by datlechin/flarum-tag-passwords', () => {
  const protect = (model: Tag, { password = true, displayed = true } = {}) =>
    Object.assign(model, {
      isUnlocked: () => false,
      isPasswordProtected: () => password,
      isGroupProtected: () => !password,
      isProtectedTagDisplayedForTagsPage: () => displayed,
    });

  it('shows a lock instead of the stats and last discussion', () => {
    const category = mq(Category, { model: protect(Object.create(tag('3'))) });

    expect(category).toHaveElement('.TagCategory-locked i.fas.fa-lock');
    expect(category).toContainRaw('datlechin-tag-passwords.forum.tags_page.password_protected');
    expect(category).not.toHaveElement('.StatWidget');
    expect(category).not.toHaveElement('.LastDiscussion');
  });

  it('shows a group lock for a group protected tag', () => {
    expect(mq(Category, { model: protect(Object.create(tag('3')), { password: false }) })).toHaveElement('.TagCategory-locked i.fas.fa-user-lock');
  });

  it('is hidden when the tag is not displayed on the tags page', () => {
    expect(mq(Category, { model: protect(Object.create(tag('3')), { displayed: false }) })).not.toHaveElement('.TagCategory');
  });
});
