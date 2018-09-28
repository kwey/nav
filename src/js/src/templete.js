import Utils from '../utils';



class Templete {
    constructor(nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.init();
    }

    init() {
        const self = this;
        const prefix = this.prefix;
        const container = this.nav.container;
        container.innerHtml(this.TPL());

        this.header = document.querySelector();
    }

    TPL() {
        const prefix = this.prefix;
        return `
            <div class="${prefix}-area">
                <div class="${prefix}-body"></div>
            </div>`;
    }

}

export default Templete;
