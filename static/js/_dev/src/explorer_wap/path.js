//对文件打开，文件操作的封装
define(function(require, exports) {
	var pathOperate  = require('../../common/pathOperate');
	var pathOpen 	 = require('../../common/pathOpen');
	var selectByChar = undefined;//键盘选择记录

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
		window.location.href = 'index.php#'+G.this_path;
		ui.f5_callback(function(){
			if(typeof(callback) == 'function')callback();
		});
	};
	var _open = function(path,ext){
		if (path == undefined) return;
		if (ext == 'folder'){
			ui.path.list(path+'/');//更新文件列表
			return;
		}else{
			var url = core.path2url(path);
			var can_open = ['pdf','mp4','mp3','wma','m4v','mov'];
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
			}else if (inArray(core.filetype['doc'],ext) || ext=='pdf'){
				var url = './index.php?explorer/officeView&path='+urlEncode(path);
				if (typeof(G['share_page']) != 'undefined') {
					url = G.app_host+'index.php?share/officeView&user='+G.user+'&sid='+G.sid+'&path='+urlEncode2(path);
				}
				window.location.href= url;
			}else if (inArray(core.filetype['image'],ext) || 
				inArray(can_open,ext) ||
				inArray(core.filetype['text'],ext) ||
				inArray(core.filetype['code'],ext)) {
				window.location.href= url;
			}else{
				var the_url = 'index.php?explorer/fileDownload&path='+urlEncode2(path);;
				var content = '<div class="unknow_file" style="width:200px;word-break: break-all;"><span>'
					+LNG.unknow_file_tips+'<br/>'
					+'</span><br/><a class="btn btn-success btn-sm" href="'+the_url+'"> '+LNG.unknow_file_download+' </a></div>'
				$.dialog({
					fixed: true,//不跟随页面滚动
					icon:'warning',
					width:30,
					lock:true,
					background:'#000',
					opacity:0.2,
					title:LNG.unknow_file_title,
					padding:10,
					content:content,
					cancel: true
				});
			}			
		}
	}

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

	//新建文件夹
	var newFolder = function() {
		var dialog = artDialog.prompt('',function(value){
			pathOperate.newFolder(G.this_path+value,function(){
				ui.f5();
			});
		},_getName('folder'));
	};

	//重命名
	var rname = function(path) {
		var dialog = artDialog.prompt('',function(value){
			var file_path =urlEncode(G.this_path+path);
			var rname_to=urlEncode(G.this_path+value);
			pathOperate.rname(file_path,rname_to,function(){
				ui.f5();
			});	
		},path);
	};

	//构造参数 操作文件[夹]【选中数据】
	var _param = function(makeArray,path,type){
		if (type!='folder') {
			type = 'file';
		};
		if (makeArray) {//多个数据操作
			return [{path:G.this_path+path,type:type}];
		}else{// 单个操作  返回
			return {path:G.this_path+path,type:type};
		}
	};
	return {
		//operate
		pathOperate:pathOperate,
		download:function(path,type){
			if (type=='folder') {//单个文件下载
				pathOperate.zipDownload([{path:G.this_path+path,type:'folder'}]);
			}else{//多个文件或文件夹下载(压缩后下载)
				pathOpen.download(G.this_path+path);
			}
		},
		remove 	:function(path,type){
			pathOperate.remove(_param(true,path,type),null);
		},
		copy 	:function(path,type){pathOperate.copy(_param(true,path,type));},
		cute 	:function(path,type){pathOperate.cute(_param(true,path,type),ui.f5);},
		info:function(path,type){
			//pathOperate.remove(_param(true,path,type),null);
			pathOperate.info(_param(true,path,type));
		},
		past:function(){
			pathOperate.past(G.this_path,ui.f5);
		},

		//内部特有的
		open:_open,
		list:list,
		newFolder:newFolder,
		rname:rname
	}
});