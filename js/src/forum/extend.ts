import Extend from 'flarum/common/extenders';
import Tag from 'ext:flarum/tags/common/models/Tag';

export default [
  new Extend.Routes().add('categories', '/categories', () => import('./components/CategoriesPage')),
  new Extend.Model(Tag).attribute<number>('postCount'),
];
