define(function(require, exports) {
	//ajax后重置数据、重新绑定事件(f5或者list更换后重新绑定)
    var fileSelect  = require('./fileSelect');
    var fileLight   = fileSelect.fileLight;
    var MyPicasa    = new Picasa();
	var _ajaxLive = function(){		
		fileLight.init();
		ui.setStyle();
        //图片缩略图懒加载 桌面不做处理
        if(G.list_type == "icon"){
	        $(".fileContiner .picture img").lazyload({
				effect : "fadeIn",
				container: $(".bodymain"),
				placeholder:G.static_path + 'images/image.png'
			});
        }
	}
	//文件列表 列表模式和图标模式切换,
	var _initListType = function(thistype){
		$('.tools-right button').removeClass('active');
		$('#set_'+thistype).addClass('active');
		if (thistype=='list') {
			$(Config.FileBoxSelector).removeClass('fileList_icon').addClass('fileList_list');
			$('#list_type_list').html(
				'<div id="main_title">'+
					'<div class="filename" field="name">'+LNG.name+'<span></span></div><div class="resize filename_resize"></div>'+
					'<div class="filetype" field="ext">'+LNG.type+'<span></span></div><div class="resize filetype_resize"></div>'+
					'<div class="filesize" field="size">'+LNG.size+'<span></span></div><div class="resize filesize_resize"></div>'+
					'<div class="filetime" field="mtime">'+LNG.modify_time+'<span></span></div><div class="resize filetime_resize"></div>'+
					'<div style="clear:both"></div>'+
				'</div>'
			);
			$(Config.FileBoxSelector+' textarea').autoTextarea({minHeight:19,padding:4});
			list_header_resize.bind_list_resize();
		}else{
			$(Config.FileBoxSelector).removeClass('fileList_list').addClass('fileList_icon');
			$('#list_type_list').html('');
			$(Config.FileBoxSelector+' textarea').autoTextarea({minHeight:32,padding:4});
		}
		//同步到右键菜单
		$('.menu_seticon').removeClass('selected');
		$('.set_set'+G.list_type).addClass('selected');
	}
	//修改显示方式，图标&列表方式；动态加载css,本页面json刷新。
	var _setListType = function (thistype,firstRun){
		G.list_type = thistype;
		if (firstRun == undefined){
			$.ajax({
				url:'index.php?setting/set&k=list_type&v='+thistype,
				dataType:'json',		
				success:function(data){
					_initListType(thistype);
					_f5(false,false);
				}
			});
		}else{
			_initListType(thistype);
			_f5(false,true);
		}
	};

	//json 排序 filed:(string)排序字段，orderby:升降序。升序为-1，降序为1
	var _sortBy = function(filed,orderby) {
		var orderby = (orderby=='down')? -1 : 1;
		return function (a, b) {
			a = a[filed];
			b = b[filed];
			if (a < b) 	return orderby * -1;
			if (a > b) 	return orderby * 1;
			return 0;
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

	//标题栏排序方式点击
	var _bindEventSort = function(){
		$('#main_title div').die('click').live('click',function(){
			if($(this).hasClass('resize')){
				return;
			}
			if ($(this).attr('id')=='up'){
				$(this).attr('id','down');
			}else $(this).attr('id','up');
			_setListSort($(this).attr('field'),$(this).attr('id'));
		});
	};
	var _bindEventTools = function(){
		$('.tools a,.tools button').bind('click',function(){
			var todo = $(this).attr('id');
			_toolsAction(todo);
		});
	};
	var _bindEventTheme = function(){//主题切换		
		$('.dropdown-menu-theme li').click(function(){//点击选中
			var theme=$(this).attr("theme");
			$.ajax({
				url:'index.php?setting/set&k=theme&v='+theme,
				dataType:'json',
				success: function(data) {
					ui.setTheme(theme);
					if (!data.code) {
						if (!core.authCheck('setting:set')) {
							core.tips.tips(LNG.config_save_error_auth,false);
						}else{
							core.tips.tips(LNG.config_save_error_file,false);
						}
					}
				}
			});
			$('.dropdown-menu li').removeClass('this');
			$(this).addClass('this');
		});
	};

	var _bindHotKey = function(){
		var cmmand = 91;
		Global.ctrlKey = false;
		$(document).keydown(function (e){
			//console.log(e.keyCode,e.ctrlKey);
			if ($('#PicasaView').css('display') != 'none') return true;//图片播放
			if (ui.isEdit()) return true;//编辑状态		
			if (rightMenu.isDisplay()) return true;

			var isStopPP = false;//是否向上拦截冒泡
			if (Global.ctrlKey || e.keyCode == cmmand || e.ctrlKey) {
				//ctrl 组合键
				isStopPP = true;
				Global.ctrlKey = true;
				switch(e.keyCode){
					//case 8:ui.path.remove();isStopPP=true;break;//ctrl+backspace   remove
					case 8:ui.path.history.next();isStopPP=true;break;//前进
					case 65:fileSelect.selectPos('all');break;//CTRL+A	全选					
					case 67:ui.path.copy();break;//CTRL+C 复制
					case 88:ui.path.cute();break;//CTRL+X 剪切
					case 83:break; 	// 屏蔽CTRL+S
					case 86:ui.path.past();break;//CTRL+V 粘贴
					case 70://CTRL+F 查找
						core.search($('.header-right input').val(),G.this_path);
						break;			
					default:isStopPP=false;break;	
				}
			}else if(e.shiftKey) {
				Global.shiftKey = true;
				//console.log("shiftKey+"+e.keyCode);
			}else{
				switch (e.keyCode) {
					case 8:ui.path.history.back();isStopPP=true;break;
					case 32:ui.path.open();break;//space 预览
					case 35:fileSelect.selectPos('end');break;
					case 36:fileSelect.selectPos('home');break;
					case 37:fileSelect.selectPos('left');isStopPP=true;break;
					case 38:fileSelect.selectPos('up');isStopPP=true;break;
					case 39:fileSelect.selectPos('right');isStopPP=true;break;
					case 40:fileSelect.selectPos('down');isStopPP=true;break;
					case 13:ui.path.open();isStopPP=false;break;//enter 打开文件==双击
					case 46:ui.path.remove();isStopPP=true;break;
					case 113:ui.path.rname();isStopPP=true;break;//f2重命名
					default:isStopPP=false;break;
				}
			}
			if (isStopPP) {
				stopPP(e);
				e.keyCode=0;
				e.returnValue=false;//拦截向上消息冒泡				
			}
			return true;
		}).keyup(function(e){
			if (!e.shiftKey) Global.shiftKey = false;
			if (e.keyCode == cmmand || !e.ctrlKey) Global.ctrlKey = false;//win=ctrl
		});		
	};

	//下拉菜单展开操作
	var _menuActionBind = function(){
		$('.drop-menu-action li').bind('click',function(){
			if ($(this).hasClass('disabled'))return;
			var action = $(this).attr('id');
			switch(action){
				case 'open':ui.path.open();break;
				case 'copy':ui.path.copy();break;
				case 'rname':ui.path.rname();break;
				case 'cute':ui.path.cute();break;
				case 'clone':ui.path.copyDrag(G.this_path,true);break;
				case 'past':ui.path.past();break;
				case 'remove':ui.path.remove();break;
				case 'zip':ui.path.zip();break;
				case 'share':ui.path.share();break;
				case 'createLink':ui.path.createLink();break;
				case 'add_to_fav':ui.path.fav();break;
				case 'download':ui.path.download();break;
				case 'info':ui.path.info();break;
				default:break;
			}
		});
		$('.dlg_goto_path').bind('click',function(){
			var path = G.json_data['info']['admin_real_path'];
			ui.path.list(path);
		});
	};

	var _hover_title = function(list){
		var html ="'";//class 额外追加
		var tips ="";//title可读写提示
		if(list.is_writeable==0){
			html = " file_not_writeable"+html;
			tips = "【"+LNG.system_role_read+"】";
		}
		if(list.is_readable==0){//可读可写区分
			html = " file_not_readable"+html;
			tips = "【"+LNG.no_permission_read_all+"】";
		}

		var file_size = LNG.size+":"+core.file_size(list['size'])+"&#10;";
		if(list.type=='folder'){
			file_size='';
		}
		html += " data-path='"+list.path+"'";
		html += " data-name='"+list.name+"'";
		return  html+" title='"+				
				LNG.name+":"+list.name+"&#10;"+file_size+
				LNG.permission+':'+list.mode+tips+" &#10;"+
				LNG.create_time+':'+list.ctime+"&#10;"+
				LNG.modify_time+':'+list.mtime+"' ";
	};
	//图标样式，文件夹模版填充
	var _getFolderBox = function(list){
		var html="";
		var display_name = list['name'];
		if (typeof(list['exists'])=='number' && list['exists']==0) {
			display_name = '<b style="color:red;" class="file_not_exists">'+display_name+'</b>';
		}
		if(list['menuType'] != undefined){//特殊目录
			html+= "<div class='file systemBox "+list['menuType']+_hover_title(list)+">";
			html+= "<div class='ico "+list['tree_icon']+"' filetype='folder'></div>";
		}else{
			html+="<div class='file folderBox menufolder "+_hover_title(list)+">";
			html+="<div class='folder ico' filetype='folder'></div>";
		}

		//分享标记
		if(list['meta_info'] != undefined){
			html+='<div class="'+list['meta_info']+'"></div>';
		}
		html+="<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+display_name+"</span></div></div>";
		return html;
	}	 
	//图标样式，文件模版填充
	var _getFileBox = function(list){
		var html="";
		var display_name = list['name'];
		if (typeof(list['exists'])=='number' && list['exists']==0) {
			display_name = '<b style="color:red;" class="file_not_exists">'+display_name+'</b>';
		}
		if (list['ext'] == 'oexe' && list['icon'] != undefined) {
			var icon = list.icon;
			if (list.icon.search(G.static_path)==-1
			 && list.icon.substring(0,4) !='http') {
				icon = G.static_path + 'images/app/' + list.icon;
			}
			var code = base64_encode(json_encode(list));
			display_name = display_name.replace('.oexe','');
			html ="<div data-app='"+code+"' class='file fileBox menufile"+_hover_title(list)+">";
			
			//快捷方式处理;显示原本的图标
			if (list['type'] == 'app_link') {
				if(list['content'].search('ui.path.open') == 0){//文件
					html+="<div class='"+core.pathExt(list['name'].replace('.oexe',''))+" ico'";
				}else{//文件夹
					html+="<div class='folder ico'";
				}
				html+=' filetype="oexe"></div><div class="app_link"></div>';
			}else{
				html+="<div class='ico' filetype='oexe' style='background-image:url("+icon+")'></div>";
			}			
		}else if (inArray(core.filetype['image'],list['ext'])) {//如果是图片，则显示缩略图
			var filePath = core.path2url(list['path']);
			var thumbPath = 'index.php?explorer/image&path='+urlEncode(list['path']);
			var lazyImg = G.static_path+'/images/file_icon/file_64/jpg.png';
			html+="<div class='file fileBox menufile "+_hover_title(list)+">";
			html+="<div picasa='"+filePath+"' thumb='"+thumbPath+"' class='picasaImage picture ico' filetype='"+list['ext']+"' style='background:none'><img data-original='"+thumbPath+"' draggable='false'/></div>";
		}else{
			html+="<div class='file fileBox menufile "+_hover_title(list)+">";
			html+="<div class='"+list['ext']+" ico' filetype='"+list['ext']+"'></div>";
		}

		//分享标记
		if(list['meta_info'] != undefined){
			html+='<div class="'+list['meta_info']+'"></div>';
		}
		html+="<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+display_name+"</span></div></div>";
		return html;
	}

	//---------------------------------------
	//列表样式，文件夹模版填充
	var _getFolderBoxList = function(list){
		var display_name = list['name'];
		if (typeof(list['exists'])=='number' && list['exists']==0) {
			display_name = '<b style="color:red;" class="file_not_exists">'+display_name+'</b>';
		}
		var html="<div class='file_list_cell'>";
		if(list['menuType'] != undefined){//特殊目录
			html+= "<div class='file systemBox "+list['menuType']+_hover_title(list)+">";
			html+= "<div class='ico "+list['tree_icon']+"' filetype='folder'></div>";
		}else{
			html+= "<div class='file folderBox menufolder "+_hover_title(list)+">";
			html+= "<div class='folder ico' filetype='folder'></div>";
		}
		html+="	<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+display_name+"</span></div>";
		html+="	<div class='filetype'>"+LNG.folder+"</div>";
		html+="	<div class='filesize'></div>";
		html+="	<div class='filetime'>"+list['mtime']+"</div>";
		if(list['meta_info'] != undefined){
			html+='<div class="'+list['meta_info']+'"></div>';
		}
		html+="	<div style='clear:both'></div>";
		html+="</div><div style='clear:both'></div></div>";
		return html;
	}
	//列表样式，文件模版填充
	var _getFileBoxList = function(list){
		var html="<div class='file_list_cell'>";
		var display_name = list['name'];
		if (typeof(list['exists'])=='number' && list['exists']==0) {
			display_name = '<b style="color:red;" class="file_not_exists">'+display_name+'</b>';
		}
		if (list['ext'] == 'oexe') {
			var code = base64_encode(json_encode(list));
			html +="<div data-app='"+code+"' class='file fileBox menufile "+_hover_title(list)+">";
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
			html+="<div picasa='"+filePath+"' thumb='"+thumbPath+"' class='picasaImage file fileBox menufile'"+_hover_title(list)+">";
			html+="	<div class='"+list['ext']+" ico' filetype='"+list['ext']+"'></div>";
		}else {
			html+="<div class='file fileBox menufile "+_hover_title(list)+">";
			html+="	<div class='"+list['ext']+" ico' filetype='"+list['ext']+"'></div>";	
		}
		html+="	<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+display_name+"</span></div>";
		html+="	<div class='filetype'>"+list['ext']+"  "+LNG.file+"</div>";
		html+="	<div class='filesize'>"+core.file_size(list['size'])+"</div>";
		html+="	<div class='filetime'>"+list['mtime']+"</div>";
		if(list['meta_info'] != undefined){//小图标
			html+='<div class="'+list['meta_info']+'"></div>';
		}
		html+="	<div style='clear:both'></div>";		
		html+="</div><div style='clear:both'></div></div>";
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

		list_page_max = 100000;//默认100 太多则分页加载；
		var current_num = 0;
		if (G.list_type=='list') {
			for (var i=0;i<filelist.length;i++){
				if(current_num>=list_page_max){
					break;
				}
				current_num++;
				file_html += _getFileBoxList(filelist[i]);
			}
			for (var i=0;i<folderlist.length;i++){
				if(current_num>=list_page_max){
					break;
				}
				current_num++;
				folder_html += _getFolderBoxList(folderlist[i]);
			}
		}else{
			for (var i=0;i<filelist.length;i++){
				if(current_num>=list_page_max){
					break;
				}
				current_num++;
				file_html += _getFileBox(filelist[i]);
			}
			for (var i=0;i<folderlist.length;i++){
				if(current_num>=list_page_max){
					break;
				}
				current_num++;
				folder_html += _getFolderBox(folderlist[i]);
			}
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
		if (G.list_type=='list') {//列表奇偶行css设置
			$(Config.FileBoxSelector+" .file_list_cell:nth-child(2n)").find(".file").addClass('file2');
		}
		list_header_resize.resize();
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
			ui.path.setSelectByFilename(select_arr);//不刷新数据的话，保持上次选中
		}else{//获取服务器数据
			$.ajax({
				url:'index.php?explorer/pathList&path='+urlEncode(G.this_path),
				dataType:'json',
				beforeSend:function(){
					$('.tools-left .msg').stop(true,true).fadeIn(100);
				},
				success:function(data){
					$('.tools-left .msg').fadeOut(100);
					if(!data){
						return;
					}
					if (!data.code) {	
						core.tips.tips(data);
						$(Config.FileBoxSelector).html('');
						return false;
					}
					G.json_data = data.data;
					f5_jsondata_filter();
					_mainSetData(is_animate);					
					ui.header.addressSet();//header地址栏更新
					pathTypeChange();
					if (typeof(callback) == 'function'){
						callback(data);
					}
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
	var f5_jsondata_filter = function(){
		if (!G.json_data) return;
		if(G.json_data['share_list']!=undefined){//时间处理
			G.self_share = G.json_data['share_list'];
		}
		if(G.json_data['this_path']){
			G.this_path = G.json_data['this_path'];
		}

		for (var key in G.json_data) {
			if(key !='filelist' && key !='folderlist') continue;
			//处理文件&文件夹
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

				//分享标记
				if(path_is_share(G.json_data[key][i]['path'])){
					G.json_data[key][i]['meta_info'] = 'path_self_share';
				}
			}
		}
		if(Config.pageApp!='explorer'){
			return;
		}
		//用户根目录虚拟目录加入：recycle  share
		//用户组虚拟目录加入：share 公开目录
	}

	//是否为共享
	var path_is_share = function(path){
		for(var key in G.self_share){
			if(core.pathClear(G.self_share[key]['path']) == core.pathClear(path)){
				return true;
			}
		}
		return false;
	}

	//头部操作控制器。
	var _toolsAction = function(what){
		switch (what){
			case 'recycle_clear':ui.path.recycle_clear();break;
			case 'newfile':ui.path.newFile();break;
			case 'refresh':ui.f5();break;
			case 'newfolder':ui.path.newFolder();break;
			case 'upload':core.upload();break;	
			case 'set_icon':
				if(!$('#set_icon').hasClass('active')){
					_setListType('icon');
				}
				break;
			case 'set_list':
				if(!$('#set_list').hasClass('active')){
					_setListType('list');
				}
				break;
			default:break;
		}
	};


	//1.工具栏调整筛选【文件管理，回收站，分享根目录】对应右键菜单处理
	//2.文件管理：读写权限处理【只读，可读写】——状态处理
	//3.我在该组【您是访客，】
	//4.物理目录读写状态处理[只读，不存在]
	var pathTypeChange = function(type){
		var info = G.json_data['info'],
			kod_path_type = info['path_type'],
			path_writeable= G.json_data['path_read_write'];
		var bodyClass = 'menuBodyMain menuRecycleBody menuShareBody';
		var cellClass = 'folderBox menufolder fileBox menufile';
		var $bodymain = $('.html5_drag_upload_box');

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

		//右键菜单 及菜单处理
		if (kod_path_type==G.KOD_USER_RECYCLE) {//回收站	ok		
			$bodymain.removeClass(bodyClass).addClass('menuRecycleBody');
			$('.tools-left>.btn-group')
				.addClass('hidden')
				.parent()
				.find('.kod_recycle_tool').removeClass('hidden');
			$('.fileContiner .file')
				.removeClass(cellClass)
				.addClass('menuRecyclePath');
		}else if (kod_path_type==G.KOD_USER_SHARE) {//我的共享
			if(core.pathClear(G.this_path).indexOf('/')==-1){//共享根目录
				$bodymain.removeClass(bodyClass).addClass('menuShareBody');
				$('.tools-left>.btn-group')
					.addClass('hidden')
					.parent()
					.find('.kod_share_tool').removeClass('hidden');
				$('.fileContiner .file')
					.removeClass(cellClass)
					.addClass('menuSharePath');
				//自己的共享根目录
				if(info['id'] == G.user_id){
					$('.menuSharePathMenu').find('.open_the_path,.share_edit,.remove').removeClass('hidden');
					$('.menuSharePathMore').find('.remove').removeClass('hidden');
				}else{
					$('.menuSharePathMenu').find('.open_the_path,.share_edit,.remove').addClass('hidden');
					$('.menuSharePathMore').find('.remove').addClass('hidden');
				}
			}else{
				$bodymain.removeClass(bodyClass).addClass('menuBodyMain');
				$('.tools-left>.btn-group')
					.addClass('hidden')
					.parent()
					.find('.kod_path_tool').removeClass('hidden');
			}
		}else{
			//还原
			$bodymain.removeClass(bodyClass).addClass('menuBodyMain');
			$('.tools-left>.btn-group')
				.addClass('hidden')
				.parent()
				.find('.kod_path_tool').removeClass('hidden');
		}
		//目录权限对应右键变化;数据请求后调用
        menuCurrentPath();
	}
	//目录权限对应右键变化;数据请求后调用
    var  menuCurrentPath=function(){
    	var info = G.json_data['info'],
    		path_read = G.json_data['path_read_write'],
    		kod_path_type = info['path_type'];
        var classMenu = '.createLink,.createProject,.cute,.remove,.rname,.zip,.unzip,.newfile,'+
                        '.newfolder,.newfileOther,.app_create,.app_install,.past,.upload,.clone';
        var drop_menu = "#download,#rename,#cute,#remove,#zip,#past,#clone,#share,#rname,#createLink,.divider";
        var theClass = "disable";//disable disabled hide

        if (info['can_upload']){
        	$('ul.menufolder,ul.menuMore,ul.menufile,ul.fileContiner_menu')
            	.find(classMenu).removeClass(theClass);

            $('.path_tips').hide();
            $('.kod_path_tool>button').removeClass('disabled');
            $('.kod_path_tool').find(drop_menu).removeClass('hidden');      
        }else{
        	$('.kod_path_tool').find(drop_menu).addClass('hidden');
            $('.kod_path_tool>button').addClass('disabled');
            $('ul.menufolder,ul.menuMore,ul.menufile,ul.fileContiner_menu')
            	.find(classMenu).addClass(theClass);
            //not_writeable not_exists
            $('.path_tips span').html(LNG.only_read);
            if( kod_path_type==G.KOD_USER_RECYCLE ||
            	kod_path_type==G.KOD_USER_SHARE){
            	$('.path_tips').hide();
            	$('.kod_path_tool>button').removeClass('disabled');
            	if(kod_path_type==G.KOD_USER_SHARE && G.user_id != info['id']){
            		$('.kod_path_tool>button').addClass('disabled');
            	}
            }else{
            	$('.path_tips').show();
            }
        }

        //空间大小使用情况 自己能编辑才能看到；管理员默认可以看到
        if(	((kod_path_type==G.KOD_GROUP_PATH||kod_path_type==G.KOD_GROUP_SHARE) && G.is_root) ||
        	(kod_path_type==G.KOD_GROUP_PATH && info['role']=='owner')){
        	var space = G.json_data['group_space_use'];
        	if(space){
	        	var html = core.user_space_html(space.size_use+'/'+space.size_max);
	        	$(".group_space_use").removeClass('hidden').html(html);
        	}else{
        		$(".group_space_use").addClass('hidden');
        	}        	
        }else{
        	$(".group_space_use").addClass('hidden');
        }

        //自己的使用空间
        if(G.json_data['user_space']){
        	var space = G.json_data['user_space'];
			var html = core.user_space_html(space.size_use+'/'+space.size_max);
			$('.user_space_info').html(html);
        }
        

        //不能存在提示
        if (path_read == 'not_exists'){//不存在处理
            $('.path_tips span').html(LNG.not_exists);
            $('.path_tips').show();
        }

        if( kod_path_type==G.KOD_USER_RECYCLE || 
			kod_path_type==G.KOD_USER_SHARE || 
			kod_path_type==G.KOD_GROUP_SHARE ||
			kod_path_type==G.KOD_GROUP_PATH){			
			$('ul.menufolder,ul.menuMore,ul.menufile,ul.fileContiner_menu')
            	.find('.share').addClass('hidden');
		}else{			
			$('ul.menufolder,ul.menuMore,ul.menufile,ul.fileContiner_menu')
            	.find('.share').removeClass('hidden');			
		}

		//真实目录
		if(G.is_root==1 && info['admin_real_path']){
        	$('.admin_real_path').removeClass('hidden');
        }else{
        	$('.admin_real_path').addClass('hidden');
        }

        //文件夹选择api;目录变更；api检测弹出层   && info['can_upload']
        if($.getUrlParam("path_select")=='folder'){
			var top = share.system_top();
			top.core.path_select_change($.getUrlParam('uuid_key'),G.this_path);
		}
    };

	return{	
		f5:_f5,
		f5_callback:_f5_callback,
		picasa:MyPicasa,
		setListSort:_setListSort,
		setListType:_setListType,
		path_is_share:path_is_share,
		f5_jsondata_filter:f5_jsondata_filter,
		setTheme:function(thistheme){
			core.setSkin(thistheme);
			FrameCall.top('OpenopenEditor','Editor.setTheme','"'+thistheme+'"');
			FrameCall.top('Opensetting_mode','Setting.setThemeSelf','"'+thistheme+'"');
			FrameCall.father('ui.setTheme','"'+thistheme+'"');
		},
		isEdit:function(){
			var focusTagName = $(document.activeElement).get(0)
			if (!focusTagName) return;
			focusTagName = focusTagName.tagName;
			if (focusTagName == 'INPUT' || focusTagName == 'TEXTAREA'){
				return true;
			}
			return false;
		},
		init:function(){
			_f5_callback(function(){//数据首次加载后回调
				ui.path.history.add();
				_setListType(G.list_type,true);
			});			
			//生成文件列表
			_bindEventSort();
			_bindEventTheme();
			_bindEventTools();
			_bindHotKey();
			_menuActionBind();
			ui.header.bindEvent();
			$(window).bind("resize",function(){
				ui.setStyle();//浏览器调整大小，文件列表区域调整高宽。
				ui.header.set_width();
				if ($('#PicasaView').css("display")!="none") {
					MyPicasa.setFrameResize();
				}
			});
			$("html").bind('click',function (e) {
				rightMenu.hidden();
			});
			Mousetrap.bind(['ctrl+s', 'command+s'],function(e) {
	            e.preventDefault();
	            FrameCall.top('OpenopenEditor','Editor.save','');
	        });


			//绑定键盘定位文件名 选中文件,只只是首字母选择。
			var lastClickTime = 0;
			var lastkeyCode = '';
			var keyTimeout;
			var timeOffset = 0.2;//按键之间延迟，小于则认为是整体

			Mousetrap.bind(
				['1','2','3','4','5','6','7','8','9','0','`','~','!','@','#','$','%','^','&','*','(',')',
				'-','_','=','+','[','{',']','}','|','/','?','.','>',',','<','a','b','c','d','e',
				'f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],function(e){
				var code = String.fromCharCode(e.charCode);
				if (lastClickTime == 0) {//新的一次键盘记录
					lastClickTime = time_float();
					lastkeyCode = code;
					keyTimeout = setTimeout(function(){
						ui.path.setSelectByChar(lastkeyCode);
						lastClickTime = 0;
					},timeOffset*1000);//延迟执行
					return;
				}
				if (code == lastkeyCode.substr(-1)) {//当前和之前一致
					ui.path.setSelectByChar(lastkeyCode);
					lastClickTime = 0;
					return;
				}

				if (time_float() - lastClickTime < timeOffset) {
					//定时之内没有输入则执行，有则追加，继续延时
					lastClickTime = time_float();
					lastkeyCode += code;
					clearTimeout(keyTimeout);
					keyTimeout = setTimeout(function(){
						ui.path.setSelectByChar(lastkeyCode);
						lastClickTime = 0;
					},timeOffset*1000);//延迟执行。
				}
	        });
			Mousetrap.bind(['f5'],function(e){
				stopPP(e);ui.f5(true,true);
	        });
			Mousetrap.bind(['ctrl+u', 'command+u'],function(e){
				stopPP(e);core.upload();
	        });
	        Mousetrap.bind(['ctrl+e', 'command+e'],function(e){
				stopPP(e);ui.path.openEditor();
	        });
	        Mousetrap.bind(['alt+i', 'alt+i'],function(e){
				stopPP(e);ui.path.info();//属性
	        });
			Mousetrap.bind(['alt+n', 'alt+n'],function(e){
				stopPP(e);ui.path.newFile();
	        });
			Mousetrap.bind(['alt+m', 'alt+m'],function(e){
				stopPP(e);ui.path.newFolder();
	        });	        

			//如果为图片的话，"+LNG.double_click_rename+"被图片插件绑定，
            MyPicasa.init(".picasaImage");
            MyPicasa.initData();
		},	
		setStyle:function(){//设置文件列表高宽。
			if (G.list_type=='list') {
				Global.fileRowNum = 1;
			}else{
				//main当前宽度所容纳每行文件个数。
				Global.fileRowNum = (function(){
					var main_width=$(Config.FileBoxSelector).width();//获取main主体的
					var file_width=
						$sizeInt($(Config.FileBoxClass).css('width'))+
						$sizeInt($(Config.FileBoxClass).css('border-left-width'))+
						$sizeInt($(Config.FileBoxClass).css('border-right-width'))+
						$sizeInt($(Config.FileBoxClass).css('margin-right'));
					return parseInt(main_width/file_width);		
				})();					
			}	
		},
		// 头部操作
		header:{
			bindEvent:function(){								
				//地址栏点击，更换地址。
				$("#yarnball li a").die('click').live('click',function(e) {
					var path = $(this).attr('title');
					$("input.path").val(path);
					ui.header.gotoPath();
					//ui.path.list(path);
					stopPP(e);
				});

				$("#yarnball").die('click').live('click',function(){
					$("#yarnball").css('display','none');
					$("#yarnball_input").css('display','block');
					$("#yarnball_input input").focus();
					return true;
				});
				$("#yarnball_input input").die('blur').live('blur',function(){
					ui.header.gotoPath();
				});
				//enter
				$('#yarnball_input input').keyEnter(function(){
					ui.header.gotoPath();
				});

				// 头部功能绑定
				//enter搜索
				$('.header-right input').keyEnter(function(e){
					core.search($('.header-right input').val(),G.this_path);
				});
				$('.header-right input').bind('keyup focus',function(){
					ui.path.setSearchByStr($(this).val());
				});

				$('.header-content a,.header-content button').click(function(e){
					var action = $(this).attr('id');
					switch (action){
						case 'history_back':ui.path.history.back();break;
						case 'history_next':ui.path.history.next();break;
						case 'refresh':
							ui.f5(true,true);
							ui.tree.init();
							break;
						case 'home':ui.path.list(G.myhome);break;
						case 'fav':
							ui.path.pathOperate.fav({
								path:G.this_path,
								type:'folder',
								name:$("ul.yarnball li:last .title_name").html()
							});
							break;
						case 'up':ui.header.gotoFather();break;
						case 'setting':core.setting();break;
						case 'search':
							core.search($('.header-right input').val(),G.this_path);
							break;
						default:break;
					}
					return true;
				});
			},
			//更新地址栏
			addressSet:function(){
				var path = G.this_path;
				$("input.path").val(path);
				$("#yarnball_input").css('display','none');
				$("#yarnball").css('display','block');

				 //地址可点击html拼装，与input转换
				var __set_address = function(address) {
					var info = G.json_data['info'],path_type = info['path_type'];
					var add_first = '<li class="yarnlet first"><a title="@1@" style="z-index:{$2};"><span class="left-yarn"></span>{$3}</a></li>\n';
					var add_more = '<li class="yarnlet "><a title="@1@" style="z-index:{$2};">{$3}</a></li>\n';
					address = address.replace(/\/+/g,'/');
					var arr = address.split('/');
					if (arr[arr.length - 1] == '') {
						arr.pop();
					}
					var this_address = arr[0]+'/';		
					var li = add_first.replace(/@1@/g,this_address);
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
					li = li.replace('{$3}',key_pre+'<span class="title_name">'+key+"</span>");
					var html = li;
					for (var i=1,z_index=arr.length-1; i<arr.length; i++,z_index--){
						this_address += arr[i]+'/';
						li = add_more.replace(/@1@/g,this_address);
						li = li.replace('{$2}',z_index);
						li = li.replace('{$3}','<span class="title_name">'+arr[i]+"</span>");
						html += li;
					}
					return '<ul class="yarnball">'+html+'</ul>';
				};
				$("#yarnball").html(__set_address(path));
				ui.header.set_width();
			},
			//自适应宽度
			set_width:function(){
				$(".yarnball").stop(true,true);
				var box_width = $('#yarnball').innerWidth();
				var need_width = 0;
				$('#yarnball li a').each(function(index){
					need_width += $(this).outerWidth()+ parseInt($(this).css('margin-left'))+5;
				});

				var m_width = box_width - need_width;
				if(m_width<=0){
					$(".yarnball")
						.css('width',need_width +'px')
						.css('left',m_width+'px');
				}else{
					$(".yarnball").css({'left':'3px','width':box_width +'px'});
				}
			},

			//地址栏enter或者 点击go按钮，main更换地址
			gotoPath:function(){
				var path=rtrim(core.pathClear($("input.path").val()))+'/';
				$("input.path").val(path);
				ui.path.list(path);
				ui.header.addressSet();
			},
			//转到上层目录
			gotoFather:function(){
				var path=rtrim(core.pathClear($("input.path").val()));
				if (path=='/' || path.indexOf('/')==-1) {
					core.tips.tips(LNG.path_is_root_tips,'warning');
					return;
				};
				var gopath=core.pathFather(path);
				$("input.path").val(gopath);
				ui.header.gotoPath();
			}
		}
	}
});
