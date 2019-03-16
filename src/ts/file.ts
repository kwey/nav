import Utils from './utils';

import Nav, { ElementsInterface } from './nav';
import svg from './svg';
import { LocalInterface } from './info-set';
import { LinkListInterface } from '../../ui/src/ts/link';
import { SelectListInterface } from '../../ui/src/ts/select';

class File {
    prefix: string;
    nav: Nav;
    container: HTMLElement;
    local: LocalInterface;
    elements: ElementsInterface;

    constructor(nav: Nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.container = this.nav.template.file;
        this.local = this.nav.infoSet.local;
        this.init();
        this.golbalEvents();
    }

    init() {
        const { prefix } = this;
        this.container.innerHTML =  this.TPL();

        this.elements = {
            addFile: this.container.querySelector(`.${prefix}-file-drop`),
            download: this.container.querySelector(`.${prefix}-file-download`),
        };
    }

    private golbalEvents() {
        // 下载json
        this.elements.download.addEventListener('click', () => {
            this.downloadJSON();
        });
        //下载xml
        this.elements.download.addEventListener('contextmenu', (e: any) => {
            e.preventDefault();
            this.downloadXML();
            return false;
        });
        // 上传文件
        const browser = Utils.browser;
        if (!browser.version.trident && !browser.version.edge) {
            this.elements.addFile.addEventListener('change', () => {
                this.fileChange();
            });
        } else {
            // IE系的浏览器因为浏览器本身的bug无法用click()触发input元素的change事件,这里做下处理.
            setTimeout(() => {
                if (this.elements.addFile[0].getAttribute('value').length > 0) {
                    this.fileChange();
                }
            }, 0);
        }
    }
    private TPL() {
        const { prefix } = this;
        return `<span class="${prefix}-file-upload">${svg.upload}<input type="file" class="${prefix}-file-drop"></span>
                <span class="${prefix}-file-download">${svg.upload}</span>`;
    }
    // 上传文件
    private fileChange() {
        this.update((result: LocalInterface) => {
            this.nav.infoSet.setLocalSettings(result);
            this.nav.reload();
        });
    }

    // 下载xml
    private downloadXML() {
        try {
            const { typeList, srcList } = this.local;
            let reXml = '';
            reXml += `<type value="${typeList.value}" height="${typeList.maxHeight}"></type>\n`;
            typeList.items.forEach((ele) => {
                reXml += `<item id="${ele.id}" name="${ele.name}"></item>\n`;
            });
            typeList.items.forEach((ele) => {
                if (srcList[ele.id]) {
                    srcList[ele.id].forEach((item: LinkListInterface) => {
                        reXml += `<list tid="${ele.id}" id="${item.id}" name="${item.name}" src="${encodeURIComponent(item.src)}"></list>\n`;
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
                text: JSON.stringify(this.local, null),
                type: 'text/json;charset=utf-8',
                fileName: 'nav-x.json',
            });
        } catch (error) {
            console.warn(error);
        }
    }
    // 上传文件
    private update(cb: Function) {
        const file = (this.elements.addFile as any).files[0];
        const type = file.type;
        const reader: any = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            if (/\w+\/json/.test(type)) {
                try {
                    cb(JSON.parse(reader.result));
                } catch (error) {
                    console.log(error);
                }
            } else if (/\w+\/xml/.test(type)) {
                cb(this.parseXML(reader.result));
            }
        };
        reader.onerror = (e: any) => {
            console.log(e);
        };
    }
    // 格式化xml -> json
    private parseXML(result: string): void {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result, 'text/xml');
        const type = xmlDoc.getElementsByTagName('type')[0];
        const items = xmlDoc.getElementsByTagName('item');
        const list = xmlDoc.getElementsByTagName('list');
        const local = Utils.extend(true, this.local, {
            typeList: {
                value: File.getAttributeValue(type, 'value'),
                maxHeight: +File.getAttributeValue(type, 'height'),
            }
        });
        let tid = '';
        for (let i = 0, len = items.length; i < len; i += 1) {
            const ele = items[i];
            tid = File.getAttributeValue(ele, 'id');
            const hasType = local.typeList.items.some((item: SelectListInterface) => {
                return item.id === tid;
            });
            !hasType && local.typeList.items.push({
                id: tid,
                name: File.getAttributeValue(ele, 'name'),
            });
        }
        for (let i = 0, len = list.length; i < len; i += 1) {
            const ele = list[i];
            const tid = File.getAttributeValue(ele, 'tid');
            if (typeof tid !== 'undefined') {
                const id = File.getAttributeValue(ele, 'id');
                const it = {
                    src: decodeURIComponent(File.getAttributeValue(ele, 'src')),
                    name: File.getAttributeValue(ele, 'name'),
                    id,
                };
                if (local.srcList[tid]) {
                    const hasSrc = local.srcList[tid].some((item: SelectListInterface) => {
                        return item.id === id;
                    });
                    !hasSrc && local.srcList[tid].push(it);
                } else {
                    local.srcList[tid] = [it];
                }
            }
        }
        return local;
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

export default File;
