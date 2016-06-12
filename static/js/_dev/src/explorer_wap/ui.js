define(function(require, exports) {
	var _ajaxLive = function(){		
        //图片缩略图懒加载 桌面不做处理
        $(".fileContiner .picture img").lazyload({
        	//effect : "fadeIn",
        	//placeholder:G.static_path + 'images/loading_tree.gif',
        	container: $(".bodymain")
		});
	}
	//json 排序 filed:(string)排序字段，orderby:升降序。升序为-1，降序为1
	var _sortBy = function(filed,orderby) {
		var orderby = (orderby=='down')? -1 : 1;
		return function (a, b) {
			a = a[filed];
			b = b[filed];
			if (a < b) 	return orderby * -1;
			if (a > b) 	return orderby * 1;
		}
	}
	//列表排序操作。
	var _setListSort = function(field,order){
		//同步到右键菜单,如果传入0,则不修改
		if (field != 0) {//同步修改排序字段
			G.list_sort_field = field;
			$('.menu_set_sort').removeClass('selected');
			$('.set_sort_'+field).addClass('selected');
		}
		if (order != 0) {//修改排序方式，升序，降序
			G.list_sort_order = order;
			$('.menu_set_desc').removeClass('selected');
            $('.set_sort_'+order).addClass('selected');		
		}
		_f5(false,true);//使用本地列表
		$.ajax({
			url:'index.php?setting/set&k=list_sort_field,list_sort_order&v='
				+G.list_sort_field+','+G.list_sort_order
		});
	};
	//针对排序方式更新标题栏显示
	var _jsonSortTitle = function(){
		var up='<i class="font-icon icon-chevron-up"></i>';
		var down='<i class="font-icon icon-chevron-down"></i>';
		$('#main_title .this')
			.toggleClass('this')
			.attr('id','')
			.find('span')
			.html("");		
		$('#main_title div[field='+G.list_sort_field+']')
			.addClass('this')
			.attr('id',G.list_sort_order)
			.find('span')
			.html(eval(G.list_sort_order));
	};

	
	//下拉菜单展开操作
	var _menuActionBind = function(){
		$('.drop-menu-action li').bind('click',function(){
			if ($(this).hasClass('disabled'))return;
			var action = $(this).attr('id');
			switch(action){
				case 'past':ui.path.past();break;
				case 'info':ui.path.info();break;
				default:break;
			}
		});
	};

	//---------------------------------------
	//列表样式，文件夹模版填充
	var _getFolderBoxList = function(list){
		var display_name = list['name'];
		if (typeof(list['exists'])=='number' && list['exists']==0) {
			display_name = '<b style="color:red;">'+display_name+'</b>';
		}
		var html="<div class='file folderBox menufolder' onclick=''>";
		html+="	<div class='folder ico' filetype='folder'></div>";
		html+="	<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+display_name+"</span></div>";
		html+="	<div class='filesize'></div>";
		html+="	<div class='filetime'>"+list['mtime']+"</div>";
		html+="	<div style='clear:both'></div>";
		html+="</div>";
		return html;
	}
	//列表样式，文件模版填充
	var _getFileBoxList = function(list){
		var html="";
		var display_name = list['name'];
		if (typeof(list['exists'])=='number' && list['exists']==0) {
			display_name = '<b style="color:red;">'+display_name+'</b>';
		}
		if (list['ext'] == 'oexe') {
			var code = urlEncode(json_encode(list));
			html ="<div class='file fileBox menufile' data-app="+code+" onclick=''>";
			display_name = display_name.replace('.oexe','');
			//快捷方式处理
			if (list['type'] == 'app_link') {
				if(list['content'].search('ui.path.open') == 0){//文件
					html+="<div class='"+core.pathExt(list['name'].replace('.oexe',''))+" ico'";
				}else{//文件夹
					html+="<div class='folder ico'";
				}
				html+=' filetype="oexe"></div><div class="app_link"></div>';
			}else{
				html+="<div class='oexe ico' filetype='oexe'></div>";
			}
		}else if (inArray(core.filetype['image'],list['ext'])) {//如果是图片，则显示缩略图，并绑定幻灯片插件
			var filePath = core.path2url(list['path']);
			var thumbPath = 'index.php?explorer/image&path='+urlEncode(list['path']);
			html+="<div picasa='"+filePath+"' thumb='"+thumbPath+"' class='picasaImage file fileBox menufile' onclick=''>";
			html+="	<div class='"+list['ext']+" ico' filetype='"+list['ext']+"'></div>";
		}else {
			html+="<div class='file fileBox menufile'  onclick=''>";
			html+="	<div class='"+list['ext']+" ico' filetype='"+list['ext']+"'></div>";	
		}
		html+="	<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+display_name+"</span></div>";
		html+="	<div class='filesize'>"+core.file_size(list['size'])+"</div>";
		html+="	<div class='filetime'>"+list['mtime']+"</div>";
		html+="	<div style='clear:both'></div>";
		html+="</div>";
		return html;
	};

	//文件列表数据填充
	var _mainSetData = function(isFade){
		if (!G.json_data || !G.json_data['filelist'] || !G.json_data['folderlist']){
			_mainSetDataShare();
		}
		var html ="";//填充的数据
		var folderlist	= G.json_data['folderlist'];
		var filelist	= G.json_data['filelist'];
		//如果排序字段为size或ext时，文件夹排序方式按照文件名排序
		if (G.list_sort_field=='size' || G.list_sort_field=='ext' ){
			folderlist= folderlist.sort(_sortBy('name',G.list_sort_order));
		}else {
			folderlist= folderlist.sort(_sortBy(G.list_sort_field,G.list_sort_order));
		}
		filelist = filelist.sort(_sortBy(G.list_sort_field,G.list_sort_order));
		G.json_data['folderlist']=folderlist;
		G.json_data['filelist']=filelist;//同步到页面数据
		var file_html='',folder_html='';
		for (var i=0;i<filelist.length;i++){
			file_html += _getFileBoxList(filelist[i]);
		}
		for (var i=0;i<folderlist.length;i++){
			folder_html += _getFolderBoxList(folderlist[i]);
		}
		//end排序方式重组json数据------
		//升序时，都是文件夹在上，文件在下，各自按照字段排序		
		if (G.list_sort_order=='up'){
			html = folder_html+file_html;
		}else{
			html = file_html+folder_html;
		}

		if (html =='') html = '<div style="text-align:center;color:#aaa;">'+LNG.path_null+'</div>'
		html += "<div style='clear:both'></div>";
		//填充到dom中-----------------------------------
		if (isFade){//动画显示,
			$(Config.FileBoxSelector)
				.hide()
				.html(html)
				.fadeIn(Config.AnimateTime);
		}else{
			$(Config.FileBoxSelector).html(html);				
		}


		$('<i class="file-action icon-font icon-ellipsis-horizontal"></i>').appendTo(Config.FileBoxClass);
		$(Config.FileBoxSelector+" .file:nth-child(2n)").addClass('file2');
		_ajaxLive();
	};
	var _f5 = function(is_data_server,is_animate,callback) {
		if(is_data_server == undefined) is_data_server = true; //默认每次从服务器取数据
		if(is_animate == undefined)		is_animate = false;	   //默认不用渐变动画
		_jsonSortTitle();//更新列表排序方式dom		
		if(!is_data_server){//采用当前数据刷新,用于显示模式更换
			var select_arr = fileLight.getAllName();//获取选中的文件名
			_mainSetData(is_animate);
			pathTypeChange();
		}else{//获取服务器数据
			$.ajax({
				url:'index.php?explorer/pathList&path='+urlEncode(G.this_path),
				dataType:'json',
				beforeSend:function(){
					$('.tools-left .msg').stop(true,true).fadeIn(100);
				},
				success:function(data){
					$('.tools-left .msg').fadeOut(100);
					if (!data.code) {	
						core.tips.tips(data);
						$(Config.FileBoxSelector).html('');
						return false;
					}
					G.json_data = data.data;
					_f5_time_user();
					_mainSetData(is_animate);
					pathTypeChange();
					ui.header.addressSet();//header地址栏更新
				},
				error:function(XMLHttpRequest, textStatus, errorThrown){					
					$('.tools-left .msg').fadeOut(100);
					$(Config.FileBoxSelector).html('');
					core.ajaxError(XMLHttpRequest, textStatus, errorThrown);
				}
			});		
		}
	};
	var _f5_callback = function(callback){
		_f5(true,false,callback);//默认刷新数据，没有动画,成功后回调。
	};
	//分享文件夹列表
	var _f5_time_user = function(){
		if (!G.json_data) return;
		for (var key in G.json_data) {//处理文件&文件夹
			if(key !='filelist' && key !='folderlist') continue;
			for (var i = 0; i < G.json_data[key].length; i++) {
				G.json_data[key][i]['atime'] = date(LNG.time_type,G.json_data[key][i]['atime']);
				G.json_data[key][i]['ctime'] = date(LNG.time_type,G.json_data[key][i]['ctime']);
				if (G.json_data['info']['path_type']==G.KOD_USER_SHARE &&
					trim(G.this_path,'/').indexOf('/')==-1 //分享根目录
				   ) {//分享统计数据
					var num_view = parseInt(G.json_data[key][i]['num_view']);
					num_view = isNaN(num_view)?0:num_view;
					var num_download = parseInt(G.json_data[key][i]['num_download']);
					num_download = isNaN(num_download)?0:num_download;
					var info = date('Y/m/d ',G.json_data[key][i]['mtime'])+'  ';
					info += LNG.share_view_num+ num_view +'  '+LNG.share_download_num+num_download
					G.json_data[key][i]['mtime'] = info;
				}else{
					G.json_data[key][i]['mtime'] = date(LNG.time_type,G.json_data[key][i]['mtime']);
				}
			}
		}
	};

	//文件操作菜单
	var _fileMenuAction = function($dom,action){
		var path = $dom.find('.titleBox').attr('id');
		var type = $dom.find('.ico').attr('filetype');
		switch (action){
			case 'action_copy':ui.path.copy(path,type);break;
			case 'action_rname':ui.path.rname(path);break;
			case 'action_download':ui.path.download(path,type);break;
			case 'action_remove':ui.path.remove(path,type);break;
			default:break;
		}
	}
	//文件列表事件绑定
	var _fileActionBind = function(){
		//浏览器后退，描点进行数据刷新。
		$(window).bind('hashchange', function() {
			var url = window.location.href;
			var arr = url.split('#');
			if (arr[1]!='' && arr[1]!=G.this_path) {
				ui.path.list(arr[1]);
			}
		});

		//打开文件
		$('.fileContiner .file').die('click').live('click',function(e){//
			$('.fileContiner .file .file_action_menu').animate(
				{left:'100%'},300,0,function(){
                $(this).remove();
            });
			if ($(this).find('.file_action_menu').length>0) {
				if ($(e.target).hasClass('action_menu')) {
					var action = $(e.target).attr('data-action');
					_fileMenuAction($(this),action);
				}
				if ($(e.target).parent().hasClass('action_menu')) {
					var action = $(e.target).parent().attr('data-action');
					_fileMenuAction($(this),action);
				}
				return;
			}
			if ($(e.target).hasClass('file-action')) {
				var $menu =$('.file_menu .file_action_menu').clone();
				$menu.appendTo($(this));
				$menu.removeClass('hidden').css({left:'100%'}).animate(
					{left:'0%'},300,0,function(){
                });
				return;
			}
			var type = $(this).find('.ico').attr('filetype');
			var path = $(this).find('.titleBox').attr('id');					
			ui.path.open(G.this_path+path,type);
			stopPP(e);
		});
		//地址栏点击，更换地址。
		$(".address li").die('click').live('click',function(e) {
			var path = $(this).find('a').attr('title');
			ui.path.list(path);
			stopPP(e);
		});
	}

	//1.工具栏调整筛选【文件管理，回收站，分享根目录】对应右键菜单处理
	//2.文件管理：读写权限处理【只读，可读写】——状态处理
	//3.我在该组【您是访客，】
	//4.物理目录读写状态处理[只读，不存在]
	var pathTypeChange = function(type){
		var info = G.json_data['info'],
			kod_path_type = info['path_type'],
			path_writeable= G.json_data['path_read_write'];
		if( (path_writeable!=undefined && path_writeable!='writeable') ||
			kod_path_type==G.KOD_USER_RECYCLE || 
			kod_path_type==G.KOD_USER_SHARE || 
			kod_path_type==G.KOD_GROUP_SHARE){
			G.json_data['info']['can_upload'] = false;
		}else{
			G.json_data['info']['can_upload'] = true;
			if( G.is_root!=1 &&
				kod_path_type==G.KOD_GROUP_PATH && 
				info['role']=='guest'){
				G.json_data['info']['can_upload'] = false;
			}
		}
	}


	return{	
		f5:_f5,
		f5_callback:_f5_callback,
		init:function(){
			_f5_callback(function(){//数据首次加载后回调
				_f5(false,true);
			});

			//生成文件列表
			_fileActionBind();
			ui.header.bindEvent();
		},

		// 头部操作
		header:{
			bindEvent:function(){
				$('.right_tool').on('click',function(){
					$(this).parent().toggleClass('open');
				})
				$('.left_tool').on('click',function(){
					$('body').toggleClass('menu-open');
				});

				//左侧菜单
				$('.panel-menu li').on('click',function(){
					$('body').removeClass('menu-open');
					var action = $(this).attr('data-action');
					switch(action){						
						case 'my_doc':ui.path.list(G.myhome);break;
						case 'my_desktop':ui.path.list(G.myhome+'/desktop/');break;
						case 'public':ui.path.list(G.KOD_GROUP_PATH+':1/');break;
						case 'exit':window.location.href="./index.php?user/logout";break;
						default:break;
					}
				});

				//右侧菜单
				$('.menu-right_tool li').on('click',function(){
					$('.menu_group').removeClass('open');
					var action = $(this).attr('data-action');
					switch(action){
						case 'upload':core.upload();break;
						case 'newfolder':ui.path.newFolder();break;
						case 'search':core.search('',G.this_path);break;

						case 'past':ui.path.past();break;
						default:break;
					}
				});
			},
			//更新地址栏
			addressSet:function(){
				var path = G.this_path;
				 //地址可点击html拼装，与input转换
				var __set_address = function(address) {
					var info = G.json_data['info'],path_type = info['path_type'];
					var add_more = '<li class="item" onclick=""><a title="@1@" style="z-index:{$2};">{$3}</a><i>></i></li>\n';
					address = address.replace(/\/+/g,'/');
					var arr = address.split('/');
					if (arr[arr.length - 1] == '') {
						arr.pop();
					}		
					var this_address = arr[0]+'/';		
					var li = add_more.replace(/@1@/g,this_address);


					var key = arr[0];
					var key_pre = '';
					if (arr[0] != '') {//特殊目录处理
						if (path_type==G.KOD_USER_SHARE) {
							if(G.user_id == info['id']){
								key_pre= '<span class="address_ico userSelf"></span>';
								key = LNG.my_share;
							}else{
								key_pre= '<span class="address_ico user"></span>';
								key = info['name'];
							}							
						}else if (path_type==G.KOD_GROUP_PATH) {
							if(info['role']=='owner'){
								key_pre= '<span class="address_ico groupSelfOwner"></span>';
							}else{
								key_pre= '<span class="address_ico groupSelf"></span>';
							}							
							key = info['name'];
						}else if (path_type==G.KOD_GROUP_SHARE) {
							key_pre= '<span class="address_ico groupGuest"></span>';
							key = info['name'];
						}else if (path_type==G.KOD_USER_RECYCLE) {
							key_pre= '<span class="address_ico recycle"></span>';
							key = LNG.recycle;
						}
					}
					li = li.replace('{$2}',arr.length);
					li = li.replace('{$3}',key_pre+'<span class="title_name">'+urlDecode(key)+"</span>");

					var html = li;
					for (var i=1,z_index=arr.length-1; i<arr.length; i++,z_index--){
						this_address += arr[i]+'/';
						li = add_more.replace(/@1@/g,this_address);
						li = li.replace('{$2}',z_index);
						li = li.replace('{$3}',urlDecode(arr[i]));
						html += li;
					}
					return html;
				};
				$(".frame-main .address ul").html(__set_address(path));
			},
			
			//地址栏enter或者 点击go按钮，main更换地址
			gotoPath:function(){
				var url=$("input.path").val();//保持文件夹最后有一个/
				url = url.replace(/\\/g,'/');
				$("input.path").val(url);
				if (url.substr(url.length-1,1)!='/'){
					url+='/';
				}

				var temp_path = '*public*/';
				ui.path.list(url);
				ui.header.addressSet();
			}
		}
	}
});
