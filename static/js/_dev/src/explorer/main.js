define(function(require, exports, module) {
    Config = {
        BodyContent:".bodymain",    // 框选事件起始的dom元素
        FileBoxSelector:'.fileContiner',// dd
        FileBoxClass:".fileContiner .file",     // 文件选择器
        FileBoxClassName:"file",    // 文件选择器    
        FileBoxTittleClass:".fileContiner .title",// 文件名选择器
        SelectClass:".fileContiner .select",        // 选中文件选择器
        SelectClassName:"select",   // 选中文件选择器名称
        TypeFolderClass:'folderBox',// 文件夹标记选择器
        TypeFileClass:'fileBox',    // 文件标记选择器
        HoverClassName:"hover",     // hover类名
        FileOrderAttr:"number",     // 所有文件排序属性名
        TreeId:"folderList",        // 目录树对象

        pageApp     : "explorer",
        treeAjaxURL : "index.php?explorer/treeList&app=explorer",//树目录请求
        AnimateTime:200             // 动画时间设定
    };
    Global = {
        fileListAll:'',             // 当前路径下文件对象集合,缓存起来便于全局使用
        fileListNum:0,              // 文件&文件夹总个数
        fileRowNum:0,               // 当前屏幕每行文件&文件夹个数
        ctrlKey:false,              // 是否按下ctrl
        shiftKey:false,             // 是否按下shift

        fileListSelect:'',          // 选s择的文件
        fileListSelectNum:''        // 选中的文件数。
    };   
    require('lib/jquery-lib');
    require('lib/util');
    require('lib/ztree/js/ztree');
    require('lib/contextMenu/jquery-contextMenu');
    require('lib/artDialog/jquery-artDialog');
	require('lib/picasa/picasa');

    ui= require('./ui');
	TaskTap		= require('../../common/taskTap');    //任务栏
    core        = require('../../common/core');     //公共方法及工具封装
    rightMenu   = require('../../common/rightMenu');  //通用右键菜单配置
    ui.tree     = require('../../common/tree');
    ui.path     = require('./path');
    fileSelect  = require('./fileSelect');
	fileLight   = fileSelect.fileLight;
    list_header_resize  = require('./list_header_resize');
    var uploader;

	$(document).ready(function() {
        core.init();
        $('.init_loading').fadeOut(450).addClass('pop_fadeout');
        require.async('lib/webuploader/webuploader-min',function(){
            core.upload_init();
        });//-min
        ui.init();
        list_header_resize.init();
        ui.tree.init();
		TaskTap.init();        
		fileSelect.init();
		rightMenu.initExplorer();        
        $('.path_tips').tooltip({placement:'bottom',html:true});

        //带参数url
        function url_get(name){
            var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if(r!=null)return  unescape(r[2]); return null;
        }
        if(url_get('type')=='file_list'){
            $(".tools .tools-left").remove();
            $('.header-middle').appendTo(".tools");
        }
	});
});