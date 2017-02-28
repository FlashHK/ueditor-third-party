var EditorWord = function (options) {

    UE.registerUI('word', function (editor, uiName) {

        var ui = new UE.ui.MultiMenuPop({
            name: uiName,
            title: '导入word',
            iframeUrl: './editor-word/word.html',
            className: 'edui-for-word',
            editor: editor
        });

        return ui;
    })

    var defaultOptions = {
        url: '',
        match: function () {
            return true
        }
    }
    options = $.extend(true, defaultOptions, options)

    UE.commands['word'] = {
        execCommand: function (cmd, form) {
            var editor = this;
            var $form = $(form);
            var name = $.trim($form.find('#wordFile').val());

            if (!(options.match.call($form, name))) return false;
            $(form).ajaxSubmit({
                url: options.url,
                success: function (data) {
                    data = data.replace(/&#xa0;/gim, '');
                    editor.execCommand('insertHtml', UE.filterWord(data));
                    form.reset()
                }
            })
        }
    };

    UE.utils.cssRule('edui-for-word', '.edui-default .edui-toolbar .edui-for-word.edui-splitbutton .edui-icon {background-position: -300px -40px;}')

    return UE
}
