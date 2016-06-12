//点击右键，获取元素menu的值，对应为右键菜单div的id值。实现通用。
//流程：给需要右键菜单的元素，加上menu属性，并赋值，把值作为右键菜单div的id值
define(function(require, exports) {
    var fileMenuSelector   = ".menufile";
    var folderMenuSelector = ".menufolder";
    var selectMoreSelector = ".menuMore";
    var selectTreeSelectorRoot      = ".menuTreeRoot";
    var selectTreeSelectorFolder    = ".menuTreeFolder";   
    var selectTreeSelectorFile      = ".menuTreeFile";

    var common_menu = {
        "listIcon": {
            name: LNG.list_type,
            icon:"eye-open",
            items:{
                "seticon":{name:LNG.list_icon,className:'menu_seticon set_seticon'},
                "setlist":{name:LNG.list_list,className:'menu_seticon set_setlist'}
            }
        },
        "sortBy": {
            name: LNG.order_type,
            accesskey: "y",
            icon:"sort",
            items:{
                "set_sort_name":{name:LNG.name,className:'menu_set_sort set_sort_name'},
                "set_sort_ext":{name:LNG.type,className:'menu_set_sort set_sort_ext'},
                "set_sort_size":{name:LNG.size,className:'menu_set_sort set_sort_size'},
                "set_sort_mtime":{name:LNG.modify_time,className:'menu_set_sort set_sort_mtime'},
                "set_sort_up":{name:LNG.sort_up,className:'menu_set_desc set_sort_up line_top'},
                "set_sort_down":{name:LNG.sort_down,className:'menu_set_desc set_sort_down'}
            }
        }
    };

    var _init_explorer = function(){
        $('<div id="rightMenu" class="hidden"></div>').appendTo('body');
        $('.context-menu-list').die("click").live("click",function(e){
            stopPP(e);return false;//屏蔽html点击隐藏
        });

        _bindBody_explorer();
        _bindFolder();
        _bindFile();
        _bindSelectMore();
        _bindTreeRoot();
        _bindTreeFolder();
        _bindDialog();
        _bindTask();
        _bindTaskBar();
        //初始化绑定筛选排序方式
        $('.set_set'+G.list_type).addClass('selected');
        $('.set_sort_'+G.list_sort_field).addClass('selected');
        $('.set_sort_'+G.list_sort_order).addClass('selected');
        $('.context-menu-root').addClass('animated fadeIn');
    };

    //初始化编辑器 树目录右键菜单
    var _init_editor = function(){
        $('<div id="rightMenu" class="hidden"></div>').appendTo('body');
        $('.context-menu-list').die("click").live("click",function(e){
            stopPP(e);
            return false;//屏蔽html点击隐藏
        });
        _bindTreeRoot();
        _bindTask();
        _bindDialog();
        _bindTreeFolderEditor();
        _bindEditorFile();
        _bindTaskBar();
        $('.context-menu-root').addClass('animated fadeIn');
    };

    var _bindBody_explorer = function(){
        $.contextMenu({
            selector: '.menuBodyMain',
            className:"fileContiner_menu",
            zIndex:9999,
            callback: function(key, options) {_menuBody(key, options);},
            items: {
                "refresh":{name:LNG.refresh+'<b>F5</b>',className:"refresh",icon:"refresh",accesskey: "e"},
                "sep1":"--------",
                "listIcon":common_menu['listIcon'],
                "sortBy":common_menu['sortBy'],
                "sep10":"--------",
                "info":{name:LNG.info+'<b>Alt+I</b>',className:"info",icon:"info",accesskey: "i"}
            }
        });
    }; 
    var _bindFolder = function(){
        $('<i class="'+folderMenuSelector.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: folderMenuSelector,
            className:folderMenuSelector.substr(1),
            callback: function(key, options) {_menuPath(key);},
            items: {
                "open":{name:LNG.open+'<b>Enter</b>',className:"open",icon:"folder-open-alt",accesskey: "o"},
                "down":{name:LNG.download,className:"down",icon:"download",accesskey: "x"},
                "sep1":"--------",
                "search":{name:LNG.search_in_path+'<b>Ctrl+F</b>',className:"search",icon:"search",accesskey: "s"},
                "openProject":{name:LNG.openProject,className:"openProject",icon:"edit"},
                "sep2":"--------",
                "info":{name:LNG.info+'<b>Alt+I</b>',className:"info",icon:"info",accesskey: "i"}
            }
        });
    };

    var _bindFile = function(){
        $('<i class="'+fileMenuSelector.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: fileMenuSelector,
            className:fileMenuSelector.substr(1),
            callback: function(key, options) {_menuPath(key);},
            items: {
                "open":{name:LNG.open+'<b>Enter</b>',className:"open",icon:"external-link",accesskey: "o"},
                "open_text":{name:LNG.edit+'<b>Ctrl+E</b>',className:"open_text",icon:"edit",accesskey: "e"},
                "down":{name:LNG.download,className:"down",icon:"download",accesskey: "x"},
                "show_file":{name:LNG.show_file,className:"show_file",icon:"globe",accesskey: "b"},
                "sep1":"--------",                
                "info":{name:LNG.info+'<b>Alt+I</b>',className:"info",icon:"info",accesskey: "i"}
            }
        });
    };  
    var _bindSelectMore = function(){
        $('<i class="'+selectMoreSelector.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: selectMoreSelector,
            className:selectMoreSelector.substr(1),
            callback: function(key, options) {_menuPath(key);},
            items: {
                "down":{name:LNG.download,className:"down",icon:"download",accesskey: "x"},
                "sep1":"--------",
                "playmedia":{name:LNG.add_to_play,className:"playmedia",icon:"music",accesskey: "p"},
                "info":{name:LNG.info,className:"info",icon:"info",accesskey: "i"}
            }
        });
    }

    //___________________________________________________________________________________
    //桌面右键& 资源管理器右键动作
    var _menuBody = function(action) {
        switch(action){
            case 'refresh':ui.f5(true,true);break;
            case 'seticon': ui.setListType('icon');break;//大图标显示
            case 'setlist':ui.setListType('list');break;//列表显示
            case 'set_sort_name':ui.setListSort('name',0);break;//排序方式，名称
            case 'set_sort_ext':ui.setListSort('ext',0);break;//排序方式，扩展名
            case 'set_sort_size':ui.setListSort('size',0);break;//排序方式，大小
            case 'set_sort_mtime':ui.setListSort('mtime',0);break;//排序方式，修改时间               
            case 'set_sort_up':ui.setListSort(0,'up');break;//已有模式升序
            case 'set_sort_down':ui.setListSort(0,'down');break;//已有模式降序
            case 'info':ui.path.info();break;//当前文件夹熟悉

            case 'open':ui.path.open();break;
            case 'open_new':ui.path.open_new();break;
            default:break;
        }
    };

    //目录右键绑定(文件、文件夹) 树目录文件(夹)
    var _menuPath = function(action) {
        switch(action){
            case 'open':ui.path.open();break;            
            case 'down':ui.path.download();break;
            case 'open_text':ui.path.openEditor();break;
            case 'playmedia':ui.path.play();break;
            case 'search':ui.path.search();break;
            case 'show_file':ui.path.show_file();break;

            case 'openProject':ui.path.openProject();break;
            case 'info':ui.path.info();break;
            default:break;
        }
    };

    //=============================tree start=============================
    var _bindTreeRoot = function(){
        $('<i class="'+selectTreeSelectorRoot.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: selectTreeSelectorRoot, 
            callback: function(key, options) {_menuTree(key);},
            items: {
                //"search":{name:LNG.search_in_path,className:"search",icon:"search",accesskey: "s"},
                "download":{name:LNG.download,className:"down",icon:"download",accesskey: "x"},
                "sep2":"--------",
                "info":{name:LNG.info,className:"info",icon:"info",accesskey: "i"}
            }
        });
    }
    var _bindTreeFolder = function(){
        $('<i class="'+selectTreeSelectorFolder.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: selectTreeSelectorFolder, 
            callback: function(key, options) {_menuTree(key);},
            items: {
                //"refresh":{name:LNG.refresh_tree,className:"refresh",icon:"refresh",accesskey: "e"},
                "download":{name:LNG.download,className:"down",icon:"download",accesskey: "x"},
                "sep1":"--------",
                "search":{name:LNG.search_in_path,className:"search",icon:"search",accesskey: "s"},
                "explorer":{name:LNG.manage_folder,className:"explorer",icon:"laptop",accesskey: "v"},
                "openProject":{name:LNG.openProject,className:"openProject",icon:"edit"},
                "sep2":"--------",
                "info":{name:LNG.info,className:"info",icon:"info",accesskey: "i"}
            }
        });
    }
    var _bindTreeFolderEditor = function(){
        $('<i class="'+selectTreeSelectorFolder.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: selectTreeSelectorFolder, 
            callback: function(key, options) {_menuTree(key);},
            items: { 
                //"refresh":{name:LNG.refresh_tree,className:"refresh",icon:"refresh",accesskey: "e"},                
                "download":{name:LNG.download,className:"down",icon:"download",accesskey: "x"},
                "sep1":"--------",
                "search":{name:LNG.search_in_path,className:"search",icon:"search",accesskey: "s"},
                "explorer":{name:LNG.manage_folder,className:"explorer",icon:"laptop",accesskey: "v"},
                "openProject":{name:LNG.openProject,className:"openProject",icon:"edit"},
                "sep2":"--------",
                "info":{name:LNG.info,className:"info",icon:"info",accesskey: "i"}
            }
        });
    };
    var _bindEditorFile = function(){
        $('<i class="'+selectTreeSelectorFile.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: selectTreeSelectorFile, 
            callback: function(key, options) {_menuTree(key);},
            items: {
                "edit":{name:LNG.edit,className:"edit",icon:"edit",accesskey: "e"},
                "open":{name:LNG.open,className:"open",icon:"external-link",accesskey: "o"},
                "download":{name:LNG.download,className:"download",icon:"download",accesskey: "x"},               
                "show_file":{name:LNG.show_file,className:"show_file",icon:"globe",accesskey: "b"},
                "sep1":"--------",            
                "info":{name:LNG.info,className:"info",icon:"info",accesskey: "i"}
            }
        });
    };

    //绑定任务栏 程序标签
    var _bindTaskBar = function(){
        $('<i class="taskBarMenu"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: '.taskBarMenu', 
            items: {    
                "quitOthers":{name:LNG.close_others,className:"quitOthers",icon:"remove-circle",accesskey: "o"},
                "quit":{name:LNG.close,className:"quit",icon:"remove",accesskey: "q"}
            },
            callback: function(key, options) {
                var id =options.$trigger.attr('id');
                var dialog = art.dialog.list[id];
                switch(key){
                    case 'quitOthers':
                        $.each(art.dialog.list,function(index,dlg){
                            if(id != index) dlg.close();
                        });
                        break;                        
                     case 'quit':dialog.close();break;
                }
            }
        });        
    };
    //绑定任务栏
    var _bindTask = function(){
        $.contextMenu({
            zIndex:9999,
            selector: '.task_tab', 
            items: {
                "closeAll":{name:LNG.dialog_close_all,icon:"remove-circle",accesskey: "q"},
                "showAll":{name:LNG.dialog_display_all,icon:"th-large",accesskey: "s"},
                "hideAll":{name:LNG.dialog_min_all,icon:"remove",accesskey: "h"}
            },
            callback: function(key, options) {
                var id =options.$trigger.attr('id');
                var dialog = art.dialog.list[id];
                switch(key){
                    case 'showAll':
                        $.each(art.dialog.list,function(index,dlg){
                            dlg.display(true);
                        });
                        break;                       
                    case 'hideAll':
                        $.each(art.dialog.list,function(index,dlg){
                            dlg.display(false);
                        });
                        break;                    
                    case 'closeAll':
                        $.each(art.dialog.list,function(index,dlg){
                            dlg.close();
                        });
                        break;
                    default:break;
                }
            }
        });        
    };

    //绑定任务栏
    var _bindDialog = function(){
        $('<i class="dialog_menu"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: '.dialog_menu', 
            items: {
                "quit_dialog":{name:LNG.close,className:"quit_dialog",icon:"remove",accesskey: "q"},
                "hide_dialog":{name:LNG.dialog_min,className:"hide_dialog",icon:"minus",accesskey: "h"},
                "refresh":{name:LNG.refresh,className:"refresh",icon:"refresh",accesskey: "r"},
                "open_window":{name:LNG.open_ie,className:"open_window",icon:"globe",accesskey: "b"},
                "qrcode":{name:LNG.qrcode,className:"qrcode line_top",icon:"qrcode",accesskey: "c"}             
            },
            callback: function(key, options) {
                var id =options.$trigger.attr('id');
                var dialog = art.dialog.list[id];
                switch(key){
                    case 'quit_dialog':dialog.close();break;
                    case 'hide_dialog':dialog.display(false);break;
                    case 'refresh':dialog.refresh();break;
                    case 'open_window':dialog.open_window();break;
                    case 'qrcode':core.qrcode(dialog.DOM.wrap.find('iframe').attr('src'));break;
                    default:break;
                }
            }
        });        
    };
    var _menuTree = function(action) {//多选，右键操作
        switch(action){
            case 'edit':ui.tree.openEditor();break;
            case 'open':ui.tree.open();break;
            case 'refresh':ui.tree.refresh();break;
            case 'info':ui.tree.info();break;
            case 'explorer':ui.tree.explorer();break;
            case 'openProject':ui.tree.openProject();break;
            case 'show_file':ui.tree.show_file();break;

            case 'download':ui.tree.download();break;
            case 'search':ui.tree.search();break;
            case 'refresh_all':ui.tree.init();break;            
            case 'quit':;break;
            default:break;
        }
    };
    //=============================tree end==========================

    return{
        initExplorer:_init_explorer,
        initEditor:_init_editor,
        show:function(select,left,top){
            if (!select) return;
            rightMenu.hidden();
            $(select).contextMenu({x:left, y:top});
        },
        //菜单显示回调 
        menuShow:function(){
            var $theMenu = $('.context-menu-list').filter(':visible');
            var $focus = $('.context-menu-active');
            if ($theMenu.length==0 || $focus.length==0) return;

            //对话框，是否有iframe对应菜单隐藏显示
            if($focus.hasClass('dialog_menu')){
                var dlg_id = $focus.attr('id');
                var dialog = art.dialog.list[dlg_id];
                if (dialog.has_frame()) {
                    $theMenu.find('.open_window').show();
                    $theMenu.find('.refresh').show();
                }else{
                    $theMenu.find('.open_window').hide();
                    $theMenu.find('.refresh').hide();
                }
            }

            if($focus.hasClass('menufile')){
                var ext = fileLight.type(Global.fileListSelect);
                if (ext=='zip') {
                    $theMenu.find('.unzip').show();
                }else{
                    $theMenu.find('.unzip').hide();
                }

                if(ext=='html' || ext=='htm' || ext=='oexe'){
                    $theMenu.find('.open_text').show();
                }else{
                    $theMenu.find('.open_text').hide();
                }
            }

            //play list
            if($focus.hasClass('menuMore')){
                var needMenu = 0;
                Global.fileListSelect.each(function(){
                    var ext = core.pathExt(fileLight.name($(this)));
                    if (inArray(core.filetype['music'],ext) 
                        || inArray(core.filetype['movie'],ext)){
                        needMenu +=1;
                    }
                });
                if(needMenu == 0){
                    $theMenu.find('.playmedia').hide();
                }else{
                    $theMenu.find('.playmedia').show();
                }
            }
        },
        isDisplay:function(){//检测是否有右键菜单
            var display = false;
            $('.context-menu-list').each(function(){
                if($(this).css("display") !="none"){
                    display = true;
                }
            });
            return display;
        },
        hidden:function(){
            $('.context-menu-list').filter(':visible').trigger('contextmenu:hide');
        }
    }
});