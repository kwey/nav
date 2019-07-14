import Utils from './utils'
import Global from './global'
import Nav from './nav'

import { Select, Input, Button, Contextmenu, Tooltip } from '../../ui/src/ui'
import { LocalInterface } from './info-set'
import { SelectListInterface } from '../../ui/src/ts/select'

class Header {
    prefix: string
    nav: Nav
    container: HTMLElement
    local: LocalInterface
    elements: any
    typeMenu: Contextmenu
    teachWrap: HTMLElement

    constructor(nav: Nav) {
        this.nav = nav
        this.prefix = this.nav.prefix
        this.container = this.nav.template.header
        this.local = this.nav.infoSet.local
        this.init()
        this.golbalEvents()
    }

    init() {
        const { prefix } = this
        this.container.innerHTML = this.TPL()

        this.elements = {
            addinfo: this.container.querySelector(`.${prefix}-add-info`),
            typeInfo: new Select(this.container.querySelector(`.${prefix}-type`), {
                value: this.local.typeList.value,
                items: this.local.typeList.items,
                cmClass: this.nav.cmClass
            }),
            nameInfo: new Input(this.container.querySelector(`.${prefix}-name-input`), {}),
            srcInfo: new Input(this.container.querySelector(`.${prefix}-src-input`), {}),
            submit: new Button(this.container.querySelector(`.${prefix}-add-btn`), {
                name: '添加'
            }),
            clear: new Button(this.container.querySelector(`.${prefix}-clear`), {
                name: '清空'
            }),
            teach: this.container.querySelector(`.${prefix}-teach-info`)
        }
    }

    private golbalEvents() {
        // 回车 添加类型
        this.elements.typeInfo.on('input', (item: SelectListInterface) => {
            this.nav.infoSet.setTypeInfo(item)
            // this.reload();
        })
        // 选择类型
        this.elements.typeInfo.on('change', (item: SelectListInterface) => {
            this.nav.infoSet.setTypeInfo(item)
        })
        // 类型收起
        this.elements.typeInfo.on('fold', () => {
            this.typeMenu && this.typeMenu.hide()
        })
        // 上传src
        this.elements.submit.on('click', () => {
            this.upLoadSrc()
        })
        this.elements.nameInfo.on('keydown', (e: KeyboardEvent) => {
            if (e.keyCode === 13 || e.charCode === 13) {
                this.upLoadSrc()
            }
        })
        this.elements.srcInfo.on('keydown', (e: KeyboardEvent) => {
            if (e.keyCode === 13 || e.charCode === 13) {
                this.upLoadSrc()
            }
        })
        this.elements.clear.on('click', () => {
            this.clear()
        })
        this.elements.teach.addEventListener('click', () => {
            this.addTeachImg()
        })
        // 绑定右键事件
        this.typeMenuEvent()
        // reload
        this.nav.on(Global.NAV_RELOAD, () => {
            this.reload()
        })
    }
    // 类型右键
    private typeMenuEvent() {
        this.typeMenu = new Contextmenu(this.container.querySelector(`.${this.prefix}-type`), {
            menu: [],
            changedMode: true,
            changedType: 0,
            cmClass: this.nav.cmClass,
            onChange: (e: MouseEvent) => {
                const target = e.target as HTMLElement
                const id = target.getAttribute('data-id')
                const name = target.textContent
                const menu = [
                    {
                        type: 'event',
                        text: '删除 ' + name,
                        click: () => {
                            id && this.removeType(id)
                        }
                    }
                ]
                return menu
            }
        })
    }
    private TPL() {
        const { prefix } = this
        return `<div class="${prefix}-add-info">
                <div class="${prefix}-type"></div>
                <div class="${prefix}-name">name: </div>
                <div class="${prefix}-name-input"></div>
                <div class="${prefix}-src">src: </div>
                <div class="${prefix}-src-input"></div>
                <div class="${prefix}-add-btn"></div>
                <div class="${prefix}-clear"></div>
                <div class="${prefix}-teach-info">使用教程</div>
            </div>`
    }
    // 删除type
    private removeType(id: string) {
        if (this.nav.infoSet.removeType(id)) {
            this.elements.typeInfo.removeType(id)
        }
    }
    // 清空
    private clear() {
        this.nav.infoSet.clearAll()
    }

    // 上传单条记录 name中含转义字符会导致xml无法获取
    private upLoadSrc() {
        const tid = this.local.typeList.value
        const name = this.elements.nameInfo.value()
        const src = this.elements.srcInfo.value()
        this.local.srcList[tid] = this.local.srcList[tid] || []
        const id = this.local.srcList[tid].length + '_' + Utils.guid(1)
        if (name && src) {
            this.nav.infoSet.setSrcInfo(
                {
                    tid,
                    name,
                    src,
                    id
                },
                () => {
                    this.elements.nameInfo.value('')
                    this.elements.srcInfo.value('')
                    this.nav.list.load()
                }
            )
        } else {
            new Tooltip(this.container[0], {
                value: '数据不全',
                position: 'cb',
                time: 2000
            })
        }
    }
    addTeachImg() {
        if (this.teachWrap) {
            this.teachWrap.classList.remove(`${this.prefix}-teach-hide`)
        } else {
            this.teachWrap = document.createElement('div')
            this.teachWrap.classList.add(`${this.prefix}-teach`)
            this.teachWrap.innerHTML = `
                <div class="${this.prefix}-teach-close">X</div>
                <image class="${this.prefix}-teach-img" src="//www.webq.top/teach.jpg">
            `
            document.body.appendChild(this.teachWrap)
            this.teachWrap.querySelector(`.${this.prefix}-teach-close`).addEventListener('click', () => {
                this.teachWrap.classList.add(`${this.prefix}-teach-hide`)
            })
        }
    }
    // reload
    reload() {
        this.elements.typeInfo.reload(this.local.typeList)
    }
}

export default Header
