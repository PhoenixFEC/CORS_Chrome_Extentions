'use strict';

$(function() {

    // -------------------------------
    // 显示/隐藏 badge，开关CORS跨域
    // -------------------------------
    $('#showBadge').click(() => {
        const jQthis = $(this);
        chrome.extension.getBackgroundPage().switchBadge();
        chrome.extension.getBackgroundPage().getStorage('showBadge', result => {
            const showBadge = !result.showBadge ? false : true;
            updateSwitchStatus(!showBadge, 'showBadge');
        });
    });

    // -------------------------------
    // 保存跨域配置
    // -------------------------------
    window.curCredentials = 'false';
    $('#xCustomConfigSave').click(() => {
        const config = {};
        config['Access-Control-Allow-Origin'] = $('#xCustomOrigin').val() || '*';
        config['Access-Control-Allow-Headers'] = $('#xCustomHeaders').val() || '*';
        config['Access-Control-Allow-Methods'] = $('#xCustomMethod').val() || '*';
        config['Access-Control-Allow-Credentials'] = window.curCredentials;
        config['webRequestIncludeTypes'] = $('#xCustomIncludeTypes').val();
        config['webRequestExcludeTypes'] = $('#xCustomExcludeTypes').val();

        // 上传云
        chrome.extension.getBackgroundPage().setStorage(config, 'sync', () => {
            // console.log('已成功保存跨域配置，并同步到云', config)
            $('#savedMsg').text('已成功保存跨域配置，并同步到云');

            // 将保存好的options数据发送给插件
            chrome.runtime.sendMessage(config);
        });
    });

    // 从选项同步的云上获取当前选项配置, 并缓存
    chrome.extension.getBackgroundPage().getStorage([
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Credentials',
        'webRequestIncludeTypes',
        'webRequestExcludeTypes'
    ], 'sync', result => {
        $('#xCustomOrigin').val(result['Access-Control-Allow-Origin']);
        $('#xCustomHeaders').val(result['Access-Control-Allow-Headers']);
        $('#xCustomMethod').val(result['Access-Control-Allow-Methods']);
        window.curCredentials = result['Access-Control-Allow-Credentials'] || window.curCredentials;
        // 更新状态'Access-Control-Allow-Credentials' switch状态
        updateSwitchStatus(window.curCredentials !== 'false', 'xCustomCredentials');
        $('#xCustomIncludeTypes').val(result['webRequestIncludeTypes']);
        $('#xCustomExcludeTypes').val(result['webRequestExcludeTypes']);

        // 是否开启"Access-Control-Allow-Credentials"
        $('#xCustomCredentials').click(() => {
            updateSwitchStatus(window.curCredentials === 'false', 'xCustomCredentials');
            window.curCredentials = window.curCredentials === 'false' ? 'true' : 'false';
        });
    }).catch(err => console.log(err));

    // 更新插件开关在选项里的状态
    chrome.extension.getBackgroundPage().getStorage(['showBadge' ], 'local', result => {
        updateSwitchStatus(result['showBadge'], 'showBadge');
    }).catch(err => console.log(err));

    // 更新switch控件当前状态
    function updateSwitchStatus(status, whose) {
        if(!status) {
            $(`#${whose}`).find('label').removeClass('radio-checkbox--checked');
        }
        else {
            $(`#${whose}`).find('label').addClass('radio-checkbox--checked');
        }
    }

})