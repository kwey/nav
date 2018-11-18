import Utils from './utils';

import Nav from './nav';
import { SelectOptionsInterface } from '../../ui/src/ts/select';
import { LinkOptionsInterface, LinkListInterface } from '../../ui/src/ts/link';

export interface LocalInterface {
    typeList: SelectOptionsInterface;
    srcList: LinkOptionsInterface;
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
                    maxHeight: 100,
                    items: [],
                },
                srcList: {
                    list: [],
                },
            };
            this.setLocalSettings();
        }
    }

    setSrcInfo(info: SetSrcInterface | SetSrcInterface[], cb: Function) {
        const infoList = Array.isArray(info) ? info : [info];
        let more = 0;
        infoList.forEach((item: SetSrcInterface) => {
            const hasSrc = this.verifyDistinct(item);
            if (hasSrc) {
                console.log(1111111);
            } else {
                more++;
                typeof cb === 'function' && cb();
            }
        });
        more && this.setLocalSettings();
    }

    setLocalSettings(list?: any) {
        this.local = list ? $.extend(true, this.local, list) : this.local;
        Utils.setLocalSettings(`${this.prefix}-kwe`, JSON.stringify(this.local));
    }

    verifyDistinct(item: SetSrcInterface) {
        const { typeId, name, src } = item;
        const list = this.local.typeList.items;
        const hasType = list.some(ele => ele.id === typeId);
        this.local.srcList[typeId] = this.local.srcList[typeId] || [];
        const l = this.local.srcList[typeId];
        if (hasType) {
            const hasSrc = l && l.some((ele: LinkListInterface) => ele.name === name && ele.src === src);
            if (hasSrc) {
                return true;
            }
            l.push({ name, src });
            return false;
        }
        list.push({
            name: typeId,
            id: list.length + '-' + Utils.guid(1),
        });
        l.push({ name, src });
        return false;
    }
}

export default InfoSet;
