import Utils from '../utils/utils.js';
import UI from "../../../ui/src/js";


class Header {
    constructor(nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.container = this.nav.template.header;
        this.local = this.nav.infoSet.local;
        this.init();
    }

    init() {
        const prefix = this.prefix;
        this.container.append(this.TPL());

        this.elements = {
            addFile: this.container.find(`.${prefix}-add-file .drop`),
            addinfo: this.container.find(`.${prefix}-add-info`),
            typeInfo: new UI.Select($(`.${prefix}-type`)[0], this.local.typeList),
            nameInfo: new UI.Input($(`.${prefix}-name-input`)[0]),
            srcInfo: new UI.Input($(`.${prefix}-src-input`)[0]),
            submit: new UI.Button($(`.${prefix}-add-btn`)[0], {
                name: '上传',
            }),
            download: new UI.Button($(`.${prefix}-download-btn`)[0], {
                name: '下载',
            }),
        }

        this.elements.typeInfo.on('input', (e) => {
            this.local.typeList.items.push(e);
            this.local.typeList.value = e.id;
            this.local.srcList[e.id] = [];
            this.nav.infoSet.setLocalSettings();
            this.elements.typeInfo.reload(this.local.typeList);
        });
        
        this.elements.submit.on('click', (e) => {
            this.upLoadSrc();
        });
        
        this.elements.download.on('click', (e) => {
            this.downloadJSON();
        });
        this.elements.download.on('contextmenu', (e) => {
            e.preventDefault();
            this.downloadXML();
            return false;
        });
        const browser = Utils.browser();
        if (!browser.version.trident && !browser.version.edge) {
            this.elements.addFile.on('change', () => {
                this.fileChange();
            });
        } else {
            // IE系的浏览器因为浏览器本身的bug无法用click()触发input元素的change事件,这里做下处理.
            window['setTimeout'](() => {
                if (this.elements.addFile.getAttribute('value').length > 0) {
                    this.fileChange();
                }
            }, 0);    
        }
    }
    fileChange() {
        this.update((result) => {
            this.nav.infoSet.setLocalSettings(result);
            this.elements.typeInfo.reload(this.local.typeList);
            this.nav.list.load();
        });
    }
    TPL() {
        const prefix = this.prefix;
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
    upLoadSrc() {
        const typeId = this.local.typeList.value;
        const name = $.trim(this.elements.nameInfo.value());
        const src = $.trim(this.elements.srcInfo.value());
        if (name && src) {
            this.nav.infoSet.setSrcInfo({
                typeId,
                name,
                src
            }, () => {
                this.elements.nameInfo.value('');
                this.elements.srcInfo.value('');
                this.nav.list.load();
            });
        } else {
            console.log(123123);
        }
    }
    downloadXML() {
        try {
            const local = this.local;
            const items = local.typeList.items;
            const src = local.srcList;
            let reXml = '';
            reXml += '<type value="' + local.typeList.value + '" height="' + local.typeList.maxHeight + '"></type>\n';
            items.forEach(ele => {
                reXml += '<item id="' + ele.id + '" name="' + ele.name + '"></item>\n'
            });
            items.forEach(ele => {
                src[ele.id].forEach(item => {
                    reXml += '<list id="' + ele.id + '" name="' + item.name + '" src="' + item.src + '"></list>\n'
                })
            });
            Utils.download({
                text: `<filters>\n${reXml}</filters>`,
                type: 'text/xml;charset=utf-8',
                fileName: 'nav-x.xml'
            })
        } catch (error) {
            console.warn(error);
        }
    }
    downloadJSON() {
        try {
            Utils.download({
                text: JSON.stringify(this.nav.infoSet.local, null, '\t'),
                type: 'text/json;charset=utf-8',
                fileName: 'nav-x.json'
            })
        } catch (error) {
            console.warn(error);
        }
    }
    update(cb) {
        const file = this.elements.addFile[0]['files'][0];
        const type = file.type;
        const reader = new FileReader();
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
        reader.onerror = (e) => {
            console.log(e);
        };
    }

    parseXML(result) {
        const json = {
            srcList: {},
        };
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result,"text/xml");
        var type = xmlDoc.getElementsByTagName('type')[0];
        const items = xmlDoc.getElementsByTagName('item');
        const list = xmlDoc.getElementsByTagName('list');
        json.typeList = {
            value: this.getAttributeValue(type, 'value'),
            maxHeight: this.getAttributeValue(type, 'height'),
            items: [],
        };
        for (let i = 0, len = items.length; i < len; i++) {
            const ele = items[i];
            json.typeList.items.push({
                id: this.getAttributeValue(ele, 'id'),
                name: this.getAttributeValue(ele, 'name'),
            })
        }
        for (let i = 0, len = list.length; i < len; i++) {
            const ele = list[i];
            const id = this.getAttributeValue(ele, 'id');
            if (typeof id !== 'underfined') {
                const it = {
                    src: this.getAttributeValue(ele, 'src'),
                    name: this.getAttributeValue(ele, 'name'),
                };
                if (json.srcList[id]) {
                    json.srcList[id].push(it)
                } else {
                    json.srcList[id] = [it]
                }
            }
        }
        return json;
    }

    getAttributeValue (xmlNode, attrName){
        if(!xmlNode) return "" ;
        if(!xmlNode.attributes) return "" ;
        if(xmlNode.attributes[attrName] !== null) return xmlNode.attributes[attrName].value ;
        if(xmlNode.attributes.getNamedItem(attrName) !== null) return xmlNode.attributes.getNamedItem(attrName).value ;
        return "" ;
    }
}

export default Header;
