define(function(require, exports) {
    var role_list_all;
    var current_role;

    var init = function(setting){
        $.ajax({
            url:'index.php?system_role/get',
            dataType:'json',
            async:false,
            success:function(data){
                if (!data.code) {
                    tips(data);
                    return;
                }
                role_list_all = data.data;
                make_list();
                if(current_role == undefined){
                    current_role = "1";
                }
                set_select(current_role);
            }
        });

        //hover
        $('.group_editor .path_ext_tips').tooltip({placement:'bottom',html:true});
        $('.group_editor .warning').tooltip({placement:'bottom',html:true});
    };

    var make_list = function(){
        var html = '';
        $.each(role_list_all,function(key,val){
            html+= '<li class="role_cell" data-role-id="'+key+'">'+
                   '<span>'+val['name']+'</span><i class="sub_menu icon-angle-right"></i></li>';
        });
        $('.role_list_cell').html(html);
    }
    var set_select = function(role_id){
        var role_info;
        current_role = role_id;        
        $(".system_role li.role_cell").removeClass('select');
        $("#content_system_role [data-action=role_add],"+
               "#content_system_role [data-action=role_delete]").show();
        if(role_id == undefined){//添加
            role_info = {name:"",ext_not_allow:"php|jsp|html"};
            $("#content_system_role [data-action=role_add],"+
               "#content_system_role [data-action=role_delete]").hide();
            $("#content_system_role .role_title").html(LNG.system_role_add);
        }else{
            role_info = role_list_all[role_id];
            $(".system_role [data-role-id="+role_id+"]").addClass('select');
            $("#content_system_role .role_title").html(role_info.name);
        }

        $('.group_editor #name').val(role_info.name).textFocus();
        $('.group_editor #ext_not_allow').val(role_info.ext_not_allow);
        $('.group_editor .tag').removeClass('this');
        $('.group_editor input').removeAttr('checked');
        //设置选中状态
        $('.group_editor .tag').each(function(){
            var self = $(this);
            var data_role = self.attr('data-role');
            data_role = data_role.split(';');
            data_role = data_role[0];
            if (role_info[data_role]) {
                self.addClass('this');
                self.find('input').attr('checked',true);
            }
        });
    }

    //添加一条收藏记录，后保存
    var save = function(){
        var name= $('.group_editor #name').val(),
            ext_not_allow= $('.group_editor #ext_not_allow').val(),
            params = {},   //具体功能权限数据
            url = 'index.php?system_role/add';

        if (ext_not_allow == undefined) ext_not_allow = '';
        if (name ==''){
            tips(LNG.not_null,'error');
            return false;
        }

        $('.group_editor .tag.this').each(function(){
            var data = $(this).attr('data-role').split(';');
            for (var i = 0; i < data.length; i++) {
                params[data[i]] = 1;
            };
        });
        if(current_role=='1' && params != {}){
            params = {};
            tips(LNG.system_role_admin_set,'warning');
        }
        //动作分发,保存或者添加
        if (current_role != undefined) {//没有当前则添加；
            url='index.php?system_role/edit&role_id='+current_role;
        }
        $.ajax({
            url:url+'&name='+urlEncode(name)+'&ext_not_allow='+ext_not_allow,
            data:params,
            type:'POST',
            dataType:'json',
            success:function(data){
                tips(data);
                if (data.code){
                    current_role = data.info;//info返回role_id;编辑或者添加
                    init();
                    System.system_member.load_list('');
                }
            }
        });
    };

    //删除用户
    var role_delete = function(role_id){
        $.dialog({
            fixed: true,
            icon:'question',
            drag: true,//拖曳
            title:LNG.warning,
            content: LNG.if_remove+get_role_name(role_id)+'?<br/>'+LNG.group_remove_tips,
            cancel:true,
            ok:function() {
                $.ajax({
                    url:'index.php?system_role/del&role_id='+role_id,
                    async:false,
                    dataType:'json',
                    success:function(data){
                        tips(data);
                        if (data.code){
                            current_role = undefined;
                            init();
                            System.system_member.reset_list();//重置用户列表
                            System.system_member.load_list('');
                        }
                    }
                }); 
            }            
        });
    };

    var select_revert = function(){
        $('.group_editor .tag').each(function(){
            if ($(this).hasClass('this')) {
                $(this).removeClass('this');
                $(this).find('input').removeAttr('checked');
            }else{
                $(this).addClass('this');
                $(this).find('input').attr('checked',true);
            }

            if (!$('.group_editor .combox:eq(0) .tag:eq(0)').hasClass('this')) {
                $('.group_editor .combox:eq(0) .tag').removeClass('this');
                $('.group_editor .combox:eq(0) .tag').find('input').removeAttr('checked');
            }
            if (!$('.group_editor .combox:eq(1) .tag:eq(0)').hasClass('this')) {
                $('.group_editor .combox:eq(1) .tag').removeClass('this');
                $('.group_editor .combox:eq(1) .tag').find('input').removeAttr('checked');
            }
        });
    }

    //事件绑定
    var bindEvent = function(){
        //编辑保存页面
        $('.group_editor .tag').live('click',function(){
            var self = $(this)
                select = false;
            self.toggleClass('this');
            if (self.hasClass('this')) {
                select = true;
                self.find('input').attr('checked',true);
            }else{
                select = false;
                self.find('input').removeAttr('checked');
            }

            if(self.parent().hasClass('combox')){
                var index = self.index();
                //取消选中第一项，则默认取消后面权限。
                if (index == 1 && select==false){
                    self.parent().find('.tag').removeClass('this');
                    self.parent().find('input').removeAttr('checked');
                }
                //选择后面操作，默认选中第一项
                if (index !=1 && select==true) {
                    self.parent().find('.tag:eq(0)').addClass('this');
                    self.parent().find('input:eq(0)').attr('checked',true);
                }
            }
        });

        //左侧列表
        $(".system_role li.role_cell").live('click',function(){
            set_select($(this).attr('data-role-id'));
        });

        $("#content_system_role [data-action]").live('click',function(e){
            var action = $(this).attr('data-action');
            var $that = $(this);
            switch(action){
                case 'role_add':
                    set_select();
                    break;//添加用户
                case 'role_delete':
                    role_delete(current_role);
                    break;//移动到组
                case 'role_edit_save':
                    save();
                    break;//编辑分组
                case 'revert_all':
                    select_revert();
                    break;//编辑分组
                default:break;
            }
            stopPP(e);//阻止向上冒泡
        });
    };

    var get_role_name = function(role_id){
        var role = role_list_all[role_id];
        if(role){
            return role['name']
        }
        return '<span style="color:#f00">null</span>';
    };
    var get_list = function(){
        var role = {};
        $.each(role_list_all,function(key,val){
            role[key] =val.name;
        });
        return role;
    }
    bindEvent();

    return{
        init:init,
        get_list:get_list,
        set_select:set_select       
    }
});