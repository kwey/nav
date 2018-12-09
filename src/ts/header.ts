import Utils from './utils';
import Global from './global';
import Nav from './nav';

import { Select, Input, Button, Contextmenu, Tooltip } from '../../ui/src/ui';
import { LocalInterface } from './info-set';
import { SelectListInterface } from '../../ui/src/ts/select';

class Header {
    prefix: string;
    nav: Nav;
    container: JQuery;
    local: LocalInterface;
    elements: any;
    typeMenu: Contextmenu;

    constructor(nav: Nav) {
        this.nav = nav;
        this.prefix = this.nav.prefix;
        this.container = this.nav.template.header;
        this.local = this.nav.infoSet.local;
        this.init();
        this.golbalEvents();
    }

    init() {
        const { prefix } = this;
        this.container.append(this.TPL());

        this.elements = {
            addinfo: this.container.find(`.${prefix}-add-info`),
            typeInfo: new Select($(`.${prefix}-type`)[0], {
                items: this.local.typeList.items,
                cmClass: this.nav.cmClass,
            }),
            nameInfo: new Input($(`.${prefix}-name-input`)[0], {}),
            srcInfo: new Input($(`.${prefix}-src-input`)[0], {}),
            submit: new Button($(`.${prefix}-add-btn`)[0], {
                name: '上传',
            }),
        };
    }

    private golbalEvents() {
        // 回车 添加类型
        this.elements.typeInfo.on('input', (item: SelectListInterface) => {
            this.nav.infoSet.setTypeInfo(item);
            // this.reload();
        });
        // 选择类型
        this.elements.typeInfo.on('change', (item: SelectListInterface) => {
            this.nav.infoSet.setTypeInfo(item);
        });
        // 类型收起
        this.elements.typeInfo.on('fold', () => {
            this.typeMenu && this.typeMenu.hide();
        });
        // 上传src
        this.elements.submit.on('click', () => {
            this.upLoadSrc();
        });
        this.elements.srcInfo.on('keydown', (e: KeyboardEvent) => {
            if (e.keyCode === 13 || e.charCode === 13) {
                this.upLoadSrc();
            }
        });
        // 绑定右键事件
        this.typeMenuEvent();
        // reload
        this.nav.bind(Global.NAV_RELOAD, () => {
            this.reload();
        });
    }
    // 类型右键
    private typeMenuEvent() {
        this.typeMenu = new Contextmenu($(`.${this.prefix}-type`)[0], {
            menu: [],
            changedMode: true,
            changedType: 0,
            cmClass: this.nav.cmClass,
            onChange: (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                const id = $(target).data('id');
                const name = target.textContent;
                const menu = [
                    {
                        type: 'event',
                        text: '删除 ' + name,
                        click: () => {
                            id && this.removeType(id);
                        }
                    },
                ];
                return menu;
            }
        });
    }
    private TPL() {
        const { prefix } = this;
        return `<div class="${prefix}-add-info">
                <div class="${prefix}-type"></div>
                <div class="${prefix}-name">name: </div>
                <div class="${prefix}-name-input"></div>
                <div class="${prefix}-src">src: </div>
                <div class="${prefix}-src-input"></div>
                <div class="${prefix}-add-btn"></div>
            </div>`;
    }
    // 删除type
    private removeType(id: string) {
        const typelist = this.local.typeList.items;
        Array.isArray(typelist) && typelist.some((item: SelectListInterface, index: number) => {
            if (item.id === id) {
                typelist.splice(index, 1);
                if (typelist.length && this.local.typeList.value === id) {
                    this.local.typeList.value = this.local.typeList.items[0].id;
                }
                this.elements.typeInfo.removeType(id);
                if (this.local.srcList[id]) {
                    delete this.local.srcList[id];
                    this.nav.list.load();
                }
                this.nav.infoSet.setLocalSettings();
                return true;
            }
        });
    }

    // 上传单条记录 name中含转义字符会导致xml无法获取
    private upLoadSrc() {
        const tid = this.local.typeList.value;
        const name = $.trim(this.elements.nameInfo.value());
        const src = $.trim(this.elements.srcInfo.value());
        this.local.srcList[tid] = this.local.srcList[tid] || [];
        const id = this.local.srcList[tid].length + '_' + Utils.guid(1);
        if (name && src) {
            this.nav.infoSet.setSrcInfo({
                tid,
                name,
                src,
                id,
            }, () => {
                this.elements.nameInfo.value('');
                this.elements.srcInfo.value('');
                this.nav.list.load();
            });
        } else {
            new Tooltip(this.container[0], {
                value: '数据不全',
                position: 'cb',
                time: 2000,
            });
        }
    }
    // reload
    reload() {
        this.elements.typeInfo.reload(this.local.typeList);
    }
}

export default Header;
