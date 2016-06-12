define(function(require, exports) {
	var pathOperate  = require('./pathOperate');
	var pathOpen     = require('./pathOpen');
	var successCallback;//节点请求成功后回调
	var isUpdateRefresh = false;//上传连续更新树目录队列方式。没有处理完不做反应，处理完后sleep 2s;
	ui.pathOpen = pathOpen;
	ui.pathOperate = pathOperate;
	var zTree;
	var viewImage = function(){
		if($('#windowMaskView').length!=0 
			&& $('#windowMaskView').css('display')=='block'
			&& inArray(core.filetype['image'],_param().type)){
			pathOpen.open(_param().path,_param().type);
		}
	}

	// 目录树操作
	var init=function(){
		$.ajax({
			url: Config.treeAjaxURL+"&type=init",
			dataType:'json',
			error:function(){
				$('#folderList').html('<div style="text-align:center;">'+LNG.system_error+'</div>');
			},
			success:function(data){
				if (!data.code){
					$('#folderList').html('<div style="text-align:center;">'+LNG.system_error+'</div>');
					return;
				} 
				var tree_json = data.data;
				$.fn.zTree.init($("#folderList"), setting,tree_json);
				zTree = $.fn.zTree.getZTreeObj("folderList");
			}
		});
		$('.ztree .switch').die('mouseenter').live('mouseenter',function(){
			$(this).addClass('switch_hover');
		}).die('mouseleave').live('mouseleave',function(){
			$(this).removeClass('switch_hover');
		});
		if (Config.pageApp == 'editor') {
			Mousetrap.bind('up',function(e) {
				keyAction(e,'up');		    
			}).bind('down',function(e) {
				keyAction(e,'down');
			}).bind('left',function(e) {
				keyAction(e,'left');
			}).bind('right',function(e) {
				keyAction(e,'right');
			});
			Mousetrap.bind('enter',function(e) {
				tree.open();
			}).bind(['del','command+backspace'],function(e) {
				tree.remove();
			}).bind('f2',function(e) {
				stopPP(e);
				tree.rname();
			}).bind(['ctrl+f','command+f'],function(e) {
				stopPP(e);
				tree.search();
			}).bind(['ctrl+c','command+c'],function(e) {
				tree.copy();
			}).bind(['ctrl+x','command+x'],function(e) {
				tree.cute();
			}).bind(['ctrl+v','command+v'],function(e) {
				tree.past();
			}).bind('alt+m',function(e) {
				tree.create('folder');
			}).bind('alt+n',function(e) {
				tree.create('file');
			});
		}
	};
	var keyAction = function(e,action){
		stopPP(e);
		var treeNode = zTree.getSelectedNodes()[0];
		if (!treeNode) return;			
		switch(action){
			case 'up':
				var node = treeNode.getPreNode();
				if (!node) {
					node = treeNode.getParentNode();
				}else if(node.open && node.children.length>0) {
					while(node.open && node.children && node.children.length>=1){
						node = node.children[node.children.length-1];
					}
					//if (node.getParentNode().tId == treeNode.tId) node=treeNode;
				}
				zTree.selectNode(node);
				break;
			case 'down':
				if (treeNode.open && treeNode.children.length>=1){
					node = treeNode.children[0];
				}else{
					var tempNode = treeNode,
						node = tempNode.getNextNode()||tempNode.getParentNode().getNextNode();
					try{
						while(!node){
							tempNode = tempNode.getParentNode();
							node = tempNode.getNextNode()||tempNode.getParentNode().getNextNode();
						}
					}catch(e){}
				}
				zTree.selectNode(node);
				break;
			case 'left':
				if (!treeNode.isParent) {
					zTree.selectNode(treeNode.getParentNode());
				}else{
					if (treeNode.open) {
						zTree.expandNode(treeNode,false);
					}else{
						zTree.selectNode(treeNode.getParentNode());
					}						
				}
				break;
			case 'right':
				if (treeNode.open){
					zTree.selectNode(treeNode.children[0]);	
				}else{
					zTree.expandNode(treeNode,true);
				}
				break;
			default:break;
		}
		viewImage();
	};

	var canDbClickOpen = function(){
		if(Config.pageApp=='editor'){
			return false;
		}
		return true;
	}

	var setting={
		async: {
			enable: true,
			dataType: "json",
			url:Config.treeAjaxURL,//直接上次拿到的json变量。
			autoParam:["ajax_path=path",'tree_icon=tree_icon'],//前面是value 后面是key
			dataFilter: function(treeId,parentNode,responseData){
				if (!responseData.code) return null;
				return responseData.data;
			}
		},
		edit: {
			enable: true,
			showRemoveBtn: false,
			showRenameBtn: false,
			drag:{
				isCopy:false,//暂时屏蔽拖拽方式移动
				isMove:false
				// 	isCopy:true,
				// 	isMove:true,
				// 	prev:false,
				// 	inner:true,
				// 	next:false
			}
		},
		view: {
			showLine: false,
			selectedMulti: false,
			dblClickExpand:canDbClickOpen(),// 双击 展开&折叠
			addDiyDom: function(treeId, treeNode) {
				var spaceWidth = 15;//相差宽度
				var switchObj = $("#" + treeNode.tId + "_switch"),
				icoObj = $("#" + treeNode.tId + "_ico");
				switchObj.remove();
				treeNode.iconSkin = treeNode.tree_icon;

				var tree_icon = treeNode.tree_icon;
				if(treeNode.ext){
					tree_icon = treeNode.ext;
				}else if(!treeNode.tree_icon){
					tree_icon = treeNode.type;
				}
				icoObj.before(switchObj)
					.before('<span id="'+treeNode.tId +'_my_ico"  class="tree_icon button '+tree_icon+'"></span>')
					.remove();

				if(treeNode.ext!=undefined){//如果是文件则用自定义图标
					icoObj.attr('class','')
					.addClass('file '+treeNode.ext).removeAttr('style');;
				}
				if (treeNode.level >= 1) {
					var spaceStr = "<span class='space' style='display: inline-block;width:"
					 + (spaceWidth * treeNode.level)+ "px'></span>";
					switchObj.before(spaceStr);
				}

				//配置对应右键菜单
				var selector = '';
				if (treeNode['menuType'] != undefined) {
					selector = treeNode['menuType'];
				}else{
					if (treeNode.type == 'file'||treeNode.ext == 'oexe') selector ='menuTreeFile'; 
					if (treeNode.type == 'folder') selector ='menuTreeFolder';
				}

				var title = LNG.name+':'+treeNode.name+"\n"+LNG.size+':'+core.file_size(treeNode.size)+"\n"
				+LNG.modify_time+':'+treeNode.mtime;
				if (treeNode.type != 'file') {
					title = treeNode.name;
				}
				switchObj.parent().addClass(selector).attr('title',title);

				//读写权限处理
				if(treeNode.is_writeable==0){
					switchObj.parent().addClass('file_not_writeable');
				}
				if(treeNode.is_readable==0){//可读可写区分
					switchObj.parent().addClass('file_not_readable');
				}
			}
		},
		callback: {//事件处理回调函数
			onClick: function(event,treeId,treeNode){
				zTree.selectNode(treeNode);
				if(Config.pageApp=='editor' && treeNode.type=='folder'){
					zTree.expandNode(treeNode);
					return;
				}
				if (Config.pageApp=='editor' || treeNode.type!='folder'){
					ui.tree.openEditor();//编辑器优先打开文件
				}else{
					if($.inArray(treeNode.path,[
						"{tree_self_fav}",
						"{tree_group_self}",
						"{tree_group_all}"
						])!=-1){
						return;
					}
					ui.path.list(treeNode.path);//更新文件列表
				}
			},
			beforeRightClick:function(treeId, treeNode){
				zTree.selectNode(treeNode);
			},
			beforeAsync:function(treeId, treeNode){
				treeNode.ajax_name= urlEncode(treeNode.name);
				treeNode.ajax_path= urlEncode(treeNode.path);
				$("#"+treeNode.tId+"_my_ico").addClass('ico_loading');
			},
			onAsyncSuccess:function(event, treeId, treeNode, msg){//更新成功后调用
				$("#"+treeNode.tId+"_my_ico").removeClass('ico_loading');
				if (msg.data.length == 0){
					zTree.removeChildNodes(treeNode);
					return;
				}
				if (typeof(successCallback) == 'function'){
					successCallback();
					successCallback = undefined;
				}
			},
			//新建文件夹、文件、重命名后回调（input blur时调用）
			onRename:function(event, treeId,treeNode){
				var parent = treeNode.getParentNode();
				//已存在检测
				if(zTree.getNodesByParam('name',treeNode.name,parent).length>1){
					core.tips.tips(LNG.name_isexists,false);
					zTree.removeNode(treeNode);
					return;
				}

				if (treeNode.create){//新建
					var path = treeNode.path+'/'+treeNode.name;				
					if (treeNode.type=='folder') {
						pathOperate.newFolder(path,function(data){
							if (!data.code) return;
							refresh(parent);
							successCallback = function(){
								var sel = zTree.getNodesByParam('name',treeNode.name,parent)[0];
								zTree.selectNode(sel);
								f5_refresh();
							}
						});						
					}else{//新建文件
						pathOperate.newFile(path,function(data){
							if (!data.code) return;
							refresh(parent);
							successCallback = function(){
								var sel = zTree.getNodesByParam('name',treeNode.name,parent)[0];
								zTree.selectNode(sel);
								f5_refresh();
							}
						});	
					}
				}else{//重命名
					var from = rtrim(treeNode.path,'/');
					var to = core.pathFather(treeNode.path)+treeNode.name;
					pathOperate.rname(from,to,function(data){
						if (!data.code) return;
						refresh(parent);
						successCallback = function(){
							var sel = zTree.getNodesByParam('name',treeNode.name,parent)[0];
							zTree.selectNode(sel);
							f5_refresh();
						}
					});
				}
			},
			beforeDrag: function(treeId, treeNodes){
				for (var i=0,l=treeNodes.length; i<l; i++) {
					if (treeNodes[i].drag === false) return false;
				}
				return true;
			},
			beforeDrop: function(treeId, treeNodes, targetNode, moveType){
				return targetNode ? targetNode.drop !== false : true;
			},
			onDrop:function(event, treeId, treeNodes, targetNode, moveType){
				var path = '',path_to='';
				var treeNode = treeNodes[0];
				if (!treeNode.father && !treeNode.this_path) return;

				path = treeNode.father+urlEncode(treeNode.name);
				path_to = targetNode.father+urlEncode(targetNode.name);
				pathOperate.cuteDrag([{path:path,type:treeNode.type}],path_to,function(){
					refresh(treeNode);
				});
			}
		}
	};

	//配置请求数据  通用
	var _param = function(makeArray){
		if (!zTree) return;
		var treeNode = zTree.getSelectedNodes()[0],
			path = '',
			type ='';
		if (!treeNode) return {path:'',type:''};

		//打开文件夹&文件
		type = treeNode.type;
		if (type == '_null_' || type==undefined) type = 'folder';
		if (type == 'file')   type = treeNode.ext;
		if (makeArray) {//多个操作接口
			return [{path:treeNode.path,type:type,node:treeNode}];
		}else{
			return {path:treeNode.path,type:type,node:treeNode};
		}
	};
	//通用刷新 不传参数则刷新选中节点
	var refresh = function(treeNode){
		if (!treeNode) treeNode=zTree.getSelectedNodes()[0];
		if (!treeNode.isParent){
			treeNode = treeNode.getParentNode();
			if (!treeNode){
				ui.tree.init();return;
			}
		}
		zTree.reAsyncChildNodes(treeNode, "refresh");
	};
	var refresh_fav = function(){
		refresh_path("{tree_self_fav}");
	}
	var refresh_group_change = function(){
		refresh_path("{tree_self_fav}");
		refresh_path("{tree_group_self}");
		refresh_path("{tree_group_all}");
	}
	var refresh_path = function(path){
		var treeNode=zTree.getNodesByParam("path",path, null);
		refresh(treeNode[0]);
	}
	var f5_refresh = function(){//树目录变化后，对应刷新文件目录
		if (Config.pageApp == 'explorer') {
			ui.f5();
		}
	};

	//对外接口
	return {
		pathOpen:pathOpen,
		init:init,		
		refresh:refresh,
		refresh_path:refresh_path,
		refresh_fav:refresh_fav,
		refresh_group_change:refresh_group_change,
		zTree:function(){return zTree;},
		openEditor:function(){pathOpen.openEditor(_param().path);},
		openIE:function(){pathOpen.openIE(_param().path);},
		share:function(){pathOperate.share(_param());},
		download:function(){
			if (_param().type == 'folder') {
				pathOperate.zipDownload(_param(true));
			}else{
				pathOpen.download(_param().path);
			}
		},
		open:function(){
			if ($('.dialog_path_remove').length>=1) return;
			var p=_param();
			if (p.type == 'oexe'){
				p.path = p.node;
			}
			pathOpen.open(p.path,p.type);
		},
		fav:function(){
			var p=_param();
			p.name = p.node.name;
			pathOperate.fav(p);
		},
		search:function(){core.search('',_param().path);},
		appEdit:function(){
			var p=_param();
			var data = p.node;data.path = p.path;
			pathOperate.appEdit(data,function(){
			refresh(p.node.getParentNode());
		});},

		//operate
		info:function(){pathOperate.info(_param(true));},
		copy:function(){pathOperate.copy(_param(true));},
		cute:function(){pathOperate.cute(_param(true));},
		copyTo:function(){
			core.path_select('folder',LNG.copy_to,function(path){
				pathOperate.copyDrag(_param(true),path,'',false);
			});
		},
		cuteTo:function(){
			core.path_select('folder',LNG.cute_to,function(path){
				pathOperate.cuteDrag(_param(true),path,function(){
					refresh_path();
				});
			});
		},
		fav_remove:function(){
			$.dialog({
				id:'dialog_fav_remove',
				fixed: true,//不跟随页面滚动
				icon:'question',
				title:LNG.fav_remove,
				width:250,
				padding:40,
				content:LNG.fav_remove+'?',
				ok:function() {
					$.ajax({
			            url:'index.php?fav/del&name='+_param().node.name,
			            dataType:'json',
			            async:false,
			            success:function(data){
			            	core.tips.tips(data);
							ui.tree.init();
			            }
			        });
				},
				cancel: true
			});
		},
		past:function(){
			var param = _param();
			if (!param.node.isParent) param.node = param.node.getParentNode();
			pathOperate.past(param.path,function(){
				f5_refresh();
				refresh(param.node);
			});
		},
		clone:function(){
			var param = _param();
			if (!param.node.isParent) param.node = param.node.getParentNode();

			pathOperate.copyDrag(_param(true),core.pathFather(param.path),function(){
				f5_refresh();
				if(param.type=='folder'){
					refresh(param.node.getParentNode());
				}else{
					refresh(param.node);
				}
			},true);//自动重命名
		},
		remove:function(){
			var param  = _param(true);
			var parent = param[0].node.getParentNode();
			pathOperate.remove(param,function(){
				f5_refresh();
				refresh(parent);
			});
		},
		checkIfChange:function(explorer_path){//目录变更后自动更新节点		
			if (isUpdateRefresh) return;
			isUpdateRefresh = true;
			if (!zTree) return;
			zTree.getNodesByFilter(function(treeNode){
				var path = treeNode.path;
				if( treeNode.type == 'folder' && 
					core.pathClear(path) == core.pathClear(explorer_path)){
					refresh(treeNode);
				}
				return false;
			},true);
			setTimeout(function(){
				isUpdateRefresh = false;
			},500);
		},
		explorer:function(){
			var sel = zTree.getSelectedNodes();
			if (sel.length<=0){//没有选中则先默认选中第一个
				var node = zTree.getNodes();
				zTree.selectNode(node[0]);
			}
			var path = _param().path;
			if(_param().type!='folder'){//editor 选中了文件
				path = core.pathFather(path);
			}
			core.explorer(path);
		},
		openProject:function(){
			core.explorerCode(_param().path);
		},
		// 创建节点 让元素进入编辑状态(编辑、新建)。保存动作在ztree的onRename回调函数中
		create:function(type){//type ='file' 'folder'
			var sel = zTree.getSelectedNodes();
			if (sel.length<=0){//工具栏新建文件（夹）
				var node = zTree.getNodes();
				zTree.selectNode(node[0]);
			} 

			var	param = _param(),
				treeNode = param.node,
				parent = treeNode.getParentNode(),
				file="newfile",i=0,
				folder=LNG.newfolder;
			if (type=='folder') {
				while(zTree.getNodesByParam('name',folder+'('+i+')',parent).length>0){
					i++;
				}
				newNode = {name:folder+'('+i+')','ext':'',type:'folder',create:true,path:param.path};
			}else{
				var type_ext = type;
				while(zTree.getNodesByParam('name',file+'('+i+').'+type_ext,parent).length>0){
					i++;
				}
				newNode = {name:file+'('+i+').'+type_ext,'ext':type_ext,type:'file',create:true,path:param.path};
			}
			if(treeNode.children != undefined){//已展开
				var treeNodeNew = zTree.addNodes(treeNode,newNode)[0];
				zTree.editName(treeNodeNew);
			}else{//新建文件&文件夹
				if (treeNode.type != 'folder') treeNode = treeNode.getParentNode();
				successCallback = function(){
					var treeNodeNew = zTree.addNodes(treeNode,newNode)[0];
					zTree.editName(treeNodeNew);
				}
				if(!treeNode.isParent){//没有子文件&文件夹
					successCallback();
				}else{
					zTree.expandNode(treeNode);
				}
			}			
		},
		//分享文件的展示
		show_file:function(){
			var url = './index.php?share/file&sid='+G.sid+'&user='+G.user+'&path='+_param().path;
			window.open(url);
		},
		rname:function(){
			var treeNode = zTree.getSelectedNodes()[0],newNode;
			zTree.editName(treeNode);
			treeNode.beforeName = treeNode.name;
		}
	}
}); 
