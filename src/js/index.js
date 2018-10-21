

import '../css/index.less';

import Template from './src/template';
import Header from './src/header';
import List from './src/list';
import InfoSet from './src/info-set';

class Nav {
    constructor(config) {
        this.config = config;
        this.prefix = 'nav-x';
        this.container = config.container || document.createElement('div');
        this.init();
        return this;
    }

    init() {
        this.infoSet = new InfoSet(this);
        this.template = new Template(this);
        this.header = new Header(this);
        this.list = new List(this);
        console.log(Nav.getVersion());
    }

    static getVersion() {
        return {
            version: 'REPLACE_VERSION',
        };
    }
}

export default Nav;
