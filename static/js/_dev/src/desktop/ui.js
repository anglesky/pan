﻿define(function(require, exports) {
	//ajax后重置数据、重新绑定事件(f5或者list更换后重新绑定)
    var MyPicasa    = new Picasa();
	var _ajaxLive = function(){		
		fileLight.init();
		ui.setStyle();
		//幻灯片播放绑定
        MyPicasa.initData();
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
					case 8:ui.path.remove();isStopPP=true;break;//ctrl+backspace remove
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
					case 8:isStopPP=true;break;//backspace
					case 35:fileSelect.selectPos('end');break;
					case 36:fileSelect.selectPos('home');break;
					case 37:fileSelect.selectPos('left');isStopPP=true;break;
					case 38:fileSelect.selectPos('up');break;
					case 39:fileSelect.selectPos('right');isStopPP=true;break;
					case 40:fileSelect.selectPos('down');break;
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
			if (e.shiftKey) Global.shiftKey = false;
			if (e.keyCode == cmmand || !e.ctrlKey) Global.ctrlKey = false;//win=ctrl
		});
	};
	var _ieCss = function(){//图标竖排统一用js处理；css实在是各种兼容问题
		//if (!$.browser.msie && navigator.userAgent.indexOf("Firefox")<0) return;
		var top 	= 10;
		var left 	= 10;
		var width 	= 85;
		var height 	= 100;
		var margin 	= 10;

		var w_height= $(document).height() - 50;
		var col_num   = Math.floor((w_height-top)/(height+margin));
		var row=0,col=0,x=0,y=0;
		$('.fileContiner .file').css('position','absolute');
		$('.fileContiner .file').each(function(i){
			row = i%col_num;
			col = Math.floor(i/col_num);
			x = left + (width+margin)*col;
			y = top + (height+margin)*row;
			$(this).css({'left':x,'top':y});
		});
	}
	var _hover_title = function(list){
		var html = ' data-path="'+list.path+'" ';
		return  html+'data-name="'+list.name+'" title="'+
				LNG.name+':'+list.name+"&#10;"+
				LNG.size+':'+core.file_size(list['size'])+"&#10;"+
				LNG.permission+':'+list.mode+"&#10;"+
				LNG.create_time+':'+list.ctime+"&#10;"+
				LNG.modify_time+':'+list.mtime+'" ';
	};
	//图标样式，文件夹模版填充
	var _getFolderBox = function(list){
		var html="<div class='file folderBox menufolder' "+_hover_title(list)+">";
		html+="<div class='folder ico' filetype='folder'></div>";
		//分享标记
		if(list['meta_info'] != undefined){
			html+='<div class="'+list['meta_info']+'"></div>';
		}
		html+="<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+list['name']+"</span></div></div>";
		return html;
	}	 

	//图标样式，文件模版填充
	var _getFileBox = function(list){
		var html = '';
		if (list['ext'] == 'oexe' && list['icon'] != undefined) {
			var icon = list.icon;
			if (list.icon.search(G.static_path)==-1
			 && list.icon.substring(0,4) !='http') {
				icon = G.static_path + 'images/app/' + list.icon;
			}
			var code = base64_encode(json_encode(list));
			var display_name = list.name.replace('.oexe','');
			html ="<div class='file fileBox menufile' data-app="+code+_hover_title(list)+">";

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
		}else if (inArray(core.filetype['image'],list['ext'])) {//如果是图片，则显示缩略图
			var filePath = core.path2url(list['path']);
			var thumbPath = 'index.php?explorer/image&path='+urlEncode(list['path']);
			html+="<div class='file fileBox menufile "+_hover_title(list)+">";
			html+="<div picasa='"+filePath+"' thumb='"+thumbPath+"' class='picasaImage picture ico' filetype='"+list['ext']+"' style='background:none'><img src='"+thumbPath+"' draggable='false'/>";
		}else{
			html+="<div class='file fileBox menufile'"+_hover_title(list)+">";
			html+="<div class='"+list['ext']+" ico' filetype='"+list['ext']+"'></div>";
		}

		//分享标记
		if(list['meta_info'] != undefined){
			html+='<div class="'+list['meta_info']+'"></div>';
		}
		html+="<div id='"+list['name']+"' class='titleBox'><span class='title' title='"+LNG.double_click_rename+"'>"+list['name']+"</span></div></div>";
		$(Config.FileBoxSelector+' textarea').autoTextarea({minHeight:32,padding:4});
		return html;
	}
	//文件列表数据填充
	var _mainSetData = function(isFade){
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
			file_html += _getFileBox(filelist[i]);
		}
		for (var i=0;i<folderlist.length;i++){
			folder_html += _getFolderBox(folderlist[i]);
		}
		//end排序方式重组json数据------
		//升序时，都是文件夹在上，文件在下，各自按照字段排序		
		if (G.list_sort_order=='up'){
			html += folder_html+file_html;
		}else{
			html += file_html+folder_html;
		}

		var system = '';//系统应用
		$('.systemBox').each(function(){
			system += $(this).get(0).outerHTML;
		});
		html = system + html;
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
		_ajaxLive();
		_ieCss();
	};
	var _f5 = function(is_data_server,is_animate,callback) {
		if(is_data_server == undefined) is_data_server = true; //默认每次从服务器取数据
		if(is_animate == undefined)		is_animate = false;	   //默认不用渐变动画
		if(!is_data_server){//采用当前数据刷新,用于显示模式更换
			var select_arr = fileLight.getAllName();//获取选中的文件名
			_mainSetData(is_animate);
			ui.path.setSelectByFilename(select_arr);//不刷新数据的话，保持上次选中
		}else{//获取服务器数据
			$.ajax({
				url:'index.php?explorer/pathList&type=desktop&path='+G.this_path,
				dataType:'json',
				//async:false,//同步阻塞.阻塞其他线程，等待执行完成。//解决重命名后设置选中
				error:core.ajaxError,
				success:function(data){
					if (!data.code) {	
						core.tips.tips(data);
						$(Config.FileBoxSelector).html('');
						return false;
					}
					G.json_data = data.data;
					G.json_data['info']['can_upload'] = true;
					_f5_jsondata_filter();
					_mainSetData(is_animate);
					if (typeof(callback) == 'function'){
						callback(data);
					}
				}
			});
			//回收站检查
			$.ajax({
				url:'index.php?explorer/pathList&type=desktop&path='+G.KOD_USER_RECYCLE,
				dataType:'json',
				error:core.ajaxError,
				success:function(data){
					if (!data.code) return false;
					var recycle_image = G.static_path+'images/app/recycle_full.png';
					if (data.data.folderlist.length==0 && data.data.filelist.length==0) {
						var recycle_image = G.static_path+'images/app/recycle.png';
					}
					$('.menuRecycleButton .ico').css('background-image','url("'+recycle_image+'")');
				}
			});	
		}
	};
	var _f5_callback = function(callback){
		_f5(true,false,callback);//默认刷新数据，没有动画,成功后回调。
	};

	//分享文件夹列表
	var _f5_jsondata_filter = function(){
		//时间处理
		if (!G.json_data || !G.json_data['filelist'] || !G.json_data['folderlist']) return;

		if(G.json_data['share_list']!=undefined){
			G.self_share = G.json_data['share_list'];
		}
		for (var key in G.json_data) {
			if(key !='filelist' && key !='folderlist') continue;
			//处理文件&文件夹
			for (var i = 0; i < G.json_data[key].length; i++) {
				G.json_data[key][i]['atime'] = date(LNG.time_type,G.json_data[key][i]['atime']);
				G.json_data[key][i]['ctime'] = date(LNG.time_type,G.json_data[key][i]['ctime']);
				G.json_data[key][i]['mtime'] = date(LNG.time_type,G.json_data[key][i]['mtime']);
				//分享标记
				if(path_is_share(G.json_data[key][i]['path'])){
					G.json_data[key][i]['meta_info'] = 'path_self_share';
				}
			}
		}
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

	return{	
		f5:_f5,
		f5_callback:_f5_callback,
		picasa:MyPicasa,
		setListSort:_setListSort,
		sort_list:_ieCss,
		init:function(){
			$('.hidden').removeClass('hidden');
			_ieCss();
			_f5_callback();//生成文件列表			
			_bindHotKey();			
			$(window).bind("resize",function(){
				ui.setStyle();//浏览器调整大小，文件列表区域调整高宽。
				if ($('#PicasaView').css("display")!="none") {
					MyPicasa.setFrameResize();
				}
				_ieCss();
			});
			$("html").die('click').live('click',function (e) {
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
		setTheme:function(thistheme){
			core.setSkin(thistheme);
			FrameCall.top('OpenopenEditor','Editor.setTheme','"'+thistheme+'"');
			FrameCall.top('Opensetting_mode','Setting.setThemeSelf','"'+thistheme+'"');
			FrameCall.father('ui.setTheme','"'+thistheme+'"');
		},
		setWall:function(img){
			$('.background')
			.attr('src',img)
			.one('load',function(){
				$('.desktop').css('background-image','url('+img+')');
			});
		},
		isEdit:function(){
			var focusTagName = $(document.activeElement).get(0);
			if (!focusTagName) return;
			focusTagName = focusTagName.tagName;
			if (focusTagName == 'INPUT' || focusTagName == 'TEXTAREA'){
				return true;
			}
			return false;			
		},			
		setStyle:function(){//设置文件列表高宽。
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
	}
});
