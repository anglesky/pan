define(function(require, exports) {
    var user_list_all;
    var current_group_id;

    var load_list = function(group_id){
        if(user_list_all !=undefined){//已加载则不再加载；更新时只需要重置user_list_all即可
            _init_view(group_id);
            return;
        }
        $.ajax({
            url:'./index.php?system_member/get',
            dataType:'json',
            success:function(data){
                if (!data.code) {
                    tips(data);
                    return;
                }
                user_list_all= data.data;
                _init_view(group_id);
            },
            error:function(){
                return false;
            }
        });
    }
    var _init_view = function(group_id){
        if(group_id == ''){//空值则刷新列表
            group_id = current_group_id;
        }
        current_group_id = group_id;
        
        var tpl_list = require('./tpl/user_list.html');
        var render = template.compile(tpl_list);
        var html = render({
            LNG:LNG,
            select_group:group_id,
            user_list:user_list_all,
            group_list:System.system_group.get_group_list(),
            role_list:System.system_role.get_list()
        });
        $('.user_liser_content').html(html);
        $('.button_aciton_muti button').addClass('disabled');
        System.size_use($('#content_system_group .user_list_cell .space'));
    }
    //支持多个删除
    var user_remove = function(user_id){        
        $.dialog({
            id:'dialog_path_remove',
            fixed: true,//不跟随页面滚动
            icon:'question',
            title:LNG.system_member_remove,
            padding:20,
            width:200,
            lock:true,
            background:"#000",
            opacity:0.3,
            content:LNG.system_member_remove_tips,
            ok:function() {
                user_action_post('del',user_id,'');
            },
            cancel: true
        });
    }

    /**
     * 用户批量操作 system_member/do_action&action=&user_id=[101,222,131]&param=
     * action : 
     * -------------
     * del                  删除用户
     * status_set           启用&禁用 param=0/1
     * role_set             权限组 param=role_id
     * group_reset          重置分组 param=group_json
     * group_remove_from    从某个组删除 param=group_id
     * group_add            添加到某个分组 param=group_json
     */ 
    var user_action_post = function(action,user_id,param){
        if (user_id == undefined) return;
        if(typeof(user_id) != 'object'){
            user_id = [user_id];
        }

        var action_dlg = {
            'del':LNG.system_member_remove_tips,
            'status_set':'',
            'role_set':LNG.system_member_set_role,
            'group_reset':'',
            'group_remove_from':LNG.system_member_remove_group,
            'group_add':'',
        };

        var do_post = function(){
            $.ajax({
                url: './index.php?system_member/do_action&action='+action,
                type:'POST',
                data:"user_id="+json_encode(user_id)+'&param='+param,
                dataType:'json',
                beforeSend:function(){
                    core.tips.loading();
                },
                error:core.ajaxError,
                success: function(data) {
                    core.tips.close(data);
                    if(artDialog.list['share_dialog']){
                        artDialog.list['share_dialog'].close();
                    }
                    user_list_all = undefined;
                    load_list(current_group_id);
                }
            });
        }

        if(action_dlg[action] ==''){
            do_post();
        }else{//需要确认的操作
            $.dialog({
                id:'dialog_user_confirm',
                fixed: true,//不跟随页面滚动
                icon:'question',
                padding:30,
                width:250,
                lock:true,
                background:"#000",
                opacity:0.2,
                content:action_dlg[action],
                ok:function() {
                    do_post();
                },
                cancel: true
            });
        }
    }

    var user_import = function(group_id){
        var group_info = {"1":"read"};
        group_info[group_id] = "read";
        var user_info =  {
            user_id:'',
            name:"",
            password:"123456",
            role:"default",
            group_info:group_info,
            config:{size_max:"1.5",size_use:'0'}
        };
        user_add_dialog(user_info,true);
    }

    
    var user_create = function(group_id){
        var group_info = {"1":"read"};
        group_info[group_id] = "read";
        var user_info = {
            user_id:'',
            name:"",
            password:"123456",
            role:"default",
            group_info:group_info,
            config:{size_max:"1.5",size_use:'0'}
        };
        user_add_dialog(user_info);
    }

    //input空间大小变更 和界面绑定
    var size_display = function(){
        var size = parseFloat($('.size_max_set input').val())*1073741824;
        var the_size = core.file_size(size);
        if(size==0 || isNaN(size)){
            $('.size_max_set i').html(LNG.space_tips_default);
        }else{
            $('.size_max_set i').html(the_size);
        }
    }

    //显示用户所属的分组
    var user_dialog_set_group = function(){
        var group_list_all  = System.system_group.get_group_list();
        var self_group = json_decode($('#group_info').attr('value'));
        var html = '';
        for(var key in self_group){
            //if(group_list_all[key]) continue;
            if(self_group[key]=='read'){
                html+='<span class="label label-info" title="'+LNG.system_role_read+'">'+group_list_all[key]['name']+'</span>';
            }else{
                html+='<span class="label label-primary" title="'+LNG.system_role_write+'">'+group_list_all[key]['name']+'</span>';
            }
        }
        $('.dlg_group_display .cell').html(html+'<div style="clear:both"></div>');
    }
    //添加组或编辑组
    var user_add_dialog = function(user_info,is_import){
        var role_list = System.system_role.get_list();
        var tpl_list = require('./tpl/user.html');
        if(is_import){
            tpl_list = require('./tpl/user_import.html');
        }
        var render = template.compile(tpl_list);
        var html = render({LNG:LNG,user_info:user_info,role_list:role_list});
        var add_dialog = $.dialog({
            id:"share_dialog",
            simple:true,
            resize:false,
            width:425,
            background:"#000",
            opacity:0.1,
            title:"",
            padding:'0',
            fixed:true,
            lock:true,
            content:html
        });
        size_display();
        System.size_use($('.share_view_info'));
        $("#group_info").val(json_encode(user_info['group_info']));
        $(".dlg_group_select").unbind('click').bind('click',function(){
            dialog_select_group($('#group_info').val(),function(result){
                $('#group_info').val(result);//返回值回填到表单
                user_dialog_set_group();
            });
        });
        user_dialog_set_group();
        
        $('.input_line #name').textFocus();
        var save_url = './index.php?system_member/add';
        if(is_import){//导入用户
            save_url = './index.php?system_member/add&is_import=1';
        }else{
            if(user_info.name == ''){//新建
                $(".share_action .remove_button").hide();
            }else{
                var save_url = './index.php?system_member/edit&user_id='+user_info['user_id'];
            }
        }
        
        
        $("#system_save").unbind('click').bind('click',function(){
            post_data();
        });
        $(".select_drop_menu a").unbind('click').bind('click',function(){
            $(this).parent().parent().find('a').removeClass('selected');
            $(this).addClass('selected');
            $(".select_drop_menu .role_title").html($(this).html());
            $("#role").val($(this).attr('data-role-id'));
        });

        $(".remove_button").unbind('click').bind('click',function(){
            user_action_post('del',user_info['user_id'],'');
        });
        $(".dlg_goto_path").unbind('click').bind('click',function(){
            System.open_path(user_info);
        });
        $(".content_box input").keyEnter(function(){
            post_data(true);
        });
        $("#system_save_goon_add").unbind('click').bind('click',function(){
            post_data(true);
        });
        var post_data = function(keep_add_go_on){
            if(is_import){
                keep_add_go_on= false;
            }
            var param={};
            $('.share_dialog .content_info [name]').each(function(){
                var value = urlEncode($(this).val());
                if(value=="") return;
                param[$(this).attr('name')]=value;
            });
            $.ajax({
                url: save_url,
                data:param,
                type:'POST',
                dataType:'json',
                beforeSend:function(){
                    core.tips.loading();
                },
                error:core.ajaxError,
                success: function(data) {
                    core.tips.close(data);
                    if(!data.code){
                        if(is_import){
                            $('#name').val(data['info']); 
                        }
                        return;
                    }
                    user_list_all = undefined;
                    load_list(current_group_id);  
                    if(is_import){
                        add_dialog.close();                       
                    }else{//批量添加，部分成功
                        if(user_info.name != '' || keep_add_go_on!=true){//编辑 or保存
                            add_dialog.close();
                        }else{
                            $('.input_line #name').val('').textFocus();
                        }
                    }                    
                }
            });
        }
    }

    
    //选择用户所在分组
    var dialog_select_group = function(self_group,callback){
        var group_list_tree = System.system_group.get_group_tree();
        var group_list_all  = System.system_group.get_group_list();
        self_group = json_decode(self_group);//key value对象
        if($.isArray(self_group)){
            self_group = {};
        }
        var tree_setting={//tree_setting
            view: {
                showLine: false,
                selectedMulti: false,
                dblClickExpand: false,
                addDiyDom: function(treeId, treeNode) {
                    var spaceWidth = 15;//层级的宽度
                    var switchObj = $("#"+treeId+" #" + treeNode.tId + "_switch"),
                    icoObj = $("#"+treeId+" #" + treeNode.tId + "_ico");

                    icoObj.before(switchObj)
                        .after('<i class="font-icon group_select_box icon-sort"></>')
                        .before('<span class="tree_icon button group"></span>')
                        .removeClass('ico_docu').addClass('group_icon')
                        .remove();

                    if (treeNode.level >= 1) {
                        var spaceStr = "<span class='space' style='display:inline-block;width:"
                         + (spaceWidth * treeNode.level)+ "px'></span>";
                        switchObj.before(spaceStr);                 
                    }
                    $("#"+treeId+" #"+treeNode.tId+"_a").attr('data-group-id',treeNode.id);
                }                
            },
            callback: {//事件处理回调函数
                onClick: function(event,treeId,treeNode){
                    if(!self_group){
                        self_group = {};
                    }
                    if(!$('#'+treeNode.tId+'_a').hasClass('this')){//取反
                        self_group[treeNode.id] = 'read';
                    }else{
                        delete(self_group[treeNode.id]);
                    }
                    init_data();
                }
            }
        };
        var make_tree = function(){//构造tree
            var $tree = $('#user_group_select');
            $.fn.zTree.init($tree,tree_setting,group_list_tree);
            var selectTree = $.fn.zTree.getZTreeObj("user_group_select");
            selectTree.expandAll(true);
        }

        var open_dialog = function(){
            var tpl_list = require('./tpl/group_select.html');
            var render = template.compile(tpl_list);
            var html = render({LNG:LNG});
            var add_dialog = $.dialog({
                id:'select_usre_group_dlg',
                title:"设置分组",
                padding:'0',
                width:500,
                lock:true,
                background:'#fff',opacity:0.1,
                fixed:true,
                content:html,
                ok:function(){
                    callback(json_encode(self_group));
                },
                cancel: true
            });
            make_tree();
        }

        var init_data = function(){
            var html = '';
            $('#user_group_select .curSelectedNode').removeClass('curSelectedNode');
            $("#user_group_select a[data-group-id").removeClass('this');

            var make_select = function(read_type){
                var type = {'read':LNG.system_role_read,'write':LNG.system_role_write};
                var read_select = '',write_select='class="selected"',button_type='btn-primary';
                if(read_type=='read'){
                    read_select ='class="selected"';write_select='';
                    button_type = 'btn-default';
                }
                var select = 
                '<div class="btn-group select_drop_menu open">\
                  <button class="btn '+button_type+' btn-xs" type="button" data-toggle="dropdown">\
                    <span class="group_info_title pr-5">'+type[read_type]+'</span><span class="caret"></span>\
                  </button>\
                  <ul class="dropdown-menu" data-current="'+read_type+'">\
                    <li data-info="read" '+read_select+'>'+LNG.system_role_read+'</li>\
                    <li data-info="write" '+write_select+'>'+LNG.system_role_write+'</li>\
                  </ul>\
                </div>';
                return select;
            }
            for(var key in self_group){
                $("#user_group_select a[data-group-id="+key+"]").addClass('this');
                html += '<li class="group_self" group-id="'+key+'">'+
                        '    <span class="title"><i class="font-icon icon-group"></i>'+group_list_all[key]['name']+'</span>'+
                        '    <i class="font-icon icon-remove remove"></i>'+make_select(self_group[key])+
                        '</li>';

            }
            $('.select_group_right').html(html);
        }
        var bind_event = function(){
            $('.right_content .group_self .remove').die('click').live('click',function(){
                var group_id = $(this).parent().attr('group-id');
                delete(self_group[group_id]);
                init_data();
            });

            $('.group_self .dropdown-menu li').die('click').live('click',function(){
                var current = $(this).attr('data-info');
                var before = $(this).parent().attr('data-current');
                var group_id = $(this).parent().parent().parent().attr('group-id');
                if(before != current){
                    self_group[group_id]=current;
                    init_data();
                }
            });
        }

        open_dialog();
        init_data();
        bind_event();
    }


    var _menu_hidden = function(){
        $('.context-menu-list').filter(':visible').trigger('contextmenu:hide');
    };
    var bind_menu = function(){//右键绑定
        $('body').click(_menu_hidden).contextmenu(_menu_hidden);
        $.contextMenu({
            zIndex:9999,
            selector: '.user_action_menu', 
            items: {
                "user_list_edit":{name:LNG.edit,icon:"edit",accesskey: "e"},
                "sep1":"--------",
                "user_remove":{name:LNG.remove,icon:"trash",accesskey: "d"},
                "user_status_close":{name:LNG.system_member_unuse,icon:"",accesskey: "c"},
                "user_status_open":{name:LNG.system_member_use,icon:"",accesskey: "o"},
                "sep2":"--------",
                "group_remove_from":{name:LNG.system_member_group_remove,icon:"",accesskey: "g"},
                "group_add":{name:LNG.system_member_group_insert,icon:"",accesskey: "a"},
                "group_reset":{name:LNG.system_member_group_reset,icon:"",accesskey: "i"}
            },
            callback: function(key, options) {
                var user_id = options.$trigger.attr('data-id');
                var group_id = $('#content_system_group .group_title').attr('data-id');
                var user_select_arr = [user_id];
                toolbar_action(key,user_select_arr,'');
            }
        });
    };

    var bind_event_action = function(){
        //用户添加或修改，空间大小显示
        $('.size_max_set input').live("input",size_display);
        //各种按钮及点击事件
        $("#content_system_group .content [data-action]").live('click',function(e){
            if($(e.target).is('input')){
                return;
            }
            var $that = $(this);
            var action = $that.attr('data-action');

            var user_select_arr = [];
            $("#content_system_group .user_select:checked").each(function(i,value){
                user_select_arr.push($(this).parent().parent().attr('data-id'));
            });

            //点击用户名编辑
            if(action == 'user_list_edit'){
                var user_id = $that.parent().parent().attr('data-id');
                user_select_arr = [user_id];
            }
            toolbar_action(action,user_select_arr,$that,e);
            return true;
        });
    }

    var toolbar_action = function(action,user_arr,$that,event){
        var group_id = $('#content_system_group .group_title').attr('data-id');
        switch(action){
            case 'user_add':
                user_create(group_id);
                break;//添加用户
            case 'user_import':
                user_import(group_id);
                break;
            case "group_remove_from":
                user_action_post('group_remove_from',user_arr,group_id);
                break;
            case "group_add":
                dialog_select_group("{}",function(result){
                    user_action_post('group_add',user_arr,result);
                });
                break;
            case "group_reset":
                dialog_select_group("{}",function(result){
                    user_action_post('group_reset',user_arr,result);
                });
                break;
            case "role_set":
                var role_id = $that.attr('data-role-id');
                user_action_post('role_set',user_arr,role_id);
                break;                
            case 'user_status_open'://开启用户
                user_action_post('status_set',user_arr,1);
                break;
            case 'user_status_close'://禁用用户
                user_action_post('status_set',user_arr,0);
                break;
            case 'user_remove':
                user_action_post('del',user_arr,'');
                break;//删除用户
            case 'user_list_select':
                var checkbox = $that.find('.user_select');
                if(checkbox.attr('checked')){
                    checkbox.removeAttr('checked');
                }else{
                    checkbox.attr('checked','true');
                }
                update_select();
                break;//列表点击编辑
            case 'user_list_edit':
                user_add_dialog(user_list_all[user_arr[0]]);
                stopPP(event);
                break;//列表点击编辑
            default:break;
        }
    }

    var update_select = function(){
        if($("#content_system_group .user_select:checked").length>=1){
            $('.button_aciton_muti button').removeClass('disabled');
        }else{
            $('.button_aciton_muti button').addClass('disabled');
        }
        $("#content_system_group .user_list_cell ").removeClass('selected');
        $("#content_system_group .user_select:checked").each(function(i,value){
            $(this).parent().parent().addClass('selected');
        });
    }
    var bind_event = function(){
        //全选和反选
        $("#content_system_group .user_select_set").live('click',function(e){
            if($(this).attr('checked')){
                $('#content_system_group .user_select').attr('checked','true');
            }else{
                $('#content_system_group .user_select').removeAttr('checked');
            }
            update_select();
        });
        //选中某一个
        $("#content_system_group .user_select").live('click',function(e){
            update_select();
        });
    }

    bind_event();
    bind_event_action();
    bind_menu();

    return{
        reset_list:function(){
            user_list_all =undefined;
        },
        load_list:load_list,
        add:user_create
    }
});