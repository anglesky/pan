define(function(require, exports) {
	//ajax后重置数据、重新绑定事件(f5或者list更换后重新绑定)
    var fileSelect  = require('./fileSelect');
    var fileLight   = fileSelect.fileLight;
    var MyPicasa    = new Picasa();

	var _ajaxLive = function(){		
		fileLight.init();
		ui.setStyle();
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
		_initListType(thistype);
		Cookie.set('list_type',thistype);
		if (firstRun == undefined){
			_f5(false,false);
		}else{
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
		Cookie.set('list_sort_field',G.list_sort_field);
		Cookie.set('list_sort_order',G.list_sort_order);
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
		$('.tools a,.tools button,.tools_list button').bind('click',function(){
			var todo = $(this).attr('id');
			_toolsAction(todo);
		});
	};	
	var _bindEventTheme = function(){//主题切换
		//core.setSkin(G.theme,'app_explorer.css');
		$('.dropdown-menu-theme li[theme="'+G.theme+'"]').addClass('this');
		$('.dropdown-menu-theme li').click(function(){//点击选中
			var theme=$(this).attr("theme");
			Cookie.set('theme',theme);
			$('.dropdown-menu li').removeClass('this');
			$(this).addClass('this');
			core.setSkin(theme,'app_explorer.css');
		});
	};

	var _bindHotKey = function(){
		var cmmand = 91;
		Global.ctrlKey = false;
		$(document).keydown(function (e){
			if ($('#PicasaView').css('display') != 'none') return true;//图片播放
			if (ui.isEdit()) return true;//编辑状态		
			if (rightMenu.isDisplay()) return true;

			var isStopPP = false;//是否向上拦截冒泡
			if (Global.ctrlKey || e.keyCode == cmmand || e.ctrlKey) {
				//ctrl 组合键console.log(e.keyCode)	
				isStopPP = true;
				Global.ctrlKey = true;
				switch(e.keyCode){
					case 8:ui.path.history.next();break;//前进
					case 65:fileSelect.selectPos('all');break;//CTRL+A	全选
					case 83:break; 	// 屏蔽CTRL+S
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
					case 35:fileSelect.selectPos('end');break;
					case 36:fileSelect.selectPos('home');break;
					case 37:fileSelect.selectPos('left');isStopPP=true;break;
					case 38:fileSelect.selectPos('up');isStopPP=true;break;
					case 39:fileSelect.selectPos('right');isStopPP=true;break;
					case 40:fileSelect.selectPos('down');isStopPP=true;break;
					case 13:ui.path.open();isStopPP=false;break;//enter 打开文件==双击
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

	this._hover_title = function(list){
		return  ' data-path="'+list.path+'" data-name="'+list.name+'" title="'+
				LNG.name+':'+list.name+"&#10;"+
				LNG.size+':'+core.file_size(list['size'])+"&#10;"+
				LNG.permission+':'+list.mode+"&#10;"+
				LNG.create_time+':'+list.ctime+"&#10;"+
				LNG.modify_time+':'+list.mtime+'" ';
	};
	//图标样式，文件夹模版填充
	this._getFolderBox = function(list){
		var html="";
		html+="<div class='file folderBox menufolder' data-name='"+list.name+"'"+_hover_title(list)+">";
		html+="<div class='folder ico' filetype='folder'></div>";
		html+="<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+list['name']+"</span></div></div>";
		return html;
	}	 
	//图标样式，文件模版填充
	this._getFileBox = function(list){
		var html="";
		if (list['ext'] == 'oexe' && list['icon'] != undefined) {
			var icon = list.icon;
			if (list.icon.search(G.static_path)==-1
			 && list.icon.substring(0,4) !='http') {
				icon = G.static_path + 'images/app/' + list.icon;
			}
			var code = base64_encode(json_encode(list));
			var display_name = list.name.replace('.oexe','');
			html ="<div class='file fileBox menufile' data-app="+code+" data-name='"+list.name+"'"+_hover_title(list)+">";
			
			//快捷方式处理
			if (list['type'] == 'app_link') {
				if(list['content'].search('ui.path.open') == 0){//文件
					html+="<div class='"+core.pathExt(display_name)+" ico'";
				}else{//文件夹
					html+="<div class='folder ico'";
				}
				html+=' filetype="oexe"></div><div class="app_link"></div>';
			}else{
				html+="<div class='ico' filetype='oexe' style='background-image:url("+icon+")'></div>";
			}
			html+="<div id='' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+
					display_name+"</span></div></div>";
		}else if (inArray(core.filetype['image'],list['ext'])) {//如果是图片，则显示缩略图
			var filePath = core.path2url(list['path']);
			var thumbPath = 'index.php?share/image&user='+G.user+'&sid='+G.sid+'&path='+urlEncode(list['path']);
			html+="<div class='file fileBox menufile' "+_hover_title(list)+">";
			html+="<div picasa='"+filePath+"' thumb='"+thumbPath+"' title='"+list['name']+"' class='picasaImage picture ico' filetype='"+list['ext']+"' style='margin:3px 0 0 8px;background:url(\""+thumbPath+"\") no-repeat center center;'></div>";
			html+="<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+list['name']+"</span></div></div>";
		}else{
			html+="<div class='file fileBox menufile' "+_hover_title(list)+">";
			html+="<div class='"+list['ext']+" ico' filetype='"+list['ext']+"'></div>";
			html+="<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+list['name']+"</span></div></div>";
		}
		return html;
	}

	//---------------------------------------
	//列表样式，文件夹模版填充
	this._getFolderBoxList = function(list){
		var html="<div class='file_list_cell'><div class='file folderBox menufolder' "+_hover_title(list)+">";
		html+="	<div class='folder ico' filetype='folder'></div>";
		html+="	<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+list['name']+"</span></div>";
		html+="	<div class='filetype'>"+LNG.folder+"</div>";
		html+="	<div class='filesize'></div>";
		html+="	<div class='filetime'>"+list['mtime']+"</div>";
		html+="	<div style='clear:both'></div>";
		html+="</div><div style='clear:both'></div></div>";
		return html;
	}
	//列表样式，文件模版填充
	this._getFileBoxList = function(list){
		var html="<div class='file_list_cell'>";
		var display_name = list.name;
		if (list['ext'] == 'oexe') {
			var code = base64_encode(json_encode(list));
			display_name = list.name.replace('.oexe','');
			html +="<div class='file fileBox menufile' data-app="+code+_hover_title(list)+">";

			//快捷方式处理
			if (list['type'] == 'app_link') {
				if(list['content'].search('ui.path.open') == 0){//文件
					html+="<div class='"+core.pathExt(display_name)+" ico'";
				}else{//文件夹
					html+="<div class='folder ico'";
				}
				html+=' filetype="oexe"></div><div class="app_link"></div>';
			}else{
				html+="<div class='oexe ico' filetype='oexe'></div>";
			}
		}else if (inArray(core.filetype['image'],list['ext'])) {//如果是图片，则显示缩略图，并绑定幻灯片插件
			var filePath = core.path2url(list['path']);
			var thumbPath = 'index.php?share/image&user='+G.user+'&sid='+G.sid+'&path='+urlEncode(list['path']);
			html+="<div picasa='"+filePath+"' thumb='"+thumbPath+"' class='picasaImage file fileBox menufile'"+_hover_title(list)+">";
			html+="	<div class='"+list['ext']+" ico' filetype='"+list['ext']+"'></div>";
		}else {
			html+="<div class='file fileBox menufile'"+_hover_title(list)+">";
			html+="	<div class='"+list['ext']+" ico' filetype='"+list['ext']+"'></div>";	
		}
		html+="	<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+display_name+"</span></div>";
		html+="	<div class='filetype'>"+list['ext']+"  "+LNG.file+"</div>";
		html+="	<div class='filesize'>"+core.file_size(list['size'])+"</div>";
		html+="	<div class='filetime'>"+list['mtime']+"</div>";
		html+="	<div style='clear:both'></div>";
		html+="</div><div style='clear:both'></div></div>";
		return html;
	};

	var pathTypeChange = function(type){
		var cellClass = 'folderBox menufolder fileBox menufile';
		var $bodymain = $('.html5_drag_upload_box');
		$bodymain.removeClass('menuBodyMain').addClass('menuBodyMain');
		$('.tools-left>.btn-group')
			.addClass('hidden')
			.parent()
			.find('.kod_path_tool').removeClass('hidden');
	}

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
		var file_function = '_getFileBox',
			folder_function = '_getFolderBox',
			file_html='',folder_html='';
		if (G.list_type=='list') {
			file_function   = '_getFileBoxList';
			folder_function = '_getFolderBoxList'
		}
		for (var i=0;i<filelist.length;i++){
			file_html += this[file_function](filelist[i]);
		}
		for (var i=0;i<folderlist.length;i++){
			folder_html += this[folder_function](folderlist[i]);
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
				url:'index.php?share/pathList&user='+G.user+'&sid='+G.sid+'&path='+urlEncode(G.this_path),
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
	var _f5_time_user = function(){
		if (!G.json_data || !G.json_data['filelist'] || !G.json_data['folderlist']) return;
		for (var i = 0; i < G.json_data.filelist.length; i++) {
			G.json_data.filelist[i]['atime'] = date(LNG.time_type,G.json_data.filelist[i]['atime']);
			G.json_data.filelist[i]['ctime'] = date(LNG.time_type,G.json_data.filelist[i]['ctime']);
			G.json_data.filelist[i]['mtime'] = date(LNG.time_type,G.json_data.filelist[i]['mtime']);
		}
		for (var i = 0; i < G.json_data.folderlist.length; i++) {
			G.json_data.folderlist[i]['atime'] = date(LNG.time_type,G.json_data.folderlist[i]['atime']);
			G.json_data.folderlist[i]['ctime'] = date(LNG.time_type,G.json_data.folderlist[i]['ctime']);
			G.json_data.folderlist[i]['mtime'] = date(LNG.time_type,G.json_data.folderlist[i]['mtime']);
		}
	};

	//头部操作控制器。
	var _toolsAction = function(what){
		switch (what){
			case 'refresh':ui.f5(true,true);break;
			case 'selectAll':fileSelect.selectPos('all');break;
			case 'down':ui.path.download();break;
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
	return{	
		f5:_f5,
		f5_callback:_f5_callback,
		picasa:MyPicasa,
		setListSort:_setListSort,
		setListType:_setListType,
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
			if (Cookie.get('theme')) G.theme=Cookie.get('theme');
			if (Cookie.get('list_type')) G.list_type=Cookie.get('list_type');			
			if (Cookie.get('list_sort_field')) G.list_sort_field=Cookie.get('list_sort_field');
			if (Cookie.get('list_sort_order')) G.list_sort_order=Cookie.get('list_sort_order');
			
			Cookie.set('theme',G.theme);
			Cookie.set('list_type',G.list_type);
			Cookie.set('list_sort_field',G.list_sort_field);
			Cookie.set('list_sort_order',G.list_sort_order);

			var url_path = window.location.href.split("#");
			if(url_path.length==2){
				G.this_path = urlDecode(url_path[1]);
			}

			_f5_callback(function(){//数据首次加载后回调
				_setListType(G.list_type,true);
				ui.path.history.add();
			});
			//生成文件列表
			_bindEventSort();
			_bindEventTheme();
			_bindEventTools();
			_bindHotKey();
			ui.header.bindEvent();

			$("#set_theme").addClass('hidden');
			$(window).bind("resize",function(){
				ui.setStyle();//浏览器调整大小，文件列表区域调整高宽。
				ui.header.set_width();
				if ($('#PicasaView').css("display")!="none") {
					MyPicasa.setFrameResize();
				}
			});
			
			if(G.share_info['can_upload']!="1"){
				$("#upload").addClass("hidden");
			}

			$("html").bind('click',function (e) {
				rightMenu.hidden();
			});
			Mousetrap.bind(['ctrl+s', 'command+s'],function(e) {
	            e.preventDefault();
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
	        Mousetrap.bind(['alt+i', 'alt+i'],function(e){
				stopPP(e);ui.path.info();//属性
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
				$('.header-right input').die('keyup').live('keyup',function(){
					ui.path.setSearchByStr($(this).val());
				});

				$('.header-content a,.header-content button').click(function(e){
					var action = $(this).attr('id');
					switch (action){
						case 'history_next':ui.path.history.next();break;
						case 'history_back':ui.path.history.back();break;
						case 'refresh':
							ui.f5(true,true);
							ui.tree.init();
							break;
						case 'home':ui.path.list('/');break;
						case 'up':ui.header.gotoFather();break;
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
					var add_first = '<li class="yarnlet first"><a title="@1@" style="z-index:{$2};"><span class="left-yarn"></span>{$3}</a></li>\n';
					var add_more = '<li class="yarnlet "><a title="@1@" style="z-index:{$2};">{$3}</a></li>\n';
					address = address.replace(/\/+/g,'/');
					var arr = address.split('/');
					if (arr[arr.length - 1] == '') {
						arr.pop();
					}
					if (arr[0] == undefined) arr[0] = '';
					var this_address = arr[0]+'/';		
					var li = add_first.replace(/@1@/g,this_address);
					var key = arr[0];
					li = li.replace('{$2}',arr.length);
					li = li.replace('{$3}',key);

					var html = li;
					for (var i=1,z_index=arr.length-1; i<arr.length; i++,z_index--){
						this_address += arr[i]+'/';
						li = add_more.replace(/@1@/g,this_address);
						li = li.replace('{$2}',z_index);
						li = li.replace('{$3}',arr[i]);
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
					need_width += $(this).outerWidth()+ $sizeInt($(this).css('margin-left'))+5;
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
				var url=$("input.path").val();//保持文件夹最后有一个/
				url = url.replace(/\\/g,'/');
				$("input.path").val(url);
				if (url.substr(url.length-1,1)!='/'){
					url+='/';
				}

				var temp_path = '*public*/';
				ui.path.list(url);
				ui.header.addressSet();
			},

			//转到上层目录
			gotoFather:function(){
				var path=$("input.path").val();
				var len=path.length-1;
				var gopath='';
				var count=(path.split('/')).length-1;
				if (count==1){//只出现一次'/'，即为根目录，上层目录是自己
					gopath=path;	
				}else{
					if (path.substr(len,1)=='/'){
						len=len-1;
					}
					for (var i=len; i>0; i--){
						if (path.substr(len,1)!='/'){
							len--;
						}else {
							break;
						}
					}
					gopath=path.substr(0,len+1);		
				}
				$("input.path").val(gopath);
				ui.header.gotoPath();
			}
		}
	}
});
