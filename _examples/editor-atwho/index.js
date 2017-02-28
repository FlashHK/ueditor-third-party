var EditorAtwho = function (options) {
    var atwhoEnabled = true; //标识是否开启@功能

    function initAtwho(editor) {
        var $body = $(editor.body);
        var defaultOptions = {
            headerTpl: options.header ? '<div class="atwho-header">' + options.header + '</div>' : '',
            displayTpl: "<li data-id='${id}'>${display}</li>",
            insertTpl: "${atwho-at}${name}",
            at: "@",
            limit: 10,
            url: '',
            data: {},
            parsed: function (data) {
                return data;
            },
//            suffix: ';',
//            startWithSpace: false
            callbacks: {
                matcher: function (flag, subtext, should_startWithSpace, acceptSpaceBar) {
                    if (!atwhoEnabled) return null;
                    var _a, _y, match, regexp, space;
                    flag = flag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                    if (should_startWithSpace) {
                        flag = '(?:^|\\s)' + flag;
                    }
                    _a = decodeURI("%C3%80");
                    _y = decodeURI("%C3%BF");
                    space = acceptSpaceBar ? "\ " : "";
                    regexp = new RegExp(flag + "([A-Za-z" + _a + "-" + _y + "0-9\u4e00-\u9fa5_" + space + "\'\.\+\-]*)$|" + flag + "([^\\x00-\\xff]*)$", 'gi');
                    match = regexp.exec(subtext);
                    if (match) {
                        return match[2] || match[1];
                    } else {
                        return null;
                    }
                },
                filter: function (query, data, searchKey) { //重写过滤方法
                    return data;
                },
                sorter: function (query, items, searchKey) { //重写排序方法
                    return items;
                },
                remoteFilter: function (query) { //重写远程过滤
                    return query;
                }
            },
            functionOverrides: {
                /**
                 * 重写插入<span>，增加一些自定义的标签
                 * @param content
                 * @param $li
                 * @returns {*}
                 */
                insert: function (content, $li) {
                    var data, range, suffix, suffixNode;
                    suffix = (suffix = this.getOpt('suffix')) === "" ? suffix : suffix || "\u00A0";
                    data = $li.data('item-data');
                    this.query.el.removeClass('atwho-query').addClass('atwho-inserted').html(content).attr('data-atwho-at-query', "" + data['atwho-at'] + this.query.text).attr('contenteditable', "false");
                    this.query.el.attr('data', '@{id:' + data.id + '}'); //@内容增加标记，用于后端获取
                    this.query.el.css({ 'color': '#3366FF', 'cursor': 'pointer' });
                    if (range = this._getRange()) {
                        if (this.query.el.length) {
                            range.setEndAfter(this.query.el[0]);
                        }
                        range.collapse(false);
                        range.insertNode(suffixNode = this.app.document.createTextNode("\u200D" + suffix));
                        this._setRange('after', suffixNode, range);
                    }
                    if (!this.$inputor.is(':focus')) {
                        this.$inputor.focus();
                    }
                    return this.$inputor.change();
                }
            }
        }
        options = $.extend(true, defaultOptions, options)
        $body.atwho(options);

        var timeout;
        $body.on("matched.atwho", function (event, flag, query) {
            if ($.trim(query) === '') return;
            $.ajax({
                type: "GET",
                async: false,
                url: options.url + encodeURIComponent(query),
                success: function (data) {
                    data = options.parsed.call(this, data);
                    if (typeof data === 'string') return
                    $body.atwho('load', '@', data);
                }
            })
        });
    }

    /**
     * 为ueditor注册@按钮
     */
    UE.registerUI('atwho', function (editor, uiName) {

        var ui = new UE.ui.MultiMenuPop({
            name: uiName,
            title: '@功能',
            iframeUrl: './editor-atwho/atwho.html',
            className: 'edui-for-atwho',
            editor: editor
        });

        editor.addListener('ready', function () {
            initAtwho(editor);
        });

        return ui;
    })

    UE.utils.cssRule('edui-for-atwho', '.edui-default .edui-toolbar .edui-for-atwho.edui-splitbutton .edui-icon {background: url("./editor-atwho/at.png")} .edui-for-atwho.edui-default .edui-popup-content{height: 37px;width: 180px;overflow: hidden;}')
    UE.commands['atwho'] = {
        execCommand: function (cmd, enabled) {
            atwhoEnabled = enabled;
        }
    };

    return UE
}
