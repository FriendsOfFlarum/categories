import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .setting(() => () => <legend class="categories-legend">{app.translator.trans('fof-categories.admin.headings.nav')}</legend>, 10)
    .setting(
      () => ({
        setting: 'fof-categories.keep-tags-nav',
        label: app.translator.trans('fof-categories.admin.labels.keep_tags_nav'),
        type: 'switch',
      }),
      9
    )
    .setting(() => () => <legend class="categories-legend">{app.translator.trans('fof-categories.admin.headings.layout')}</legend>)
    .setting(() => ({
      setting: 'fof-categories.full-page-desktop',
      label: app.translator.trans('fof-categories.admin.labels.full_page_desktop'),
      help: app.translator.trans('fof-categories.admin.help.full_page_desktop'),
      type: 'switch',
    }))
    .setting(() => ({
      setting: 'fof-categories.compact-mobile',
      label: app.translator.trans('fof-categories.admin.labels.compact_mobile_mode'),
      type: 'switch',
    }))
    .setting(() => () => <legend class="categories-legend">{app.translator.trans('fof-categories.admin.headings.parent_display')}</legend>)
    .setting(() => ({
      setting: 'fof-categories.parent-remove-icon',
      label: app.translator.trans('fof-categories.admin.labels.parent_remove_icon'),
      type: 'switch',
    }))
    .setting(() => ({
      setting: 'fof-categories.parent-remove-description',
      label: app.translator.trans('fof-categories.admin.labels.parent_remove_description'),
      type: 'switch',
    }))
    .setting(() => ({
      setting: 'fof-categories.parent-remove-stats',
      label: app.translator.trans('fof-categories.admin.labels.parent_remove_stats'),
      type: 'switch',
    }))
    .setting(() => ({
      setting: 'fof-categories.parent-remove-last-discussion',
      label: app.translator.trans('fof-categories.admin.labels.parent_remove_last_discussion'),
      type: 'switch',
    }))
    .setting(() => () => <legend class="categories-legend">{app.translator.trans('fof-categories.admin.headings.child_display')}</legend>)
    .setting(() => ({
      setting: 'fof-categories.child-bare-icon',
      label: app.translator.trans('fof-categories.admin.labels.child_bare_icon'),
      help: app.translator.trans('fof-categories.admin.help.child_bare_icon'),
      type: 'switch',
    }))
    .setting(() => () => <legend class="categories-legend">{app.translator.trans('fof-categories.admin.headings.performance')}</legend>)
    .setting(() => ({
      setting: 'fof-categories.small-forum-optimized',
      label: app.translator.trans('fof-categories.admin.labels.small_forum_optimized'),
      help: app.translator.trans('fof-categories.admin.help.small_forum_optimized'),
      type: 'switch',
    })),
] satisfies object[];
