// import Utils from '../utils';

import UI from '../../../ui/src/js';

class List {
    constructor(nav) {
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
    }

    load() {
        this.container.html('');
        this.index = 0;
        const types = this.local.typeList.items;
        const len = this.color.length;
        types.forEach((item) => {
            const co = this.color[this.index % len];
            const list = this.local.srcList[item.id];
            list && list.length > 0 && this.container.append(new UI.Link($(`<div class="${this.prefix}-list-item"></div>`)[0], {
                type: item.name,
                list: list,
                bg: co,
                border: co,
            }).container);
            this.index ++;
        });
    }

    reload() {

    }
}

export default List;
