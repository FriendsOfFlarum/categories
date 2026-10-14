import Extend from 'flarum/common/extenders';
import Tag from 'ext:flarum/tags/common/models/Tag';
import realtime from './realtime';

export default [
  new Extend.Routes().add('categories', '/categories', () => import('./components/CategoriesPage')),
  new Extend.Model(Tag).attribute<number>('postCount'),

  // flarum/realtime is an optional dependency, so it has loaded before this runs.
  ...('flarum-realtime' in flarum.extensions ? realtime() : []),
];
