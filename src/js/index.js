

import './../css/index.less';

import Templete from './src/templete';

class KNav {
    constructor(config) {
        this.config = config;
        this.init();
        return this;
    }

    init() {
        this.templete = new Templete(this);
        console.log(KNav.getVersion());
    }

    static getVersion() {
        return {
            version: 'REPLACE_VERSION',
        };
    }
}

export default KNav;
