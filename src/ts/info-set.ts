import Utils from './utils'
import Global from './global'

import Nav from './nav'
import { SelectOptionsInterface, SelectListInterface } from '../../ui/src/ts/select'
import { LinkListInterface } from '../../ui/src/ts/link'

export interface LocalInterface {
    typeList: SelectOptionsInterface
    srcList: LocalSrcInterface
}
interface LocalSrcInterface {
    [key: string]: LinkListInterface[]
}
export interface SetSrcInterface extends LinkListInterface {
    tid: string
}

class InfoSet {
    prefix: string
    nav: Nav
    local: LocalInterface

    constructor(nav: Nav) {
        this.nav = nav
        this.prefix = this.nav.prefix
        this.init()
        this.golbalEvents()
    }

    init() {
        try {
            this.local = JSON.parse(Utils.getLocalSettings(`${this.prefix}-kwe`))
        } catch (error) {
            console.log(error)
        }
        if (!this.local || !this.local.typeList || !this.local.srcList) {
            this.local = Utils.localInfoDefault()
            this.getRemote((data: LocalInterface) => {
                if (data) {
                    this.mergeLocal(data)
                    this.nav.reload()
                }
                this.setLocalSettings()
            })
        }
    }
    golbalEvents() {
        // clear
        this.nav.on(Global.NAV_CLEAR, () => {
            this.clearAll()
        })
    }
    // 保存类型
    setTypeInfo(info: SelectListInterface, cb?: Function) {
        const list = this.local.typeList.items
        const hasType = list.some(ele => ele.id === info.id)
        this.local.typeList.value = info.id
        if (!hasType) {
            this.local.typeList.items.unshift(info)
            this.local.srcList[info.id] = []
        }
        typeof cb === 'function' && cb()
        this.setLocalSettings()
    }
    // 保存记录
    setSrcInfo(info: SetSrcInterface, cb?: Function) {
        const { tid, name, src, id } = info
        const l = this.local.srcList[tid]
        const hasSrc = l.some((ele: LinkListInterface) => ele.id === id)
        if (!hasSrc) {
            l.push({ name, src, id })
            typeof cb === 'function' && cb()
            this.setLocalSettings()
        }
    }
    // 删除type
    removeType(id: string) {
        const typelist = this.local.typeList.items
        const hasType =
            Array.isArray(typelist) &&
            typelist.some((item: SelectListInterface, index: number) => {
                if (item.id === id) {
                    typelist.splice(index, 1)
                    if (typelist.length && this.local.typeList.value === id) {
                        this.local.typeList.value = this.local.typeList.items[0].id
                    }
                    if (this.local.srcList[id]) {
                        delete this.local.srcList[id]
                        this.nav.list.load()
                    }
                    this.setLocalSettings()
                    return true
                }
            })
        return hasType
    }
    // 清空
    clearAll() {
        this.local = Utils.localInfoDefault()
        Utils.setLocalSettings(`${this.prefix}-kwe`, JSON.stringify(this.local))
    }
    // 存储到本地
    setLocalSettings(list?: LocalInterface) {
        if (list) {
            this.mergeLocal(list)
        }
        Utils.setLocalSettings(`${this.prefix}-kwe`, JSON.stringify(this.local))
    }
    // 获取外部列表
    getRemote(cb: Function) {
        const url = this.nav.config.url
        if (url) {
            Utils.fetch({ url }).then((res: LocalInterface) => {
                if (res) {
                    cb(res)
                } else {
                    cb(null)
                }
            })
        } else {
            cb(null)
        }
    }
    // 合并local
    private mergeLocal(list: LocalInterface) {
        const { typeList, srcList } = this.local
        this.local.typeList = this.mergeType(typeList, list.typeList)
        this.local.srcList = this.mergeSrc(srcList, list.srcList)
    }
    // 合并type
    private mergeType(targetType: SelectOptionsInterface, list: SelectOptionsInterface) {
        let hasType = false
        targetType.value = list.value
        Array.isArray(list.items) &&
            list.items.forEach((item: SelectListInterface) => {
                hasType = targetType.items.some((type: SelectListInterface) => {
                    return type.id === item.id
                })
                if (!hasType) {
                    targetType.items.push(item)
                }
            })
        return targetType
    }
    // 合并src
    private mergeSrc(targetSrc: LocalSrcInterface, srcList: LocalSrcInterface) {
        let hasSrc = false
        const keys = Object.keys(srcList)
        Array.isArray(keys) &&
            keys.forEach((item: string) => {
                const target = targetSrc[item]
                const source = srcList[item]
                if (!target || target.length === 0) {
                    targetSrc[item] = source || []
                } else {
                    Array.isArray(source) &&
                        source.forEach((link: LinkListInterface) => {
                            hasSrc = target.some((src: SelectListInterface) => {
                                return src.id === link.id
                            })
                            if (!hasSrc) {
                                targetSrc[item].push(link)
                            }
                        })
                }
            })
        return targetSrc
    }
}

export default InfoSet
