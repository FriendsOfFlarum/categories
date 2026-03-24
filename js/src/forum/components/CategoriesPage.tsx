import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import ItemList from 'flarum/common/utils/ItemList';
import extractText from 'flarum/common/utils/extractText';
import classList from 'flarum/common/utils/classList';
import sortTags from 'ext:flarum/tags/common/utils/sortTags';
import tagLabel from 'ext:flarum/tags/common/helpers/tagLabel';
import Category from './Category';
import PageStructure from 'flarum/forum/components/PageStructure';
import WelcomeHero from 'flarum/forum/components/WelcomeHero';

export default class CategoriesPage extends Page {
  tags!: any[];
  loading!: boolean;

  oninit(vnode) {
    super.oninit(vnode);

    app.history.push('categories', extractText(app.translator.trans('fof-categories.forum.header.back_to_categories_tooltip')));

    this.tags = [];

    const preloaded = app.preloadedApiDocument<any>();

    if (preloaded) {
      this.tags = sortTags(preloaded.filter((tag: any) => !tag.isChild()));
      return;
    }

    this.loading = true;

    app.tagList.load(['parent', 'children', 'lastPostedDiscussion', 'lastPostedDiscussion.lastPostedUser']).then(() => {
      this.tags = sortTags(app.store.all('tags').filter((tag) => !tag.isChild()));

      this.loading = false;

      m.redraw();
    });
  }

  view() {
    if (this.loading) {
      return <LoadingIndicator />;
    }

    const fullPageDesktop = !!app.forum.attribute('categories.fullPageDesktop');

    return (
      <PageStructure
        className={classList('CategoriesPage', { 'Page--vertical': fullPageDesktop })}
        hero={this.hero.bind(this)}
        sidebar={this.sidebar.bind(this)}
      >
        {this.contentItems().toArray()}
      </PageStructure>
    );
  }

  hero() {
    return <WelcomeHero />;
  }

  sidebar() {
    return <IndexSidebar />;
  }

  contentItems() {
    const items = new ItemList();

    const pinned = this.tags.filter((tag) => tag.position() !== null);
    const cloud = this.tags.filter((tag) => tag.position() === null);

    items.add(
      'categoriesList',
      <ol className="TagCategoryList">
        {pinned.map((tag) => {
          return Category.component({ model: tag });
        })}
      </ol>,
      100
    );

    if (cloud.length) {
      items.add('cloud', <div className="TagCloud">{cloud.map((tag) => [tagLabel(tag, { link: true }), ' '])}</div>, 10);
    }

    return items;
  }

  oncreate(vnode) {
    super.oncreate(vnode);

    app.setTitle(extractText(app.translator.trans('fof-categories.forum.all_categories.meta_title_text')));
  }
}
