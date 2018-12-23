
import InfoSet from './info-set';
import Template from './template';
import Header from './header';
import List from './list';
import File from './file';
import Global from './global';

export interface ConfigInterface {
    prefix: string;
    className: string;
    url: string;
}
export interface ElementsInterface {
    [key: string]: JQuery;
}

class Nav {
    config: ConfigInterface;
    prefix: string;
    cmClass: string;
    container: JQuery;
    infoSet: InfoSet;
    template: Template;
    header: Header;
    list: List;
    file: File;

    constructor(config: ConfigInterface) {
        this.config = config;
        this.prefix = 'nav-x';
        this.cmClass = 'nav-cm'; // 供右键选择target
        this.container = $(`.${config.className}`) || $(document.createElement('div'));
        this.init();
        return this;
    }

    init() {
        this.infoSet = new InfoSet(this);
        this.template = new Template(this);
        this.header = new Header(this);
        this.list = new List(this);
        this.file = new File(this);
    }
    reload() {
        this.trigger(Global.NAV_RELOAD);
    }

    bind(type: any, callback?: any) {
        this.container.bind(type, callback);
    }
    unbind(type: string) {
        this.container.unbind(type);
    }
    trigger(type: string) {
        this.container.trigger.apply(this.container, [type, Array.prototype.slice.call(arguments, 1, arguments.length)]);
    }
}

export default Nav;
