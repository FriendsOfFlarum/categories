/// <reference types="mithril" />
import Page from 'flarum/common/components/Page';
import ItemList from 'flarum/common/utils/ItemList';
export default class CategoriesPage extends Page {
    tags: any[];
    loading: boolean;
    oninit(vnode: any): void;
    view(): JSX.Element;
    hero(): JSX.Element;
    sidebar(): JSX.Element;
    contentItems(): ItemList<unknown>;
    oncreate(vnode: any): void;
}
