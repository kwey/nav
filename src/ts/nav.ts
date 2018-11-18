
import InfoSet from './info-set';
import Template from './template';
import Header from './header';
import List from './list';

export interface ConfigInterface {
    prefix: string;
    container: HTMLElement;
}

class Nav {
    config: ConfigInterface;
    prefix: string;
    container: HTMLElement;
    infoSet: InfoSet;
    template: Template;
    header: Header;
    list: List;

    constructor(config: ConfigInterface) {
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
        console.log(this.getVersion());
    }

    getVersion() {
        return {
            version: 'REPLACE_VERSION',
        };
    }
}

export default Nav;
