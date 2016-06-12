var animate_time	= 160;//关闭动画
define(function(require, exports, module) {
    require('lib/jquery-lib');
    require('lib/util');
    require('lib/contextMenu/jquery-contextMenu');
    require('lib/artDialog/jquery-artDialog');
    
    core    = require('../../common/core');     //公共方法及工具封装
    Editor  = require('./edit');       //编辑器
    Tap     = require('./taskTap');    //多标签，标签管理
    Toolbar = require('./toolbar');    //任务栏
    rightMenu = Tap.rightMenu;
    $(document).ready(function() {
        Editor.init();
        Toolbar.init();
        Tap.init();
        require.async('lib/code_beautify');//js,css,html
        $('a,img').attr('draggable','false');
        
        //自动创建标签
        setTimeout(function(){
            var index = window.location.href.indexOf('#filename=');
            var first_file = '';
            if (index>0) {
                first_file = window.location.href.substr(index+'#filename='.length);
                first_file = urlDecode(first_file);
            }
            Editor.add(first_file);
        },300);

        //窗口调整
        $(window).bind("resize",function(e){
            Tap.resetWidth('resize');
        });

        window.onbeforeunload = function(){//关闭窗口编辑器保存提示
            if (Editor.hasFileSave()) {
                return LNG.if_save_file;
            }else{
                return undefined;
            }
        }
    });
});