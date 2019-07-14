import EventEmitter from 'events'
import InfoSet from './info-set'
import Template from './template'
import Header from './header'
import List from './list'
import File from './file'
import Global from './global'

export interface ConfigInterface {
    prefix: string
    className: string
    url: string
}
export interface ElementsInterface {
    [key: string]: any
}

class Nav extends EventEmitter {
    config: ConfigInterface
    prefix: string
    cmClass: string
    container: HTMLElement
    infoSet: InfoSet
    template: Template
    header: Header
    list: List
    file: File

    constructor(config: ConfigInterface) {
        super()
        this.config = config
        this.prefix = 'nav-x'
        this.cmClass = 'nav-cm' // 供右键选择target
        this.container =
            document.querySelector(`.${config.className}`) || document.createElement('div')
        console.log(this)
        this.init()
    }

    init() {
        console.log(this.config)
        this.infoSet = new InfoSet(this)
        this.template = new Template(this)
        this.header = new Header(this)
        this.list = new List(this)
        this.file = new File(this)
    }
    getData() {
        return this.infoSet.local
    }
    reload() {
        this.emit(Global.NAV_RELOAD)
    }
}

export default Nav
