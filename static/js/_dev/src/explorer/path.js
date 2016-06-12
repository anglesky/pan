//对文件打开，文件操作的封装
define(function(require, exports) {
	var pathOperate  = require('../../common/pathOperate');
	var pathOpen 	 = require('../../common/pathOpen');
	var selectByChar = undefined;//键盘选择记录
	ui.pathOpen = pathOpen;

	//打开目录。更新文件列表，ajax方式
	var list = function(path,tips,callback){//
		if (path == undefined) return;
		if (Config.pageApp!='explorer') {
			core.explorer(path);
			return;
		};
		if (path == G.this_path){
			if (tips != undefined && tips!='') {
				core.tips.tips(LNG.path_is_current,'info');
			}
			return; //如果相同，则不加载。
		}
		//统一处理地址
		G.this_path = path.replace(/\\/g,'/');
		G.this_path = path.replace(/\/+/g,'/');
		if (G.this_path.substr(G.this_path.length-1) !='/') {
			G.this_path+='/';
		}
		if ($('.dialog_file_upload').length>0) {
			var ishidden = $('.dialog_file_upload').css("visibility")=='hidden';
			core.upload();
			if (ishidden) {
				$('.dialog_file_upload').css("visibility",'hidden');
			}
		}
		ui.f5_callback(function(){
			if(typeof(callback) == 'function')callback();
		});
		history.add();
	};
	var history = (function(){
		var history_list = [];
		var history_max = 60;
		var index = 0;
		var add = function(){
			if (G.this_path == history_list[history_list.length-1]){
				_refresh();
				return;
			}
			if (index!= history_list.length-1) {
				history_list = history_list.slice(0,index+1);
			}
			history_list.push(G.this_path);
			index = history_list.length-1;//重置
			_refresh();
		};
		var next = function(){
			if (index+1<=history_list.length-1) {
				index = index+1;
				G.this_path = history_list[index];
				ui.f5(true,true);
				_refresh();
			}
		}
		var back = function(){
			if (index-1>=0) {
				index = index-1;
				G.this_path = history_list[index];
				ui.f5(true,true);
				_refresh();
			}
		}
		var _refresh = function(){
			if (index == history_list.length-1){
				$('#history_next').addClass('active');
			}else{
				$('#history_next').removeClass('active');
			}
			if (index == 0){
				$('#history_back').addClass('active');
			}else{
				$('#history_back').removeClass('active');
			}
		}
		return {
			add:add,
			back:back,
			next:next,
			list:function(){
				return history_list;
			}
		}
	})();

	//得到json中，获取新建文件名  dom节点的位置。
	//新建文件(保持排序队形不变)
	var _getCreatePos = function(str,type){
		var list    = "",i,j,offset=0,
			folderlist  = G.json_data['folderlist'],
			filelist    = G.json_data['filelist'],
			sort_list	= folderlist,
			sort_key	= G.list_sort_field,
			sort_order  = G.list_sort_order;
		var temp_new = {'name':str,'size':0,'ext':type,'mtime':date('Y/m/d H:i:s',time())};
		if (Config.pageApp == 'desktop') {
			offset += $('.menuDefault').length+1;
		}
		if(type == 'file'){
			temp_new['ext'] = core.pathExt(str);
			sort_list = filelist;
			if (sort_order == 'up'){
				offset += folderlist.length;
			}
		}else{
			if (sort_order == 'down'){
				offset += filelist.length;
			}
		}
		for (i=0;i<sort_list.length; i++){//直到比str大，返回该位置
			if (sort_order == 'down'){
				if (sort_list[i][sort_key]<temp_new[sort_key]) break;
			}else{
				if (sort_list[i][sort_key]>=temp_new[sort_key]) break;
			}
		}
		return i+offset-1;
	};

	//设置某个文件[夹]选中。传入字符串或数组
	var _setSelectByFilename = function(name) {
		if (name == undefined) return;
		if (typeof(name) == 'string') {
			name = [name];
		}
		fileLight.clear();
		$('.fileContiner .file').each(function(key,value){
			var current_name = fileLight.name($(this));
			if ($.inArray(current_name,name) !=-1){
				$(Global.fileListAll).eq(key).addClass(Config.SelectClassName);
			}
		});
		fileLight.select();
		fileLight.setInView();
	};

	//设置某个文件[夹]选中。传入字符串或数组
	var _setSelectByChar = function(ch) {
		if (ch == '') return;
		//初始化数据
		ch = ch.toLowerCase();
		if (selectByChar == undefined
			|| G.this_path != selectByChar.path 
			|| ch != selectByChar.key ) {
			var arr = [];
			$('.fileContiner .file').each(function(){
				var current_name = fileLight.name($(this));
				if (!current_name) return;
				if (ch == current_name.substring(0,ch.length).toLowerCase()){
					arr.push(current_name);
				}
			});
			selectByChar = {key:ch,path:G.this_path,index:0,list:arr};
		}
		
		if (selectByChar.list.length == 0) return;//没有匹配项
		//自动从匹配结果中查找
		_setSelectByFilename(selectByChar.list[selectByChar.index++]);
		if (selectByChar.index == selectByChar.list.length) {
			selectByChar.index = 0;
		}
	};

	//搜索当前文件夹 含有字母
	var _setSearchByStr = function(ch) {
		if (ch == ''){
			fileLight.clear();
			return;
		}
		fileLight.clear();
		$('.fileContiner .file').each(function(key,value){
			var current_name = fileLight.name($(this));
			if (current_name.toLowerCase().indexOf(ch) != -1){
				$(Global.fileListAll).eq(key).addClass(Config.SelectClassName);
			}
		});
		fileLight.select();
		fileLight.setInView();
	};

	//查找json中，文件名所在的数组位置。
	var _arrayFind = function(data,key,str){
		var m=data.length;
		for(i=0;i<m;i++){
			if(data[i][key]==str) return data[i];
		}
	};
	//重名&新建  文件[夹]名是否存在检测()
	var _fileExist = function(filename){
		var list="";
		var is_exist=0;
		if (G.json_data['filelist']!=null) {
			list=_arrayFind(G.json_data['filelist'],'name',filename);//重名检测
			if(list!=null){ 
				is_exist=1;
			}       
		}
		if (G.json_data['folderlist']!=null) {
			list=_arrayFind(G.json_data['folderlist'],'name',filename);//重名检测
			if(list!=null){ 
				is_exist=1;
			}
		}
		return is_exist;
	}
	//获得文件名,同名则结尾自增  folder--folder(1)--folder(2)
	var _getName = function(filename,ext){
		var i = 0,lastname;
		if (ext == undefined) {//文件夹
			if(!_fileExist(filename)){
				return filename;
			}
			lastname = filename+'(0)';
			while(_fileExist(lastname)){
				i++;
				lastname = filename+'('+i+')';
			}
			return lastname;
		}else{
			if(!_fileExist(filename+'.'+ext)){
				return filename+'.'+ext;
			}
			lastname = filename+'(0).'+ext;
			while(_fileExist(lastname)){        
				i++;
				lastname = filename+'('+i+').'+ext;
			}
			return lastname;            
		}
	};

	//====================桌面、文件管理器专用部分====================
	var newFile = function(newname_ext) {
		fileLight.clear();
		if (newname_ext == undefined) newname_ext = 'txt';
		var newname     = "newfile";
		var is_exist    = 0;
		var newname     = _getName(newname,newname_ext);
		var pos         = _getCreatePos(newname,'file');

		//编辑区
		var edit_html = "<textarea class='newfile fix'>"+newname+"</textarea>";
		if(G.list_type == 'list'){//list
			edit_html = "<input class='newfile fix' value='"+newname+"'/>"
		}

		var listhtml=
		'<div class="file select menufile file_icon_edit"  id="makefile">\
			<div class="'+newname_ext+' ico"></div>\
			<div class="titleBox">\
				<span class="title"><div class="textarea">'+edit_html+'</div></span>\
			</div>\
			<div style="clear:both;"></div>\
		</div>';

		var parent_class = '.file';
		if(G.list_type == 'list'){//list
			listhtml = '<div class="file_list_cell">'+listhtml+'</div>';
			parent_class = '.file_list_cell';
		}
		if (pos==-1){
			$(Config.FileBoxSelector).html(listhtml+$(Config.FileBoxSelector).html());      
		}else {
			$(listhtml).insertAfter(Config.FileBoxSelector+" "+parent_class+":eq("+pos+")");
		}
		if (Config.pageApp == 'desktop') {
			ui.sort_list();
		}

		// dom 
		var $textarea   = $(".textarea .newfile");
		var textarea    = $textarea.get(0);
		// 处理选中文件名部分
		var selectlen=newname.length-newname_ext.length-1;
		if($.browser.msie){//IE
			var range = textarea.createTextRange();
			range.moveEnd('character', -textarea.value.length);         
			range.moveEnd('character', selectlen);
			range.moveStart('character', 0);
			range.select();
		}else{//firfox chrome ...
		   textarea.setSelectionRange(0,selectlen);
		}

		$textarea.focus();
		$textarea.unbind('keydown').keydown(function(event) {
			if (event.keyCode == 13 || event.keyCode == 27){
				//捕获键盘事件 enter  esc
				stopPP(event);
				event.preventDefault();//阻止编辑器回车
				filename=$textarea.attr('value');//获取编辑器值
				if(trim(filename)==''){
					$("#makefile").remove();
					core.tips.tips(LNG.error,'warning');
					return;
				}
				if(_fileExist(filename)){
					$("#makefile").remove();
					core.tips.tips(LNG.path_exists,'warning');
				}else{
					pathOperate.newFile(G.this_path+filename,function(){
						ui.f5_callback(function() {
							_setSelectByFilename(filename);
						});
					});
				}
			}
			return true;
		}); 
		$textarea.unbind('blur').blur(function(){   
			filename=$textarea.attr('value');//获取编辑器值
			if(trim(filename)==''){
				$("#makefile").remove();
				core.tips.tips(LNG.error,'warning');
				return;
			}
			if(_fileExist(filename)){
				$("#makefile").remove();
				core.tips.tips(LNG.path_exists,'warning');
				_newFile(newname_ext);
			}else{           
				pathOperate.newFile(G.this_path+filename,function(){
					ui.f5_callback(function() {
						_setSelectByFilename(filename);
					});
				});
			}
		});
	};
	//新建文件夹
	var newFolder = function() {
		fileLight.clear();
		var newname=LNG.newfolder;
		var is_exist=0;
		var newname=_getName(newname);//如果重复，则自动追加字符
		var pos=_getCreatePos(newname,'folder');

		//编辑区
		var edit_html = "<textarea class='newfile fix'>"+newname+"</textarea>";
		if(G.list_type == 'list'){//list
			edit_html = "<input class='newfile fix' value='"+newname+"'/>"
		}

		var listhtml='<div class="file select menufolder file_icon_edit" id="makefile">';
		listhtml+='<div class="folder ico" filetype="folder"></div>';
		listhtml+='<div  class="titleBox">';
		listhtml+='<span class="title"><div class="textarea">'+edit_html+'</div></span></div><div style="clear:both;"></div></div>';
		
		var parent_class = '.file';
		if(G.list_type == 'list'){//list
			listhtml = '<div class="file_list_cell">'+listhtml+'</div>';
			parent_class = '.file_list_cell';
		}
		if (pos==-1){//空目录时
			$(Config.FileBoxSelector).html(listhtml+$(Config.FileBoxSelector).html());      
		}else {
			$(listhtml).insertAfter(Config.FileBoxSelector+" "+parent_class+":eq("+pos+")");
		}
		if (Config.pageApp == 'desktop') {
			ui.sort_list();
		}
		
		$('.textarea .newfile').select();
		$('.textarea .newfile').focus();
		$('.textarea .newfile').unbind('keydown').keydown(function(event) {
			if (event.keyCode == 13 || event.keyCode == 27) {
				stopPP(event);
				event.preventDefault();//阻止编辑器回车
				var filename=$('.newfile').attr('value');//获取编辑器值
				if(trim(filename)==''){
					$("#makefile").remove();
					core.tips.tips(LNG.error,'warning');
					return;
				}
				if(_fileExist(filename)){
					$("#makefile").remove();
					core.tips.tips(LNG.path_exists,'warning');
				}else{
					pathOperate.newFolder(G.this_path+filename,function(){
						if (Config.pageApp == 'explorer') {
 							ui.tree.checkIfChange(G.this_path);
	  					}
						ui.f5_callback(function() {
							_setSelectByFilename(filename);
						});
					});
				}
			}
		});
		$('.textarea .newfile').unbind('blur').blur(function(){//编辑框事件处理
			filename=$('.textarea .newfile').attr('value');//获取编辑器值
			if(trim(filename)==''){
				$("#makefile").remove();
				core.tips.tips(LNG.error,'warning');
				return;
			}
			if(_fileExist(filename)){
				$("#makefile").remove();
				core.tips.tips(LNG.path_exists,'warning');
				_newFolder();
			}else{
				pathOperate.newFolder(G.this_path+filename,function(){
					if (Config.pageApp == 'explorer') {
						ui.tree.checkIfChange(G.this_path);
					}					
					ui.f5_callback(function() {
						_setSelectByFilename(filename);
					});
				});
			}
		});
	};

	//重命名
	var rname = function() {
		var rname_to    = "";       
		var path        = "";
		var selectname  = "";//成功后选中的名称
		var selectObj   = Global.fileListSelect;
		var selectid    = fileLight.name(selectObj);
		var selecttype  = fileLight.type(selectObj);
		if(selectObj.length !=1) return;
		if(selectObj.hasClass('menuSharePath')){
			ui.path.share_edit();
			return;//分享、不能重命名
		}

		selecttype= (selecttype=='folder'?'folder':selecttype);
		//编辑区
		var the_value = $(selectObj).find(".title").text();
		var edit_html = "<textarea class='fix' id='pathRenameTextarea'>"+the_value+"</textarea>";
		selectObj.addClass('file_icon_edit');
		if(G.list_type == 'list'){//list
			edit_html = "<input class='fix' id='pathRenameTextarea' value='"+the_value+"'/>";
		}
		$(selectObj).find(".title").html("<div class='textarea'>"+edit_html+"<div>");

		var $textarea   = $("#pathRenameTextarea");
		var textarea    = $textarea.get(0);
		if (selecttype=='folder') {
			$textarea.select();
		}else{//若为文件，则只选中名称部分
			var selectlen=selectid.length-selecttype.length-1;
			if($.browser.msie){//IE
				var range = textarea.createTextRange();
				range.moveEnd('character', -textarea.value.length);         
				range.moveEnd('character', selectlen);
				range.moveStart('character', 0);
				range.select();
			}else{//firfox chrome ...
			   textarea.setSelectionRange(0,selectlen);
			}
		}
		$textarea.unbind('focus').focus();
		$textarea.keydown(function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();//阻止编辑器回车
				stopPP(event);
				rname_to=$textarea.attr('value');//获取编辑器值
				if (selecttype == 'oexe') rname_to+='.oexe';
				var select_name = rname_to;//重命名后选中文件。
				if (rname_to!=selectid){
					path    =urlEncode(G.this_path+selectid);
					rname_to=urlEncode(G.this_path+rname_to);
					pathOperate.rname(path,rname_to,function(){
						if (Config.pageApp == 'explorer') {
 							ui.tree.checkIfChange(G.this_path);
	  					}
						ui.f5_callback(function() {
							_setSelectByFilename(select_name);
						});
					});
				}else{
					ui.f5(false,false);
				}
			}
			if ( event.keyCode == 27){
				if (selecttype == 'oexe') selectid =selectid.replace('.oexe','');
				$(selectObj).find(".title").html(selectid);
			}
		}); 
		$textarea.unbind('blur').blur(function(){
			rname_to=$('#pathRenameTextarea').attr('value');//获取编辑器值
			if (selecttype == 'oexe') rname_to+='.oexe';
			var select_name = rname_to;//重命名后选中文件。
			if (rname_to!=selectid){
				path    =urlEncode(G.this_path+selectid);
				rname_to=urlEncode(G.this_path+rname_to);
				pathOperate.rname(path,rname_to,function(){
					if (Config.pageApp == 'explorer') {
						ui.tree.checkIfChange(G.this_path);
					}
					ui.f5_callback(function() {
						_setSelectByFilename(select_name);
					});
				});
			}else{
				ui.f5(false,false);
			}
		});
	};
	var refreshCallback=function(callback){//当前目录文件变化，刷新目录
		ui.f5();
		if (Config.pageApp == 'explorer') {
			ui.tree.checkIfChange(G.this_path);
		}
	};

	//构造参数 操作文件[夹]【选中数据】
	var _param = function(makeArray){
		if (makeArray) {//多个数据操作
			var list = [];
			if (Global.fileListSelect.length == 0) return list;
			Global.fileListSelect.each(function(index){
				var path = fileLight.path($(this));
				var type = fileLight.type($(this))=='folder' ? 'folder':'file';
				list.push({path:path,type:type});
			});
			return list;
		}else{// 单个操作  返回
			if (Global.fileListSelectNum !=1) return {path:'',type:''};//默认只能打开一个
			var selectObj= Global.fileListSelect;
			var path = fileLight.path(selectObj);
			var type = fileLight.type(selectObj);
			return {path:path,type:type};
		}
	};

	var _share_path_exist_check = function(sid){
		var current_arr;
		if(G.json_data.share_list[sid]['type'] == 'folder'){
			current_arr = G.json_data.folderlist;
		}else{
			current_arr = G.json_data.filelist;
		}
		for (var i = 0; i < current_arr.length; i++) {
			var obj = current_arr[i];
			if(current_arr[i]['sid'] == sid){
				if(typeof(obj['exists'])=='number' && obj['exists']==0){
					return false;
				}else{
					return true;
				}
			}
		}
	};

	//获取json_data 中find_key为value的元素
	var get_jsondata_cell = function(find_key,value){
		for (var key in G.json_data) {
			if(key !='filelist' && key !='folderlist') continue;
			for (var i = 0; i < G.json_data[key].length; i++) {
				if(G.json_data[key][i][find_key] == value){
					return G.json_data[key][i];
				}
			}
		}
	}

	return {
		//app
		history:history,
		get_jsondata_cell:get_jsondata_cell,
		appEdit:function(create){
			if (create) {
				pathOperate.appEdit(0,0,'user_add');
			}else{
				var code = Global.fileListSelect.attr('data-app');
				var data = json_decode(base64_decode(code));
				data.path = fileLight.path(Global.fileListSelect);
				pathOperate.appEdit(data);
			}
		},
		appList:function(){pathOperate.appList(_param().path);},
		appInstall:function(){pathOperate.appInstall(_param().path);},

		//open
		openEditor 	:function(){pathOpen.openEditor(_param().path);},
		openIE 		:function(){pathOpen.openIE(_param().path);},
		open:function(path){
			if (Config.pageApp=='editor') {//编辑器中oexe打开
				pathOpen.open(path);
				return;
			}
			if (path != undefined){
				pathOpen.open(path);
				return;
			}
			if(Global.fileListSelect.length == 0){
				return;
			}
			var param = _param();
			var selectObj= Global.fileListSelect;
			if (inArray(core.filetype['image'],param.type) ) {
				//没有下载权限
				//if (!core.authCheck('explorer:fileDownload',LNG.no_permission_download)) return;
				//TODO picasa
				ui.picasa.initData();
				if (G.list_type=='icon' || Config.pageApp == 'desktop') {
					ui.picasa.play($(selectObj).find('.ico'));
				}else{
					ui.picasa.play($(selectObj));
				}
				return;
			}

			if($(selectObj).find('.file_not_exists').length!=0){
				core.tips.tips(LNG['share_error_path'],false);
				return;
			}
			//oexe 的打开
			if (param.type == 'oexe') {
				var code = selectObj.attr('data-app');
				param.path = json_decode(base64_decode(code));
			}
			if (G.json_data['info']['path_type']== G.KOD_USER_SHARE){
				//share_edit share_open_window open_the_path
				if(G.json_data['info']['id'] == G.user_id){
					ui.path.open_the_path();
					return;
				}			
			}
			pathOpen.open(param.path,param.type);
		},
		play:function(){
			if (Global.fileListSelectNum <1) return;
			var list = [];//选中单个&多个都可以播放
			Global.fileListSelect.each(function(index){
				var pathtype = fileLight.type($(this));
				if (inArray(core.filetype['music'],pathtype)
					|| inArray(core.filetype['movie'],pathtype)) {
					var url = core.path2url(fileLight.path($(this)));
					list.push(url);
				}
			});
			pathOpen.play(list,'music');
		},

		//operate
		pathOperate:pathOperate,
		share   :function(){pathOperate.share(_param());},
		setBackground   :function(){pathOperate.setBackground(_param().path);},
		createLink      :function(){
			pathOperate.createLink(_param().path,_param().type,function(data){
				ui.f5_callback(function(){
					_setSelectByFilename(data.info);
				});
			});
		},
		createProject   :function(){
			pathOperate.createProject(_param().path,function(data){
				ui.f5_callback(function(){
					_setSelectByFilename(data.info);
				});
			});
		},
		download:function(){
			var theList = _param(true);
			if (theList.length==1 && theList[0]['type']=='file') {//单个文件下载
				pathOpen.download(_param().path);
			}else{//多个文件或文件夹下载(压缩后下载)
				pathOperate.zipDownload(theList);
			}
		},

		share_edit:function(){
			var cell_info = get_jsondata_cell('path',_param().path);
			var share_info = G.json_data['share_list'][cell_info['sid']];
			pathOperate.share_box(share_info);
		},

		share_open_window:function(){
			var cell_info = get_jsondata_cell('path',_param().path);			
			var shareType = cell_info.type;
			if (cell_info.type=='folder') {
				if (cell_info.code_read == 1) {
					shareType = 'code_read';
				}else{
					shareType = 'folder';
				}
			}
			var share_url = './index.php?share/'+shareType+'&user='
				+G.json_data['info']['id']+"&sid="+cell_info.sid;
			window.open(share_url);
		},
		open_the_path:function(){
			var cell_info = get_jsondata_cell('path',_param().path);
			var share_info = G.json_data['share_list'][cell_info['sid']];
			var path = core.pathFather(share_info['path']);
			var name = core.pathThis(share_info['path']);

			if(share_info['type']=="folder"){
				ui.path.list(share_info['path'],'');
			}else{
				ui.path.list(path,'',function(){
					_setSelectByFilename(name);
				});
			}			
		},
		recycle_clear:function(){
			$.dialog({
				id:'dialog_path_remove',
				fixed: true,//不跟随页面滚动
				icon:'question',
				title:LNG.remove_title,
				padding:40,
				lock:true,
				background:"#000",
				opacity:0.2,
				content:LNG.recycle_clear_info,
				ok:function() {
					$.ajax({
						url: 'index.php?explorer/pathDeleteRecycle',
						beforeSend:function(){
							core.tips.loading();
						},
						error:core.ajaxError,
						success: function(data) {
							core.tips.close(data);
							ui.f5();
							FrameCall.father('ui.f5','');
							if (typeof(callback) == 'function')callback(data);
						}
					});
				},
				cancel: true
			});
		},
		explorer:function(){
			core.explorer(_param().path);
		},
		explorerNew:function(){
			window.open('index.php?/explorer&path='+_param().path);
		},
		openProject:function(){
			core.explorerCode(_param().path);
		},
		search 	:function(){core.search('',_param().path);},
		fav 	:function(){
			var p=_param();
			p.name = core.pathThis(p.path);
			pathOperate.fav(p);
		},
		remove 	:function(){
			var list = _param(true);
			if (G.json_data['info']['path_type']== G.KOD_USER_SHARE &&
				G.json_data['info']['id'] == G.user_id) {
				$.each(list,function(i,v){//取消分享
					list[i]['type'] = 'share';
					var cell = get_jsondata_cell('path',list[i]['path']);
					list[i]['path'] = cell['sid'];
				});
			}
			pathOperate.remove(list,refreshCallback);
			fileLight.clear();
		},
		copy 	:function(){pathOperate.copy(_param(true));},
		cute 	:function(){pathOperate.cute(_param(true),ui.f5);},
		zip 	:function(){
			pathOperate.zip(_param(true),function(data){
				ui.f5_callback(function(){
					_setSelectByFilename(data.info);
				});
			});
		},
		unZip 	:function(create_folder){pathOperate.unZip(_param().path,ui.f5,create_folder);},
		cuteDrag:function(dragTo){pathOperate.cuteDrag(_param(true),dragTo,refreshCallback);},
		copyDrag:function(dragTo,isDragCurrent){
			pathOperate.copyDrag(_param(true),dragTo,function(list){
				fileLight.clear();
				if (Config.pageApp == 'explorer'){
					ui.tree.checkIfChange(G.this_path);
				}
				ui.f5_callback(function() {
					if (isDragCurrent && list['data']){
						_setSelectByFilename(list.data);
					}
				});
			},isDragCurrent);
		},
		copyTo:function(){
			core.path_select('folder',LNG.copy_to,function(path){
				pathOperate.copyDrag(_param(true),path,function(list){
					fileLight.clear();
				},false);
			});
		},
		cuteTo:function(){
			core.path_select('folder',LNG.cute_to,function(path){
				pathOperate.cuteDrag(_param(true),path,refreshCallback);
			});
		},
		info:function(){pathOperate.info(_param(true));},
		past:function(){
			fileLight.clear();
			pathOperate.past(G.this_path,function(list){
				if (Config.pageApp == 'explorer') {
					ui.tree.checkIfChange(G.this_path);
				}
				ui.f5_callback(function() {
					_setSelectByFilename(list);
				});
			});
		},
		//内部特有的
		list:list,
		newFile:newFile,
		newFolder:newFolder,
		rname:rname,
		setSearchByStr:_setSearchByStr,
		setSelectByChar:_setSelectByChar,
		setSelectByFilename:_setSelectByFilename,
		clipboard:pathOperate.clipboard
	}
});