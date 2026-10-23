import Component from 'flarum/common/Component';
import ItemList from 'flarum/common/utils/ItemList';
import type Mithril from 'mithril';
interface Attrs {
    model: any;
    parent: any;
}
interface TagLocked {
    icon: icon;
    text: string;
    isVisible: boolean;
}
export default class Category extends Component<Attrs> {
    tag: any;
    isChild: boolean;
    collapsed: boolean;
    compactMobileMode: boolean;
    tagLocked: TagLocked;
    oninit(vnode: any): void;
    view(): JSX.Element | null;
    categoryItems(): ItemList<unknown>;
    contentItems(): ItemList<unknown>;
    alignStartItems(): ItemList<unknown>;
    alignEndItems(): ItemList<unknown>;
    lockedItems(): ItemList<unknown>;
    iconItems(): ItemList<unknown>;
    mainItems(): ItemList<unknown>;
    statItems(): ItemList<unknown>;
    lastDiscussionItems(): ItemList<unknown>;
    oncreate(vnode: any): void;
    onremove(vnode: Mithril.VnodeDOM<Attrs, this>): void;
    toggleArrow(e: MouseEvent): void;
}
export {};
