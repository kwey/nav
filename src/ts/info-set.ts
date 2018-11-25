import Utils from './utils';

import Nav from './nav';
import { SelectOptionsInterface, SelectListInterface } from '../../ui/src/ts/select';
import { LinkListInterface } from '../../ui/src/ts/link';

export interface LocalInterface {
    typeList: SelectOptionsInterface;
    srcList: {[key: string]: any[]};
}
export interface SetSrcInterface extends LinkListInterface{
    typeId: string;
}

class InfoSet {
    prefix: string;
    nav: Nav;
    local: LocalInterface;

    constructor(nav: Nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.init();
    }

    init() {
        try {
            this.local = JSON.parse(Utils.getLocalSettings(`${this.prefix}-kwe`));
        } catch (error) {
            console.log(error);
        }
        if (!this.local || !this.local.typeList || !this.local.srcList) {
            this.local = {
                typeList: {
                    value: '0',
                    maxHeight: 150,
                    items: [],
                },
                srcList: {},
            };
            this.setLocalSettings();
        }
    }
    // 保存类型
    setTypeInfo(info: SelectListInterface, cb?: Function) {
        const list = this.local.typeList.items;
        const hasType = list.some(ele => ele.id === info.id);
        this.local.typeList.value = info.id;
        if (!hasType) {
            this.local.typeList.items.push(info);
            this.local.srcList[info.id] = [];
        }
        typeof cb === 'function' && cb();
        this.setLocalSettings();
    }
    // 保存记录
    setSrcInfo(info: SetSrcInterface, cb?: Function) {
        const { typeId, name, src } = info;
        this.local.srcList[typeId] = this.local.srcList[typeId] || [];
        const l = this.local.srcList[typeId];
        const hasSrc = l.some((ele: LinkListInterface) => ele.name === name && ele.src === src);
        if (!hasSrc) {
            l.push({ name, src });
            typeof cb === 'function' && cb();
            this.setLocalSettings();
        }
    }
    // 存储到本地
    setLocalSettings(list?: LocalInterface) {
        this.local = list ? $.extend(true, this.local, list) : this.local;
        Utils.setLocalSettings(`${this.prefix}-kwe`, JSON.stringify(this.local));
    }
}

export default InfoSet;
