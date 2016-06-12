define(function(require, exports) {
	var page;
	var bindEvent = function(){
		page = location.hash.split("#", 2)[1];
		if (!page) {page = 'all'}
		change(page);

		$('ul.setting a').click(function(){
			if(page==$(this).attr('id')){
				return;
			}
			page=$(this).attr('id');
			change(page);
		});
		
		//选择事件绑定
		$('.box .list').live(
			'hover',
			function(){	$(this).addClass('listhover');},
			function(){	$(this).toggleClass('listhover');}
		).live('click',function(){		
			//保存到服务器
			var geturl='index.php?setting/set&k='+type+'&v='+value;
			$.ajax({
				url:geturl,
				dataType:'json',
				success:function(data){
					tips(data.data,data.code);
				}
			});			
		});
		$('a.create_app').bind('click',function(){
			FrameCall.father('ui.path.pathOperate.appEdit','"","","root_add"');
		});
		$('.app-list .app_li').die('click').live('click',function(e){
			if (!$(e.target).attr('action')) return;
			var data = json_decode(urlDecode($(this).attr('data')));
			var action = $(e.target).attr('action');
			switch(action){
				case 'preview':core.openApp(data);break;
				case 'add':
					FrameCall.father('get','G.this_path');
					var path = share.data('create_app_path');
					var filename = urlEncode(path+data.name);
					var url = './index.php?app/user_app&action=add&path='+filename;
					$.ajax({
						url:url,
						dataType:'json',
						type:'POST',
						data:'data='+urlEncode2(json_encode(data)),
						error:core.ajaxError,
						success:function(data){
							tips(data.data,data.code);
							if (!data.code) return;
							FrameCall.father('ui.f5','');
						}
					});
					break;
				case 'edit':
					if (window['parent']) {
						window.parent.ui.path.pathOperate.appEdit(data,'','root_edit');
					}
					break;
				case 'del':
					$.dialog({
						id:'dialog_app_remove',
						fixed: true,//不跟随页面滚动
						icon:'question',
						padding:20,
						width:200,
						lock:true,
						background:"#000",
						opacity:0.3,
						content:LNG.remove_info,
						ok:function() {
							$.ajax({
								url:'./index.php?app/del&name='+urlEncode(data.name),
								dataType:'json',
								error:core.ajaxError,
								success:function(data){
									tips(data.data,data.code);
									if (!data.code) return;
									change();
								}
							});	
						},
						cancel: true
					});
					break;
				default:break;
			}
		});
	};
	var _html = function(data){
		var html = '';
		var root_action=
				"<button type='button' class='btn btn-sm btn-default dropdown-toggle' data-toggle='dropdown'>\
				    <span class='caret'></span>\
				    <span class='sr-only'>Toggle Dropdown</span>\
				</button>\
				<ul class='dropdown-menu' role='menu'>\
					<li><a action='edit' href='javascript:;'>"+LNG.button_edit+"</a></li>\
					<li><a action='del' href='javascript:;'>"+LNG.button_del+"</a></li>\
				</ul>";
		if (!G.is_root) {root_action='';}
		for (var i in data) {
			var icon = data[i].icon;
			if (icon.search(G.static_path)==-1
			 && icon.substring(0,4) !='http') {
				icon = G.static_path + 'images/app/' + icon;
			}
			//console.log(data[i],urljson_encode(data[i]));
			html+="<li class='app_li' data="+urlEncode(json_encode(data[i]))+">\
				<a action='preview' href='javascript:;' class='icon'><img action='preview' src='"+icon+"'></a>\
				<p><span class='title'>"+data[i].name+"</span>\
				<span class='info'>"+data[i].desc+"</span></p>"+
				"<div class='btn-group'>\
				<button type='button' class='btn btn-sm btn-default' action='add'>"+LNG.button_add+"</button>"+root_action+
				"</div><div style='clear:both;'></div></li>";
		}
		html+= "<div style='clear:both;'></div>";
		return html;
	}

	var change = function(group){
		if (group == undefined || group =='') {group = page;}
		window.location.href ='#'+group;
		$('.selected').removeClass('selected');
		$('ul.setting a#'+group).addClass('selected');
		$('.main').find('.h1').html($('.selected').html());

		var $content = $('.main .app-list');
		$.ajax({
			url:'./index.php?app/get&group='+group,
			dataType:'json',
			beforeSend:function (data){},
			success:function(data){
				$content.html(_html(data.data));
				$('body').scrollTop(0);
			}
		});
	};

	// 对外提供的函数
	return{
		reload:change,
		init:bindEvent	
	};
});
