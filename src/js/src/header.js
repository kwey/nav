import Utils from '../utils/utils.js';
import UI from "../../../ui/src/js";
import pako from "pako";


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

        this.elements = {
            addFile: this.container.find(`.${prefix}-add-file`),
            addinfo: this.container.find(`.${prefix}-add-info`),
            typeInfo: new UI.Select($(`.${prefix}-type`)[0], this.nav.typeList),
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
            this.nav.typeList.items.push(e);
            this.nav.typeList.value = e.id;
            this.nav.srcList[e.id] = [];
            this.nav.infoSet.setLocalSettings();
            this.elements.typeInfo.reload(this.nav.typeList);
        });

        this.elements.submit.on('click', (e) => {
            this.upLoadSrc();
        });

        this.elements.download.on('click', (e) => {
            this.downloadXML();
            this.downloadJSON();
        });
        this.elements.addFile.on('click', (e) => {
            this.upload();
        });
        
    }

    TPL() {
        const prefix = this.prefix;
        return `
            <div class="${prefix}-add-file">点击或拖拽上传文件（xml, json）</div>
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
        const typeId = this.nav.typeList.value;
        const name = $.trim(this.nameInfo.value());
        const src = $.trim(this.srcInfo.value());
        if (name && src) {
            this.nav.infoSet.setSrcInfo({
                typeId,
                name,
                src
            }, () => {
                this.nameInfo.value('');
                this.srcInfo.value('');
                this.nav.list.load();
            });
        } else {
            console.log(123123);
        }
    }
    downloadXML() {
        try {
            const local = this.nav.infoSet.local;
            const items = local.typeList.items;
            const src = local.srcList;
            let reXml = '';
            reXml += '<type value="' + local.typeList.value + '" height="' + local.typeList.maxHeight + '"></type>\n';
            items.forEach(ele => {
                reXml += '<item id="' + ele.id + '">' + ele.name + '</item>\n'
            });
            items.forEach(ele => {
                src[ele.id].forEach(item => {
                    reXml += '<list id="' + ele.id + '" name="' + item.name + '">' + item.src + '</list>\n'
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
    upload() {
        Utils.upload((reader) => {
            console.log(reader);
            const arrayBuffer = reader.result;
            const dataView = new DataView(arrayBuffer);
            const len = dataView.byteLength;
            if (!this.decoder) {
                this.decoder = Utils.getDecoder();
            }
            const tag = this.decoder.decode(arrayBuffer.slice(0, 4));
            const ver = dataView.getInt32(4);
            const res = dataView.getInt32(8);
            const num = dataView.getInt32(12);

            const data = {};
            data.list = [];
            data.zip = [];
            data.pageList = [];
            let offset = 16,
                packetLen = 4;
            for (let i = 0; i < num; i++) {
                const time = dataView.getInt32(offset + 4);
                const off = dataView.getInt32(offset + 12);
                offset += packetLen * 4;
                data.list.push({
                    time,
                    off
                })
            }
            console.time('object');
            data.list.reduce((last, now) => {
                if (last !== 0) {
                    const input = arrayBuffer.slice(last.off, now.off);
                    data.zip.push({
                        zip: pako.inflate(input).buffer,
                    })
                }
                return now;
            }, 0)
            console.timeEnd('object');
            data.zip.length = 1;
            let width, height, time, page, l, dw, pages = [];
            console.time('object1');
            data.zip.forEach(item => {
                dw = new DataView(item.zip);
                for (let i = 0, len = dw.byteLength; i < len;) {
                    width = width || dw.getInt16(i);
                    height = height || dw.getInt16(i + 2);
                    l = l || (width * height) / 8;
                    time = dw.getInt32(i + 8);
                    page = item.zip.slice(i + 12, i + 12 + l);
                    page = 'data:image/png;base64,' + btoa(String.fromCharCode(...new Uint8Array(page)));
                    i = i + 12 +l;
                    pages.push({
                        width,
                        height,
                        time,
                        page,
                    });
                }

                data.pageList.push(pages)
            })
            console.timeEnd('object1');
            this.container.append(`<img src="${data.pageList[0][0].page}">`);
            // for (; offset < num ; offset += packetLen) {
            //     packetLen = dataView.getInt32(offset);
            //     headerLen = dataView.getInt16(offset + STATE.WS_HEADER_OFFSET);
            //     // body = JSON.parse(this.decoder.decode(arrayBuffer.slice(offset + headerLen,
            //     //     offset + packetLen)));
            //     try {
            //         body = JSON.parse(this.decoder.decode(arrayBuffer.slice(offset + headerLen, offset + packetLen)));
            //         data.body = body;
            //     } catch (e) {
            //         body = this.decoder.decode(arrayBuffer.slice(offset + headerLen, offset + packetLen));
            //         console.error('decode body error:', new Uint8Array(arrayBuffer), data);
            //     }
            // }


            // console.log(tag, ver, res, num);
        })
    }
}

export default Header;
