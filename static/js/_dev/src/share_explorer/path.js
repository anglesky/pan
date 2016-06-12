//对文件打开，文件操作的封装
define(function(require, exports) {
	var pathOperate  = require('../../common/pathOperate');
	var pathOpen 	 = require('../../common/pathOpen');
	var selectByChar = undefined;//键盘选择记录
	ui.pathOpen = pathOpen;

	//打开目录。更新文件列表，ajax方式
	var list = function(path,tips,callback){//
		if (path == undefined) return;
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
		ui.f5_callback(function(){
			if(typeof(callback) == 'function')callback();
		});
		window.location.href="#"+urlEncode(G.this_path);
		history.add();
	};


	var history = (function(){
		var history_list = ['/'];
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
			index = history_list.length-1;
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
			next:next
		}
	})();


	//得到json中，获取新建文件名  dom节点的位置。
	//新建文件(保持排序队形不变)
	var _getCreatePos = function(str,type){
		var list    = "",i,j,offset=0,
			folderlist  =G.json_data['folderlist'],
			filelist    =G.json_data['filelist'];

		if (Config.pageApp == 'desktop') {
			offset = $('.menuDefault').length;
		}
		if (type=='folder'){
			for (i=0;i<folderlist.length; i++){
				//知直到比str大，返回该位置
				if (folderlist[i]['name']>=str) break;
			}
			if (G.list_sort_order == 'up') return i+offset;
			return filelist.length+i+offset;
		}else if(type=='file'){
			for (j=0;j<filelist.length; j++){
				//直到比str大，返回该位置
				if (filelist[j]['name']>=str) break;
			}
			if (G.list_sort_order == 'down') return j+offset;
			return folderlist.length+j+offset;
		}
		return -1;
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
	return {
		//open
		history:history,
		openEditor 	:function(){pathOpen.openEditor(_param().path);},
		openIE 		:function(){pathOpen.openIE(_param().path);},
		open:function(path){
			if (_param().path.length==0) return;
			if (path != undefined) {pathOpen.open(path);return;};
			var param = _param();
			var selectObj= Global.fileListSelect;
			if (inArray(core.filetype['image'],param.type) ) {
				if (G.list_type=='icon' || Config.pageApp == 'desktop') {
					ui.picasa.play($(selectObj).find('.ico'));
				}else{
					ui.picasa.play($(selectObj));
				}
				return;
			}
			//oexe 的打开
			if (param.type == 'oexe') {
				var code = selectObj.attr('data-app');
				param.path = json_decode(base64_decode(code));
			}
			pathOpen.open(param.path,param.type);
		},
		show_file:function(){
			var url = './index.php?share/file&sid='+
					   G.sid+'&user='+G.user+'&path='+urlEncode(_param().path);
			window.open(url);
		},
		openProject:function(){
			core.explorerCode(_param().path);
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
		download:function(){
			var theList = _param(true);
			if (theList.length==1 && theList[0]['type']=='file') {//单个文件下载
				pathOpen.download(_param().path);
			}else{//多个文件或文件夹下载(压缩后下载)
				pathOperate.zipDownload(theList);
			}
		},
		search 	:function(){core.search('',_param().path);},
		info:function(){
			pathOperate.info(_param(true));
		},
		//内部特有的
		list:list,
		setSearchByStr:_setSearchByStr,
		setSelectByChar:_setSelectByChar,
		setSelectByFilename:_setSelectByFilename,
	}
});