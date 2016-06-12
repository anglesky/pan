define(function(require, exports) {	
	loadRipple(['a','button','label','.context-menu-item','#picker']);
	$('a,img').attr('draggable','false');
	$(document).bind('mouseup',function(){
		window.focus();
	})

	var init_first = function(){		
		window.require = require;
		core.update();
		if(typeof(G) != 'undefined'){
			if(G.is_root!=1){
				$(".menu_system_setting").remove();
			}
			if( G.is_root ||  
				AUTH['system_member:get']==1 || 
				AUTH['system_group:get']==1){
			}else{
				$(".menu_system_group").remove();
			}
		}
	}
	return {
		init:init_first,
		filetype : {
			'image'	: ['jpg','jpeg','png','bmp','gif','ico'],
			'music'	: ['mp3','wma','wav','mid','m4a','aac','midi'],
						//'m3a','aif','ac3','ram','ogg','oga','m4b','mka','mp1','mx3','mp2'],
			'movie'	: ['avi','flv','f4v','wmv','3gp','mp4','wmv','asf','m4v','mov','mpg'],
						//'rmvb','rm','mkv','mpeg','vob','mpv','ogm','ogv','qt'],
			'doc'	: ['doc','docx','docm','xls','xlsx','xlsb','xlsm','ppt','pptx','pptm'],
			'text'	: ['oexe','inc','inf','csv','log','asc','tsv','lnk','url','webloc','meta'],
			'code'	: ["abap","abc","as","ada","adb","htgroups","htpasswd","conf","htaccess","htgroups",
						"htpasswd","asciidoc","asm","ahk","bat","cmd","c9search_results","cpp","c","cc","cxx","h","hh","hpp",
						"cirru","cr","clj","cljs","CBL","COB","coffee","cf","cson","Cakefile","cfm","cs","css","curly","d",
						"di","dart","diff","patch","Dockerfile","dot","dummy","dummy","e","ejs","ex","exs","elm","erl",
						"hrl","frt","fs","ldr","ftl","gcode","feature","gitignore","glsl","frag","vert","go","groovy",
						"haml","hbs","handlebars","tpl","mustache","hs","hx","html","htm","xhtml","erb","rhtml","ini",'strings',
						"cfg","prefs","io","jack","jade","java","js","jsm","json","jq","jsp","jsx","jl","tex","latex",
						"ltx","bib","lean","hlean","less","liquid","lisp","ls","logic","lql","lsl","lua","lp","lucene",
						"Makefile","makefile","GNUmakefile","makefile","OCamlMakefile","make","md","rst","markdown","mask","matlab",
						"mel","mc","mush","mysql","nix","m","mm","ml","mli","pas","p","pl","pm","pgsql","php","phtml",
						"ps1","praat","praatscript","psc","proc","plg","prolog","properties","proto","py","r","Rd",
						"Rhtml","rb","ru","gemspec","rake","Guardfile","Rakefile","Gemfile","rs","sass","scad","scala",
						"scm","rkt","scss","sh","bash","bashrc","sjs","smarty","tpl","snippets","soy","space","sql",
						"styl","stylus","svg","tcl","tex","txt","textile","toml","twig","ts","typescript","str","vala",
						"vbs","vb","vm","v","vh","sv","svh","vhd","vhdl","xml","rdf","rss",
						"wsdl","xslt","atom","mathml","mml","xul","xbl","xaml","xq","yaml","yml","htm",
						"xib","xsd","storyboard","plist","csproj","pch","pbxproj","local","xcscheme"],
			'bindary':['pdf','bin','zip','swf','gzip','rar','arj','tar','gz','cab','tbz','tbz2','lzh',
					   'uue','bz2','ace','exe','so','dll','chm','rtf','odp','odt','pages','class','psd',
					   'ttf','fla','7z','dmg','iso','dat','ipa','lib','a','apk','so','o']
		},
		ico:function(type){
			var arr_others=['edit','search','upload','setting','appStore','error','info'];
			var arr_files =['folder','file','mp3','flv','pdf','doc','xls','ppt','html','swf','php','js','zip','rar','txt','jpg'];
			if ($.inArray(type,arr_others)>=0) {
				return G.static_path + 'images/file_icon/icon_others/'+type+'.png';
			}else if ($.inArray(type,arr_files)>=0) {
				return G.static_path + 'images/file_icon/file_16/'+type+'.png';
			}else{
				return G.static_path + 'images/file_icon/file_16/file.png';
			}
		},
		contextmenu:function(event){
			try{
				rightMenu.hidden();
			}catch(e){};
			//return true;
			var e = event || window.event;
			if (!e) return true;
			if ( (e && $(e.target).is('textarea'))
				|| $(e.target).is('input')
				|| $(e.target).is('p')
				|| $(e.target).is('pre')

				|| $(e.target).parents(".can_right_menu").length!=0
				|| $(e.target).parents(".topbar").length!=0
				|| $(e.target).parents(".edit_body").length!=0
				|| $(e.target).parents(".aui_state_focus").length!=0
				){
				return true;
			}
			return false;
		},
		//获取当前文件名
		pathThis:function(path){
			if(!path || path=='/') return '';
			path = path = this.pathClear(path);
			var index = path.lastIndexOf('/');
			var name =  path.substr(index+1);

			//非服务器路径
			if (name.search('fileProxy')==0) {
				name = urlDecode(name.substr(name.search('&path=')));
				var arr = name.split('/');
				name = arr[arr.length -1];
				if (name=='') name = arr[arr.length -2];
			}
			return name;
		},
		pathClear:function(path){
			path = path.replace(/\\/g, "/");
			path = rtrim(path,'/');
			path = path.replace(/\/+/g, "/");
			return path;
		},
		//获取文件父目录
		pathFather:function(path){
			path = this.pathClear(path);
			var index = path.lastIndexOf('/');
			return path.substr(0,index+1);
		},
		//获取路径扩展名
		pathExt:function(path){
			path = path.replace(/\\/g, "/");
			path = path.replace(/\/+/g, "/");
			var index = path.lastIndexOf('.');
			path = path.substr(index+1);
			return path.toLowerCase();
		},
		//绝对路径转url路径
		path2url :function(path){
			if (path.substr(0,4) == 'http') return path;

			path = path.replace(/\\/g, "/");
			path = rtrim(path,'/');
			path = path.replace(/\/+/g, "/");
			path = path.replace(/\/\.*\//g, "/");
			//user group
			if (G.is_root && path.substring(0,G.web_root.length) == G.web_root){//服务器路径下
				return G.web_host+path.replace(G.web_root,'');
			}else{
				var the_url = G.app_host+'/index.php?explorer/fileProxy&path=' +urlEncode(path);
				if (typeof(G['share_page']) != 'undefined') {
					the_url = G.app_host+'/index.php?share/fileProxy&user='+G.user+'&sid='+G.sid+'&path=' +urlEncode(path);
				}
				return the_url;
			}
		},
		path_can_read:function(path){
			if(typeof(G.json_data)!="object"){
				return true;
			}
			var the_list;
			the_list=G.json_data['filelist'];
			for (var i=0;i<the_list.length;i++){
				if(the_list[i].path == path){
					if(the_list[i]['is_readable']==undefined || the_list[i]['is_readable'] == 1){
						return true;
					}else{
						return false;
					}
				}
			}
			the_list=G.json_data['folderlist'];
			for (var i=0;i<the_list.length;i++){
				if(the_list[i].path == path){
					if(the_list[i]['is_readable']==undefined || the_list[i]['is_readable'] == 1){
						return true;
					}else{
						return false;
					}
				}
			}
			return true;
		},
		authCheck:function(type,msg){
			if (G.is_root) return true;
			if (!AUTH.hasOwnProperty(type)) return true;
			if (AUTH[type]) {
				return true;
			}else{
				if (msg == undefined) {
					msg = LNG.no_permission
				}
				core.tips.tips(msg,false);
				return false;
			}
		},
		ajaxError:function(XMLHttpRequest, textStatus, errorThrown){
			core.tips.close(LNG.system_error,false);
			var response = XMLHttpRequest.responseText;
			var error = '<div class="ajaxError">'+response+'</div>';
			var dialog = $.dialog.list['ajaxErrorDialog'];
			
			//已经退出
			if (response.substr(0,17) == '<!--user login-->') {
				FrameCall.goRefresh();
				return;
			}

			if (dialog) {
				dialog.content(error);
			}else{
				$.dialog({
					id:'ajaxErrorDialog',
					padding:0,
					width:'60%',
					height:'50%',
					fixed:true,
					resize:true,
					ico:core.ico('error'),
					title:'ajax error',
					content:error
				});	
			}
		},
		file_get:function(path,callback) {
			var the_url = './index.php?editor/fileGet&filename='+urlEncode2(path);
			if (typeof(G['share_page']) != 'undefined') {
				the_url = './index.php?share/fileGet&user='+G.user+'&sid='+G.sid+'&filename='+urlEncode2(path);
			}
			$.ajax({
				url:the_url,
				dataType:'json',
				beforeSend: function(){
					core.tips.loading(LNG.loading);
				},
				error:core.ajaxError,
				success:function(data){
					core.tips.close(LNG.success);
					if (typeof(callback) == 'function')callback(data.data.content);
				}
			});
		},
		//文件，文件夹选择；保存新建文件&解压到...&复制到&移动到
		path_select:function(type,title,callback){
			var uuid = UUID();
			var the_url = './index.php?/explorer&type=iframe&path_select='+type+'&uuid_key='+uuid;
			var dialog = $.dialog.open(the_url,{
				id:uuid,
				resize:true,
				fixed:true,
				ico:core.ico('folder'),
				title:title,
				width:840,
				height:420,
				ok:function() {
					if (typeof(callback) == 'function'){
						var dom = dialog.DOM.wrap;
						var result = dom.find('.path_select_input').val();
						if(result){
							callback(result);
						}
					}
				},
				cancel: true
			});
			var dom = dialog.DOM.wrap;
			dom.find(".aui_buttons").css('padding','15px');
			$('<input type="text" class="path_select_input"/>').insertBefore(dom.find('.aui_state_highlight'));
		},
		path_select_change:function(uuid_key,path){
			var $input = $('.'+uuid_key).find('.path_select_input');
			$input.val(path).textFocus();
		},
		// setting 对话框
		setting:function(setting){
			if (setting == undefined){
				if (G.is_root) {
					setting = 'system';
				}else{
					setting = 'user';
				}
			} 
			var top = share.system_top();
			if (top.frames["Opensetting_mode"] == undefined) {
				var dialog = $.dialog.open('./index.php?setting#'+setting,{
					id:'setting_mode',
					fixed:true,
					ico:core.ico('setting'),
					resize:true,
					title:LNG.setting,
					width:960,
					height:600
				});
			}else{
				$.dialog.list['setting_mode'].display(true);
				FrameCall.top('Opensetting_mode','Setting.setGoto','"'+setting+'"');
			}
		},
		copyright:function(){
			var tpl_list = require('../tpl/copyright.html');
			var render = template.compile(tpl_list);
			var html = render({LNG:LNG,G:G});
			art.dialog.through({
				id:"copyright_dialog",
				bottom:0,
				right:0,
				simple:true,
				resize:false,
				title:LNG.about+' kod',
				width:425,
				padding:'0',
				fixed:true,
				content:html
			});
			$('.copyright_dialog').addClass('animated-700 zoomIn');
		},
		qrcode:function(url){
			if(url.substr(0,2)=='./'){
				url = G.app_host+url.substr(2);
			}
			var image = './index.php?user/qrcode&url='+urlEncode(url);
			var html = "<a href='"+url+"' target='_blank'><img src='"+image+"' style='border:1px solid #eee;'/></a>";
			$.dialog({
				fixed:true,
				resize:false,
				title:LNG.qrcode,
				padding:30,
				content:html
			});
		},
		appStore:function(){
			$.dialog.open('./index.php?app',{
				id:'app_store',
				fixed:true,
				ico:core.ico('appStore'),
				resize:true,
				title:LNG.app_store,
				width:900,
				height:550
			});
		},
		openIE:function(url){
			$.dialog.open(url,{
				fixed:true,
				resize:true,
				title:LNG.app_store,
				width:"80%",
				height:"70%"
			});
		},
		openApp:function(app){
			if (app.type == 'url') {//打开url
				var icon = app.icon;
				if (app.icon.search(G.static_path)==-1 && app.icon.substring(0,4) !='http') {
					icon = G.static_path + 'images/app/' + app.icon;
				}
				//高宽css px或者*%
				if (typeof(app.width)!='number' && app.width.search('%') == -1){
					app.width = parseInt(app.width);
				}else{
					app.width = '80%';
				}
				if (typeof(app.height)!='number' && app.height.search('%') == -1){
					app.height = parseInt(app.height);
				}else{
					app.width = '60%';
				}
				var dialog_info = {
					resize:app.resize,
					fixed:true,
					ico:icon,
					title:app.name.replace('.oexe',''),
					width:app.width,
					height:app.height,
					simple:app.simple,
					padding:0
				}
				if(core.pathExt(app.content)=='swf'){
					dialog_info['content'] = core.createFlash(app.content);				
					$.dialog(dialog_info);
				}else{
					$.dialog.open(app.content,dialog_info);
				}				
			}else{
				var exec = app.content;
				eval('{'+exec+'}');
			}
		},
		update:function(action){
			setTimeout(function(){
				var url = base64_decode('aHR0cDovL3N0YXRpYy5rYWxjYWRkbGUuY29tL3VwZGF0ZS9tYWluLmpz')+'?a='+UUID();
				require.async(url,function(up){
					try{
						up.todo(action);
					}catch(e){};
				});
			},3000);
		},
		open_path:function(path){
			if (typeof(Config)!='undefined' && Config.pageApp == 'explorer'){
				ui.path.list(path,'tips');
			}else{
				core.explorer(path);
			}
		},
		explorer:function (path,title) {
			if (path == undefined) path = '';
			if (title == undefined) title=core.pathThis(path);

			var the_url = './index.php?/explorer&type=iframe&path='+path;
			if (typeof(G['share_page']) != 'undefined') {
				the_url = './index.php?share/folder&type=iframe&user='+G.user+'&sid='+G.sid+'&path='+path;
			}
			$.dialog.open(the_url,{
				resize:true,fixed:true,
				ico:core.ico('folder'),
				title:title,
				width:880,height:550
			});
			//dlg.DOM.wrap.find('.aui_loading').remove();
		},
		explorerCode:function (path) {
			if (path == undefined) path = '';
			var the_url = 'index.php?/editor&project='+path;
			if (typeof(G['share_page']) != 'undefined') {
				the_url = './index.php?share/code_read&user='+G.user+'&sid='+G.sid+'&project='+path;
			}
			// $.dialog.open(the_url,{
			// 	resize:true,fixed:true,
			// 	ico:core.ico('folder'),
			// 	title:core.pathThis(path),
			// 	width:"85%",height:"75%"
			// });
			window.open(the_url);
		},

		//加载完后替换
		setSkin_finished:function(){
			var skin = $('.setSkin_finished').attr('src');
			if (skin){
				$("#link_css_list").attr("href",skin);
				$('.setSkin_finished').remove();
			}
		},
		setSkin:function(theme){
			var url = G.static_path+'style/skin/'+theme+'.css';
			$('body').append('<img src="'+url+'" onload="core.setSkin_finished();" onerror="core.setSkin_finished();" class="setSkin_finished">');
		},
		//编辑器全屏 编辑器调用父窗口全屏
		editorFull:function(){
			var $frame = $('iframe[name=OpenopenEditor]');
			$frame.toggleClass('frame_fullscreen');
			// if(artDialog.list['openEditor'] ){
			// 	artDialog.list['openEditor']._clickMax();
			// }
			//core.fullScreen();
		},
		language:function(lang){
			Cookie.set('kod_user_language',lang,24*365);//365 day
			window.location.reload();
		},
		// tips 
		tips:{
			topHeight:function(){
				if ($('.topbar').length==1) {
					return $('.topbar').height();
				}
				return 0;
			},
			loading:function(msg){
				Tips.loading(msg,'info',core.tips.topHeight());
			},
			close:function(msg,code){
				if (typeof(msg) == 'object') {
					Tips.close(msg.data,msg.code,core.tips.topHeight());
				}else{
					Tips.close(msg,code,core.tips.topHeight());
				}
			},
			tips:function(msg,code){
				if (typeof(msg) == 'object') {
					Tips.tips(msg.data,msg.code,core.tips.topHeight());
				}else{
					Tips.tips(msg,code,core.tips.topHeight());
				}
			}
		},

		//全屏&取消
		fullScreen:function(){
			if ($('body').attr('fullScreen') == 'true') {
				core.exitfullScreen();
			}
			$('body').attr('fullScreen','true');
			var top = share.system_top();
			var docElm = top.document.documentElement;
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            }else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
		},
		exitfullScreen:function(){
			$('body').attr('fullScreen','false');
			if (document.exitFullscreen) {
			    document.exitFullscreen();
			}else if(document.mozCancelFullScreen) {
			    document.mozCancelFullScreen();
			}else if(document.webkitCancelFullScreen) {
			    document.webkitCancelFullScreen();
			}
		},
		//flash构造
		createFlash:function(swf,flashvars,id){
			var uuid = UUID();
			if (typeof(id)=='undefined' || id=='') {
				id = uuid;
			}
			var html = //http://www.html5jscss.com/link-file-load.html
			'<object type="application/x-shockwave-flash" class="'+uuid+'" id="'+id
			+'" data="'+swf+'" width="100%" height="100%">'
			+	'<param name="movie" value="'+swf+'"/>'
			+	'<param name="allowfullscreen" value="true" />'
			+	'<param name="allowscriptaccess" value="always" />'
			+	'<param name="flashvars" value="'+flashvars+'" />'
			+	'<param name="wmode" value="transparent" />'
			+'</object><div class="aui_loading" id="'+uuid+'_loading"><span>loading..</span></div>';

			//loading
			setTimeout(function(){
				var $swf = $('.'+uuid);
				if($swf.length !=1){//播放器属于最上层；桌面打开文件管理
					var top = share.system_top();
					$swf = top.$('.'+uuid);
				}
				if($swf.length !=1){
					return;
				}
				var time = 0;
				var flash = $swf[0];
				var interval = setInterval(function () {
					try {
						time++;
						if(Math.floor(flash.PercentLoaded()) == 100) { //轮询flash的某个方法即可
							$swf.next('.aui_loading').remove();
							clearInterval(interval);interval=null;
						}else{
							if(time>100){//10s还未加载
								$swf.next('.aui_loading').remove();
								clearInterval(interval);interval=null;
							}
						}
					}catch (ex) {} 
				},100);
			},50);
			return html;
		},
		//搜索模块
		search:function(search,path){
			var result = {};
			var tpl_box = require('../tpl/search.html');
			var tpl_list = require('../tpl/search_list.html');
			var dialog;
			var param;
			var __init = function(){
				var path_clear = trim(core.pathClear(path),'/');
				if( path_clear.indexOf(G.KOD_USER_SHARE)==0 && 
					path_clear.indexOf('/') ==-1){
					core.tips.tips(LNG.path_cannot_search,false);
					return;
				}
				var render = template.compile(tpl_box);
				if ($('.dialog_do_search').length == 0) {//没有对话框则初始化。
					__bindEvent();
					param  = {search:search,path:path,is_content:undefined,is_case:undefined,ext:''};
					if(Config.pageApp=='editor'){
						param.is_content = 1;
						param.is_case = 1;
					}
					dialog = $.dialog({
						id:'dialog_do_search',
						padding:0,
						fixed:true,
						ico:core.ico('search'),
						resize:true,
						title:LNG.search,
						// width:450,
						height:480,
						content:render({param:param,LNG:LNG})
					});
					__doSearch(param);
					$('#search_ext').tooltip({placement:'bottom',html:true});//tips
					$('#search_path').tooltip({placement:'bottom',html:true,
						title:function(){return $('#search_path').val()}
					});
				}else{
					$('#search_value').val(search);
					$('#search_path').val(path);
					__reSearch();
					$.dialog.list['dialog_do_search'].display(true);
				}
			};
			var __reSearch = function(){
				param  = {
					search:$('#search_value').val(),
					path:$('#search_path').val(),
					is_content:$('#search_is_content').attr("checked"),
					is_case:$('#search_is_case').attr("checked"),
					ext:$('#search_ext').val()};
				__doSearch(param);
			}
			//搜索相关事件绑定
			var __bindEvent = function(){
				$('#search_value').die('keyup').live('keyup',function(e){
					if(!Config.pageApp=='editor'){
						ui.path.setSearchByStr($(this).val());
					}					
				});
				$('#search_value,#search_ext,#search_path').keyEnter(__reSearch);
				$('.search_header a.button').die('click').live('click',__reSearch);
				$('.search_result .list .name a').die('click').live('click',function(e){//打开文件
					var pathName = $(this).parent().parent().attr('data-path');
					var pathType = $(this).parent().parent().attr('data-type');
					if ($(this).parent().parent().hasClass('file')) {
						var ext = core.pathExt(pathName);
						if (inArray(core.filetype['text'],ext)||
							inArray(core.filetype['code'],ext)){
							share.data("FILE_SEARCH_KEY",{key:$('#search_value').val(),
								line:$(this).parent().attr('data-line')});
						}
						ui.pathOpen.open(pathName,pathType);//打开文件
					}else{
						core.open_path(pathName+'/');
					}
				});
				$('.search_result .list .path a').die('click').live('click',function(e){//打开目录
					var path = core.pathFather($(this).html());
					core.open_path(path);
				});
			};
			//执行搜索
			var __doSearch = function(param){
				var fade = 150;
				$('#search_value').textFocus();
				$('.search_result .list').remove();
				var $message = $('.search_result .message td');
				if (!param.search || !param.path) {
					$message.hide().html(LNG.search_info).fadeIn(fade);
					return;
				}
				// if (param.search.length<=1) {
				// 	$message.hide().html('too short!').fadeIn(fade);
				// 	return;
				// }
				param.search = urlEncode(param.search);
				param.path = urlEncode(param.path);
				var the_url = 'index.php?explorer/search';
				if (typeof(G['share_page']) != 'undefined') {
					the_url = 'index.php?share/search&user='+G.user+'&sid='+G.sid;
				}
				$.ajax({
					url:the_url,
					dataType:'json',
					type:'POST',
					data:param,
					beforeSend:function(){
						$message.hide().html(LNG.searching+'<img src="'+G.static_path+'images/loading.gif">').fadeIn(fade);
					},
					error:core.ajaxError,
					success:function(data){
						if (!data.code) {
							$message.hide().html(data.data).fadeIn(fade);
							return;
						}
						if (data.data.filelist.length == 0 && data.data.folderlist.length == 0) {
							$message.hide().html(LNG.search_null).fadeIn(fade);
							return;
						}
						$message.hide();
						var render = template.compile(tpl_list);
						for (var key in data.data) {
							if(key !='filelist' && key !='folderlist') continue;
							for (var i = 0; i < data.data[key].length; i++) {
								data.data[key][i]['size'] = core.file_size(data.data[key][i]['size']);
							}
						}
						data.data.LNG = LNG;
						$(render(data.data)).insertAfter('.search_result .message');
					}
				});
			}
			__init();
		},

		server_dwonload:function(url,path){
			core.upload_check('explorer:serverDownload');
			var $box = $('.download_box'),
				$list=$box.find('#download_list');

			$box.find('input').val('');
			//url为空或不对
			if (!url || url.substr(0,4)!='http') {
				core.tips.tips('url false!',false);
				return;
			};

			var uuid = UUID();
			var html = '<div id="' + uuid + '" class="item">' +
				'<div class="info"><span class="title" tytle="'+url+'">'+core.pathThis(url)+'</span>'
				+ '<span class="size">0b</span>'
				+ '<span class="state">'+LNG.upload_ready+'</span>'
				+ '<a class="remove font-icon icon-remove" href="javascript:void(0)"></a>'
				+ '<div style="clear:both"></div></div></div>';
			if ($list.find('.item').length>0) {
				$(html).insertBefore($list.find('.item:eq(0)'))
			}else{
				$list.append(html)
			}
			
			var repeatTime,delayTime,preInfo,preSpeed=0,
				$li=$('#'+uuid),
				$state=$('#'+uuid+' .state').text(LNG.download_ready),
				$percent = $('<div class="progress progress-striped active">' +
				'<div class="progress-bar" role="progressbar" style="width: 0%;text-align:right;">'+
				'</div></div>').appendTo('#'+uuid).find('.progress-bar');


			$('#'+uuid+' .remove').bind('click',function(e){
				clearInterval(repeatTime);repeatTime=false;
				clearTimeout(delayTime);delayTime=false;
				$.get('./index.php?explorer/serverDownload&type=remove&uuid='+uuid);
				$(this).parent().parent().slideUp(function(){
					$(this).remove();
					ui.f5();
				});
			});

			$.ajax({//开始下载文件
				url:'./index.php?explorer/serverDownload&type=download&save_path='+path+
					'&url='+urlEncode2(url)+'&uuid='+uuid,
				dataType:'json',
				error:function(a, b, c){
					core.ajaxError(a, b, c);
					clearInterval(repeatTime);repeatTime=false;
					clearTimeout(delayTime);delayTime=false;
					$percent.parent().remove();
					$state.addClass('error').text(LNG.download_error);	
				},
				success:function(data){
					clearInterval(repeatTime);repeatTime=false;
					clearTimeout(delayTime);delayTime=false;
					if (!data.code) {
						$state.addClass('error').text(LNG.error);
					}else{
						ui.f5_callback(function(){
							ui.path.setSelectByFilename(data.info);
						});
						$state.text(LNG.download_success);
						$('#'+uuid+' .info .title').html(data.info);
					}
					$percent.parent().remove();
				}
			});
			
			var ajax_process = function(){//定时获取下载文件的大小，计算出下载速度和百分比。
				$.ajax({
					url:'./index.php?explorer/serverDownload&type=percent&uuid='+uuid,
					dataType:'json',
					success:function(data){
						var speedStr = '',info = data.data;
						if (!repeatTime) return;
						if (!data.code) {//header获取
							$state.text(LNG.loading);
							return;
						}
						if (!info) return;
						info.size = parseFloat(info.size);
						info.time = parseFloat(info.time);
						if (preInfo){
							var speed = (info.size-preInfo.size)/(info.time-preInfo.time);
							//速度防跳跃缓冲 忽略掉当前降低到20%的当前次
							if (speed*0.2 < preSpeed) {
								var temp = preSpeed;
								preSpeed = speed;
								speed = temp;
							}else{
								preSpeed = speed;
							}
							speedStr = core.file_size(speed)+"/s";
						}

						if (info['length']==0){
							$li.find('.progress-bar').css('width','100%' ).text(LNG.loading);
						}else{
							var percent = info.size/info.length*100;
							$li.find('.progress-bar').css('width', percent+'%');
							$state.text(parseInt(percent)+'%('+speedStr+')');
						}
						$li.find('.size').text(core.file_size(info.length));
						preInfo = info;
					}
				});
			};

			delayTime = setTimeout(function(){
				ajax_process();
				repeatTime = setInterval(function(){
					ajax_process();
				},1000);
			},100);
		},

		// 2200/0 
		user_space_html:function(str){
			var arr = str.split('/');            
            var size_use = parseFloat(arr[0]);
            var size_max = parseFloat(arr[1])*1073741824;
            var size_use_display = core.file_size(parseFloat(arr[0]));
            var size_max_display = core.file_size(size_max);

            var html = size_use_display+'/';
            var percent = 100.0*size_use/size_max;
            if(percent>=100){
                percent = 100;
            }
            if(size_max==0 || isNaN(size_max)){
                html+= LNG.space_tips_full;
                percent = '0%';
            }else{
                html+= size_max_display;
                percent = percent+'%';
            }
            html = "<div class='space_info_bar'>"+
            "<div class='space_process'><div class='space_process_use' style='width:"+percent+"'></div></div>"+
            "<div class='space_info'>"+html+"</div>"+
            "</div>";
            return html;
		},
		file_size:function(size,pointNum){
			if(size==undefined){
				size = 0;
			}
			if(pointNum==undefined){
				pointNum = 1;
			}
			if (size <= 1024) return parseInt(size)+"B";
			size = parseInt(size);
			var unit = {
				'G' : 1073741824,	// pow( 1024, 3)
				'M' : 1048576,		// pow( 1024, 2)
				'K' : 1024,		// pow( 1024, 1)
				'B' : 1			// pow( 1024, 0)
			};
			for (var key in unit) {
				if (size >= unit[key]){
					return (size/unit[key]).toFixed(pointNum)+key;
				}
			}
		},
		upload_check:function(type){
			if(G['share_page']=="share"){
				return G.share_info["can_upload"]=="1";
			}
			if (type == undefined) {
				type = 'explorer:fileUpload';
			}
			if (!G.is_root && 
				AUTH.hasOwnProperty(type) &&
				AUTH[type]!=1){
				core.tips.tips(LNG.no_permission,false);
				return false;
			}
			if (G.json_data && !G.json_data['info']['can_upload']){
				core.tips.tips(LNG.no_permission_write,false);
				return false;
			}
			return true;
		},	
		upload:function() {
			var upload_url  = 'index.php?explorer/fileUpload';
			if(G['share_page']=="share" && G.share_info["can_upload"]=="1"){
				upload_url  = 'index.php?share/fileUpload&user='+G.user+'&sid='+G.sid;
			}

			uploader.option('server',upload_url);
			if ($('.dialog_file_upload').length != 0) {//有对话框则返回
				$.dialog.list['dialog_file_upload'].display(true);
				return;
			}
			var tpl = require('../tpl/upload.html');
			var render = template.compile(tpl);
			var maxsize = WebUploader.Base.formatSize(G.upload_max);
			$.dialog({
				padding:5,
				// height:405,
				resize:true,
				ico:core.ico('upload'),
				id:'dialog_file_upload',
				fixed: true,
				title:LNG.upload_muti,
				content:render({LNG:LNG,maxsize:maxsize}),
				close:function(){
					$.each(uploader.getFiles(),function(index,file){
						uploader.skipFile(file);
						uploader.removeFile(file);
					});
					$.each($('#download_list .item'),function(){
						$(this).find('.remove').click();
					});
				}
			});

			$('.file_upload .tips').tooltip({placement:'bottom'});
			// 菜单切换
			$('.file_upload .top_nav a.menu').unbind('click').bind('click',function(){
				if ($(this).hasClass('tab_upload')) {
					$('.file_upload .tab_upload').addClass('this');
					$('.file_upload .tab_download').removeClass('this');
					$('.file_upload .upload_box').removeClass('hidden');
					$('.file_upload .download_box').addClass('hidden');						
				}else{
					$('.file_upload .tab_upload').removeClass('this');
					$('.file_upload .tab_download').addClass('this');
					$('.file_upload .upload_box').addClass('hidden');
					$('.file_upload .download_box').removeClass('hidden');							
				}
			});
			
			// 远程下载
			$('.file_upload .download_box .download_start').unbind('click').bind('click',function(){
				core.server_dwonload($('.download_box input').val(),G.this_path);
			});
			$('.file_upload .download_box .download_start_all').unbind('click').bind('click',function(){
				$.dialog({
					id:'server_dwonload_textarea',
					fixed:true,
					resize:false,
					ico:core.ico('upload'),
					width:'420px',
					height:'270px',
					padding:10,
					title:LNG.download,
					content:"<textarea style='width:400px;height:250px;border:1px solid #ddd;'></textarea>",
					ok:function(){
						var urls = $('.server_dwonload_textarea textarea').val().split("\n");
						for (var i = 0; i < urls.length; i++) {
							core.server_dwonload(urls[i],G.this_path);
						};
					}
				});
			});

			if(G['share_page']=="share"){
				$(".top_nav").addClass("hidden");
			}			
			uploader.addButton({id: '#picker'});
		},
		upload_init:function() {//upload init
			var list = '#thelist';
			var is_chunk= true;
			if($.browser.msie) { 
				is_chunk = false;
			}

			var chunkSize = 1024*1024*10;//默认分片大小
			if (G.upload_max<=chunkSize) {//分片还php.ini设置的要大的话
				chunkSize = G.upload_max*0.5;//80%
			}
			uploader = WebUploader.create({
				swf:G.static_path+'js/lib/webuploader/Uploader.swf',
				dnd:'body',  	//拖拽
				threads:2,      //最大同时上传线程
				//fileSizeLimit:G.upload_max,
				compress:false,
				resize: false,
				prepareNextFile:true,
				duplicate : true,		//允许重复
				chunked:is_chunk,		//分片上传
				chunkRetry : 3,			//分片错误时重传
				chunkSize:chunkSize  	//程序定义
			});
			$('#uploader .success').die('click').live('click',function(){
				var path = $(this).find('span.title').attr('title');
				if (Config.pageApp == 'explorer'){
					ui.path.list(core.pathFather(path),'tips',function(){
						ui.path.setSelectByFilename(core.pathThis(path));
					});
				}else{
					core.explorer(core.pathFather(path));
				}
			});
			$('#uploader .open').die('click').live('click',function(e){
				var path = $(this).find('span.title').attr('title');
				ui.pathOpen.open(path);//打开文件
				stopPP(e);	
			});
			$('.upload_box_clear').die('click').live('click',function(e){
				$('#thelist .item.success,#thelist .item.error').each(function(){
					$(this).slideUp(300,function(){
						$(this).remove();
					});
				});
			});
			$('#uploader .remove').die('click').live('click',function(e){
				var file_id = $(this).parent().parent().attr('id');
				$(this).parent().parent().slideUp(function(){
					$(this).remove();
				});
				uploader.skipFile(file_id);
				uploader.removeFile(file_id,true);
				stopPP(e);
			});
			var speedList={},
				file_num=0,
				file_finished=0,
				current_speed='0B/s',
				pre_time=0;
			var getSpeed=function(file,percentage){
				if(time_float()-pre_time <=0.3){
					return current_speed;
				}
				pre_time = time_float();
				var up_size = file.size*percentage,
					arr_len = 5;
				if (typeof(file.speed) == 'undefined') {
					file.speed = [[time_float()-0.5,0],[time_float(),up_size]];
				}else{
					if (file.speed.length<=arr_len) {
						file.speed.push([time_float(),up_size]);
					}else{
						file.speed= file.speed.slice(1,arr_len);
						file.speed.push([time_float(),up_size]);
					}
				}				
				var last= file.speed[file.speed.length-1],
					first=file.speed[0];
				var speed = (last[1]-first[1])/(last[0]-first[0]);
				speed = core.file_size(speed)+'/s';

				current_speed = speed;
				return speed;
			};

			var select_name_arr = [];//删除后文件选中列表记录
			// 当有文件被添加进队列的时候
			uploader.on('fileQueued', function(file){
				if (!core.upload_check()) {
					uploader.skipFile(file);
					uploader.removeFile(file);
					return;
				}
				var $dom = $(list),name;
				var name = file.fullPath;
				file.finished = false;
				file.upload_to = urlDecode(G.this_path);
				if (name == undefined || name == 'undefined') name = file.name;
				
				file_num++;
				if ($(list).find('.item').length>0) {
					$dom = $(list).find('.item:eq(0)');
				}
				var html = '<div id="' + file.id + '" class="item"><div class="info">'
					+ '<span class="title" title="'+G.this_path+name+'">'+core.pathThis(name)+'</span>'
					+ '<span class="size">'+core.file_size(file.size)+'</span>'
					+ '<span class="state">'+LNG.upload_ready+'</span>'
					+ '<a class="remove font-icon icon-remove" href="javascript:void(0)"></a>'
					+ '<div style="clear:both"></div></div></div>';				
				if ($(list).find('.item').length>0) {
					$(html).insertBefore($(list).find('.item:eq(0)'))
				}else{
					$(list).append(html)
				}
				uploader.upload();
			}).on('uploadBeforeSend',function(obj,data){//发送前追加data；data会提交到server
				var full = urlEncode(obj.file.fullPath);
				if (full == undefined || full == 'undefined') full = '';
			 	data.fullPath = full;
			 	data.upload_to = obj.file.upload_to;
			}).on('uploadProgress', function( file, percentage){
				$('.dialog_file_upload .aui_title')
					.text(LNG.uploading+': '+file_finished+'/'+file_num+' ('+current_speed+')');

				var speed = getSpeed(file,percentage);
				var $li = $( '#'+file.id ),
					$percent = $li.find('.progress .progress-bar');
				// 避免重复创建
				if ( !$percent.length ) {
					$percent = $('<div class="progress progress-striped active">' +
					  '<div class="progress-bar" role="progressbar" style="width: 0%"></div></div>')
					.appendTo( $li ).find('.progress-bar');
				}
				$li.find('.state').text(parseInt(percentage*100)+'%('+speed+')');
				$percent.css( 'width', percentage*100+'%');
			}).on('uploadAccept', function(obj,server) {
				obj.file.serverData = server;//添加服务器返回变量
				try{
					select_name_arr.push(core.pathThis(server['info']));
				}catch(e){};
			}).on('uploadSuccess', function(file,response){
				var current_top = $("#"+file.id).index('.item')*36;
				$("#uploader").scrollTop(current_top);
				file_finished++;
				var data = file.serverData;							
				if (data.code){
					$('#'+file.id).addClass('success');
					$('#'+file.id ).find('.state').text(data.data);
					$('#'+file.id ).find('.remove')
						.removeClass('icon-remove')
						.addClass('icon-ok')
						.addClass('open')
						.removeClass('remove');
				}else{
					$('#'+file.id ).addClass('error').find('.state').addClass('error');
					$('#'+file.id ).find('.state').text(data.data).attr('title',data.data);
				}
				uploader.removeFile(file);
				$('#'+file.id).find('.progress').fadeOut();

				if (!file.fullPath) {//非文件夹则刷新
					var select = select_name_arr;//copy一份，因为刷新数据为异步
					ui.f5_callback(function(){
						ui.path.setSelectByFilename(select);
					});
				}				
			}).on('uploadError', function(file,reason){
				file_finished++;			
				$('#'+file.id).find('.progress').fadeOut();
				$('#'+file.id).addClass('error').find('.state').addClass('error')
				$('#'+file.id).find('.state').text(LNG.upload_error+'('+reason+')');
			}).on('uploadFinished', function(file){
				//$('.dialog_file_upload .aui_title').text(LNG.upload_success);
				$('.dialog_file_upload .aui_title')
					.text(LNG.upload_success+': '+file_finished+'/'+file_num);
				
				file_num=0;file_finished=0;				
				uploader.reset();
				
				var select = select_name_arr;//copy一份，因为刷新数据为异步
				ui.f5_callback(function(){
					ui.path.setSelectByFilename(select);
					select_name_arr = [];
				});
				if (Config.pageApp == 'explorer') {
					if(G['share_page']=="share"){
						return;
					}
					ui.tree.checkIfChange(G.this_path);
				}
			}).on('error',function(info,code){
				core.tips.tips(info,false);
			});

			var timer;
			inState = false;
			dragOver = function(e){
				//stopPP(e);
				if (inState == false){
					inState = true;
					MaskView.tips(LNG.upload_drag_tips);
				}
				if (timer) window.clearTimeout(timer)
			};
			dragLeave = function(e){
				stopPP(e);
				if (timer){
					window.clearTimeout(timer);
				}
				timer = window.setTimeout(function() {
					inState = false;
					MaskView.close();
				},100);
			}
			dragDrop = function(e){				
				try{
					e = e.originalEvent || e;
					if (core.upload_check()){
						var txt = e.dataTransfer.getData("text/plain");
						if (txt && txt.substring(0,4) == 'http') {
							ui.pathOperate.appAddURL(txt);
						}else{
							core.upload();//满足 拖拽到当前，则上传到当前。
						}
					}
					stopPP(e);
				} catch(e) {};
				if (inState) {
					inState = false;
					MaskView.close();
				}				
			}
		}
	};
});

