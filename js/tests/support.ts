import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import { makeUser } from '@flarum/jest-config/factory';
import app from 'flarum/forum/app';
import Extend from 'flarum/common/extenders';
import IndexPage from 'flarum/forum/components/IndexPage';
import tagsExtend from 'ext:flarum/tags/common/extend';
import categoriesExtend from '../src/forum/extend';
import loadTranslations from './translations';

// flarum/tags' forum extenders import plain .js files, which Jest loads as CommonJS, so register its tag route as it does.
const tagsForumExtend = [
  ...tagsExtend,
  new Extend.Routes().add('tag', '/t/:tags', IndexPage).helper('tag', (tag: any) => app.route('tag', { tags: tag.slug() })),
];

/**
 * Bootstrap and boot the forum with this extension's (and flarum/tags') extenders applied,
 * as the forum does at runtime. `attributes` are forum attributes, such as settings.
 */
export function bootForum({
  attributes = {},
  resources = [],
  apiDocument = null,
}: { attributes?: object; resources?: any[]; apiDocument?: any } = {}): void {
  bootstrapForum({
    apiDocument,
    resources: [
      { type: 'forums', id: '1', attributes: { canEditUserCredentials: true, ...attributes } },
      makeUser({ id: '1', attributes: { username: 'admin', displayName: 'Admin' } }),
      ...resources,
    ],
  });

  app.bootExtensions({ 'flarum-tags': { extend: tagsForumExtend }, 'fof-categories': { extend: categoriesExtend } });
  loadTranslations(app.translator);
  app.boot();
}

/**
 * A `tags` JSON:API resource.
 */
export function makeTag(id: string, attributes: object = {}, relationships: object = {}) {
  return {
    type: 'tags',
    id,
    attributes: {
      name: `Tag ${id}`,
      slug: `tag-${id}`,
      description: `About tag ${id}`,
      color: '#123456',
      icon: 'fas fa-tag',
      position: Number(id),
      isChild: false,
      isHidden: false,
      discussionCount: 3,
      postCount: 12,
      ...attributes,
    },
    relationships: {
      children: { data: [] },
      ...relationships,
    },
  };
}
