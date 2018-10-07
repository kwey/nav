import Utils from '../utils';


class InfoSet {
    constructor(nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.init();
    }

    init() {
        this.getLocal();
        this.getSrcInfo();
        this.getTypeInfo();
    }
    
    getLocal() {
        this.local = Utils.getLocalSettings(this.prefix + 'kwe');
    }
    
    setSrcInfo(infloList) {
        if (Array.isArray(infloList)) {
            infloList.forEach(item => {
                this.local && this.local.srcList = 
            });
            Utils.setLocalSettings(this.prefix + 'kwe', this.prefix.local);
        }
    }

    getSrcInfo() {
        this.nav.typeList = this.local && this.local.srcList || {
            list: [{
                type: 'info',
                list: [
                    {
                        name: 'bili',
                        src: ' http://www.bilibili.com'
                    },
                ]
            }]
        }

    }

    getTypeInfo() {
        this.nav.typeList = this.local && this.local.typeList || {
            id: '1',
            maxHeight: 150,
            items: [
                {
                    name: 'info',
                    id: '1',
                }
            ]
        }
        
    }
    upLoadSrc() {
        const type = this.typeInfo.value();
        const name = $.trim(this.nameInfo.value());
        const src = $.trim(this.srcInfo.value());
        if (name && src) {
            Utils.setLocalSettings();
        } else {
            
        }
    }
}

export default InfoSet;
