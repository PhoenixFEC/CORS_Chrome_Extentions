'use strict';

chrome.runtime.onInstalled.addListener(function() {
    window.CONTEXTMENU_ID = 'CORS_HTTP_SWITCH';
    let isShowBadge = false;
    // getStorage('showBadge', function(result) {
    //     isShowBadge = result.showBadge;
    // });

    // ---------------------------------------
    // 创建页面右键菜单
    // ---------------------------------------
    chrome.contextMenus.create({
        title: '打开CORS跨域',
        id: CONTEXTMENU_ID,
        type: 'checkbox',
        checked: isShowBadge
    }, function() {
        if (chrome.extension.lastError) {
            console.log("Got expected error: " + chrome.extension.lastError.message);
        }
    });

    // 监听右键菜单
    chrome.contextMenus.onClicked.addListener(switchBadge);
    // 监听浏览器点击图标
    chrome.browserAction.onClicked.addListener(switchBadge);
    // 监听当前开启状态存储值的变更
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        isShowBadge = changes["showBadge"].newValue;
    });

    // ---------------------------------------
    // CORS跨域拦截
    // 监听网页请求，并篡改响应头cors
    // ---------------------------------------
    chrome.webRequest.onHeadersReceived.addListener(
        function(details) {
            // 过滤掉非当前tab内网页请求
            // ...
            if(isShowBadge) {
                return webRequestOnHeadersReceived(details);
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
            chrome.contextMenus.update(CONTEXTMENU_ID, {title: '关闭CORS跨域', checked: true});
            chrome.storage.local.set({ 'showBadge': true });
        } else {
            chrome.browserAction.setBadgeText({text: ''});
            chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
            chrome.contextMenus.update(CONTEXTMENU_ID, {title: '打开CORS跨域', checked: false});
            chrome.storage.local.set({ 'showBadge': false });
        }
    });
}

// 监听篡改响应头cors的callback
function webRequestOnHeadersReceived(details) {
    return { responseHeaders: details.responseHeaders };
}


/**
 * 获取指定key当前值，可指定作用域
 * @param {string} key
 * @param {?string: local | sync} scope 可选，默认存储到storage.local
 * @param {?function} callback
 */
function getStorage(key, scope, callback) {
    const curScope = arguments.length > 2 ? scope : 'local';
    const curCallback = arguments.length > 2 ? callback : scope;
    chrome.storage[curScope].get(key, function(result) {
        if (chrome.extension.lastError) {
            console.log("Got expected error: " + chrome.extension.lastError.message);
            return null;
        }
        if(typeof curCallback === 'function') curCallback(result);
    });
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
