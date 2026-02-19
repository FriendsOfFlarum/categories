import Extend from 'flarum/common/extenders';
import Tag from 'ext:flarum/tags/common/models/Tag';
import CategoriesPage from './components/CategoriesPage';

export default [new Extend.Routes().add('categories', '/categories', CategoriesPage), new Extend.Model(Tag).attribute<number>('postCount')];
