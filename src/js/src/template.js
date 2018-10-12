// import Utils from '../utils';



class Template {
    constructor(nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.init();
    }

    init() {
        const prefix = this.prefix;
        const container = this.nav.container;
        $(container).html(this.TPL());

        this.header = $(`.${prefix}-header`);
        
        this.list = $(`.${prefix}-list`);
    }

    TPL() {
        const prefix = this.prefix;
        return `
            <div class=${prefix}>
                <div class="${prefix}-header"></div>
                <div class="${prefix}-list"></div>
            </div>
            `;
    }

}

export default Template;
