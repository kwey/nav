import Utils from '../utils/utils.js';
import UI from "../../../ui/src/js";
import pako from "pako";
// import ImageTracer from "imagetracerjs";
import BitView from "bitview";



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
                for (let i = 0, len = dw.byteLength / 1; i < len;) {
                    width = width || dw.getInt16(i);
                    height = height || dw.getInt16(i + 2);
                    l = l || (width * height) / 8;
                    time = dw.getInt32(i + 8);
                    page = item.zip.slice(i + 12, i + 12 + l);
                    page = this.parseImage(width, height, page)
                    // page = 'data:image/png;base64,' + btoa(String.fromCharCode(...new Uint8Array(page)));
                    i = i + 12 +l;
                    pages.push({
                        width,
                        height,
                        time,
                        page,
                    });
                }
                
            })
            // data.zip.forEach(item => {
            //     dw = new DataView(item.zip);
            //     for (let i = 0, len = dw.byteLength; i < len;) {
            //         width = width || dw.getInt16(i);
            //         height = height || dw.getInt16(i + 2);
            //         l = l || (width * height) / 8;
            //         time = dw.getInt32(i + 8);
            //         page = item.zip.slice(i + 12, i + 12 + l);
            //         page = 'data:image/png;base64,' + btoa(String.fromCharCode(...new Uint8Array(page)));
            //         i = i + 12 +l;
            //         pages.push({
            //             width,
            //             height,
            //             time,
            //             page,
            //         });
            //     }

            //     data.pageList.push(pages)
            // })
            console.timeEnd('object1');

            // console.log(tag, ver, res, num);
        })
    }
    parseImage(width, height, buffer) {
        console.time('imagedataToSVG');
        const image0Dataview = new DataView(buffer);
        // const width = image0Dataview.getInt16(0);
        // const height = image0Dataview.getInt16(2);
        // const pts = image0Dataview.getInt32(8);
        // const base64bmp = buffer.slice(12, width * height / 8 + 12)
        const base64bmp = buffer

        // console.log(newImageData);

        const bitArray = new Uint8ClampedArray(width * height * 4);
        let bitArrayIndex = 0;
        for (var i = 0; i < image0Dataview.byteLength; i ++) {
            let t = image0Dataview.getInt8(i);
            let tempArrayBuffer = base64bmp.slice(i, i + 1);
            // let tempDataView = new DataView(tempArrayBuffer);
            // let tempUint8array = new Uint8Array(tempArrayBuffer)

            if (t !== 0) {
                const aasd = t;
            }

            let bitview = new BitView(tempArrayBuffer);
            for (let j = 0; j < 8; j ++) {
                for (let k = 0; k < 4; k ++) {
                    bitArray[bitArrayIndex] = bitview.get(j) === 0 ? 0 : 255;
                    bitArrayIndex ++;
                }
                
            }
        }

        // console.log(bitArray);

        
        // const svgstring = ImageTracer.imagedataToSVG({
        //     width: width,
        //     height: height,
        //     data: bitArray
        // }, 'artistic2');

        const data = new ImageData(bitArray, width, height)
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.putImageData(data, 0, 0);

        // Get the data-URL formatted image
        var dataURL = canvas.toDataURL("image/png");
        // artistic2 
        console.timeEnd('imagedataToSVG');


        // console.log(svgstring, new Uint8ClampedArray(bitArray));

        // document.body.innerHTML += svgstring.replace('opacity=\"0\"', 'opacity="1"');



         var image = new Image();

        //  var newStr = svgstring.replace('opacity=\"0\"', 'opacity="1"');
        //  var base64 = 'data:image/svg+xml;base64,' + window.btoa(newStr);
        //   image.src = base64;
        //   document.body.appendChild(image);
        //   return base64;

          image.src = dataURL;
          document.body.appendChild(image);
          return dataURL;
    }
    imagedata_to_image(imagedata) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        ctx.putImageData(imagedata, 0, 0);
    
        return canvas.toDataURL('image/png');
    }
}

export default Header;
