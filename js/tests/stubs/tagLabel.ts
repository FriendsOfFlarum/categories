import m from 'mithril';

/**
 * Stands in for flarum/tags' tagLabel helper, a legacy `.js` module the ESM transform can't load
 * (flarum/tags stubs its own `.js` helpers the same way).
 */
export default function tagLabel(tag: any, attrs: { link?: boolean } = {}) {
  return m(attrs.link ? 'a.TagLabel' : 'span.TagLabel', attrs.link ? { href: `/t/${tag.slug()}` } : {}, tag.name());
}
