import app from 'flarum/forum/app';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import { extend as mithrilExtend } from 'flarum/common/extend';
import LinkButton from 'flarum/common/components/LinkButton';
import CategoriesPage from './components/CategoriesPage';
import TagsPage from 'ext:flarum/tags/forum/components/TagsPage';
import Category from './components/Category';
import LastDiscussionWidget from './components/LastDiscussionWidget';
import StatWidget from './components/StatWidget';

function pruneIndexNav(items: any, func: (key: string) => boolean) {
  const isTagsPageVisible = app.forum.attribute('categories.keepTagsNav');
  const isCustomTagsHidden = app.current.matches(CategoriesPage) || app.current.matches(TagsPage);

  for (const key of Object.keys(items.toObject())) {
    if (func(key)) {
      if (key == 'tags') {
        if (!isTagsPageVisible) {
          items.remove(key);
        }
      } else {
        if (isCustomTagsHidden) {
          items.remove(key);
        }
      }
    }
  }
}

app.initializers.add('fof-categories', () => {
  mithrilExtend(IndexSidebar.prototype, 'navItems', function (items) {
    items.add(
      'categories',
      <LinkButton icon="fas fa-th-list" href={app.route('categories')}>
        {app.translator.trans('fof-categories.forum.index.categories_link')}
      </LinkButton>,
      -9.5
    );

    if (items.has('moreTags')) {
      items.setContent(
        'moreTags',
        <LinkButton href={app.route('categories')}>{app.translator.trans('flarum-tags.forum.index.more_link')}</LinkButton>
      );
    }

    pruneIndexNav(items, (item) => item.startsWith('tag'));

    return items;
  });

  mithrilExtend(IndexSidebar.prototype, 'items', function (items) {
    pruneIndexNav(items, (item) => item !== 'newDiscussion' && item !== 'nav');
    return items;
  });
});

export { default as extend } from './extend';

export default {
  'components/CategoriesPage': CategoriesPage,
  'components/Category': Category,
  'components/LastDiscussionWidget': LastDiscussionWidget,
  'components/StatWidget': StatWidget,
};
