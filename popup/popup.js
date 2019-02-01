'use strict';

$(function() {
    // -------------------------------
    // 显示/隐藏 badge，开关CORS跨域
    // -------------------------------
    $('#showBadge').click(function() {
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

    // -------------------------------------------
    // 设置跨域Origin/Headers/Method/redentials
    // -------------------------------------------

});