var EditorExcel = function (options) {

    UE.registerUI('excel', function (editor, uiName) {

        var ui = new UE.ui.MultiMenuPop({
            name: uiName,
            title: '导入excel',
            iframeUrl: './editor-excel/excel.html',
            className: 'edui-for-excel',
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

    UE.commands['excel'] = {
        execCommand: function (cmd, form) {
            var editor = this;
            var $form = $(form);
            var name = $.trim($form.find('#excelFile').val());

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

    UE.utils.cssRule('edui-for-excel', '.edui-default .edui-toolbar .edui-for-excel.edui-splitbutton .edui-icon {background-position: -320px -40px;}')

    return UE
}
