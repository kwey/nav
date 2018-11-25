// import Utils from '../utils';

import { Link, Contextmenu } from '../../ui/src/ui';
import { SelectListInterface } from '../../ui/src/ts/select';
import { LocalInterface } from './info-set';
import Nav from './nav';

class List {
    nav: Nav;
    prefix: string;
    container: JQuery;
    local: LocalInterface;
    index: number;
    color: string[];
    listItem: JQuery;

    constructor(nav: Nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.container = this.nav.template.list;
        this.local = this.nav.infoSet.local;
        this.init();
    }

    init() {
        this.index = 0;
        this.color = ['#0ff', '#9cf', '#ccf', '#fcf', '#cff', '#3cf', '#ffc'];
        this.load();
        this.listItem = $(`.${this.prefix}-list-item`);
        this.contextMenu();
    }
    private contextMenu() {
        new Contextmenu(this.container[0], {
            menu: [],
            changedMode: true,
            changedType: 0,
            onChange: (e: MouseEvent) => {
                const menu = [
                    {
                        type: 'ss',
                        text: '更新历史',
                        click: () => {
                            console.log('version', e);
                        }
                    },
                ];
                return menu;
            }
        });
    }
    load() {
        this.container.html('');
        this.index = 0;
        const types = this.local.typeList.items;
        const len = this.color.length;
        types.forEach((item: SelectListInterface) => {
            const color = this.color[this.index % len];
            const list = this.local.srcList[item.id];
            if (list && list.length > 0) {
                this.container.append(new Link($(`<div class="${this.prefix}-list-item"></div>`)[0], {
                    type: item.name,
                    list,
                    bg: color,
                    border: color,
                }).container);
            }
            this.index += 1;
        });
    }
}

export default List;
