import axios from 'axios';
import { LocalInterface } from './info-set';
export interface DownloadInterface {
    text: any;
    fileName: string;
    type?: string;
}

class Utils {
    static readonly browser = {
        get version() {
            const ua = navigator.userAgent.toLowerCase();
            const isSafari = /(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.test(ua)
                || /(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.test(ua);
            const match = /(chrome)[ \/]([\w.]+)/.exec(ua) || '';
            const matched = {
                browser: match[5] || match[3] || match[1] || '',
                version: match[4] || match[2] || '0',
            };
            let version = 0;
            if (matched.browser) {
                version =  parseInt(matched.version, 10);
            }
            return {
                // 浏览器
                version,
                browser: matched.browser,

                // 系统
                linux: /Linux/i.test(ua),

                // 内核
                webKit: /AppleWebKit/i.test(ua),
                gecko: /Gecko/i.test(ua) && !/KHTML/i.test(ua),
                trident: /Trident/i.test(ua),
                presto: /Presto/i.test(ua),

                // 手机
                mobile: /AppleWebKit.*Mobile.*/i.test(ua),
                iOS: /Mac OS X[\s_\-\/](\d+[.\-_]\d+[.\-_]?\d*)/i.test(ua),
                iPhone: /iPhone/i.test(ua),
                iPad: /iPad/i.test(ua),
                webApp: !/Safari/i.test(ua),
                android: /Android/i.test(ua),
                windowsPhone: /Windows Phone/i.test(ua),
                microMessenger: /MicroMessenger/i.test(ua),

                // 桌面
                msie: /msie [\w.]+/i.test(ua),
                edge: /edge/i.test(ua),
                edgeBuild16299: /(\s|^)edge\/16.16299(\s|$)/i.test(ua),
                safari: isSafari,
                safariSupportMSE: isSafari && (/Version\/1\d/i).test(ua),
            };
        },
        get isMobile() {
            return this.version.mobile || this.version.iOS || this.version.android || this.version.windowsPhone;
        },
    };

    static getDecoder() {
        if (window['TextDecoder']) {
            return new window['TextDecoder']();
        }
        return {
            decode: (buf: any) => decodeURIComponent(window['escape'](
                String.fromCharCode.apply(String, new Uint8Array(buf)))),
        };
    }
    static extend(...arg: any) {
        let options;
        let target = arguments[0] || {};
        const length = arguments.length;
        let i = 1;
        let deep = false;
        let clone;
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== 'object' && typeof target !== 'function') {
            target = {};
        }
        if (length === i) {
            target = this;
            --i;
        }
        /* tslint:disable */
        if ((options = arg[i]) != null) {
            for (let name in options) {
                let src = target[name];
                let copy = options[name];
                if (src === copy) {
                    continue;
                }
                if (deep && copy && typeof copy === 'object') {
                    if (Array.isArray(copy)) {
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && typeof src === 'object' ? src : {};
                    }
                    target[name] = this.extend(deep, clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
    　　}
    　　return target;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
     */
    static assign(target: any, ...rest: any[]): any {
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        const to = Object(target);
        for (let i = 0; i < rest.length; i++) {
            const nextSource = rest[i];
            if (nextSource != null) { // Skip over if undefined or null
                for (const nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    }

    static getCookie(cookieName: string): string {
        const defaultResult = '';
        if (cookieName == null) {
            return defaultResult;
        }
        const cookies = document.cookie.split(';');
        const decodeCookieName = decodeURIComponent(cookieName);
        for (let i = 0; i < cookies.length; i++) {
            const [key, value] = cookies[i].trim().split('=');
            if (decodeURIComponent(key) === decodeCookieName) {
                return decodeURIComponent(value);
            }
        }
        return defaultResult;
    }

    static setCookie(name: string, value: string, days: number = 365) {
        const date = new Date();
        const encodeName = encodeURIComponent(name);
        const encodeValue = encodeURIComponent(value);
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${encodeName}=${encodeValue}; expires=${date.toUTCString()}; path=/; domain=.webq.com`;
    }

    static getLocalSettings(key: string): string {
        if (window.localStorage && localStorage.getItem) {
            return localStorage.getItem(key);
        } else {
            return this.getCookie(key);
        }
    }

    static setLocalSettings(key: string, val: string) {
        if (window.localStorage && localStorage.setItem) {
            try {
                return localStorage.setItem(key, val);
            } catch (e) {
            }
        } else {
            return this.setCookie(key, val);
        }
    }

    static getSessionSettings(key: string): string {
        if (window.sessionStorage && sessionStorage.getItem) {
            return sessionStorage.getItem(key);
        } else {
            return this.getCookie(key);
        }
    }

    static setSessionSettings(key: string, val: string) {
        if (window.sessionStorage && sessionStorage.setItem) {
            try {
                return sessionStorage.setItem(key, val);
            } catch (e) {
            }
        } else {
            return this.setCookie(key, val);
        }
    }

    /**
     * 格式化秒
     */
    static fmSeconds(second: number): string {
        let sec = second;
        if (sec == null) {
            sec = 0;
        }
        let ret: string;
        sec = Math.floor(sec) >> 0;
        ret = ('0' + sec % 60).slice(-2);
        ret = Math.floor(sec / 60) + ':' + ret;
        if (ret.length < 5) {
            ret = '0' + ret;
        }
        return ret;
    }

    static fmSecondsReverse(format: string): number {
        if (format == null) {
            return 0;
        }
        const secArr = format.toString().split(':').reverse();
        if (!secArr.length) {
            return 0;
        } else {
            return (parseInt(secArr[0], 10) || 0) + (parseInt(secArr[1], 10) || 0) * 60 + (parseInt(secArr[2], 10) || 0) * 3600;
        }
    }

    static getQueryString(url: string) {
        let queryString = '';
        if (url && url.split) {
            queryString = url.split('?')[1];
        }
        return queryString;
    }
    static canUseWebP() {
        try {
            const canvas = document.createElement('canvas');
            if (canvas.getContext && canvas.getContext('2d')) {
                try {
                    // 某些 Android 浏览器不兹词 toDataURL.
                    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
                } catch (error) {
                    return false;
                }
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
    static download(o: DownloadInterface) {
        const obj: DownloadInterface = {
            text: '',
            type: 'text/plain;charset=utf-8',
            fileName: 'text.txt',
            ...o,
        };
        const blob = new Blob([obj.text], { type: obj.type });
        if (window['navigator']['msSaveOrOpenBlob']) {
            // For IE
            navigator['msSaveBlob'](blob, obj.fileName);
        } else {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link['download'] = obj.fileName;
            link.style.display = 'none';
            link.target = '_blank';
            link.click();
            window['setTimeout'](() => {
                //  Remove unnecessary nodes and recycle the memory of blob
                link.remove();
                window.URL.revokeObjectURL(link.href);
            }, 3000);

        }
    }

    static upload(callback: Function) {
        // const uploader: any = $('<input type="file">');
        const uploader: HTMLElement = document.createElement('input');
        uploader.setAttribute('type', 'file');
        (() => {
            uploader.click();
        })();
        const reImport = () => {
            const reader = new FileReader();
            reader.readAsText(uploader['files'][0]);
            reader.onload = () => {
                callback(reader);
            };
        };
        if (!Utils.browser.version.trident && !Utils.browser.version.edge) {
            uploader.addEventListener('change', () => {
                reImport();
            });
        } else {
            // IE系的浏览器因为浏览器本身的bug无法用click()触发input元素的change事件,这里做下处理.
            window['setTimeout'](() => {
                if (uploader.getAttribute('value').length > 0) {
                    reImport();
                }
            }, 0);
        }
    }
    /**
     * 格式化时间截
     */
    static fmTimestamp(seconds: number): string {
        let ret: string;
        const date = new Date(seconds * 1000);
        ret = ('0' + date.getSeconds()).slice(-2);
        ret = ('0' + date.getMinutes() + ':' + ret).slice(-5);
        ret = ('0' + date.getHours() + ':' + ret).slice(-8);
        ret = ('0' + date.getDate() + ' ' + ret).slice(-11);
        ret = ('0' + (date.getMonth() + 1) + '-' + ret).slice(-14);
        // ret = date.getFullYear() + '-' + ret;
        return ret;
    }
    static formatDate(date: Date | null, format?: string): string {
        const d = date || new Date();
        let f = format || 'yyyy-MM-dd mm:ss';
        const mapping = {
            'M+': d.getMonth() + 1,
            'd+': d.getDate(),
            'h+': d.getHours(),
            'm+': d.getMinutes(),
            's+': d.getSeconds(),
            'q+': Math.floor((d.getMonth() + 3) / 3),
            'S+': d.getMilliseconds(),
        };
        if (/(y+)/i.test(f)) {
            f = f.replace(RegExp.$1, d.getFullYear().toString().substr(4 - RegExp.$1.length));
        }
        for (const k in mapping) {
            if (new RegExp(`(${k})`).test(f)) {
                const n = RegExp.$1.length === 1 ? mapping[k] : ('00' + mapping[k]).substr(mapping[k].toString().length);
                f = f.replace(RegExp.$1, n);
            }
        }
        return f;
    }
    static dateParser(date: string, time?: number): number | false {
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(date)) {
            const timeZone = time || 0;
            const [y, m, d] = date.split('-');
            return (+new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10))) * (1 / 1000) - (new Date().getTimezoneOffset() + timeZone * 60) * 60;
        } else {
            return false;
        }
    }
    /**
     * 数字到颜色
     */
    static colorFromInt(value: number): string {
        return '#' + ('00000' + value.toString(16)).slice(-6);
    }

    static timeParser(str: string): number | false {
        const t = /^(\d+h)?(\d+m|^s)?(\d+s)?(\d+ms)?$/.exec(str);
        const getNum = (s: string): number => {
            return parseInt(s, 10) || 0;
        };
        if (t && t[0]) {
            return getNum(t[1]) * 60 * 60 + getNum(t[2]) * 60 + getNum(t[3]) + getNum(t[4]) / 1000;
        } else if (parseFloat(str) >= 0) {
            return parseFloat(str);
        } else {
            return false;
        }
    }
    static colorToDecimal(c: string): Number {
        let color = c;
        if (color[0] === '#') {
            color = color.substr(1);
        }
        if (color.length === 3) {
            color = `${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}`;
        }
        return (parseInt(color, 16) + 0x000000) & 0xffffff;
    }

    static guid(count: number) {
        let out = '';
        for (let i = 0; i < count; i++) {
            out += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return out;
    }
    static localInfoDefault(): LocalInterface {
        return {
            typeList: {
                value: '',
                maxHeight: 200,
                items: [],
            },
            srcList: {},
        };
    }
    static parseDom(arg: string): any {
        var objE = document.createElement("div");
        objE.innerHTML = arg;
        return objE.childNodes;
    };
    static fetch(data: any) {
        const config = {
            method: 'get',
            // 基础url前缀
            baseURL: '',
            // 请求头信息
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
            // 参数 get
            params: {},
            // 参数 post
            // data: {},
            // 设置超时时间
            timeout: 10000,
            // 携带凭证
            withCredentials: true,
            // 返回数据类型
            responseType: 'json',
            ...data
        }
        return new Promise((resolve, reject) => {
            axios
            .request(config)
            .then(res => {
              resolve(res.data)
            })
            .catch(err => {
              reject(err)
            })
        })
      }
}


export default Utils;
