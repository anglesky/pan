define(function(require, exports) {
    require('lib/contextMenu/jquery-contextMenu');
    require('lib/ztree/js/ztree');
    var system_member = require('./system_member.js');
    var system_group = require('./system_group.js');
    var system_role = require('./system_role.js');

    var init = function(){
        change_tab('system_group');
        bindEvent();
       
        system_role.init();
        system_group.init();        
    };
    var change_tab = function(the_type){
        $('.system_conennt .this').removeClass('this');
        $('.system_conennt #'+the_type).addClass('this');

        $('.left_content').addClass('hidden');
        $('.'+the_type).removeClass('hidden');

        $('.right_frame').addClass('hidden');
        $('#content_'+the_type).removeClass('hidden');
    }

    var bindEvent = function(){
        $('.left_header .tab').die('click').live('click',function(){
            var tab_type = $(this).attr("id");
            change_tab(tab_type);
        });
        //tips
        $('.title_tooltip').tooltip({placement:'bottom',html:true});
    };
    var size_use = function($dom){
        $dom.each(function(){
            var html = core.user_space_html($(this).html());
            $(this).html(html);
        });        
    }
    var open_path = function(info){
        var path = G.basic_path+'data/User/'+info.path+'/home';
        if(info['group_id']){
            path = G.basic_path+'data/Group/'+info.path+'/home';
        }
        if( window.parent && 
            window.parent.Config && 
            window.parent.Config.pageApp == 'explorer'){
            window.parent.ui.path.list(path);
            Tips.tips(LNG.system_open_true_path,true);
        }else{
            core.explorer(path);
        }
    }
    return{        
        init:init,
        size_use:size_use,
        open_path:open_path,
        
        system_member:system_member,
        system_group:system_group,
        system_role:system_role
    }
});