define(function(require, exports) {
	var editors  = {};
	var focusID  = undefined;
	var aceModeList = ace.require("ace/ext/modelist");
	var ace_tools = ace.require("ace/ext/language_tools");
	var Preview = require('./preview');

	// 通过属性查找。
	var editorFind = function(key,value){
		if (value==undefined || key==undefined || editors.length<1) return '';
		for (var obj in editors){
			if (editors[obj]['kod'][key] == value){
				return editors[obj]['kod'].uuid;
			}
		}
		return '';
	};

	var init=function(){
		var defaultConfig = {//编辑器支持的参数；后续新加参数后端自动保存
			auto_complete:1,
			keyboard_type:'ace',//ace vim emacs
			theme:'tomorrow',
			font_size:'15px',
			font_family:'Consolas',
			tab_size:4,
			soft_tab:1, 
			auto_wrap:1,//自适应宽度换行
			display_char:0,//是否显示特殊字符
			function_list:1
		};
		for(var key in defaultConfig){//合并默认值
			if(typeof(G.code_config[key]) == 'undefined'){
				G.code_config[key] = defaultConfig[key];
			}
		}
		auto_function_list = parseInt(G.code_config.function_list);
		Toolbar.toolbarSelected();
		reset_font_family();

		//全局事件；
	    $('body').bind('click',function(e){//目录菜单自动
	        if( $(e.target).hasClass('markdown_menu_box')|| 
	            $(e.target).parents('.markdown_menu_box').length!=0){
	            return;//事件在对话框中
	        }
	        $('.markdown_menu_box').addClass('hidden');
	    });
	};
	var initAdd = function(filename){
		var initData;
		var uuid = 'id_'+ UUID();
		if (filename == undefined || filename=='') {
			initData = {
				uuid:       uuid,
				name:       'newfile.txt',
				charset:    'utf-8',
				filename:   '',
				mode:       aceModeList.getModeForPath('test.txt').name,
				the_url:""
			};
			initEditor(initData);
			initAce(initData);
			$('.edit_body .this').removeClass('this');
			$('.edit_body pre#'+uuid).parent().addClass('this');
			$('.tab_'+initData.uuid).removeClass("loading");
			return;
		}

		var the_url = './index.php?editor/fileGet&filename='+filename;
		if (typeof(G['share_page']) != 'undefined') {
			the_url = './index.php?share/fileGet&user='+G.user+'&sid='+G.sid+'&filename='+filename;
		}
		//打开文件
		initData = {
			charset:    'utf-8',
			uuid:       uuid,
			name:       core.pathThis(urlDecode(urlDecode(filename))),
			filename:   filename,
			mode:       aceModeList.getModeForPath(urlDecode(filename)).name,
			the_url:    the_url,
		};

		initEditor(initData,true);
		editors[initData.uuid]={kod:{'filename':initData.filename}};//先占位		

		var dialog = art.dialog({
			id:'dialog_'+initData.uuid,
			title:false,
			content:LNG.getting+"",
			icon:'warning',
			parentAt:$('.edit_body pre#'+initData.uuid).parent()
		});
		$.ajax({
			dataType:'json',
			url:the_url,
			error:function(XMLHttpRequest, textStatus, errorThrown) {
				_removeData(initData.uuid);
				core.ajaxError(XMLHttpRequest, textStatus, errorThrown);
				dialog && dialog.close();
			},
			success: function(result) {				
				$('.tab_'+initData.uuid).removeClass("loading");
				dialog && dialog.close();
				if($('#'+initData.uuid).length==0){//已经关闭
					_removeData(initData.uuid);
					return;
				}
				if (!result.code){
					Tips.tips(result);
					_removeData(initData.uuid);
					return;
				}
				var data = result.data;
				if (data['base64'] == true) {
					data.content = base64_decode(data.content);
				}

				//编辑
				var data_pre = '<?php exit;?>';
				if(data.ext=='php' && data.content.indexOf(data_pre)==0){
					var the_data = data.content.substr(data_pre.length);
					data.content = data_pre+js_beautify(the_data);
					initData.mode = aceModeList.getModeForPath("test.json").name;
				}
				if(data.ext=='oexe'){
					data.content = js_beautify(data.content);
					initData.mode = aceModeList.getModeForPath("test.json").name;
				}
				editors[uuid] = undefined;
				$('#'+uuid).text(data.content);
				initAce(initData);

				var current = editors[uuid];
				current.kod.charset = data.charset;
				current.kod.base64 = data['base64'];
				current.navigateTo(0);
				current.moveCursorTo(0,0);
				
				auto_search();
				bottomToolbarResize();
				selectTabTitle();
				Toolbar.toolbarSelected();
			}
		});		
	};

	var initEditor = function(initData,no_animate){
		var html_tab = 
		'<div class="edit_tab_menu tab loading tab_'+initData.uuid+'" uuid="'
			+initData.uuid+'" title="'+urlDecode(urlDecode(initData.filename))+'">'+
		'   <div class="name">'+initData.name+'</div>'+
		'   <a href="javascript:void(0);" class="close icon-remove" draggable="false"></a>'+
		'   <div style="clear:both;"></div>'+
		'</div>';
		$(html_tab).insertBefore('.edit_tab .add');
		var html = require('./tpl/edit_tab_content.html');
		var render = template.compile(html);
		var html_body = render({LNG:LNG,uuid:initData.uuid});
		$('.edit_body .tabs').append(html_body);
		select(initData.uuid);
		if (no_animate) {
			var temp_time=animate_time;animate_time = 1;
			Tap.resetWidth('add');
			animate_time = temp_time;
		}else{
			Tap.resetWidth('add');
		}
		reset_font_family();
	};
	var initAce = function(initData){
		var this_editor = ace.edit(initData.uuid);
		this_editor.setTheme("ace/theme/"+G.code_config.theme);
		if (initData.mode != undefined) {
			this_editor.getSession().setMode("ace/mode/"+initData.mode);
		}
		this_editor.getSession().setTabSize(G.code_config.tab_size);
		this_editor.getSession().setUseSoftTabs(G.code_config.soft_tab);
		this_editor.getSession().setUseWrapMode(G.code_config.auto_wrap);
		if(G.code_config.keyboard_type=='ace'){
			this_editor.setKeyboardHandler();
		}else{
			this_editor.setKeyboardHandler('ace/keyboard/'+G.code_config.keyboard_type);
		}

		this_editor.$blockScrolling = Infinity;
		this_editor.setShowPrintMargin(true);//代码宽度提示
		this_editor.setPrintMarginColumn(120);//显示固定宽度
		this_editor.setDragDelay(100);
		this_editor.setShowInvisibles(G.code_config.display_char);
		this_editor.setFontSize(G.code_config.font_size);
		this_editor.setAnimatedScroll(true);
		this_editor.setOptions({
			enableSnippets: true,
			enableBasicAutocompletion:true,
			enableLiveAutocompletion:G.code_config.auto_complete
		});


		var changeDelayTimer;//快速变化屏蔽
		var editor_change = function(){
			setChanged(this_editor,true);
			clearTimeout(changeDelayTimer);changeDelayTimer=false;
		    changeDelayTimer = setTimeout(function(){
		        this_editor.kod.preview.editChange();
		    },300);
		}
		
		this_editor.on("change", function(e){//ace_selected
		    editor_change();
		});
		this_editor.on("changeSelection", function(e){//ace_selected
			cursor_change();//选中更新
		});
		this_editor.commands.addCommand({
			name: 'editSave',
			bindKey: {win: 'Ctrl-S',  mac: 'Command-S',sender: 'editor|cli'},
			exec: function(editor,args, request) {
				save(editor.kod.uuid);
			}
		});
		this_editor.commands.addCommand({
			name: 'editFunction',
			bindKey: {win: 'Ctrl-Shift-E',  mac: 'Command-Shift-E',sender: 'editor|cli'},
			exec: function(editor,args, request) {
				Toolbar.doAction('function_list');
			}
		});
		this_editor.commands.addCommand({
			name: 'preview',
			bindKey: {win: 'Ctrl-Shift-S',  mac: 'Command-Shift-S'},
			exec: function(editor) {
				Toolbar.doAction('preview');
			}
		});

		//全选选中部分；多标签编辑
		this_editor.commands.addCommand({
			name: 'preview',
			bindKey: {win: 'Ctrl-command-G',  mac: 'Ctrl-command-G'},
			exec:function(editor){
				editor.findAll(editor.session.getTextRange());
				cursor_change();
			}
		});
		this_editor.commands.addCommand({
			name: 'refresh',
			bindKey: {win: 'F5',  mac: 'F5'},
			exec: function(editor) {
				Toolbar.doAction('refresh');
			}
		});

		//数据存储;以对象的方式存储在ace实例中
		if (!initData.mode) {
			initData.mode = '';
		}

		this_editor.kod = {
			'mode':initData.mode,
			'uuid':initData.uuid,
			'name':initData.name,
			'base64':false,
			'charset':'utf-8',
			'the_url':initData.the_url,
			'filename':initData.filename
		}
		this_editor.hasChanged = false;
		editors[initData.uuid]=this_editor;
		this_editor.kod.preview = new Preview(this_editor);
	}

	var selectTabTitle = function(){
		var the_editor = current();
		if (the_editor) {//设置dialog标题栏
			the_editor.focus();
			the_editor.resize();//解决大小变更后，切换标签文本显示问题。
			try{
				var dialog = window.parent.art.dialog.list['openEditor'];
				var fileName = urlDecode(urlDecode(Editor.current().kod.filename));
				var path = '<img draggable="false" src="'+G.static_path+'images/file_icon/icon_others/edit.png"/>'+fileName;
				if (dialog) {
					dialog.title(path);
					var url = './index.php?editor/edit#filename='+urlEncode2(fileName);
					window.parent.$('.openEditor .aui_content iframe').attr('src',url);
				}
			}catch(e) {};
		}
	}
	var _selectTab = function(uuid,exist){
		try{//隐藏前一个页面的自动提示
			Editor.current().completer.popup.hide();
		}catch(e) {};        
		$('.edit_tab .this').removeClass('this');
		$('.edit_tab .tab_'+uuid).addClass('this');
		focusID = uuid;
		if (exist) {
			$('.edit_tab .this')
				.stop(true,true)
				.animate({"opacity":0.3},100)
				.animate({"opacity":0.8},100)
				.animate({"opacity":0.5},40)
				.animate({"opacity":1},40,function(){
					//editors[uuid].focus();
				});
		}
		selectTabTitle();
		cursor_change();
		tabNumChanged();
		bottomToolbarResize();
	}

	//选中 分次封装
	var select = function(uuid,exist) {        
		if(uuid == undefined || uuid =='') return;
		$('.edit_body .this').removeClass('this');
		$('.edit_body #'+uuid).parent().addClass('this');
		_selectTab(uuid,exist);            
	};
	var set_config = function(key,value,uuid){
		var box = editors;
		var before_code_config = $.extend(true, {}, G.code_config);
		if (uuid != undefined){
			box={};
			if(box[uuid]){
				box[uuid]=editors[uuid];
			}else{
				box[focusID] = editors[focusID];
			}            
		}        
		var  bool_change = function(val){
			var res=Number(!Number(val));
			if(isNaN(res)){
				return 0;
			}else{
				return res;
			}
		}
		if(typeof(value)!='undefined'){
			G.code_config[key] = value;
		}else{//开关类操作
			G.code_config[key] = bool_change(G.code_config[key]);
		}
	   
		Toolbar.toolbarSelected();
		for(var obj in box){
			var edit = box[obj];
			if(!edit || !edit.kod || !edit.resize){
				continue;
			}
			switch(key){
				case 'theme':edit.setTheme("ace/theme/"+value);break;
				case 'tab_size':edit.getSession().setTabSize(value);break;
				case 'soft_tab':edit.getSession().setUseSoftTabs(G.code_config[key]);break;
				case 'font_size':edit.setFontSize(value);break;
				case 'auto_wrap':edit.getSession().setUseWrapMode(G.code_config[key]);break;
				case 'display_char':edit.setShowInvisibles(G.code_config[key]);break;//自动换行 true/false
				case 'font_family':reset_font_family();break;//保存
				case 'keyboard_type':
					if(G.code_config.keyboard_type=='ace'){
						edit.setKeyboardHandler();
					}else{
						edit.setKeyboardHandler('ace/keyboard/'+G.code_config.keyboard_type);
					}
					break;
				case 'function_list':break;                
				case 'auto_complete':
					edit.setOptions({enableLiveAutocompletion:G.code_config[key]});
					edit.$enableBasicAutocompletion = G.code_config[key]; 
					break;
				default:break;
			}
		}
		$.ajax({
			url:'./index.php?editor/setConfig&k='+key+'&v='+G.code_config[key],
			dataType:'json',
			success:function(data){
				//tips(data);
			}
		});
	};


	var reset_font_family = function(){
		var font = G.code_config.font_family;
		font = "'"+font+"',Consolas, 'Liberation Mono','Ubuntu Mono', Menlo, Courier, monospace";
		$('.ace_editor_content').css('font-family',font);
	}
	var do_action = function(action){
		var box = editors;
		for(var obj in box){
			var edit = box[obj];
			if(!edit || !edit.kod || !edit.resize){
				continue;
			}
			switch(action){
				case 'resize':edit.resize();break;   
				case 'setting':
					edit.commands.exec('showSettingsMenu',edit);
					break;//自动换行 true/false 
				default:break;
			}
		}
		if(action == 'resize'){
			bottomToolbarResize();
		}
	}

	//状态栏位置
	var bottomToolbarResize = function(){
		var the_editor = current();
		if(the_editor){
			var $box_right = $('#'+the_editor.kod.uuid).parent().find('.edit_right_frame');
			var width = 0;
			if(!$box_right.hasClass('hidden')){
				width = $box_right.width()/$(window).width()*100.0;
			}
			$('.edit_body .bottom_toolbar').css('right',width+'%');
		}
	}

	//内容进行了编辑
	var setChanged = function(theEditor,type){
		if (type == theEditor.hasChanged) return;
		theEditor.hasChanged = type;//true(change) or false(nochange)
		$('.edit_tab .tabs .tab_'+theEditor.kod.uuid).toggleClass('edit_changed');
	};

	// 编辑保存，如果是新建标签则新建文件，询问保存路径。
	var save = function(uuid,isDelete){
		if (focusID == undefined) return;
		if (uuid == undefined) uuid = focusID;
		if (isDelete == undefined) isDelete = false;

		var edit_this = editors[uuid];
		if(!edit_this.hasChanged) return;
		if(edit_this == undefined || edit_this == '') {
			tips(LNG.data_error,'warning');return;
		}

		current().focus();
		var filename = edit_this.kod.filename;
		if (filename == '') {//新建文件保存
			core.path_select('file',LNG.newfile_save_as,function(path){
				save_post_server(edit_this,path,isDelete);
			});
		}else{
			save_post_server(edit_this,filename,isDelete);
		}		
	}
	var saveall = function(){
		for (var obj in editors){
			if(editors[obj].kod.filename!=''){
				save(obj);
			}			
		}
	};
	var save_post_server = function(edit_this,filename,isDelete){
		var post_data = {
			'path':urlDecode(filename),
			'charset':edit_this.kod.charset,
			'filestr':edit_this.getValue()
		};
		var the_url = './index.php?editor/fileSave';
		if (typeof(G['share_page']) != 'undefined') {
			the_url = './index.php?share/fileSave&user='+G.user+'&sid='+G.sid+'&filename='+filename;
		}
		//支持二进制文件编辑
		if(edit_this.kod.base64){
			post_data.base64  = '1';
			post_data.filestr = base64_encode(post_data.filestr);
		}
		post_data.filestr = urlEncode(post_data.filestr);
		if(edit_this.kod.filename==''){
			post_data.create_file=1;
		}

		var dialog = art.dialog({
			title:false,
			content:LNG.getting,
			icon:'warning',
			parentAt:$('.edit_body pre#'+edit_this.kod.uuid).parent()
		});
		$('.tab_'+edit_this.kod.uuid).addClass("loading");//loading tab
		$.ajax({
			type:'POST',
			//async:false,
			dataType:'json',
			url:the_url,
			data:post_data,
			error:core.ajaxError,
			success:function(data){
				dialog && dialog.close();
				$('.tab_'+edit_this.kod.uuid).removeClass("loading");
				if (!data.code) return;
				if(edit_this.kod.filename==''){
					edit_this.kod.filename = filename;
					refresh_tab_file(edit_this);
				}
				// 保存成功 记录上次保存时的修改时间。
				setChanged(edit_this,false);
				if (isDelete) {
					_removeData(edit_this.kod.uuid);
				}
			}
		});
	}

	//新建文件；更新相关信息
	var refresh_tab_file = function(edit_this){
		var filename = edit_this.kod.filename;
		edit_this.kod.name = core.pathThis(filename);
		edit_this.kod.mode = aceModeList.getModeForPath(filename).name;
		edit_this.kod.the_url = './index.php?editor/fileGet&filename='+filename;
		var $tab = $('.tab_'+edit_this.kod.uuid);
		$tab.attr('title',filename);
		$tab.find('.name').html(edit_this.kod.name);
	}
	
	//安全删除标签，先检测该文档是否修改。
	var removeSafe = function(uuid) {
		if (uuid == undefined) uuid = focusID;
		if (editors[uuid] == undefined){
			_removeData(uuid);
			return;
		} 
		var edit_this = editors[uuid];
		if (edit_this.hasChanged) {
			$.dialog({
				title:LNG.warning,
				resize:false,
				background: '#fff',
				opacity: 0.4,
				lock:true,
				icon: 'question',
				content:edit_this.kod.name+'<br/>'+LNG.if_save_file,
				padding:40,
				button:[
					{name:LNG.button_save,focus:true,callback:function(){
						save(uuid,true);
					}},
					{name:LNG.button_not_save,callback:function(){
						_removeData(uuid);
					}}
				]
			});
		}else{
			_removeData(uuid);
		}
	}

	//删除
	var _removeData = function(uuid) {
		delete editors[uuid];
		var changeID = '';
		var $tabs    = $('.edit_tab .tab');
		var $that    = $('.edit_tab .tab_'+uuid);
		var $editor  = $('.edit_body pre#'+uuid).parent();  
		if ($that.hasClass('this')){
			if ($($tabs[0]).attr('uuid') == uuid) {
				changeID = $($tabs[1]).attr('uuid');
			}else{
				$tabs.each(function(i){
					var temp_id = $(this).attr('uuid');
					if (temp_id == uuid){return false;}//跳出该循环。
					changeID = temp_id;
				});
			}
			if(changeID !=''){//先显示下一个body，避免闪烁
				$('.edit_body pre#'+changeID).addClass('this');
			}
			$editor.remove();
			Tap.resetWidth('remove',$that,changeID);
		}else{
			$editor.remove();
			Tap.resetWidth('remove',$that);
		}
		tabNumChanged();        
	};

	//tab个数发生了变化
	var tabNumChanged = function(){
		//全部关闭了
		if ($('.edit_body .tabs .edit_content').length==0) {
			if(current()){
				current().kod.preview.close();
			}
			$('.disable_mask,.introduction').removeClass('hidden');
			$('.bottom_toolbar').addClass('hidden');
			$('.edit_body .tabs').addClass('hidden');
		}else{
			$('.disable_mask,.introduction').addClass('hidden');
			$('.bottom_toolbar').removeClass('hidden');
			$('.edit_body .tabs').removeClass('hidden');
		}		
	}

	var hasFileSave = function(){
		for (var obj in editors){
			if (editors[obj].hasChanged) return true;
		}
		return false;
	};
	var setTheme = function(thistheme){
		core.setSkin(thistheme);
	};
	var current = function(){
		if (!focusID || !editors[focusID] || !editors[focusID].focus) return false;
		return editors[focusID];
	};
	var refresh = function(uuid){
		var $current = Editor.current();
		if(uuid){
			$current = editors[uuid];
		}		
		var the_url = $current.kod.the_url;
		var uuid = $current.kod.uuid;
		if (the_url=='') {
			tips(LNG.not_exists,'warning');
			return;
		}
		var dialog = art.dialog({
			title:false,
			content:LNG.getting,
			icon:'warning',
			parentAt:$('.edit_body pre#'+uuid).parent()
		});
		$('.tab_'+uuid).addClass("loading");
		$.ajax({
			dataType:'json',
			url:the_url,
			error:function(XMLHttpRequest, textStatus, errorThrown) {
				dialog && dialog.close();
				$('.tab_'+uuid).removeClass("loading");
				core.ajaxError(XMLHttpRequest, textStatus, errorThrown);
			},
			success: function(result) {
				dialog && dialog.close();
				$('.tab_'+uuid).removeClass("loading");
				if (!result.code){
					Tips.tips(result);
					return;
				}

				var data = result.data;
				if (data['base64'] == true) {
					data.content = base64_decode(data.content);
				}
				var data_pre = '<?php exit;?>';
				if(data.ext=='php' && data.content.indexOf(data_pre)==0){
					var the_data = data.content.substr(data_pre.length);
					data.content = data_pre+js_beautify(the_data);
				}
				if(data.ext=='oexe'){
					data.content = js_beautify(data.content);
				}
				$current.kod.charset = data.charset;
				$current.kod.base64 = data['base64'];

				$current.getSession().setValue(data.content);
				var row = $current.getFirstVisibleRow();
				$current.scrollToLine(row);
				setChanged($current,false);
			}
		});
	}
	
	//从搜索打开，自动搜索关键词
	var auto_search = function(){
		if(share.data("FILE_SEARCH_KEY")){
			setTimeout(function(){
				var the_curent = current();
				the_curent.gotoLine(share.data("FILE_SEARCH_KEY").line);
				the_curent.find(share.data("FILE_SEARCH_KEY").key);				
				share.remove("FILE_SEARCH_KEY");
			},100);
		}
	}

	var cursor_change = function(){
		var editor = Editor.current();
		if(!editor) return;
		var info = editor.selection.getCursor();
		var html = info.row+':'+info.column;
		if(editor.selection.rangeCount>1){
			html+= '  ['+editor.selection.rangeCount+']'
		}

		//选中文本长度
		var select = editor.selection.getAllRanges();
		var select_size = 0;
		for (var i = 0; i < select.length; i++) {
			var range = {start: select[i].start, end: select[i].end};
			var text = editor.selection.doc.getTextRange(range);
			select_size += text.length;
		}
		if(select_size >0){
			html += ' ('+select_size+' B)'
		}
		$('.editor_position').html(html);
	}

	//----------------------------------------
	return {
		init:init,
		current:current,
		hasFileSave:hasFileSave,
		set_config:set_config,
		do_action:do_action,
		setTheme:setTheme,
		select:select,
		remove:removeSafe,
		save:save,
		saveall:saveall,
		refresh:refresh,
		cursor_change:cursor_change,
		aceModeList:aceModeList,
		add:function(filename){
			var id   = editorFind('filename',filename);			
			if (id  != ''){//已存在
				select(id,true);
				auto_search();
			}else{
				initAdd(filename);
			}
		}
	};
});

