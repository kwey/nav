import Utils from '../utils/utils';

class InfoSet {
    constructor(nav) {
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
                srcList: {},
            };
            this.setLocalSettings();
        }
    }

    setSrcInfo(info, cb) {
        const infoList = Array.isArray(info) ? info : [info];
        let more = 0;
        infoList.forEach((item) => {
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

    setLocalSettings(list) {
        this.local = list ? $.extend(true, this.local, list) : this.local;
        Utils.setLocalSettings(`${this.prefix}-kwe`, JSON.stringify(this.local));
    }

    verifyDistinct(item) {
        const { typeId, name, src } = item;
        const list = this.local.typeList.items;
        const hasType = list.some(ele => ele.id === typeId);
        this.local.srcList[typeId] = this.local.srcList[typeId] || [];
        const l = this.local.srcList[typeId];
        if (hasType) {
            const hasSrc = l && l.some(ele => ele.name === name && ele.src === src);
            if (hasSrc) {
                return true;
            }
            l.push({ name, src });
            return false;
        }
        list.push({
            name: typeId,
            id: list.lenght,
        });
        l.push({ name, src });
        return false;
    }
}

export default InfoSet;
