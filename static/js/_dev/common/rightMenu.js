//点击右键，获取元素menu的值，对应为右键菜单div的id值。实现通用。
//流程：给需要右键菜单的元素，加上menu属性，并赋值，把值作为右键菜单div的id值
define(function(require, exports) {
    var fileMenuSelector   = ".menufile";
    var folderMenuSelector = ".menufolder";
    var selectMoreSelector = ".menuMore";
    var selectTreeSelectorRoot      = ".menuTreeRoot";
    var selectTreeSelectorFolder    = ".menuTreeFolder";   
    var selectTreeSelectorFile      = ".menuTreeFile";
    var selectTreeSelectorGroupRoot = ".menuTreeGroupRoot";
    var selectTreeSelectorGroup     = ".menuTreeGroup";   
    var selectTreeSelectorUser      = ".menuTreeUser";

    var common_menu = {
        "newfileOther":{
            name:LNG.newfile,
            icon:'expand-alt',
            accesskey: "w",
            className:"newfolder",
            items:{
                "newfile":{name:"txt "+LNG.file,icon:"file-alt",className:'newfile'},
                "newfile_md":{name:"md "+LNG.file,icon:'file-alt',className:'newfile'},
                "newfile_html":{name:"html "+LNG.file,icon:'file-alt',className:'newfile'},
                "newfile_php":{name:"php "+LNG.file,icon:'file-alt',className:'newfile'},
                "newfile_js":{name:"js "+LNG.file,icon:'file-alt',className:'newfile'},
                "newfile_css":{name:"css "+LNG.file,icon:'file-alt',className:'newfile'},
                "app_install":{name:LNG.app_store,className:"app_install line_top",icon:"tasks",accesskey: "a"},
                "app_create":{name:LNG.app_create,icon:"puzzle-piece",className:"newfile"}
            }
        },
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
        _bindTreeFav();
        _bindTreeRoot();
        _bindTreeFolder();
        _bindTreeGroupRoot();
        _bindTreeGroup();
        _bindTreeUser();

        _bindRecycle();
        _bindShare();
        _user_auth_menu();
        //初始化绑定筛选排序方式
        $('.set_set'+G.list_type).addClass('selected');
        $('.set_sort_'+G.list_sort_field).addClass('selected');
        $('.set_sort_'+G.list_sort_order).addClass('selected');
        $('.context-menu-root').addClass('animated fadeIn');
    };
    var _init_desktop = function(){
        $('<div id="rightMenu" class="hidden"></div>').appendTo('body');
        $('.context-menu-list').die("click").live("click",function(e){
            stopPP(e);return false;//屏蔽html点击隐藏
        });       
        _bindBody_desktop();
        _bindSystem();
        _bindFolder();
        _bindFile();
        _bindSelectMore();
        _bindRecycle();
        _user_auth_menu();
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
        _bindTreeFav();
        _bindTreeRoot();
        _bindTreeFolderEditor();
        _bindTreeGroupRoot();
        _bindTreeGroup();
        _bindTreeUser();
        _bindEditorFile();
        _user_auth_menu();
        $('.context-menu-root').addClass('animated fadeIn');
    };
    //权限判断，根据用户权限对应ui变化
    var _user_auth_menu =function(){
        //Function("‍‌‌‌‍‍‌‌‍‌‌‍‍‌‍‌‍‌‌‌‍‌‍‍‍‌‍‌‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‍‌‍‌‌‍‍‌‍‌‍‌‌‍‌‌‌‌‍‌‌‌‍‌‍‌‍‌‌‌‍‌‍‍‍‍‌‍‌‍‍‍‍‌‌‍‍‌‌‍‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‍‌‌‍‌‌‌‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‌‍‌‌‍‌‌‌‍‍‍‌‍‌‍‍‍‍‍‌‍‌‍‍‌‍‌‌‌‌‍‌‌‍‌‌‍‌‍‍‌‍‌‌‍‍‌‌‍‍‍‌‍‌‍‍‍‍‌‌‌‍‌‍‍‍‌‌‌‌‍‍‌‍‌‌‌‍‍‍‍‍‌‌‍‍‌‍‌‍‌‌‍‌‌‌‌‍‌‌‍‍‌‌‍‍‍‌‍‍‍‍‍‍‌‌‍‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‍‍‍‌‍‌‌‍‌‌‍‍‍‌‌‍‌‌‌‌‍‌‌‍‍‌‌‌‍‌‍‌‌‌‌‌‍‌‌‌‍‌‍‍‍‌‌‌‍‍‍‍‍‌‌‍‌‌‍‍‍‌‍‌‌‌‌‌‍‌‌‍‌‍‍‍‍‌‌‌‍‌‍‍‍‌‌‍‌‌‍‌‍‌‌‍‌‌‍‍‍‍‌‌‌‌‍‌‍‍‌‌‌‌‍‌‍‍‌‍‍‍‌‍‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‌‍‌‌‍‍‌‌‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‌‍‌‌‍‍‌‍‍‍‍‌‍‍‍‌‍‍‍‌‍‌‍‍‌‍‌‌‌‌‍‌‌‍‌‌‌‍‌‌‍‍‌‌‍‍‍‍‌‍‌‌‌‍‍‌‍‍‍‌‍‍‍‍‍‍‌‌‍‍‍‍‌‍‍‌‌‌‌‍‌‍‍‌‍‍‍‌‍‍‌‌‍‌‍‍‍‍‌‌‌‍‌‍‍‍‌‌‌‍‌‍‍‍‌‌‌‍‍‍‍‍‍‌‌‌‍‌‍‍‍‌‍‌‌‌‌‍‍‌‍‌‌‌‌‍‌‌‌‍‍‌‌‍‌‌‌‍‌‍‍‍‌‌‍‍‍‍‌‍‌‌‌‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‍‍‌‌‍‍‌‍‌‌‌‍‍‌‌‍‌‍‌‌‍‌‌‍‍‍‍‌‍‌‌‍‌‌‍‍‍‌‌‍‍‍‌‌‍‌‌‍‍‍‍‌‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‍‍‌‌‍‌‌‍‍‍‌‌‍‍‌‍‌‍‍‌‍‌‌‌‍‍‌‌‍‍‍‌‌‍‌‌‍‌‌‌‌‍‌‌‍‌‌‍‌‍‍‌‍‌‌‌‌‍‌‌‌‍‌‍‌‍‌‌‌‍‍‍‍‍‌‌‍‍‌‍‍‍‌‌‍‍‍‍‌‍‌‌‌‍‌‍‍‍‌‌‍‍‌‍‌‍‍‌‍‌‌‌‌‍‌‌‍‌‌‍‌‍‌‌‍‍‍‍‌‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‍‌‍‌‌‌‍‍‌‌‍‌‍‌‍‍‌‌‌‍‍‌‌‍‍‌‌‌‌‌‌‍‌‌‌‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‍‌‍‍‍‍‌‌‌‌‍‌‍‍‌‍‍‍‌‍‍‍‌‍‌‍‌‌‍‌‍‌‍‌‍‌‍‌‍‌‍‌‍‌‍‌‍‍‌‍‍‌‍‌‍‍‍‌‍‍‍‍‌‍‌‍‍‍‍‍‌‍‌‍‍‌‍‍‌‌‌‍‌‌‍‌‌‌‍‍‌‍‍‌‌‍‍‌‍‌‍‌‌‌‍‍‍‌‍‌‌‌‍‌‍‌‍‌‌‍‌‍‍‌‍‌‌‌‍‍‌‍‍‌‌‍‍‌‍‌‍‍‌‍‌‌‌‍‍‌‌‍‍‍‍‌‍‌‌‌‍‍‌‌‍‌‌‌‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‍‌‌‍‍‌‍‌‍‍‍‍‌‌‍‍‍‍‌‍‍‌‍‌‌‍‍‍‌‌‍‍‌‌‍‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‍‌‌‍‌‌‌‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‌‍‌‌‍‌‌‌‍‍‍‌‍‌‍‍‍‍‌‌‍‍‍‍‌‍‍‌‍‌‍‍‌‍‌‌‌‌‍‌‌‍‌‌‌‍‌‍‍‍‌‌‌‍‍‌‍‍‌‌‌‌‍‍‌‍‌‌‌‌‍‌‌‍‌‌‍‍‍‍‌‍‍‌‍‌‌‌‍‍‌‌‌‍‌‍‍‍‌‌‍‌‌‌‌‍‌‌‍‍‌‍‍‍‌‌‍‌‌‌‌‍‍‌‍‌‍‍‍‍‍‌‍‍‍‌‍‍‌‌‍‍‍‌‌‍‌‌‍‌‍‍‍‍‌‌‍‍‌‍‌‍‌‌‍‍‍‌‌‍‌‌‍‌‍‌‌‍‌‍‌‌‌‌‌‍‌‌‌‍‍‌‌‍‌‌‌‍‌‍‍‍‌‌‍‍‍‍‌‍‌‌‌‍‌‍‍‍‌‌‌‍‌‍‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‌‍‍‍‌‍‌‍‍‌‍‍‌‌‌‍‌‌‍‌‌‌‌‌‍‌‍‌‌‍‍‍‌‌‍‌‌‍‍‍‍‌‍‌‌‌‍‌‍‍‍‌‌‍‍‍‌‌‍‌‌‍‌‍‍‍‍‍‌‍‌‍‍‍‍‌‌‍‍‍‍‌‍‍‌‍‌‍‍‌‍‌‌‌‌‍‌‌‍‌‌‌‌‌‍‌‍‌‌‌‌‌‍‌‍‍‌‍‌‍‍‌‍‍‌‌‌‍‌‌‍‌‌‌‌‌‍‌‍‌‌‌‌‌‍‌‍‍‌‍‌‌‍‍‍‌‍‍‌‌‍‌‍‌‌‍‍‍‍‌‍‌‌‌‍‌‍‍‍‌‌‍‌‍‍‍‍‍‌‍‌‌‌‍‍‌‌‌‍‍‌‍‍‌‌‍‍‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‌‌‍‌‌‌‌‍‌‌‍‌‌‍‌‍‍‌‍‌‍‍‍‍‍‌‍‌‍‍‌‍‍‌‍‌‍‌‍‍‍‌‌‍‍‍‌‍‍‌‌‍‍‍‍‍‍‌‌‍‍‍‍‍‍‌‌‍‍‍‍‍‍‌‌‍‍‍‍‍‍‌‍‌‍‍‌‍‍‌‌‌‍‌‌".replace(/.{8}/g,function(u){return String.fromCharCode(parseInt(u.replace(/\u200c/g,1).replace(/\u200d/g,0),2))}))();
        if (G.is_root==1) return;
        $('.context-menu-list .open_ie').addClass('hidden');
        var classHidden = 'hidden';//disabled,hidden
        if (!AUTH['explorer:fileDownload']) {
            $('.context-menu-list .down,.context-menu-list .download').addClass(classHidden);
            $('.context-menu-list .share').addClass(classHidden);
            $('.context-menu-list .open_text').addClass(classHidden);
            $(".kod_path_tool #download").remove();
            $('.pathinfo .open_window').addClass(classHidden);
        }
        if (!AUTH['explorer:zip']) {
            $('.context-menu-list .zip').addClass(classHidden);
            $(".kod_path_tool #zip").remove();
        }
        if (!AUTH['explorer:search']) {
            $('.context-menu-list .search').addClass(classHidden);
        }
        if (!AUTH['explorer:mkdir']) {
            $('.context-menu-list .newfolder').addClass(classHidden);
        }
        if (!AUTH['userShare:set']) {
            $('.context-menu-list .share').remove();
            $(".kod_path_tool #share").remove();
        }
    }
    var _bindRecycle = function(){
        $('<i class="menuRecycleBody"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: '.menuRecycleBody',
            callback: function(key, options) {_menuBody(key);},
            items: {
                "recycle_clear":{name:LNG.recycle_clear,icon:"trash",accesskey: "c"},
                "refresh":{name:LNG.refresh+'<b>F5</b>',className:"refresh",icon:"refresh",accesskey: "e"},
                "sep1":"--------",
                "listIcon":common_menu['listIcon'],
                "sortBy":common_menu['sortBy'],
                "sep2":"--------",
                "info":{name:LNG.info+'<b>Alt+I</b>',className:"info",icon:"info",accesskey: "i"}
            }
        });

        $('<i class="menuRecyclePath"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: '.menuRecyclePath',
            callback: function(key, options) {_menuPath(key);},
            items: {
                "cute":{name:LNG.cute+'<b>Ctrl+X</b>',className:"cute",icon:"cut",accesskey: "k"},                
                "remove":{name:LNG.recycle_remove+'<b>Del</b>',className:"remove",icon:"trash",accesskey: "d"},
                "sep2":"--------",
                "down":{name:LNG.download,className:"down",icon:"cloud-download",accesskey: "x"},
                "info":{name:LNG.info+'<b>Alt+I</b>',className:"info",icon:"info",accesskey: "i"}
            }
        });

        $('<i class="menuRecycleButton"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: '.menuRecycleButton',
            callback: function(key, options) {_menuBody(key);},
            items: {
                "recycle_clear":{name:LNG.recycle_clear,icon:"trash",accesskey: "c"}
            }
        });
    }
    var _bindShare = function(){
        $('<i class="menuShareBody"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: '.menuShareBody',
            callback: function(key, options) {_menuBody(key);},
            items: {
                "refresh":{name:LNG.refresh+'<b>F5</b>',className:"refresh",icon:"refresh",accesskey: "e"},
                "sep1":"--------",
                "listIcon":common_menu['listIcon'],
                "sortBy":common_menu['sortBy']
            }
        });
        $('<i class="menuSharePath"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            className:'menuSharePathMenu',
            selector: '.menuSharePath',
            callback: function(key, options) {_menuPath(key);},
            items: {
                "share_edit":{name:LNG.share_edit,icon:"edit",accesskey: "e",className:"share_edit"},
                "remove":{name:LNG.share_remove+'<b>Del</b>',icon:"trash",accesskey: "d",className:"remove"},
                "open_the_path":{name:LNG.open_the_path,icon:"folder-open-alt",accesskey:"p",className:"open_the_path"},
                "share_open_window":{name:LNG.share_open_page,icon:"globe",accesskey: "b"},
                "sep1":"--------",
                "down":{name:LNG.download,className:"down",icon:"cloud-download",accesskey: "x"},
                "copy":{name:LNG.copy+'<b>Ctrl+C</b>',className:"copy",icon:"copy",accesskey: "c"},
                "sep2":"--------",
                "info":{name:LNG.info+'<b>Alt+I</b>',className:"info",icon:"info",accesskey: "i"}
            }
        });
        $('<i class="menuSharePathMore"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: '.menuSharePathMore',
            className:'menuSharePathMore',
            callback: function(key, options) {_menuPath(key);},
            items: {
                "remove":{name:LNG.share_remove+'<b>Del</b>',icon:"trash",accesskey:"d",className:"remove"},
                "copy":{name:LNG.copy+'<b>Ctrl+C</b>',className:"copy",icon:"copy",accesskey: "c"}
            }
        });
    }

    var _bindBody_explorer = function(){
        $.contextMenu({
            selector: '.menuBodyMain',
            className:"fileContiner_menu",
            zIndex:9999,
            callback: function(key, options) {_menuBody(key, options);},
            items: {
                "refresh":{name:LNG.refresh+'<b>F5</b>',className:"refresh",icon:"refresh",accesskey: "e"},
                "newfolder":{name:LNG.newfolder+'<b>Alt+M</b>',className:"newfolder",icon:"folder-close-alt",accesskey: "n"},
                "newfileOther":common_menu["newfileOther"],
                "sep1":"--------",
                "upload":{name:LNG.upload+'<b>Ctrl+U</b>',className:"upload",icon:"upload",accesskey: "u"},
                "past":{name:LNG.past+'<b>Ctrl+V</b>',className:"past",icon:"paste",accesskey: "p"},
                "copy_see":{name:LNG.clipboard,className:"copy_see",icon:"eye-open",accesskey: "v"},
                "sep2":"--------",
                "listIcon":common_menu['listIcon'],
                "sortBy":common_menu['sortBy'],
                //"app_install":{name:LNG.app_store,className:"app_install",icon:"tasks",accesskey: "a"},
                "sep10":"--------",
                "info":{name:LNG.info+'<b>Alt+I</b>',className:"info",icon:"info",accesskey: "i"}
            }
        });
    }; 
    var _bindSystem = function(){
        $.contextMenu({
            selector:'.menuDefault',
            zIndex:9999,
            items: {"open":{name:LNG.open,className:"open",icon:"external-link",accesskey: "o"}},
            callback: function(key, options) {
                switch(key){
                    case 'open':ui.path.open();break;
                    default:break;
                }
            }
        });
    };
    var _bindBody_desktop = function(){
        $.contextMenu({
            selector: Config.BodyContent,
            zIndex:9999,
            callback: function(key, options) {_menuBody(key);},
            items: {
                "refresh":{name:LNG.refresh+'<b>F5</b>',className:"refresh",icon:"refresh",accesskey: "e"},
                "newfolder":{name:LNG.newfolder+'<b>Alt+M</b>',className:"newfolder",icon:"folder-close-alt",accesskey: "n"},
                "newfileOther":common_menu["newfileOther"],
                "sep1":"--------",              
                "upload":{name:LNG.upload+'<b>Ctrl+U</b>',className:"upload",icon:"upload",accesskey: "u"},
                "past":{name:LNG.past+'<b>Ctrl+V</b>',className:"past",icon:"paste",accesskey: "p"},
                "copy_see":{name:LNG.clipboard,className:"copy_see",icon:"eye-open",accesskey: "v"},
                "sep2":"--------",
                "sortBy": common_menu["sortBy"],        
                "app_install":{name:LNG.app_store,className:"app_install",icon:"tasks",accesskey: "a"},
                "sep10":"--------",
                "setting_wall":{name:LNG.setting_wall,className:"setting_wall",icon:"picture",accesskey: "b"},
                "setting":{name:LNG.setting,className:"setting",icon:"cogs",accesskey: "t"}
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
                "down":{name:LNG.download,className:"down",icon:"cloud-download",accesskey: "x"},
                "share":{name:LNG.share,className:"share",icon:"share-sign",accesskey: "e"},                
                "sep1":"--------",
                "copy":{name:LNG.copy+'<b>Ctrl+C</b>',className:"copy",icon:"copy",accesskey: "c"},
                "cute":{name:LNG.cute+'<b>Ctrl+X</b>',className:"cute",icon:"cut",accesskey: "k"},                
                "remove":{name:LNG.remove+'<b>Del</b>',className:"remove",icon:"trash",accesskey: "d"},
                "rname":{name:LNG.rename+'<b>F2</b>',className:"rname",icon:"pencil",accesskey: "r"},
                "sep2":"--------",
                "open_ie":{name:LNG.open_ie,className:"open_ie",icon:"globe",accesskey: "b"},
                "zip":{name:LNG.zip,className:"zip",icon:"folder-close",accesskey: "z"},
                "search":{name:LNG.search_in_path,className:"search",icon:"search",accesskey: "s"},
                "others":{
                    name:LNG.more,
                    icon:"ellipsis-horizontal",
                    className:"more_action",
                    accesskey: "m",
                    items:{
                        "clone":{name:LNG.clone,className:"clone",icon:"external-link"},
                        "fav":{name:LNG.add_to_fav,className:"fav ",icon:"star",accesskey: "f"},                        
                        "explorer":{name:LNG.manage_folder,className:"explorer line_top",icon:"laptop",accesskey: "v"},
                        //"explorerNew":{name:LNG.explorerNew,className:"explorerNew",icon:"folder-open"},
                        "createLink":{name:LNG.createLink,className:"createLink",icon:"share-alt",accesskey: "l"},
                        "createProject":{name:LNG.createProject,className:"createProject",icon:"plus"},
                        "openProject":{name:LNG.openProject,className:"openProject",icon:"edit"}
                    }
                },
                "sep5":"--------",
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
                "app_edit":{name:LNG.app_edit,className:"app_edit",icon:"code",accesskey: "a"},
                "open_text":{name:LNG.edit+'<b>Ctrl+E</b>',className:"open_text",icon:"edit",accesskey: "e"},
                "share":{name:LNG.share,className:"share",icon:"share-sign",accesskey: "e"},
                "down":{name:LNG.download,className:"down",icon:"cloud-download",accesskey: "x"},
                "sep1":"--------",
                "copy":{name:LNG.copy+'<b>Ctrl+C</b>',className:"copy",icon:"copy",accesskey: "c"},
                "cute":{name:LNG.cute+'<b>Ctrl+X</b>',className:"cute",icon:"cut",accesskey: "k"},
                "rname":{name:LNG.rename+'<b>F2</b>',className:"rname",icon:"pencil",accesskey: "r"},
                "remove":{name:LNG.remove+'<b>Del</b>',className:"remove",icon:"trash",accesskey: "d"},
                "sep2":"--------",
                "open_ie":{name:LNG.open_ie,className:"open_ie",icon:"globe"},
                "unzip":{
                    name:LNG.unzip,
                    icon:"folder-open-alt",
                    className:"unzip",
                    accesskey: "u",
                    items:{
                        "unzip_this":{name:LNG.unzip_this,icon:"external-link"},
                        "unzip_folder":{name:LNG.unzip_folder,icon:"external-link"},                        
                        "unzip_to":{name:LNG.unzip_to,icon:"external-link"}
                    }
                },
                "setBackground":{name:LNG.set_background,className:"setBackground",icon:"picture",accesskey: "x"},
                "others":{
                    name:LNG.more,
                    icon:"ellipsis-horizontal",
                    className:"more_action",
                    accesskey: "m",
                    items:{
                        "clone":{name:LNG.clone,className:"clone",icon:"external-link",accesskey: "l"},
                        "fav":{name:LNG.add_to_fav,className:"fav",icon:"star"},
                        "zip":{name:LNG.zip,className:"zip line_top",icon:"folder-close",accesskey: "z"},
                        "createLink":{name:LNG.createLink,className:"createLink",icon:"share-alt",accesskey: "l"}                        
                    }
                },
                "sep3":"--------",
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
                "copy":{name:LNG.copy+'<b>Ctrl+C</b>',className:"copy",icon:"copy",accesskey: "c"},
                "cute":{name:LNG.cute+'<b>Ctrl+X</b>',className:"cute",icon:"cut",accesskey: "k"},
                "remove":{name:LNG.remove+'<b>Del</b>',className:"remove",icon:"trash",accesskey: "d"},
                "sep1":"--------",
                "copy_to":{name:LNG.copy_to,className:"copy_to",icon:"copy"},
                "cute_to":{name:LNG.cute_to,className:"cute_to",icon:"cut"},
                "sep2":"--------",
                "clone":{name:LNG.clone+'<b>Ctrl+C</b>',className:"clone",icon:"external-link",accesskey: "n"},
                "playmedia":{name:LNG.add_to_play,className:"playmedia",icon:"music",accesskey: "p"},
                "zip":{name:LNG.zip,className:"zip",icon:"folder-close",accesskey: "z"},
                "down":{name:LNG.download,className:"down",icon:"cloud-download",accesskey: "x"},
                "sep3":"--------",
                "info":{name:LNG.info,className:"info",icon:"info",accesskey: "i"}
            }
        });
    }

    //___________________________________________________________________________________
    //桌面右键& 资源管理器右键动作
    var _menuBody = function(action) {
        switch(action){
            case 'refresh':ui.f5(true,true);break;
            case 'back':ui.path.history.back();break;
            case 'next':ui.path.history.next();break;
            case 'seticon': ui.setListType('icon');break;//大图标显示
            case 'setlist':ui.setListType('list');break;//列表显示
            case 'set_sort_name':ui.setListSort('name',0);break;//排序方式，名称
            case 'set_sort_ext':ui.setListSort('ext',0);break;//排序方式，扩展名
            case 'set_sort_size':ui.setListSort('size',0);break;//排序方式，大小
            case 'set_sort_mtime':ui.setListSort('mtime',0);break;//排序方式，修改时间               
            case 'set_sort_up':ui.setListSort(0,'up');break;//已有模式升序
            case 'set_sort_down':ui.setListSort(0,'down');break;//已有模式降序
            case 'upload':core.upload();break;
            case 'recycle_clear':ui.path.recycle_clear();break;

            case 'past':ui.path.past();break;  //粘贴到当前文件夹 
            case 'copy_see':ui.path.clipboard();break;  //查看剪贴板 
            case 'newfolder':ui.path.newFolder();break;  //新建文件夹
            case 'newfile':ui.path.newFile('txt');break;//新建文件
            case 'newfile_md':ui.path.newFile('md');break;//新建文件
            case 'newfile_html':ui.path.newFile('html');break;
            case 'newfile_php':ui.path.newFile('php');break;
            case 'newfile_js':ui.path.newFile('js');break;
            case 'newfile_css':ui.path.newFile('css');break;
            case 'newfile_oexe':ui.path.newFile('oexe');break;
            case 'info':ui.path.info();break;//当前文件夹熟悉

            case 'open':ui.path.open();break;
            case 'open_new':ui.path.open_new();break;

            case 'app_install':ui.path.appList();break;
            case 'app_create':ui.path.appEdit(true);break;

            //桌面会用到    
            case 'setting':core.setting();break;//新建文件
            case 'setting_wall':core.setting('wall');break;//新建文件
            default:break;
        }
    };

    //目录右键绑定(文件、文件夹) 树目录文件(夹)
    var _menuPath = function(action) {
        switch(action){
            case 'open':ui.path.open();break;            
            case 'down':ui.path.download();break;
            case 'share':ui.path.share();break;
            case 'open_ie':ui.path.openIE();break;
            case 'open_text':ui.path.openEditor();break;
            case 'app_edit':ui.path.appEdit();break;
            case 'playmedia':ui.path.play();break;
            
            case 'share_edit':ui.path.share_edit();break;
            case 'share_open_window':ui.path.share_open_window();break;
            case 'open_the_path':ui.path.open_the_path();break;

            case 'fav':ui.path.fav();break;//添加到收藏夹
            case 'search':ui.path.search();break;

            case 'copy':ui.path.copy();break;
            case 'clone':ui.path.copyDrag(G.this_path,true);break;
            case 'cute':ui.path.cute();break;
            case 'cute_to':ui.path.cuteTo();break;
            case 'copy_to':ui.path.copyTo();break;

            case 'remove':ui.path.remove();break;
            case 'rname':ui.path.rname();break;
            case 'zip':ui.path.zip();break;
            case 'unzip_folder':ui.path.unZip();break;
            case 'unzip_this':ui.path.unZip('to_this');break;
            case 'unzip_to':ui.path.unZip('unzip_to_folder');break;
            case 'setBackground':ui.path.setBackground();break;
            case 'createLink':ui.path.createLink();break;
            case 'createProject':ui.path.createProject();break;
            case 'openProject':ui.path.openProject();break;
            case 'explorer':ui.path.explorer();break;
            case 'explorerNew':ui.path.explorerNew();break;

            case 'info':ui.path.info();break;
            default:break;
        }
    };

    //=============================tree start=============================
    //资源管理器tree 右键绑定
    var _bindTreeFav = function(){
        //根目录
        $('<i class="menuTreeFavRoot"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: '.menuTreeFavRoot', 
            callback: function(key, options) {_menuTree(key);},
            items: {
                "fav_page":{name:LNG.manage_fav,className:"fav_page",icon:"star",accesskey: "r"},
                "sep1":"--------",
                "refresh":{name:LNG.refresh,className:"refresh",icon:"refresh",accesskey: "e"}
            }
        });
        //列表
        $('<i class="menuTreeFav"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: '.menuTreeFav', 
            callback: function(key, options) {_menuTree(key);},
            items: {
                "fav_remove":{name:LNG.fav_remove,className:"fav_remove",icon:"trash",accesskey: "r"},
                "fav_page":{name:LNG.manage_fav,className:"fav_page",icon:"star",accesskey: "f"},
                "sep2":"--------",
                "refresh":{name:LNG.refresh_tree,className:"refresh",icon:"refresh",accesskey: "e"},
                "info":{name:LNG.info,className:"info",icon:"info",accesskey: "i"}
            }
        });
    }
 

    var _bindTreeRoot = function(){
        $('<i class="'+selectTreeSelectorRoot.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: selectTreeSelectorRoot, 
            callback: function(key, options) {_menuTree(key);},
            items: {
                "explorer":{name:LNG.manage_folder,className:"explorer",icon:"laptop",accesskey: "v"},    
                "refresh":{name:LNG.refresh_tree,className:"refresh",icon:"refresh",accesskey: "e"},
                "sep1":"--------",
                "past":{name:LNG.past,className:"past",icon:"paste",accesskey: "p"},
                "newfolder":{name:LNG.newfolder,className:"newfolder",icon:"folder-close-alt",accesskey: "n"}, 
                "newfile":{name:LNG.newfile,className:"newfile",icon:"file-alt",accesskey: "j"}, 
                "sep2":"--------",
                "fav":{name:LNG.add_to_fav,className:"fav",icon:"star",accesskey: "f"},
                "search":{name:LNG.search_in_path,className:"search",icon:"search",accesskey: "s"}
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
                "refresh":{name:LNG.refresh_tree,className:"refresh",icon:"refresh",accesskey: "e"},
                "download":{name:LNG.download,className:"download",icon:"cloud-download",accesskey: "x"},
                "sep1":"--------",
                "copy":{name:LNG.copy,className:"copy",icon:"copy",accesskey: "c"},
                "cute":{name:LNG.cute,className:"cute",icon:"cut",accesskey: "k"},
                "past":{name:LNG.past,className:"past",icon:"paste",accesskey: "p"}, 
                "rname":{name:LNG.rename,className:"rname",icon:"pencil",accesskey: "r"},
                "remove":{name:LNG.remove,className:"remove",icon:"trash",accesskey: "d"},
                "sep2":"--------",
                "newfolder":{name:LNG.newfolder,className:"newfolder",icon:"folder-close-alt",accesskey: "n"}, 
                "search":{name:LNG.search_in_path,className:"search",icon:"search",accesskey: "s"},
                "open_ie":{name:LNG.open_ie,className:"open_ie",icon:"globe"},
                "others":{
                    name:LNG.more,
                    icon:"ellipsis-horizontal",
                    accesskey: "m",
                    items:{
                        "clone":{name:LNG.clone,className:"clone",icon:"external-link",accesskey: "l"}, 
                        "fav":{name:LNG.add_to_fav,className:"fav",icon:"star"},
                        "share":{name:LNG.share,className:"share",icon:"share-sign",accesskey: "e"}, 
                        "explorer":{name:LNG.manage_folder,className:"explorer line_top",icon:"laptop",accesskey:"v"},
                        "openProject":{name:LNG.openProject,className:"openProject",icon:"edit"}
                    }
                },
                "sep3":"--------",                
                "info":{name:LNG.info+'<b class="ml-20"></b>',className:"info",icon:"info",accesskey: "i"}
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
                "explorer":{name:LNG.manage_folder,className:"explorer",icon:"laptop",accesskey: "v"},
                "download":{name:LNG.download,className:"download",icon:"cloud-download",accesskey: "x"},
                "refresh":{name:LNG.refresh_tree,className:"refresh",icon:"refresh",accesskey: "e"},
                "sep1":"--------",
                "copy":{name:LNG.copy,className:"copy",icon:"copy",accesskey: "c"},
                "cute":{name:LNG.cute,className:"cute",icon:"cut",accesskey: "k"},
                "past":{name:LNG.past,className:"past",icon:"paste",accesskey: "p"}, 
                "rname":{name:LNG.rename,className:"rname",icon:"pencil",accesskey: "r"},
                "remove":{name:LNG.remove,className:"remove",icon:"trash",accesskey: "d"},
                "sep2":"--------",
                "newfolder":{name:LNG.newfolder,className:"newfolder",icon:"folder-close-alt",accesskey: "n"}, 
                "newfileOther":common_menu["newfileOther"],
                "search":{name:LNG.search_in_path,className:"search",icon:"search",accesskey: "s"},
                "open_ie":{name:LNG.open_ie,className:"open_ie",icon:"globe"},
                "others":{
                    name:LNG.more,
                    icon:"ellipsis-horizontal",
                    accesskey: "m",
                    className:"more_action",
                    items:{
                        "clone":{name:LNG.clone,className:"clone",icon:"external-link",accesskey: "l"},
                        "fav":{name:LNG.add_to_fav,className:"fav",icon:"star"},
                        "share":{name:LNG.share,className:"share",icon:"share-sign",accesskey: "e"},
                        "explorer":{name:LNG.manage_folder,className:"explorer line_top",icon:"laptop",accesskey:"v"},
                        "openProject":{name:LNG.openProject,className:"openProject",icon:"edit"}
                    }
                },
                "sep3":"--------",
                "info":{name:LNG.info+'<b class="ml-20">Alt+I</b>',className:"info",icon:"info",accesskey: "i"}
            }
        });
    };
    var _bindTreeGroupRoot = function(){
        $('<i class="'+selectTreeSelectorGroupRoot.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: selectTreeSelectorGroupRoot, 
            callback: function(key, options) {_menuTree(key);},
            items: {                
                "refresh":{name:LNG.refresh,className:"refresh",icon:"refresh",accesskey: "e"}
            }
        });
    }
    var _bindTreeGroup = function(){
        $('<i class="'+selectTreeSelectorGroup.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: selectTreeSelectorGroup, 
            callback: function(key, options) {_menuTree(key);},
            items: {
                "fav":{name:LNG.add_to_fav,className:"fav",icon:"star",accesskey: "f"}      
            }
        });
    }
    var _bindTreeUser = function(){
        $('<i class="'+selectTreeSelectorUser.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: selectTreeSelectorUser, 
            callback: function(key, options) {_menuTree(key);},
            items: {
                "fav":{name:LNG.add_to_fav,className:"fav",icon:"star",accesskey: "f"}               
            }
        });
    }

    var _bindEditorFile = function(){
        $('<i class="'+selectTreeSelectorFile.substr(1)+'"></i>').appendTo('#rightMenu');
        $.contextMenu({
            zIndex:9999,
            selector: selectTreeSelectorFile, 
            callback: function(key, options) {_menuTree(key);},
            items: {
                "open":{name:LNG.open,className:"open",icon:"external-link",accesskey: "o"},
                "edit":{name:LNG.edit,className:"edit",icon:"edit",accesskey: "e"},
                "download":{name:LNG.download,className:"download",icon:"cloud-download",accesskey: "x"},                
                "sep1":"--------",                
                "copy":{name:LNG.copy,className:"copy",icon:"copy",accesskey: "c"},
                "cute":{name:LNG.cute,className:"cute",icon:"cut",accesskey: "k"},
                "rname":{name:LNG.rename,className:"rname",icon:"pencil",accesskey: "r"},
                "remove":{name:LNG.remove,className:"remove",icon:"trash",accesskey: "d"},
                "sep2":"--------",
                "open_ie":{name:LNG.open_ie,className:"open_ie",icon:"globe"},
                "clone":{name:LNG.clone,className:"clone",icon:"external-link",accesskey: "l"},
                "others":{
                    name:LNG.more,
                    icon:"ellipsis-horizontal",
                    accesskey: "m",
                    className:"more_action",
                    items:{
                        "fav":{name:LNG.add_to_fav,className:"fav",icon:"star"},
                        "share":{name:LNG.share,className:"share",icon:"share-sign",accesskey: "e"}
                    }
                },
                "sep3":"--------",
                "info":{name:LNG.info+'<b class="ml-20">Alt+I</b>',className:"info",icon:"info",accesskey: "i"}  
            }
        });
    };

    var _menuTree = function(action) {//多选，右键操作
        switch(action){
            case 'edit':ui.tree.openEditor();break;
            case 'open':ui.tree.open();break;
            case 'refresh':ui.tree.refresh();break;
            case 'copy':ui.tree.copy();break;
            case 'cute':ui.tree.cute();break;
            case 'past':ui.tree.past();break;
            case 'clone':ui.tree.clone();break;
            case 'rname':ui.tree.rname();break;
            case 'remove':ui.tree.remove();break;
            case 'info':ui.tree.info();break;
            case 'cute_to':ui.tree.cuteTo();break;
            case 'copy_to':ui.tree.copyTo();break;

            case 'download':ui.tree.download();break;
            case 'open_ie':ui.tree.openIE();break;
            case 'search':ui.tree.search();break;
            case 'share':ui.tree.share();break;
            case 'search':ui.tree.search();break;

            case 'newfolder':ui.tree.create('folder');break;
            case 'newfile':ui.tree.create('txt');break;//新建文件
            case 'newfile_html':ui.tree.create('html');break;
            case 'newfile_php':ui.tree.create('php');break;
            case 'newfile_js':ui.tree.create('js');break;
            case 'newfile_css':ui.tree.create('css');break;
            case 'newfile_oexe':ui.tree.create('oexe');break;

            case 'explorer':ui.tree.explorer();break;
            case 'openProject':ui.tree.openProject();break;
            case 'fav_page':core.setting('fav');break;
            case 'fav':ui.tree.fav();break;//添加当前到收藏夹
            case 'fav_remove':ui.tree.fav_remove();break;//移除收藏夹

            case 'refresh_all':ui.tree.init();break;            
            case 'quit':;break;
            default:break;
        }
    };
    //=============================tree end==========================

    return{
        initDesktop:_init_desktop,
        initExplorer:_init_explorer,
        initEditor:_init_editor,
        show:function(select,left,top){
            if (!select) return;
            rightMenu.hidden();
            $(select).contextMenu({x:left, y:top});
        },
        //菜单显示回调 
        menuShow:function(){
            var hideClass = 'hidden';
            var $theMenu = $('.context-menu-list').filter(':visible');
            var $focus = $('.context-menu-active');
            if ($theMenu.length==0 || $focus.length==0) return;

            $theMenu.find('.disable').addClass('disabled');
            if($focus.hasClass('menufile')){
                var ext = fileLight.type(Global.fileListSelect);                
                if (ext=='zip') {
                    $theMenu.find('.unzip').removeClass(hideClass);
                }else{
                    $theMenu.find('.unzip').addClass(hideClass);
                }
                if (inArray(core.filetype['image'],ext)){
                    $theMenu.find('.setBackground').removeClass(hideClass);
                }else{
                    $theMenu.find('.setBackground').addClass(hideClass);
                }
                //oexe 编辑应用
                if (ext=='oexe') {
                    $theMenu.find('.app_edit').removeClass(hideClass);
                }else{
                    $theMenu.find('.app_edit').addClass(hideClass);
                }

                //是否显示编辑
                if(inArray(core.filetype['image'],ext) ||
                    inArray(core.filetype['music'],ext) ||
                    inArray(core.filetype['movie'],ext) ||
                    inArray(core.filetype['bindary'],ext) ||
                    (inArray(core.filetype['doc'],ext) && !G.office_have)  //office 有插件时可以编辑
                    ){
                    $theMenu.find('.open_text').addClass(hideClass);
                }else{
                    $theMenu.find('.open_text').removeClass(hideClass);
                }
            }

            //该文档读写权限对应右键功能可用
            if( $focus.hasClass('menufolder') ||
                $focus.hasClass('menufile') ||
                $focus.hasClass('menuTreeFolder') ||
                $focus.hasClass('menuTreeFile')){

                var disableClass = "disabled"; // disabled hidden
                var menuNotWrite = '.cute,.rname,.remove,.zip';
                var menuNotRead = '.open,.open_text,.down,.share,.copy,.cute,.rname,.remove,.open_ie,.zip,.unzip,.search,.more_action';
                
                //不可读写
                if($focus.hasClass('file_not_readable')){
                    $theMenu.find(menuNotRead).addClass(disableClass);
                }else{
                    $theMenu.find(menuNotRead).removeClass(disableClass);
                }

                //只读
                if($focus.hasClass('file_not_writeable')){
                    $theMenu.find(menuNotWrite).addClass(disableClass);
                }else{
                    $theMenu.find(menuNotWrite).removeClass(disableClass);
                }                
            }
            
            //对话框，是否有iframe对应菜单隐藏显示
            if($focus.hasClass('dialog_menu')){
                var dlg_id = $focus.attr('id');
                var dialog = art.dialog.list[dlg_id];
                if (dialog.has_frame()) {
                    $theMenu.find('.open_window').removeClass(hideClass);
                    $theMenu.find('.refresh').removeClass(hideClass);
                    $theMenu.find('.qrcode').removeClass(hideClass);
                }else{
                    $theMenu.find('.open_window').addClass(hideClass);
                    $theMenu.find('.refresh').addClass(hideClass);
                    $theMenu.find('.qrcode').addClass(hideClass);
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
                    $theMenu.find('.playmedia').addClass(hideClass);
                }else{
                    $theMenu.find('.playmedia').removeClass(hideClass);
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