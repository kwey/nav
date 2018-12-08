// import Utils from '../utils';
import Nav from './nav';

class Template {
    nav: Nav;
    prefix: string;
    header: JQuery;
    list: JQuery;
    file: JQuery;

    constructor(nav: Nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.init();
    }

    init() {
        const { prefix } = this;
        const { container } = this.nav;
        $(container).html(this.TPL());

        this.header = $(`.${prefix}-header`);
        this.list = $(`.${prefix}-list`);
        this.file = $(`.${prefix}-file`);
    }

    private TPL() {
        const { prefix } = this;
        return `<div class=${prefix}>
                    <div class="${prefix}-header"></div>
                    <div class="${prefix}-list"></div>
                    <div class="${prefix}-file"></div>
                </div>`;
    }
}

export default Template;
