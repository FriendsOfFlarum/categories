import app from 'flarum/admin/app';
import { extend } from 'flarum/common/extend';
import BasicsPage from 'flarum/admin/components/BasicsPage';

export { default as extend } from './extend';

app.initializers.add('fof-categories', () => {
  extend(BasicsPage, 'homePageItems', (items) => {
    items.add('categories', {
      path: '/categories',
      label: app.translator.trans('fof-categories.admin.basics.categories_label'),
    });
  });
});
