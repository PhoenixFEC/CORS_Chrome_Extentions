'use strict';

chrome.runtime.onInstalled.addListener(function() {
    window.globalVar = {
        CONTEXTMENU_ID: 'CORS_HTTP_SWITCH',
        tmpResponseHeaders: {},
        isShowBadge: false
    };
    // window.CONTEXTMENU_ID = 'CORS_HTTP_SWITCH';
    // window.tmpResponseHeaders = {};
    // let isShowBadge = false;

    // 从选项同步的云上获取当前选项配置, 并缓存
    getStorage([
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Method',
        'Access-Control-Allow-Headers',
        'webRequestIncludeTypes',
        'webRequestExcludeTypes'
    ], 'sync', result => {
        window.globalVar.tmpResponseHeaders = Object.assign({}, window.globalVar.tmpResponseHeaders, result);
    }).catch(err => console.log(err));


    // 监听右键菜单
    chrome.contextMenus.onClicked.addListener(switchBadge);
    // 监听浏览器点击图标
    chrome.browserAction.onClicked.addListener(switchBadge);
    // 监听当前开启状态存储值的变更
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if(changes["showBadge"]) window.globalVar.isShowBadge = changes["showBadge"].newValue;
    });
    // 监听来自选项最新更新的配置数据
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(sender.id === 'fjmicobohjblipgaklggfkcdkomdgglk') {
            window.globalVar.tmpResponseHeaders = Object.assign({}, window.globalVar.tmpResponseHeaders, request);
            // console.log(window.globalVar.tmpResponseHeaders, request, sender)
        }
    });


    // ---------------------------------------
    // 创建页面右键菜单
    // ---------------------------------------
    chrome.contextMenus.create({
        title: '打开CORS跨域',
        id: window.globalVar.CONTEXTMENU_ID,
        type: 'checkbox',
        checked: window.globalVar.isShowBadge
    }, function() {
        if (chrome.extension.lastError) {
            console.log("Got expected error: " + chrome.extension.lastError.message);
        }
    });

    // ---------------------------------------
    // CORS跨域拦截
    // 监听网页请求，并篡改响应头cors
    // ---------------------------------------
    chrome.webRequest.onHeadersReceived.addListener(
        function(details) {
            if(window.globalVar.isShowBadge) {
                return setResponseHeader(details, window.globalVar.tmpResponseHeaders);
            }
        },{urls: ["<all_urls>"]}, ["responseHeaders","blocking"]
    );

});


// 监听图标状态变更的callback
// 变更当前图标状态
function switchBadge() {
    getStorage('showBadge', function(result) {
        if(!result.showBadge) {
            chrome.browserAction.setBadgeText({text: 'On'});
            chrome.browserAction.setBadgeBackgroundColor({color: [205, 70, 70, 255]});
            chrome.contextMenus.update(window.globalVar.CONTEXTMENU_ID, {title: '关闭CORS跨域', checked: true});
            chrome.storage.local.set({ 'showBadge': true });
        } else {
            chrome.browserAction.setBadgeText({text: ''});
            chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
            chrome.contextMenus.update(window.globalVar.CONTEXTMENU_ID, {title: '打开CORS跨域', checked: false});
            chrome.storage.local.set({ 'showBadge': false });
        }
    });
}

/**
 * 将自定义配置赋值给responseHeaders
 * @param {object} details chrome.webRequest.onHeadersReceived.addListener callback
 * @param {object} config 自定义配置数据
 * @returns new details.responseHeaders
 */
function setResponseHeader(details, config) {

    const includeTypes = config.webRequestIncludeTypes && config.webRequestIncludeTypes.replace(/ /g, '').split(',');
    console.log(details, config, config.webRequestIncludeTypes, includeTypes)

    if(hasCorsHeader(details.responseHeaders, 'Access-Control-Allow-Origin')) {
        const curKeyIndex = hasCorsHeader(details.responseHeaders, 'Access-Control-Allow-Origin', true);
        details.responseHeaders[curKeyIndex].value = config['Access-Control-Allow-Origin'];
    }
    else {
        details.responseHeaders.push({
            name: 'Access-Control-Allow-Origin',
            value: config['Access-Control-Allow-Origin']
        });
    }

    if(hasCorsHeader(details.responseHeaders, 'Access-Control-Allow-Method')) {
        const curKeyIndex = hasCorsHeader(details.responseHeaders, 'Access-Control-Allow-Method', true);
        details.responseHeaders[curKeyIndex].value = config['Access-Control-Allow-Method'];
    }
    else {
        details.responseHeaders.push({
            name: 'Access-Control-Allow-Method',
            value: config['Access-Control-Allow-Method']
        });
    }

    if(hasCorsHeader(details.responseHeaders, 'Access-Control-Allow-Headers')) {
        const curKeyIndex = hasCorsHeader(details.responseHeaders, 'Access-Control-Allow-Headers', true);
        details.responseHeaders[curKeyIndex].value = config['Access-Control-Allow-Headers'];
    }
    else {
        details.responseHeaders.push({
            name: 'Access-Control-Allow-Headers',
            value: config['Access-Control-Allow-Headers']
        });
    }

    return { responseHeaders: details.responseHeaders };
}

/**
 * 鉴别当前响应头是否有指定的头信息
 * @param {array} arr responseHeaders
 * @param {string} key responseHeaders[*].name
 * @param {boolean} returnIndex 'false' is default.
 * @returns {boolean}
 */
function hasCorsHeader(arr, key, returnIndex) {
    let isHere = -1;
    if(Object.prototype.toString.call([]) === '[object Array]') {
        isHere = arr.findIndex((item) => {
            item.name && item.name === key;
        });
    }
    return  returnIndex ? isHere : isHere > -1;
}

/**
 * 获取指定key当前值，可指定作用域
 * @param {string | array} key
 * @param {?string: local | sync} scope 可选，默认存储到storage.local
 * @param {?function} callback
 * @returns promise
 */
function getStorage(key, scope, callback) {
    const curScope = arguments.length > 2 ? scope : 'local';
    const curCallback = arguments.length > 2 ? callback : scope;
    const promise = new Promise((resolve, reject) => {
        chrome.storage[curScope].get(key, function(result) {
            if (chrome.extension.lastError) {
                console.log("Got expected error: " + chrome.extension.lastError.message);
                return null;
            }
            if(typeof curCallback === 'function') {
                resolve(curCallback(result));
            }
        });
    });
    return promise;
}

/**
 * 将指定key/value值存储到Storage，可指定作用域
 * @param {object} keyValue
 * @param {?string: local | sync} scope 可选
 * @param {?function} callback
 */
function setStorage(keyValue, scope, callback) {
    const curScope = arguments.length > 2 ? scope : 'local';
    const curCallback = arguments.length > 2 ? callback : scope;
    chrome.storage[curScope].set(keyValue, function(result) {
        if (chrome.extension.lastError) {
            console.log("Got expected error: " + chrome.extension.lastError.message);
            return null;
        }
        if(typeof curCallback === 'function') curCallback(result);
    });
}
