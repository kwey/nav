// import Utils from '../utils';

import UI from "../../../ui/src/js";

class List {
    constructor(nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.container = this.nav.template.list;
        this.init();
    }

    init() {
        this.container.append(this.TPL());

        this.addList(this.nav.typeList);
    }
    addList(list) {
        if (Array.isArray(list)) {
            list.forEach((item) => {
                $(`.${this.prefix}-list-area`).append(new UI.Link(null, item).container)
            })
        }
    }
    TPL() {
        const prefix = this.prefix;
        return `
            <div class="${prefix}-list-area">
            </div>
            `;
    }

}

export default List;
