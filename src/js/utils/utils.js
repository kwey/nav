// import md5 from 'md5';

class Utils {
    static browser() {
        return {
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
                    browser: matched.browser,
                    version: version,
    
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
    }

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
     */
    static assign(target, ...rest) {
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
    static extend() {
        let options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;
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
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name];
                copy = options[name];
                if (target === copy) {
                    continue;
                }
                if (deep && copy && typeof target === 'object') {
                    if (Array.isArray(copy)) {
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && typeof target !== 'object' ? src : {};
                    }
                    target[name] = this.extend(deep, clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
        return target;
        // if (obj === null || (typeof obj !== 'object')) {
        //     return obj;
        // }
        // const target = Array.isArray(obj) ? [] : {};
        // for (const name in obj) {
        //     if (Object.prototype.hasOwnProperty.call(obj, name)) {
        //         const value = obj[name];
        //         if (deep) {
        //             if (typeof value === 'object') {
        //                 target[name] = this.extend(value, deep);
        //             } else {
        //                 target[name] = value;
        //             }
        //         } else {
        //             target[name] = value;
        //         }
        //     }
        // }
        // return target;
    }
    static loadScript(options) {
        const script = document.createElement('script');
        script.onload = function () {
            options.success && options.success();
        };
        script.onerror = () => {
            options.error && options.error();
        };
        script.src = options.url;

        document.head.appendChild(script);
    }
    static getCookie(cookieName) {
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

    static setCookie(name, value, days = 365) {
        const date = new Date();
        const encodeName = encodeURIComponent(name);
        const encodeValue = encodeURIComponent(value);
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${encodeName}=${encodeValue}; expires=${date.toU()}; path=/; domain=.bilibili.com`;
    }

    static getSearchParam(name, url) {
        let searchIndex;
        let hashIndex;
        let searchString;
        if (typeof url === 'string') {
            searchIndex = url.indexOf('?');
            hashIndex = url.indexOf('#');
            if (searchIndex === -1) {
                searchString = '';
            } else if (hashIndex === -1) {
                searchString = url.slice(searchIndex, url.length);
            } else {
                searchString = url.slice(searchIndex, hashIndex);
            }
        } else {
            searchString = window.location.search;
        }
        const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        const r = searchString.substr(1).match(reg);
        if (r != null) {
            try {
                return decodeURIComponent(r[2]);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    static getLocalSettings(key) {
        if (window.localStorage && localStorage.getItem) {
            return localStorage.getItem(key);
        } else {
            return this.getCookie(key);
        }
    }

    static setLocalSettings(key, val) {
        if (window.localStorage && localStorage.setItem) {
            try {
                return localStorage.setItem(key, val);
            } catch (e) {
                console.warn(e);
            }
        } else {
            return this.setCookie(key, val);
        }
    }

    static getSessionSettings(key) {
        if (window.sessionStorage && sessionStorage.getItem) {
            return sessionStorage.getItem(key);
        } else {
            return this.getCookie(key);
        }
    }

    static setSessionSettings(key, val) {
        if (window.sessionStorage && sessionStorage.setItem) {
            try {
                return sessionStorage.setItem(key, val);
            } catch (e) {
                console.warn(e);
            }
        } else {
            return this.setCookie(key, val);
        }
    }

    static getRandomString(len) {
        const charPool = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        const totalLength = charPool.length;
        const buffer = [];
        for (let i = 0; i < len; i++) {
            const r = Math.floor(Math.random() * totalLength);
            buffer.push(charPool[r]);
        }
        return buffer.join('');
    }

    /**
     * 格式化秒
     */
    static fmSeconds(sec) {
        if (sec == null) {
            sec = 0;
        }
        let ret;
        sec = Math.floor(sec) >> 0;
        ret = ('0' + sec % 60).slice(-2);
        ret = Math.floor(sec / 60) + ':' + ret;
        if (ret.length < 5) {
            ret = '0' + ret;
        }
        return ret;
    }

    static fmSecondsReverse(format) {
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

    /**
     * 格式化时间截
     */
    static fmTimestamp(seconds) {
        let ret;
        const date = new Date(seconds * 1000);
        ret = ('0' + date.getSeconds()).slice(-2);
        ret = ('0' + date.getMinutes() + ':' + ret).slice(-5);
        ret = ('0' + date.getHours() + ':' + ret).slice(-8);
        ret = ('0' + date.getDate() + ' ' + ret).slice(-11);
        ret = ('0' + (date.getMonth() + 1) + '-' + ret).slice(-14);
        // ret = date.getFullYear() + '-' + ret;
        return ret;
    }

    /**
     * 数字到颜色
     */
    static colorFromInt(value) {
        return '#' + ('00000' + value.toString(16)).slice(-6);
    }

    static timeParser(str) {
        const t = /^(\d+h)?(\d+m|^s)?(\d+s)?(\d+ms)?$/.exec(str);
        const getNum = function (s) {
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

    static dateParser(date, timeZone) {
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(date)) {
            timeZone = timeZone || 0;
            const [y, m, d] = date.split('-');
            return (+new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10))) * (1 / 1000) - (new Date().getTimezoneOffset() + timeZone * 60) * 60;
        } else {
            return false;
        }
    }
    static validateBfsUrl(url) {
        // url 是否为 string
        if (!url || typeof url !== 'string') {
            return false;
        }
        // 文件格式是否支持
        const supportedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (supportedExts.indexOf(Utils.getUrlExt(url)) === -1) {
            return false;
        }
        // 路径是否包含 /bfs/
        if (url.indexOf('/bfs/') === -1) {
            return false;
        }
        return true;
    }
    static appendQueryString(url, queryString) {
        return queryString && queryString !== '' ? `${url}?${queryString}` : url;
    }
    static getQueryString(url) {
        let queryString = '';
        if (url && url.split) {
            queryString = url.split('?')[1];
        }
        return queryString;
    }
    static removeBfsParams(url) {
        let trimmedUrl = url;
        if (url && url.slice && url.indexOf) {
            const pos = url.indexOf('@');
            if (pos > -1) {
                trimmedUrl = url.slice(0, pos);
            }
        }
        return trimmedUrl;
    }
    static setUrlExt(url) {
        const ext = Utils.getUrlExt(Utils.removeBfsParams(url));
        let newExt = ext;
        if (ext !== 'gif' && Utils.canUseWebP()) {
            newExt = 'webp';
        }
        if (!Utils.hasUrlParams(url) && ext !== newExt) {
            url += `@.${newExt}`;
        } else if (Utils.hasUrlParams(url)) {
            url += `.${newExt}`;
        }
        // url = url.replace(RegExp('\.' + ext + '$'), `.${ext}`)
        return url;
    }
    static hasUrlParams(url) {
        return url.indexOf('@') > -1;
    }
    static getUrlExt(url) {
        if (url && url.split) {
            return url.split('.').pop().toLowerCase();
        }
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
    static removeQueryString(url) {
        let trimmedUrl = url;
        if (url && url.slice && url.indexOf) {
            const pos = url.indexOf('?');
            if (pos > -1) {
                trimmedUrl = url.slice(0, pos);
            }
        }
        return trimmedUrl;
    }
    static isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    static appendUrlParam(url, param, value) {
        url += url.indexOf('@') === -1 ? '@' : '_';
        url += value + param;
        return url;
    }
    static setSize(url, width, height) {
        // 设置宽高
        if (Utils.isNumeric(width) && width > 0) {
            url = Utils.appendUrlParam(url, 'w', width);
        }
        if (Utils.isNumeric(height) && height > 0) {
            url = Utils.appendUrlParam(url, 'h', height);
        }
        return url;
    }
    /**
     * @param {string} url
     * @param {number} width
     * @param {number} [height = width]
     * @return {string}
     */
    static thumbnail(url, width, height) {
        height = height || width;
        // 暂存 url 中查询参数，拼到 url 最后
        const queryString = Utils.getQueryString(url);
        url = Utils.removeQueryString(url);
        // 检查 url 是否符合 bfs 规范，若不合法，直接返回url
        if (!Utils.validateBfsUrl(Utils.removeBfsParams(url))) {
            return Utils.appendQueryString(url, queryString);
        }
        // 移除 url 中 @ 后的 bfs 参数
        url = Utils.removeBfsParams(url);
        // 设置宽高
        url = Utils.setSize(url, width, height);
        // 设置 url 后缀名
        url = Utils.setUrlExt(url);
        url = Utils.appendQueryString(url, queryString);
        return url;
    }

    static shuffle(array, copy) {
        let len = array.length;
        const prime = copy ? array.slice() : array;

        while (len) {
            const randomIndex = Math.floor(Math.random() * len);
            const buffer = prime[--len];
            prime[len] = prime[randomIndex];
            prime[randomIndex] = buffer;
        }

        return prime;
    }

    static download(o) {
        const obj = $.extend({
            text: '',
            type: 'text/plain;charset=utf-8',
            fileName: 'text.txt',
        }, o);
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

    static upload(callback) {
        // const uploader: any = $('<input type='file'>');
        const uploader = document.createElement('input');
        uploader.setAttribute('type', 'file');
        (() => {
            uploader.click();
        })();
        const reImport = () => {
            const reader = new FileReader();
            reader.readAsText(uploader['files'][0]);
            reader.onload = () => {
                callback(reader, uploader['files'][0].type);
            };
            reader.onerror = (e) => {
                console.log(e);
            };
        };
        const browser = this.browser();
        if (!browser.version.trident && !browser.version.edge) {
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

    static formatDate(date, format) {
        date = date || new Date();
        format = format || 'yyyy-MM-dd mm:ss';
        const mapping = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            'S+': date.getMilliseconds(),
        };
        if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, date.getFullYear().toString().substr(4 - RegExp.$1.length));
        }
        for (const k in mapping) {
            if (new RegExp(`(${k})`).test(format)) {
                const n = RegExp.$1.length === 1 ? mapping[k] : ('00' + mapping[k]).substr(mapping[k].toString().length);
                format = format.replace(RegExp.$1, n);
            }
        }
        return format;
    }
    static show(ele, type = 'block') {
        if (((ele instanceof jQuery) && (ele).length === 1) || (ele) instanceof HTMLElement) {
            if (ele instanceof jQuery) {
                ele[0].style.display = type;
                return ele;
            }
            (ele).style.display = type;
        } else {
            (ele).show();
            return ele;
        }
    }

    static hide(ele) {
        if (((ele instanceof jQuery) && (ele).length === 1) || (ele) instanceof HTMLElement) {
            if (ele instanceof jQuery) {
                ele[0].style.display = 'none';
                return ele;
            }
            (ele).style.display = 'none';
        } else {
            (ele).hide();
            return ele;
        }
    }

    static colorToDecimal(color) {
        if (color[0] === '#') {
            color = color.substr(1);
        }
        if (color.length === 3) {
            color = `${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}`;
        }
        return (parseInt(color, 16) + 0x000000) & 0xffffff;
    }

    // static getSessionID() {
    //     return md5((String(this.getCookie('buvid3') || Math.floor(Math.random() * 100000).toString(16)) + (+new Date())));
    // }
    
    static generateUUID() {
        let d = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    static getDecoder() {
        if (window.TextDecoder) {
            return new window.TextDecoder();
        }

        return {
            decode: buf => decodeURIComponent(window.escape(
                String.fromCharCode.apply(String, new Uint8Array(buf)))),
        };
    }

    static getEncoder() {
        if (window.TextEncoder) {
            return new window.TextEncoder();
        }

        return {
            encode: (str) => {
                const buf = new ArrayBuffer(str.length), // 每个字符占用2个字节
                    bufView = new Uint8Array(buf);

                for (let i = 0, strLen = str.length; i < strLen; i++) {
                    bufView[i] = str.charCodeAt(i);
                }
                return buf;
            },
        };
    }
    static mergeArrayBuffer(arrayBuffer1, arrayBuffer2) {
        const unit8Array1 = new Uint8Array(arrayBuffer1),
            unit8Array2 = new Uint8Array(arrayBuffer2),
            res = new Uint8Array(unit8Array1.byteLength + unit8Array2.byteLength);

        res.set(unit8Array1, 0);
        res.set(unit8Array2, unit8Array1.byteLength);
        console.log('res.buffer', res.buffer);
        return res.buffer;
    }
}


export default Utils;
