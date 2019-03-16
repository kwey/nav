// import Utils from './utils';
import Nav from './nav';

class Template {
    nav: Nav;
    prefix: string;
    header: HTMLElement;
    list: HTMLElement;
    file: HTMLElement;

    constructor(nav: Nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.init();
    }

    init() {
        const { prefix } = this;
        const { container } = this.nav;
        container.innerHTML = this.TPL();
        // container.innerHTML = Utils.parseDom(this.TPL());

        this.header = container.querySelector(`.${prefix}-header`);
        this.list = container.querySelector(`.${prefix}-list`);
        this.file = container.querySelector(`.${prefix}-file`);
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
