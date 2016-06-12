define(function(require, exports) {
	var setting; //url后缀参数	
	var setTheme = function(thistheme){//主动修改	
		core.setSkin(thistheme);
		FrameCall.father('ui.setTheme','"'+thistheme+'"');
	};
	//被动修改
	var setThemeSelf = function(thistheme){
		core.setSkin(thistheme);
	};
	var gotoPage = function (page){
		if (page == '' ||page==undefined) page = 'user';
		setting = page;
		if (page.substring(0,4) == 'fav&') page='fav';
		
		$('.selected').removeClass('selected');
		$('ul.setting a#'+page).addClass('selected');
		window.location.href ='#'+page;

		$.ajax({
			url:'./index.php?setting/slider&slider='+page,
			beforeSend:function (data){
				$('.main').html("<img src='./static/images/loading.gif'/>");
			},
			success:function(data){
				var title = "<div class='h1'>"+$(".menu_left .selected").html()+"</div>";
				$('.main').html(title+data);
				$('.main').fadeIn('fast');
				
				if (page=='fav') Fav.init(setting);	//收藏夹
				if (page=='member') System.init();	//用户管理
				setting = page;

				$('a,img').attr('draggable','false');
			}
		});
	};

	var bindEvent = function(){
		if(G.is_root!=1){
			$('ul.setting #system').remove();
		}
		if( G.is_root ||  
			AUTH['system_member:get']==1 || 
			AUTH['system_group:get']==1){
			$('ul.setting #member').show();
		}else{
			$('ul.setting #member').hide();
		}
		setting = location.hash.split("#", 2)[1];
		gotoPage(setting);
		$('ul.setting a').click(function(){
			if(setting == $(this).attr('id')){
				return;
			}
			setting=$(this).attr('id');
			gotoPage(setting);
		});

		$('#password_new').keyEnter(function(){
			Setting.tools();
		});
		$('.setting_basic_save').live('click',function(){
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
            set_config("recycle_open",'1');
            set_config("file_repeat",'rename');
        });

		$(".file_repeat_check label").live('click',function(){
        	var value = $(this).find("input").val();
        	set_config('file_repeat',value);
		});
        $(".recycle_open_check input").live('click',function(){
        	var value = $(this).attr("checked") == undefined?'0':'1';
        	set_config('recycle_open',value);
		});
		
		//选择事件绑定
		$('.box .list').live('hover',
			function(){	$(this).addClass('listhover');},
			function(){	$(this).toggleClass('listhover');}
		).live('click',function(){
			var _self 	= $(this),
				_parent = _self.parent();
				type 	= _parent.attr('data-type');//设置参数
				value 	= _self.attr('data-value');
			_parent.find('.this').removeClass('this');
			_self.addClass('this');
			
			//对应相应动作
			switch(type){
				case 'wall':
					var image = G.static_path+'images/wall_page/'+value+'.jpg';
					FrameCall.father('ui.setWall','"'+image+'"');
					break;
				case 'theme':setTheme(value);break;
				case 'musictheme':
					FrameCall.father('CMPlayer.changeTheme','"music","'+value+'"');
					break;
				case 'movietheme':
					FrameCall.father('CMPlayer.changeTheme','"movie","'+value+'"');
					break;
				default:break;
			}
			set_config(type,value);
		});

		//tab菜单切换
		$('.nav a').live("click",function(){
			$('.nav a').removeClass('this');
			$(this).addClass('this');

			var page = $(this).attr('data-page');
			$(this).parent().parent().find(".section").addClass('hidden');
			$(this).parent().parent().find('.'+page).removeClass('hidden');
		});
	};

	var set_config = function(type,value){
		//保存到服务器
		var geturl='index.php?setting/set&k='+type+'&v='+value;
		$.ajax({
			url:geturl,
			dataType:'json',
			success:function(data){
				if (!data.code) {
					if (!core.authCheck('setting:set')) {
						tips(LNG.config_save_error_auth,false);
					}else{
						tips(LNG.config_save_error_file,false);
					}
				}else{
					tips(data);
				}
			}
		});
	}

	// 设置子内容动作处理
	var tools = function (action){  		
		var page=$('.selected').attr('id');
		switch (page){
			case 'user'://修改密码
				var password_now = urlEncode($('#password_now').val());
				var password_new = urlEncode($('#password_new').val());
				if (password_new=='' || password_now=='') {
					tips(LNG.password_not_null,'error');
					break;
				}
				$.ajax({
					url:'index.php?user/changePassword&password_now='+password_now+'&password_new='+password_new,
					dataType:'json',
					success:function(data){
						tips(data);
						if (data.code) {
							var top = share.system_top();
							top.location.href='./index.php?user/logout';
						}		
					}
				});
				break;
			case 'wall':
				var image = $('#wall_url').val();
				if (image=="") {
					tips(LNG.picture_can_not_null,'error');break;
				}
				FrameCall.father('ui.setWall','"'+image+'"');
				$('.box').find('.this').removeClass('this');
				var geturl='index.php?setting/set&k=wall&v='+urlEncode(image);
				$.ajax({
					url:geturl,
					dataType:'json',
					success:function(data){
						tips(data);
					}
				});	
			default:break;
		}
	};

	bindEvent();
	// 对外提供的函数
	return{
		setGoto:gotoPage,
		tools:tools,
		setThemeSelf:setThemeSelf,
		setTheme:setTheme		
	};
});
