/// <reference types="mithril" />
import Component from 'flarum/common/Component';
import type Discussion from 'flarum/common/models/Discussion';
import ItemList from 'flarum/common/utils/ItemList';
interface Attrs {
    discussion: Discussion;
}
export default class LastDiscussionWidget extends Component<Attrs> {
    /**
     * Whether or not the user hover card is visible.
     */
    cardVisible: boolean;
    oninit(vnode: any): void;
    view(): JSX.Element;
    content(): ItemList<unknown>;
    oncreate(vnode: any): void;
    onremove(vnode: any): void;
    /**
     * Show the user card.
     */
    showCard(): void;
    /**
     * Hide the user card.
     */
    hideCard(): void;
}
export {};
