'use strict';

$(function() {

    // -------------------------------
    // 显示/隐藏 badge，开关CORS跨域
    // -------------------------------
    $('#show_badge').click(function() {
        var jQthis = $(this);
        chrome.extension.getBackgroundPage().switchBadge();
        chrome.extension.getBackgroundPage().getStorage('showBadge', function(result) {
            var showBadge = !result.showBadge ? false : true;
            if(!showBadge) {
                jQthis.find('label').addClass('radio-checkbox--checked');
            } else {
                jQthis.find('label').removeClass('radio-checkbox--checked');
            }
        });
    });

    // -------------------------------
    // 保存跨域配置
    // -------------------------------
    $('#xCustomConfigSave').click(function() {
        const config = {};
        config.AccessControlAllowOrigin = $('#xCustomOrigin').val();
        config.AccessControlAllowHeaders = $('#xCustomHeader').val();
        config.AccessControlAllowMethod = $('#xCustomMethod').val();
        // 上传云
        chrome.extension.getBackgroundPage().setStorage(config, 'sync', function() {
            console.log('成功保存跨域配置，并且云同步')
        });
    });

})