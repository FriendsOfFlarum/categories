import Component from 'flarum/common/Component';
import ItemList from 'flarum/common/utils/ItemList';
import type Mithril from 'mithril';
interface Attrs {
    count: number;
    icon: string;
    label: Mithril.Children;
}
export default class StatWidget extends Component<Attrs> {
    view(): JSX.Element;
    content(): ItemList<unknown>;
}
export {};
