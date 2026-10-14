import m from 'mithril';

/**
 * Stands in for flarum/tags' tagIcon helper, a legacy `.js` module the ESM transform can't load
 * (flarum/tags stubs its own `.js` helpers the same way).
 */
export default function tagIcon(tag: any) {
  return m('span.icon.TagIcon', { className: tag?.icon() ?? '' });
}
