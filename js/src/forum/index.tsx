import app from 'flarum/forum/app';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import { extend as mithrilExtend } from 'flarum/common/extend';
import LinkButton from 'flarum/common/components/LinkButton';
import TagsPage from 'ext:flarum/tags/forum/components/TagsPage';
import type ItemList from 'flarum/common/utils/ItemList';
import type Mithril from 'mithril';

export { default as extend } from './extend';

// Lazy loaded, so referred to by module path rather than imported.
const CategoriesPage = 'ext:fof/categories/forum/components/CategoriesPage';

function pruneIndexNav(items: ItemList<Mithril.Children>, func: (key: string) => boolean) {
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
  mithrilExtend(IndexSidebar.prototype, 'navItems', function (items: ItemList<Mithril.Children>) {
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
  });

  app.prefetch.add('fof-categories.categoriesPage', () => import('./components/CategoriesPage'));

  if ('fof-forum-widgets-core' in flarum.extensions) {
    app.widgets?.addPage(CategoriesPage);
  }
});
