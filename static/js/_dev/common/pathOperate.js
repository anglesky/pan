define(function(require, exports) {

	var path_not_allow  = ['/','\\',':','*','?','"','<','>','|'];//win文件名命不允许的字符
	//检测文件名是否合法，根据操作系统，规则不一样
	//win 不允许  / \ : * ? " < > |，lin* 不允许 ‘、’
	var _pathAllow = function(path){
		//字符串中检验是否出现某些字符，check=['-','=']
		var _strHasChar = function(str,check){
			var len=check.length;
			var reg="";
			for (var i=0; i<len; i++){
				if(str.indexOf(check[i])>0) return true;
			}
			return false;
		};
		if (_strHasChar(path,path_not_allow)){
			core.tips.tips(LNG.path_not_allow+':/ \ : * ? " < > |',false);
			return false;
		}
		return true;
	};
	//组装数据
	var _json = function(json){
		var send = 'list=[';
		for (var i=0;i<json.length;i++) {
			send += '{"type":"'+json[i].type+'","path":"'+urlEncode2(json[i].path)+'"}';
			if (i < json.length-1){
				send+= ',';
			}
		}
		return send+']';
	}
	// 新建文件
	var newFile = function(path,callback){
		if (!path) return;
		var filename = core.pathThis(path);
		if (!_pathAllow(filename)){
			if (typeof(callback) == 'function')callback();
			return;
		}
		$.ajax({
			dataType:'json',
			url: 'index.php?explorer/mkfile&path='+urlEncode2(path),
			beforeSend:function(){
				core.tips.loading();
			},
			error:core.ajaxError,
			success: function(data) {
				core.tips.close(data);
				if (typeof(callback) == 'function')callback(data);
			}
		});
	};
	// 新建文件夹
	var newFolder = function(path,callback){
		if (!path) return;
		var filename = core.pathThis(path);
		if (!_pathAllow(filename)){
			if (typeof(callback) == 'function')callback();
			return;
		}
		$.ajax({
			dataType:'json',
			url: 'index.php?explorer/mkdir&path='+urlEncode2(path),
			beforeSend:function(){
				core.tips.loading();
			},
			error:core.ajaxError,
			success: function(data) {
				core.tips.close(data);
				if (typeof (callback) == 'function')callback(data);
			}
		});
	};
	// 树目录重命名文件夹
	var rname = function(from,to,callback){
		if (!from || !to) return;
		if (from == to) return;
		if (!_pathAllow(core.pathThis(to))){
			if (typeof(callback) == 'function')callback();
			return;
		}
		$.ajax({
			type: "POST", 
			dataType:'json',
			url: 'index.php?explorer/pathRname',
			data: 'path='+urlEncode(from)+'&rname_to='+urlEncode(to),
			beforeSend:function(){
				core.tips.loading();
			},
			error:core.ajaxError,
			success: function(data) {
				core.tips.close(data);
				if (typeof(callback) == 'function')callback(data);
				//ui.tree.refresh(treeNode.getParentNode());
			}
		});
	};
	
	//多条数据操作
	//参数形如：list=[{"type":"file","file":"D:/test/a.txt"}]
	//删除 文件|文件夹 & 包含批量删除
	var remove = function(param,callback){
		if (param.length<1) return;
		//var name = core.pathThis(param[0]['path'])+'<br/><br/>'+;
		var title= LNG.remove_title;
		var desc = LNG.remove_info;
		var del_url = 'index.php?explorer/pathDelete';

		if (G.this_path == G.USER_RECYCLE) {//清空回收站
			desc = LNG.recycle_remove+'?';
			del_url = 'index.php?explorer/pathDeleteRecycle';
			title = LNG.recycle_remove;
		}
		if (param[0]['type'] == 'share') {//取消共享
			desc = LNG.share_remove_tips;
			del_url = 'index.php?userShare/del';
			title = LNG.share_remove;
		}
		if (param.length>1) {
			desc+= ' ... <span class="badge">'+param.length+'</span>';
		}
		$.dialog({
			id:'dialog_path_remove',
			fixed: true,//不跟随页面滚动
			icon:'question',
			title:title,
			padding:40,
			width:200,
			lock:true,
			background:"#000",
			opacity:0.1,
			content:desc,
			ok:function() {
				$.ajax({
					url: del_url,
					type:'POST',
					dataType:'json',
					data:_json(param),
					beforeSend:function(){
						core.tips.loading();
					},
					error:core.ajaxError,
					success: function(data) {
						core.tips.close(data);
						FrameCall.father('ui.f5','');
						if (param[0]['type'] == 'share'){
							G.self_share = data.info;
							//取消分享，对应关闭分享信息框
							var dialog = art.dialog.list['share_dialog'];
							if (dialog != undefined) {
								dialog.close();
							};
						}
						if (typeof(callback) == 'function')callback(data);
					}
				});
			},
			cancel: true
		});
	};
	//复制
	var copy = function(param){
		if (param.length<1) return;
		$.ajax({
			url:'index.php?explorer/pathCopy',
			type:'POST',
			dataType:'json',
			data:_json(param),
			error:core.ajaxError,
			success: function(data) {
				core.tips.tips(data);
			}
		});
	};

	var share = function(param){
		var path = param.path;
		var shareType = param.type=='folder'?'folder':'file';
		if (path.length<1) return;
		if (!core.authCheck('userShare:set')) return;
		$.ajax({
			url:'./index.php?userShare/checkByPath&path='+urlEncode(path),
			dataType:'json',
			error:core.ajaxError,
			success:function(data){
				if (data.code) {//已经分享则编辑分享
					core.tips.tips('该分享已存在',true);
					share_box(data.data);
				}else{//没有分享，新建分享提交
					//自动分享
					G.self_share = data.info;
					var param = '&path='+urlEncode(path)+'&type='+shareType+'&name='+urlEncode(core.pathThis(path));
					_share_post(param,function(data){
						if(data.code){
							core.tips.tips(LNG.success,true);
							G.self_share = data.info;
							ui.f5();
						}else{
							core.tips.tips(data);
							share_box(undefined,function(){//编辑分享
								//新建分享提交
								$('.content_info input[name=type]').val(shareType);
								$('.content_info input[name=path]').val(path);
								$('.content_info input[name=name]').val(core.pathThis(path)+'(1)');
								if (shareType=='file') {
									$('.label_code_read').addClass('hidden');
									$('.label_can_upload').addClass('hidden');
								};
							});
						}						
					});
				}
			}
		});
	};	
	var share_box = function(share_param_info,callback){
		if ($(".share_dialog").length!=0) {
			$(".share_dialog").shake(2,5,100);
		}
		seajs.use('lib/jquery.datetimepicker/jquery.datetimepicker.css');
		require.async('lib/jquery.datetimepicker/jquery.datetimepicker',function(){
			_share_box_make(share_param_info);
			if(callback!=undefined) callback();
		});
	}

	var _share_post = function(param,callback){
		$.ajax({
			url:'index.php?userShare/set',
			data:param,
			type:'POST',
			dataType:'json',
			beforeSend:function(data){
				$('.share_create_button').addClass('disabled');
			},
			error:function(){
				core.tips.tips(LNG.error,false);
			},
			success:function(data){
				$('.share_create_button').removeClass('disabled');
				if(callback!=undefined) callback(data);
			}
		});
	}

	var _share_box_make = function(share_param_info){
		var tpl_list = require('../tpl/share.html');
		var render = template.compile(tpl_list);
		var html = render({LNG:LNG});				
		$.dialog({
			id:"share_dialog",
			simple:true,
			resize:false,
			width:425,
			title:LNG.share,
			padding:'0',
			fixed:true,
			content:html,
			cancel:function(){
			}
		});

		//时间控件
		var theLang = G.lang=='zh_CN'?'ch':'en';
		$('#share_time').datetimepicker({
			format:'Y/m/d',
			formatDate:'Y/m/d',
			timepicker:false,
			lang:theLang
		});
		$('#share_time').unbind('blur').bind('blur',function(e){
			stopPP(e);
		});
		var initData = function(share_info){
			//初始化数据
			$('.share_setting_more').addClass('hidden');
			if (share_info == undefined) {//没有数据 则清空
				$('.share_has_url').addClass('hidden');
				$('.share_action .share_remove_button').addClass('hidden');

				$('.content_info input[name=sid]').val('');
				$('.content_info input[name=type]').val('');
				$('.content_info input[name=name]').val('');
				$('.content_info input[name=path]').val('');
				$('.content_info input[name=time_to]').val('');
				$('.content_info input[name=share_password]').val('');
				$(".share_view_info").addClass('hidden');
			}else{//有数据
				if (typeof(share_info['can_upload'])=='undefined') {
					share_info['can_upload'] = "";
				}
				share_param_info = share_info;
				$('.content_info input[name=sid]').val(share_info.sid);
				$('.content_info input[name=type]').val(share_info.type);
				$('.content_info input[name=name]').val(share_info.name);
				$('.content_info input[name=path]').val(share_info.path);
				$('.content_info input[name=time_to]').val(share_info.time_to);
				$('.content_info input[name=share_password]').val(share_info.share_password);
				$(".share_view_info").removeClass('hidden');

				//浏览量下载量展示
				if (typeof(share_info['num_download']) == 'undefined') {
					share_info['num_download'] = 0;
				}
				if (typeof(share_info['num_view']) == 'undefined') {
					share_info['num_view'] = 0;
				}
				var read_info = LNG.share_view_num+share_info['num_view']+'  '+
	    						LNG.share_download_num+share_info['num_download'];
				$(".share_view_info").html(read_info);

				//其他配置
				if (share_info.code_read == '1') {
					$('.content_info input[name=code_read]').attr('checked','checked');
				}else{
					$('.content_info input[name=code_read]').removeAttr('checked');
				}
				if (share_info.not_download == '1') {
					$('.content_info input[name=not_download]').attr('checked','checked');
				}else{
					$('.content_info input[name=not_download]').removeAttr('checked');
				}

				//是否可以上传
				if (share_info['can_upload'] == '1') {
					$('.content_info input[name=can_upload]').attr('checked','checked');
				}else{
					$('.content_info input[name=can_upload]').removeAttr('checked');
				}

				$('.share_has_url').removeClass('hidden');
				if (share_info.type=='file') {
					$('.label_code_read').addClass('hidden');
					$('.label_can_upload').addClass('hidden');
				}else{
					$('.label_code_read').removeClass('hidden');
					$('.label_can_upload').removeClass('hidden');
				}

				var shareType = share_info.type;
				if (share_info.type=='folder') {
					if (share_info.code_read == 1) {
						shareType = 'code_read';
					}else{
						shareType = 'folder';
					}
				}
				var share_url = G.app_host+'index.php?share/'
					+shareType+'&user='+G.user_id+"&sid="+share_info.sid;
				$('.content_info .share_url').val(share_url);

				//默认是否隐藏更多设置
				if (share_info.time_to =='1'|| 
					share_info.share_password =='1'||
					share_info['can_upload'] == '1' ||
					share_info.code_read == '1'||
					share_info.not_download == '1') {
					$('.share_setting_more').removeClass('hidden');
				};

				$('.share_remove_button').removeClass('hidden');
				$('.share_create_button').text(LNG.share_save);
			}
		}
		var bindAction = function(){
			//取消分享
			$('.share_action .share_remove_button').unbind('click').click(function(){
				remove([{type:'share',path:share_param_info.sid}],function(){
					ui.f5();
				});
			});
			$('.content_info .share_more').unbind('click').click(function(){
				$('.share_setting_more').toggleClass('hidden');
			});

			//创建分享&修复分享配置
			$('.share_action .share_create_button').unbind('click').click(function(){
				//数据获取
				var param="";
				$('.share_dialog .content_info input[name]').each(function(){
					var value = urlEncode($(this).val());
					if($(this).attr('type') == 'checkbox'){
						if($(this).attr('checked')){
							value = '1';
						}else{
							value = "";
						}
					}
					param+='&'+$(this).attr('name')+'='+urlEncode(value);
				});
				_share_post(param,function(data){
					if(!data.code){//已存在
						core.tips.tips(data);
					}else{
						core.tips.tips(LNG.success,true);
						G.self_share = data.info;
						ui.f5();
						initData(data.data);					
						$('.share_create_button').text(LNG.share_save);		
					}								
				});
			});

			$('.content_info .open_window').unbind('click').bind('click',function(){
				window.open($('input.share_url').val());
			});
			$('.content_info .qrcode').unbind('click').bind('click',function(){
				core.qrcode($('input.share_url').val());
			});

			var $share_url   = $("input.share_url");
			var share_url    = $share_url.get(0);
			$share_url.unbind('hover click').bind('hover click',function(e) {
				$(this).focus();
				var selectlen=$share_url.val().length;
				if($.browser.msie){//IE
					var range = share_url.createTextRange();
					range.moveEnd('character', -share_url.value.length);         
					range.moveEnd('character', selectlen);
					range.moveStart('character', 0);
					range.select();
				}else{//firfox chrome ...
				   share_url.setSelectionRange(0,selectlen);
				}
			});
		}
		initData(share_param_info);
		bindAction();
	}

	var setBackground = function(param){
		if (param.length<1) return;
		var url = core.path2url(param);
		FrameCall.father('ui.setWall','"'+url+'"');
		$.ajax({
			url:'index.php?setting/set&k=wall&v='+urlEncode(url),
			dataType:'json',
			success:function(data){
				core.tips.tips(data);
			}
		});
	};
	var createLink = function(path,type,callback){
		if (path.length<1) return;
		var jsrun,
			name = core.pathThis(path),
			father = core.pathFather(path);
		if (type=='folder') {
			jsrun = 'ui.path.list(\''+urlEncode(path)+'\');';
		}else{
			jsrun = 'ui.path.open(\''+urlEncode(path)+'\');';
		}

		var filename = urlEncode2(father+name+'.oexe');
	    $.ajax({
			url: './index.php?explorer/mkfile&path='+filename,
			type:'POST',
			dataType:'json',
			data:'content={"type":"app_link","content":"'+jsrun+'","icon":"app_s2.png"}',
			success: function(data) {
				if (!data.code) return;
				if (typeof (callback) == 'function') callback(data);
			}
		});
	};
	var createProject = function(path,callback){
		if (path.length<1) return;
		var name = core.pathThis(path),
			father = core.pathFather(path);
			jsrun = 'core.explorerCode(\''+urlEncode(path)+'\');';

		var filename = urlEncode2(father+name+'_project.oexe');
	    $.ajax({
			url: './index.php?explorer/mkfile&path='+filename,
			type:'POST',
			dataType:'json',
			data:'content={"type":"app_link","content":"'+jsrun+'","icon":"folder.png"}',
			success: function(data) {
				if (!data.code) return;
				if (typeof (callback) == 'function') callback(data);
			}
		});
	};
	//剪切
	var cute = function(param){
		if (param.length<1) return;
		$.ajax({
			url:'index.php?explorer/pathCute',
			type:'POST',
			dataType:'json',
			data:_json(param),
			error:core.ajaxError,
			success:function(data){
				core.tips.tips(data);
			}
		});
	};
	// 粘贴
	var past = function(path,callback){
		if (!path) return;
		var url='index.php?explorer/pathPast&path='+urlEncode2(path);
		$.ajax({
			url:url,
			dataType:'json',
			beforeSend: function(){
				core.tips.loading(LNG.moving);
			},
			error:core.ajaxError,
			success:function(data){
				core.tips.close(data);
				if (typeof(callback) == 'function')callback(data.info);
			}
		});
	};

	//获取文件夹属性
	var info = function(param){
		var tpl = {};
		tpl['file_info'] = require('../tpl/fileinfo/file_info.html');
		tpl['path_info'] = require('../tpl/fileinfo/path_info.html');
		tpl['path_info_more'] = require('../tpl/fileinfo/path_info_more.html');

		if (param.length<1) param = [{path:G.this_path,type:"folder"}];//当前目录属性

		var url = 'index.php?explorer/pathInfo';
		if (typeof(G['share_page']) != 'undefined'){
			url = 'index.php?share/pathInfo&user='+G.user+'&sid='+G.sid;
		}

		var ico_type = "info";
		if (param.length==1) {
			if(param[0].type=="file"){
				ico_type = core.pathExt(param[0].path);
			}else{
				ico_type = "folder";
			}
		}
		$.ajax({
			url:url,
			type:'POST',
			dataType:'json',
			data:_json(param),	
			beforeSend: function(){
				core.tips.loading(LNG.getting);
			},
			error:core.ajaxError,
			success:function(data){
				if (!data.code){
					core.tips.close(data);return;
				}
				core.tips.close(LNG.get_success,true);
				var tpl_file = 'path_info_more';
				var title = LNG.info;
				if (param.length ==1) {
					tpl_file = ((param[0].type =='folder')?'path_info':'file_info');
					title = core.pathThis(param[0].path);
					if (title.length>15) {
						title = title.substr(0,15)+"...  "+LNG.info
					}
				}
				var render = template.compile(tpl[tpl_file]);
				var dialog_id = UUID();
				data.data.is_root = G.is_root;
				data.data.LNG = LNG;//模板中的多语言注入
				data.data['atime'] = date(LNG.time_type_info,data.data['atime']);
				data.data['ctime'] = date(LNG.time_type_info,data.data['ctime']);
				data.data['mtime'] = date(LNG.time_type_info,data.data['mtime']);
				data.data['size_friendly'] = core.file_size(data.data['size']);

				$.dialog({
					id:dialog_id,
					padding:5,
					ico:core.ico(ico_type),
					fixed: true,//不跟随页面滚动
					title:title,
					content:render(data.data),
					ok: true
				});
				_bindInfoBoxEvent(dialog_id,param);			
			}
		});
	};

	//文件属性查看，对话框时间绑定
	var _bindInfoBoxEvent = function(dialog_id,param){
		var $dom = $('.'+dialog_id);
		//打开下载链接
		$dom.find('.open_window').bind('click',function(){
			window.open($dom.find('input.download_url').val());
		});
		$dom.find('.qrcode').unbind('click').bind('click',function(){
			core.qrcode($dom.find('input.download_url').val());
		});

		//hover选中输入框
		var $download_url   = $dom.find('input.download_url');
		var download_dom    = $download_url.get(0);
		$download_url.unbind('hover click').bind('hover click',function(e) {
			$(this).focus();
			var selectlen=$download_url.val().length;
			if($.browser.msie){//IE
				var range = download_dom.createTextRange();
				range.moveEnd('character', -download_dom.value.length);         
				range.moveEnd('character', selectlen);
				range.moveStart('character', 0);
				range.select();
			}else{//firfox chrome ...
			   download_dom.setSelectionRange(0,selectlen);
			}
		});

		//权限修改
		$dom.find('.edit_chmod').click(function(){
			var $input = $(this).parent().find('input');
			var $button = $(this);
			$.ajax({
				url:'index.php?explorer/pathChmod&mod='+$input.val(),
				type:'POST',
				data:_json(param),	
				beforeSend: function(){
					$button.text(LNG.loading);
				},
				error:function(data){
					$button.text(LNG.button_save);
				},
				success:function(data){
					$button.text(data.data)
						.animate({opacity:0.6},400,0)
						.delay(1000)
						.animate({opacity:1},200,0,function(){
							$button.text(LNG.button_save);
						});
				}
			});
		});		
	}

	var zipDownload = function(param){
		if (!core.authCheck('explorer:fileDownload')) return;
		if (param.length<1) return;

		var the_url = 'index.php?explorer/zipDownload';
		if (typeof(G['share_page']) != 'undefined') {
			the_url = 'index.php?share/zipDownload&user='+G.user+'&sid='+G.sid;
		}
		$.ajax({
			url:the_url,
			type:'POST',
			dataType:'json',
			data:_json(param),
			beforeSend: function(){
				core.tips.loading(LNG.zip_download_ready);
			},
			error:core.ajaxError,
			success:function(data){
				core.tips.close(data);
				core.tips.tips(data);

				var url = 'index.php?explorer/fileDownloadRemove&path='+urlEncode2(data.info);
				if (typeof(G['share_page']) != 'undefined') {
					url = 'index.php?share/fileDownloadRemove&user='+G.user+'&sid='+G.sid+'&path='+urlEncode2(data.info);
				}
				var html = '<iframe src="'+url+'" style="width:0px;height:0px;border:0;" frameborder=0></iframe>'+
							LNG.download_ready +'...';
				var dlg = $.dialog({
					icon:'succeed',
					title:false,
					time:1.5,
					content:html
				});
				dlg.DOM.wrap.find('.aui_loading').remove();
			}
		});
	};

	var zip = function(param,callback){
		if (param.length<1) return;
		$.ajax({
			url:'index.php?explorer/zip',
			type:'POST',
			dataType:'json',
			data:_json(param),
			beforeSend: function(){
				core.tips.loading(LNG.ziping);
			},
			error:core.ajaxError,
			success:function(data){
				core.tips.close(data);
				core.tips.tips(data);
				if (typeof (callback) == 'function') callback(data);
			}
		});
	};
	var unZip = function(path,callback,to_this){
		if (!path) return;		
		var _send = function(send_url){
			$.ajax({
				url:send_url,
				beforeSend: function(){
					core.tips.loading(LNG.unziping);
				},
				error:core.ajaxError,
				success:function(data){
					core.tips.close(data);
					if (typeof (callback) == 'function') callback(data);
				}
			});
		}

		var url='index.php?explorer/unzip&path='+urlEncode2(path);
		if(to_this == 'to_this'){
			url += '&to_this=1';
		}
		if(to_this == 'unzip_to_folder'){//解压到文件夹
			core.path_select('folder',LNG.unzip_to,function(path){
				url += '&path_to='+path;
				_send(url);
			});
		}else{			
			_send(url);
		}
	};
	// 粘贴
	var cuteDrag = function(param,dragTo,callback){
		if (!dragTo) return;
		$.ajax({
			url:'index.php?explorer/pathCuteDrag',
			type:'POST',
			dataType:'json',
			data:_json(param)+'&path='+urlEncode2(dragTo+'/'),
			beforeSend: function(){
				core.tips.loading(LNG.moving);
			},
			error:core.ajaxError,
			success:function(data){
				core.tips.close(data);
				if (typeof (callback) == 'function') callback(data);
			}
		});
	};
	// 创建副本
	var copyDrag = function(param,dragTo,callback,filename_auto){
		if (!dragTo) return;
		if (filename_auto == undefined){
			filename_auto = 0;
		}
		$.ajax({
			url:'index.php?explorer/pathCopyDrag',
			type:'POST',
			dataType:'json',
			data:_json(param)+'&path='+urlEncode2(dragTo+'/')+'&filename_auto='+ Number(filename_auto),
			beforeSend: function(){
				core.tips.loading(LNG.moving);
			},
			error:core.ajaxError,
			success:function(data){
				core.tips.close(data);
				if (typeof (callback) == 'function') callback(data);
			}
		});
	};

	//==查看剪贴板
	var clipboard = function(){
		$.ajax({
			url:'index.php?explorer/clipboard',
			dataType:'json',
			error:core.ajaxError,
			success:function(data){
				if (!data.code) return;
				$.dialog({
					title:LNG.clipboard,
					padding:0,
					height:200,
					width:400,
					content:data.data
				});
			}
		});
	};
	//==添加收藏夹 
	var fav = function(obj){
		if (!obj) return;
		if(trim(core.pathClear(obj.path),'/').indexOf('/')==-1){//虚拟目录根目录
			if(obj.path.indexOf(G.KOD_USER_SHARE)==0){
				obj.type = 'user';
			}else if(obj.path.indexOf(G.KOD_GROUP_SHARE)==0){
				obj.type = 'group';
			}else if(obj.path.indexOf(G.KOD_GROUP_PATH)==0){
				obj.type = 'groupSelf';
			}else if(obj.path.indexOf(G.KOD_GROUP_PATH)==0){
				obj.type = 'group';
			}else if(trim(obj.path,'/') == G.KOD_USER_RECYCLE){
				obj.type = 'recycle';
				obj.name = LNG.recycle;
			}
		}
		
		var pram='&name='+urlEncode(obj.name)+'&path='+urlEncode(obj.path)+'&type='+obj.type;
  		core.setting('fav'+pram);
  		return;
  		
  		$.ajax({
            url:'index.php?fav/add&name='+urlEncode(core.pathThis(obj.path))
            	 +'&path='+urlEncode(obj.path)+'&type='+obj.type,
            dataType:'json',
            success:function(data){
                core.tips.tips(data);
                if (data.code && Config.pageApp != 'desktop'){
                    ui.tree.refresh_fav();
                }
            }
        });
	};	

	//获取数据
	var _app_param = function(dom) {
		var param ={};
		param.type = dom.find("input[type=radio]:checked").val();
		param.content = dom.find("textarea").val();
		param.group   = dom.find("[name=group]").val();	
		dom.find('input[type=text]').each(function(){
			var name = $(this).attr('name');
			param[name]=$(this).val();
		});
		dom.find('input[type=checkbox]').each(function(){
			var name = $(this).attr('name');
			param[name] = $(this).attr('checked')=='checked'?1:0;
		});
		return param;
	}



	var _bindAppEvent = function(dom) {
		dom.find('.type input').change(function() {
			var val = $(this).attr('apptype');
			dom.find('[data-type]').addClass('hidden');
			dom.find('[data-type='+val+']').removeClass('hidden');
		});
	}
	//应用添加、修改——创建文件；appstore 添加、修改——修改数据
	var appEdit = function(path,callback,action){//path——path/jsondata
		//action:user_add user_edit	root_add root_edit
		var title = LNG.app_create,dom,
			url,html,
			uuid  = UUID(),
			editpath,
			theTpl = require('../tpl/app.html'),
			iconpath = G.basic_path+'static/images/app/',//root才能管理
			render = template.compile(theTpl);
		if (action == undefined) {action= 'user_edit'};
		if (action == 'root_edit') {path = path;};
		if (action == 'user_edit' || action == 'root_edit'){
			title = LNG.app_edit;
			html  = render({LNG:LNG,iconPath:iconpath,uuid:uuid,data:path});
		}else{
			html  = render({LNG:LNG,iconPath:iconpath,uuid:uuid,data:{}});
		}
		$.dialog({
			fixed: true,//不跟随页面滚动
			width:450,
			id:uuid,
			padding:15,			
			title:title,
			content:html,
			button:[
                {name:LNG.preview,callback:function(){
                    var data = _app_param(dom);
                    core.openApp(data);
                    return false;
                }},
                {name:LNG.button_save,focus:true,callback:function(){
                	var data = _app_param(dom);
                	switch(action){
						case 'user_add':
							var filename = urlEncode2(G.this_path+data.name);
							url = './index.php?app/user_app&action=add&path='+filename;
							break;
						case 'user_edit':
							url = './index.php?app/user_app&path='+urlEncode2(path.path);
							break;
						case 'root_add':url = './index.php?app/add&name='+data.name;break;
						case 'root_edit':url = './index.php?app/edit&name='+data.name+'&old_name='+path.name;break;
						default:break;
					}
	                $.ajax({
						url: url,
						type:'POST',
						dataType:'json',
						data:'data='+urlEncode2(json_encode(data)),
						beforeSend:function(){
							core.tips.loading();
						},
						error:core.ajaxError,
						success: function(data) {
							core.tips.close(data);
							if (!data.code) return;
							if (action == 'root_edit' || action == 'root_add') {
								//刷新应用列表
								if (!data.code) {return;};
								FrameCall.top('Openapp_store','App.reload','""');
							}else{
								if (typeof (callback) == 'function'){
									callback();
								}else{
									ui.f5();
								}								
							}
						}
					});
                }}
            ]
		});
		dom = $('.'+uuid);
		if(!G.is_root){
			$('.appbox .appline .right a.open').remove();
		}
		//init 选中、初始化数据、显示隐藏
		if (path.group) {
			dom.find('option').eq(path.group).attr('selected',1);
		}
		dom.find('.aui_content').css('overflow','inherit');
		switch(action){
			case 'user_edit' :
				dom.find('.name').addClass('hidden');
				dom.find('.desc').addClass('hidden');
				dom.find('.group').addClass('hidden');
				dom.find('option[value='+path.group+']').attr('checked',true);
				break;
			case 'user_add':
				dom.find('.desc').addClass('hidden');
				dom.find('.group').addClass('hidden');
				dom.find('[apptype=url]').attr('checked',true);
				dom.find('[data-type=url] input[name=resize]').attr('checked',true);
				dom.find('input[name=width]').attr('value','800');
				dom.find('input[name=height]').attr('value','600');
				dom.find('input[name=icon]').attr('value','oexe.png');
				break;				
			case 'root_add':
				dom.find('[apptype=url]').attr('checked',true);
				dom.find('[data-type=url] input[name=resize]').attr('checked',true);
				dom.find('input[name=width]').attr('value','800');
				dom.find('input[name=height]').attr('value','600');
				dom.find('input[name=icon]').attr('value','oexe.png');
				break;
			case 'root_edit':
				dom.find('option[value='+path.group+']').attr('selected',true);
				break;
			default:break;
		}
		_bindAppEvent(dom);
	};
    var appList = function(){
    	core.appStore();
	};
	//ui.path.pathOperate.appAddURL('http://www.baidu.com');
	var appAddURL = function(url){
		if (url && url.length<4 && url.substring(0,4)!='http') return;
		$.ajax({
			url: './index.php?app/get_url_title&url='+url,
			dataType:'json',
			beforeSend:function(){
				core.tips.loading();
			},
			success: function(result) {
				var name = result.data;
				core.tips.close(result);
				var data = {
					// content:"window.open('"+url+"');",
					// type: "app",
					content:url,
					type: "url",
					desc: "",
					group: "others",					
					icon: "internet.png",
					name: name,
					resize: 1,
					simple: 0,
					height: "60%",
					width: "80%"
				};
				var filename = urlEncode2(G.this_path+name);
				url = './index.php?app/user_app&action=add&path='+filename;
			    $.ajax({
					url: url,
					type:'POST',
					dataType:'json',
					data:'data='+urlEncode2(json_encode(data)),
					success: function(data) {
						core.tips.close(data);
						if (!data.code) return;
						ui.f5();
					}
				});
			}
		});		
	};

	return{
		appEdit:appEdit,
		appList:appList,
		appAddURL:appAddURL,

		share:share,
		share_box:share_box,

		setBackground:setBackground,
		createLink:createLink,
		createProject:createProject,

		newFile:newFile,
		newFolder:newFolder,
		rname:rname,
		unZip:unZip,
		zipDownload:zipDownload,

		//参数为json数据，可以操作多个对象
		zip:zip,
		copy:copy,
		cute:cute,
		info:info,
		remove:remove,
		cuteDrag:cuteDrag,
		copyDrag:copyDrag,

		past:past,
		clipboard:clipboard,
		fav:fav
	}
});

