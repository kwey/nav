import Utils from './utils';
import { Select, Input, Button } from '../../ui/src/ui';

import Nav from './nav';
import { LocalInterface } from './info-set';
import { LinkListInterface } from '../../ui/src/ts/link';
import { SelectListInterface } from '../../ui/src/ts/select';
export interface LocalInterface {
    prefix: string;
    container: HTMLElement;
}

class Header {
    prefix: string;
    nav: Nav;
    container: JQuery;
    local: LocalInterface;
    elements: any;

    constructor(nav: Nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.container = this.nav.template.header;
        this.local = this.nav.infoSet.local;
        this.init();
        this.golbalEvents();
    }

    init() {
        const { prefix } = this;
        this.container.append(this.TPL());

        this.elements = {
            addFile: this.container.find(`.${prefix}-add-file .drop`),
            addinfo: this.container.find(`.${prefix}-add-info`),
            typeInfo: new Select($(`.${prefix}-type`)[0], this.local.typeList),
            nameInfo: new Input($(`.${prefix}-name-input`)[0], {}),
            srcInfo: new Input($(`.${prefix}-src-input`)[0], {}),
            submit: new Button($(`.${prefix}-add-btn`)[0], {
                name: '上传',
            }),
            download: new Button($(`.${prefix}-download-btn`)[0], {
                name: '下载',
            }),
        };
    }

    private golbalEvents() {
        // 回车 添加类型
        this.elements.typeInfo.on('input', (item: SelectListInterface) => {
            this.nav.infoSet.setTypeInfo(item);
            this.elements.typeInfo.reload(this.local.typeList);
        });
        // 选择类型
        this.elements.typeInfo.on('change', (item: SelectListInterface) => {
            this.nav.infoSet.setTypeInfo(item);
        });
        // 上传src
        this.elements.submit.on('click', () => {
            this.upLoadSrc();
        });
        // 下载json
        this.elements.download.on('click', () => {
            this.downloadJSON();
        });
        //下载xml
        this.elements.download.on('contextmenu', (e: any) => {
            e.preventDefault();
            this.downloadXML();
            return false;
        });
        // 上传文件
        const browser = Utils.browser;
        if (!browser.version.trident && !browser.version.edge) {
            this.elements.addFile.on('change', () => {
                this.fileChange();
            });
        } else {
            // IE系的浏览器因为浏览器本身的bug无法用click()触发input元素的change事件,这里做下处理.
            setTimeout(() => {
                if (this.elements.addFile.getAttribute('value').length > 0) {
                    this.fileChange();
                }
            }, 0);
        }
    }
    private TPL() {
        const { prefix } = this;
        return `
            <div class="${prefix}-add-file">点击或拖拽上传文件（xml, json）<input type="file" class="drop"></div>
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
    // 上传文件
    private fileChange() {
        this.update((result: LocalInterface) => {
            this.nav.infoSet.setLocalSettings(result);
            this.elements.typeInfo.reload(this.local.typeList);
            this.nav.list.load();
        });
    }

    // 上传单条记录
    private upLoadSrc() {
        const typeId = this.local.typeList.value;
        const name = $.trim(this.elements.nameInfo.value());
        const src = $.trim(this.elements.srcInfo.value());
        if (name && src) {
            this.nav.infoSet.setSrcInfo({
                typeId,
                name,
                src,
            }, () => {
                this.elements.nameInfo.value('');
                this.elements.srcInfo.value('');
                this.nav.list.load();
            });
        } else {
            console.log(123123);
        }
    }
    // 下载xml
    private downloadXML() {
        try {
            const { local } = this;
            const { items } = local.typeList;
            const src = local.srcList;
            let reXml = '';
            reXml += `<type value="${local.typeList.value}" height="${local.typeList.maxHeight}"></type>\n`;
            items.forEach((ele) => {
                reXml += `<item id="${ele.id}" name="${ele.name}"></item>\n`;
            });
            items.forEach((ele) => {
                if (src[ele.id]) {
                    src[ele.id].forEach((item: LinkListInterface) => {
                        reXml += `<list id="${ele.id}" name="${item.name}" src="${encodeURIComponent(item.src)}"></list>\n`;
                    });
                }
            });
            Utils.download({
                text: `<filters>\n${reXml}</filters>`,
                type: 'text/xml;charset=utf-8',
                fileName: 'nav-x.xml',
            });
        } catch (error) {
            console.warn(error);
        }
    }
    // 下载json
    private downloadJSON() {
        try {
            Utils.download({
                text: JSON.stringify(this.nav.infoSet.local, null, '\t'),
                type: 'text/json;charset=utf-8',
                fileName: 'nav-x.json',
            });
        } catch (error) {
            console.warn(error);
        }
    }
    // 上传文件
    private update(cb: Function) {
        const file = this.elements.addFile[0].files[0];
        const { type } = file;
        const reader: any = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            if (/\w+\/json/.test(type)) {
                try {
                    typeof cb === 'function' && cb(JSON.parse(reader.result));
                } catch (error) {
                    console.log(error);
                }
            } else if (/\w+\/xml/.test(type)) {
                typeof cb === 'function' && cb(this.parseXML(reader.result));
            }
        };
        reader.onerror = (e: any) => {
            console.log(e);
        };
    }
    // 格式化xml -> json
    private parseXML(result: string) {
        const json: any = {
            typeList: {},
            srcList: {},
        };
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result, 'text/xml');
        const type = xmlDoc.getElementsByTagName('type')[0];
        const items = xmlDoc.getElementsByTagName('item');
        const list = xmlDoc.getElementsByTagName('list');
        json.typeList = {
            value: Header.getAttributeValue(type, 'value'),
            maxHeight: Header.getAttributeValue(type, 'height'),
            items: [],
        };
        for (let i = 0, len = items.length; i < len; i += 1) {
            const ele = items[i];
            json.typeList.items.push({
                id: Header.getAttributeValue(ele, 'id'),
                name: Header.getAttributeValue(ele, 'name'),
            });
        }
        for (let i = 0, len = list.length; i < len; i += 1) {
            const ele = list[i];
            const id = Header.getAttributeValue(ele, 'id');
            if (typeof id !== 'undefined') {
                const it = {
                    src: decodeURIComponent(Header.getAttributeValue(ele, 'src')),
                    name: Header.getAttributeValue(ele, 'name'),
                };
                if (json.srcList[id]) {
                    json.srcList[id].push(it);
                } else {
                    json.srcList[id] = [it];
                }
            }
        }
        return json;
    }

    static getAttributeValue(xmlNode: Element, attrName: string) {
        if (!xmlNode) return '';
        if (!xmlNode.attributes) return '';
        if (xmlNode.attributes[attrName] !== null) return xmlNode.attributes[attrName].value;
        if (xmlNode.attributes.getNamedItem(attrName) !== null) {
            return xmlNode.attributes.getNamedItem(attrName).value;
        }
        return '';
    }
}

export default Header;
