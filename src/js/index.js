

import './../css/index.less';

import Template from './src/template';
import Header from './src/header';
import List from './src/list';

class KNav {
    constructor(config) {
        this.config = config;
        this.prefix =  'nav-x';
        this.container = config.container || document.createElement('div');
        this.typeList = {
            id: '2',
            maxHeight: 150,
            items: [
                {
                    name: '黑体',
                    id: '1',
                }, {
                    name: '宋体',
                    id: '2',
                    disabled: true,
                }, {
                    name: '新宋体',
                    id: '3',
                }, {
                    name: '仿宋',
                    id: '4',
                }, {
                    name: '微软雅黑',
                    id: '5',
                }
            ]};
        
        this.init();
        return this;
    }

    init() {
        this.template = new Template(this);
        this.header = new Header(this);
        this.list = new List(this);
        console.log(KNav.getVersion());
    }

    static getVersion() {
        return {
            version: 'REPLACE_VERSION',
        };
    }
}

export default KNav;
