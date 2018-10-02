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
        this.addFile = this.header.find($(`.${prefix}-add-file`));
        this.addInfo = this.header.find($(`.${prefix}-add-info`));
        
        this.list = $(`.${prefix}-list`);
        // this.add = this.header.find($(`.${prefix}-add`));
    }

    TPL() {
        const prefix = this.prefix;
        return `
            <div class=${prefix}-area">
                <div class="${prefix}-header">
                    <div class="${prefix}-add-file">点击或拖拽上传文件（xml, json）</div>
                </div>
                <div class="${prefix}-list">
                
                </div>
            </div>
            `;
    }

}

export default Template;
