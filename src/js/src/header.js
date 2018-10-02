// import Utils from '../utils';
import UI from "../../../ui/src/js";


class Header {
    constructor(nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.container = this.nav.template.header;
        this.init();
    }

    init() {
        const prefix = this.prefix;
        this.container.append(this.TPL());

        this.type = new UI.Select($(`.${prefix}-type`)[0], this.nav.typeList).on('input', (e) => {
            console.log(e);
            this.type.reload();
        });
        this.nameInfo = new UI.Input($(`.${prefix}-name-input`)[0]);
        this.srcInfo = new UI.Input($(`.${prefix}-src-input`)[0]);
        this.submit = new UI.Button($(`.${prefix}-add-btn`)[0], {
            name: '上传',
        }).on('click', (e) => {
            console.log(e);
        });
        this.download = new UI.Button($(`.${prefix}-download-btn`)[0], {
            name: '下载',
        }).on('click', (e) => {
            console.log(e);
        });
        
    }

    TPL() {
        const prefix = this.prefix;
        return `
            <div class="${prefix}-add-info">
                <div class="${prefix}-type"></div>
                <div class="${prefix}-name">name: </div>
                <div class="${prefix}-name-input"></div>
                <div class="${prefix}-src">src: </div>
                <div class="${prefix}-src-input"></div>
                <div class="${prefix}-add-btn"></div>
                <div class="${prefix}-download-btn"></div>
            </div>
            `;
    }

}

export default Header;
