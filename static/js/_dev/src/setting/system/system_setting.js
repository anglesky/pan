define(function(require, exports) {    
    var bindEvent = function(){
        $("input[name='first_in']").live('click',function(){
            $("input[name='first_in']").removeAttr('checked');
            $(this).attr('checked','checked');
        })
        $('.system_save').live('click',function(){
            var param = {};
            $('.system_setting .box_line input').each(function(){
                var $that = $(this);
                if ($that.attr('type') == 'checkbox') {
                    var check = $that.attr("checked") == undefined?'0':'1';
                    param[$that.attr('name')] = check;
                }else if ($that.attr('type') != 'radius') {
                    param[$that.attr('name')] = urlEncode($that.val());
                }
            });
            param['first_in'] = $("input[name='first_in'][checked]").val();
            send_setting(param);
        });
        bindEventMenu();
        $('.phpinfo').die('click').live('click',function(){
            art.dialog.open('./index.php?setting/php_info',{
                title:'php_info',
                width:'70%',
                height:'65%',
                resize:true
            });
        })
    };
    var bindEventMenu = function(){
        $('.setting_menu .menu_list input[name="target"]').live('click',function(){
            if ($(this).val() == '_blank') {
                $(this).val('_self');
                $(this).removeAttr('checked');
            }else{
                $(this).val('_blank');
                $(this).attr('checked','checked');
            }
        });
        //添加，dom操作。
        $('.system_menu_add').live('click',function(){
            var $add = $('.menu_default').clone().removeClass('menu_default hidden').addClass('menu_list');
            $add.insertAfter(".setting_menu .menu_list:last");
        });
        $('.setting_menu .menu_list .move_up').live('click',function(){
            var $that = $(this).parent().parent();
            if (!$that.prev().hasClass('menu_list')) return;
            $that.insertBefore($that.prev());
        });
        $('.setting_menu .menu_list .move_down').live('click',function(){
            var $that = $(this).parent().parent();
            if (!$that.next().hasClass('menu_list')) return;
            $that.insertAfter($that.next());
        });
        $('.setting_menu .menu_list .move_hidden').live('click',function(){
            var $that = $(this).parent().parent();
            if ($that.hasClass('menu_hidden')) {
                $that.removeClass('menu_hidden');
                $(this).text(LNG.menu_hidden);
            }else{
                $that.addClass('menu_hidden');
                $(this).text(LNG.menu_show);
            }            
        });
        $('.setting_menu .menu_list .move_del').live('click',function(){
            var $that = $(this).parent().parent();
            $that.remove();          
        });

        $('.system_menu_save').live('click',function(){
            var param = [],menu;
            $('.setting_menu .menu_list').each(function(){
                var $that = $(this),
                    menu_this={};
                if ($that.hasClass('menu_default')) return;
                $that.find('input').each(function(){
                    menu_this[$(this).attr('name')] = urlEncode($(this).attr('value'));
                });
                if(menu_this['name'] == '') return;
                menu_this['use'] = '1';
                menu_this['type'] = '';
                if ($that.hasClass('menu_hidden')) {
                    menu_this['use'] = '0';
                }
                if ($that.hasClass('menu_system')) {
                    menu_this['type'] = 'system';
                }
                param.push(menu_this);
            });
            send_setting({'menu':param});
        });
    }

    var send_setting = function(param){
        $.ajax({
            url:'index.php?setting/system_setting',
            type:'POST',
            data:'data='+urlEncode(json_encode(param)),
            dataType:'json',
            success:function(data){
                tips(data);
            }
        });
    }

    bindEvent();
});