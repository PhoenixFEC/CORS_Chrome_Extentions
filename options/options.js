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
        config['Access-Control-Allow-Origin'] = $('#xCustomOrigin').val();
        config['Access-Control-Allow-Headers'] = $('#xCustomHeaders').val();
        config['Access-Control-Allow-Method'] = $('#xCustomMethod').val();
        config['webRequestIncludeTypes'] = $('#xCustomIncludeTypes').val();
        config['webRequestExcludeTypes'] = $('#xCustomExcludeTypes').val();
        // 上传云
        chrome.extension.getBackgroundPage().setStorage(config, 'sync', function() {
            // console.log('已成功保存跨域配置，并同步到云', config)
            $('#savedMsg').text('已成功保存跨域配置，并同步到云');

            // 将保存好的options数据发送给插件
            chrome.runtime.sendMessage(config, function(response) {
                console.log(response);
            });
        });
    });

    // 从选项同步的云上获取当前选项配置, 并缓存
    chrome.extension.getBackgroundPage().getStorage([
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Method',
        'Access-Control-Allow-Headers',
        'webRequestIncludeTypes',
        'webRequestExcludeTypes'
    ], 'sync', result => {
        $('#xCustomOrigin').val(result['Access-Control-Allow-Origin']);
        $('#xCustomHeaders').val(result['Access-Control-Allow-Headers']);
        $('#xCustomMethod').val(result['Access-Control-Allow-Method']);
        $('#xCustomIncludeTypes').val(result['webRequestIncludeTypes']);
        $('#xCustomExcludeTypes').val(result['webRequestExcludeTypes']);
    }).catch(err => console.log(err));

})