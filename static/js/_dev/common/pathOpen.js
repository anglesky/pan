define(function(require, exports) {
	//双击或者选中后enter 打开 执行事件
	//或者打开指定文件
	var _open = function(path,ext){
		if (path == undefined) return;
		if (ext == undefined) ext = core.pathExt(path);//没有扩展名则自动解析
		ext = ext.toLowerCase();
		if(!core.path_can_read(path)){
			core.tips.tips(LNG.no_permission_read_all,false);
			return;
		}
		if (ext == 'folder'){
			if (Config.pageApp == 'explorer'){
				ui.path.list(path+'/');//更新文件列表
			}else{
				core.explorer(path);
			}
			return;
		}
		if (ext == 'oexe') {
			//搜索中含有oexe的打开；直接打开指定oexe文件
			if (typeof(path) == 'string'){
				var file_path = path;
				if (typeof(path) != 'string') {
					file_path = path.content.split("'")[1]
				};
				core.file_get(file_path,function(data){
					var obj = json_decode(data);
					obj.name = core.pathThis(file_path);
					core.openApp(obj);
				})
			}else{//列表、树目录的打开方式
				core.openApp(path);
			}
			return;
		}

		//文件获取则判断权限
		//if (!core.authCheck('explorer:fileDownload',LNG.no_permission_download)) return;
		if (ext == 'swf') {
			$.dialog({
				resize:true,
				fixed:true,
				ico:core.ico('swf'),
				title:core.pathThis(path),
				width:'75%',
				height:'65%',
				padding:0,
				content:core.createFlash(core.path2url(path))
			});
			return;
		}

		if (ext=='html' || ext =='htm'){
			var url = core.path2url(path);
			_openWindow(url,core.ico('html'),core.pathThis(path));
			return;
		}
		if (inArray(core.filetype['image'],ext)){//单张图片打开
			var url = urlDecode(path);
			if (path.indexOf('http:') == -1) {
				url = core.path2url(url);
			}
			MaskView.image(url);
			return;
		}
		if (inArray(core.filetype['music'],ext) 
			|| inArray(core.filetype['movie'],ext) ) {
			var url = core.path2url(path);
			_player(url,ext);
			return;
		}
		if (inArray(core.filetype['doc'],ext) || ext=='pdf'){
			_openOffice(path);
			return;
		}
		if (inArray(core.filetype['text'],ext)||
			inArray(core.filetype['code'],ext)){
			_openEditor(path);//代码文件，编辑
			return ;
		}
		//未知文件
		if (Config.pageApp == 'editor'){
			core.tips.tips(ext+LNG.edit_can_not,false);
		}else{
			_unknow_open(path,'');
		}
	}

	var _unknow_open = function(path,tips){
		var content = '<div class="unknow_file" style="width:260px;word-break: break-all;"><span>'
			+LNG.unknow_file_tips+'<br/>'+tips+'</span><br/>'
			+'<a class="btn btn-default btn-sm" href="javascript:ui.pathOpen.openEditorForce(\''+path+'\');"> '+LNG.edit+' </a>&nbsp;'
			+'<a class="btn btn-success btn-sm ml-15" href="javascript:ui.path.download(\''+path+'\');"> '+LNG.unknow_file_download+' </a></div>'
		$.dialog({
			id:'open_unknow_dialog',
			fixed: true,//不跟随页面滚动
			icon:'warning',
			title:LNG.unknow_file_title,
			padding:30,
			content:content,
			cancel: true
		});
		$('.unknow_file a').unbind('click').bind('click',function(){
			artDialog.list['open_unknow_dialog'].close();
		});
	}
	var _download = function(path,is_remove){
		if (!core.authCheck('explorer:fileDownload',LNG.no_permission_download)) return;
		if (!path) return;
		if(!core.path_can_read(path)){
			core.tips.tips(LNG.no_permission_read_all,false);
			return;
		}
		var the_url = 'index.php?explorer/fileDownload&path='+urlEncode2(path);
		if (typeof(G['share_page']) != 'undefined') {
			the_url = 'index.php?share/fileDownload&user='+G.user+'&sid='+G.sid+'&path='+urlEncode2(path);
		}
		var html = '<iframe src="'+the_url+'" style="width:50px;height:50px;border:0;" frameborder=0></iframe>'+
					LNG.download_ready +'...';
		var dlg = $.dialog({
			icon:'succeed',
			title:false,
			time:1,
			content:html
		});
		dlg.DOM.wrap.find('.aui_loading').remove();
	};
	//新的页面作为地址打开。鼠标右键，IE下打开
	var _openIE = function(path){
		//if (!core.authCheck('explorer:fileDownload')) return;	
		if (path==undefined) return;
		if(!core.path_can_read(path)){
			core.tips.tips(LNG.no_permission_read_all,false);
			return;
		}		
		var url=core.path2url(path);
		window.open(url);
	};
	var _openWindow = function(url,ico,title,name) {
		if (!url) return;
		if (name == undefined) name = 'openWindow'+UUID();

		var html = "<iframe frameborder='0' name='Open"+name+"' src='"+url+
				"' style='width:100%;height:100%;border:0;'></iframe>";
		//$.dialog({
		art.dialog.through({
			id:name,
			title:title,
			ico:ico,
			width:'78%',
			height:'70%',
			padding:0,
			content:html,
			resize:true
		});
	};
	var _openEditor = function(path){
		//if (!core.authCheck('explorer:fileDownload',LNG.no_permission_download)) return;
		if (!path) return;
		if(!core.path_can_read(path)){
			core.tips.tips(LNG.no_permission_read_all,false);
			return;
		}
		var ext = core.pathExt(path);
		var iswin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
		if(G.office_have && inArray(core.filetype['doc'],ext)){
			if(!iswin){
				core.tips.tips("windows 系统才支持编辑",false);
			}else{
				_openOffice(path,true);
				return;
			}
		}
		var filename = core.pathThis(path);
		if (inArray(core.filetype['bindary'],ext) ||
			inArray(core.filetype['music'],ext) ||
			inArray(core.filetype['image'],ext) ||
			inArray(core.filetype['movie'],ext) ||
			inArray(core.filetype['doc'],ext)
			){
			//core.tips.tips(ext+LNG.edit_can_not,false);
			_open(path,ext);
			return;
		}
		_openEditorForce(path);
	};

	var _openEditorForce = function(path){
		var filename = core.pathThis(path);
		var kod_top = share.system_top();
		if (Config.pageApp == 'editor') {
			FrameCall.child('OpenopenEditor','Editor.add','"'+urlEncode2(path)+'"');//2次
			return;
		}
		if (typeof(kod_top.frames["OpenopenEditor"]) == "undefined") {
			var the_url = './index.php?editor/edit#filename='+urlEncode2(path);
			if (typeof(G['share_page']) != 'undefined') {
				the_url = './index.php?share/edit&user='+G.user+'&sid='+G.sid+'#filename='+urlEncode2(path);
			}
			var title = filename+' ——'+LNG.edit;
			_openWindow(the_url,core.ico('edit'),title.substring(title.length-50),'openEditor');
		}else{
			FrameCall.top('OpenopenEditor','Editor.add','"'+urlEncode2(path)+'"');//2次
		}
		//显示并且显示到最上层		
		var dialog_editer = kod_top.artDialog.list['openEditor'];
		if (dialog_editer) {
			dialog_editer.display(true).zIndex().focus();
        };
	};

	var _openOffice = function(path,is_edit){
		var url = './index.php?explorer/officeView&path='+urlEncode(path);
		if (typeof(G['share_page']) != 'undefined') {
			url = G.app_host+'index.php?share/officeView&user='+G.user+'&sid='+G.sid+'&path='+urlEncode2(path);
		}
		if (typeof(is_edit) != "undefined") {
			url += "&is_edit=1"
		}
		art.dialog.open(url,{
			ico:core.ico('doc'),
			title:core.pathThis(path),
			width:'80%',
			height:'70%',
			resize:true
		});
	}
	//传入音乐播放地址，多个的话传入数组。可以扩展播放网络音乐
	var _player = function(list,ext){
		if (!list) return;
		if (typeof(list) == 'string') list=[list];
		CMPlayer = require('./CMPlayer');
		CMPlayer.play(list,ext);
	};
	//对外接口
	return{
		open:_open,
		play:_player,
		openEditor:_openEditor,
		openEditorForce:_openEditorForce,
		openIE:_openIE,
		download:_download
	}
});
