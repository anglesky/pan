define(function(require, exports) {
	var bindToolbarMenu = function(){
		bind_menu_event();
		$('.toolMenu').bind('click mouseup',stopPP);
		$('.toolMenu').on('mousedown', function(e){
			$('.toolMenu').removeClass('select')
			$(this).addClass('select');
			$(this).contextMenu({action:reset_menu_position});
		});

		var reset_menu_position = function(menu,obj){
			if(obj.parent().hasClass('top_toolbar')){
				menu.css({left:obj.offset().left-4,top:obj.outerHeight()-1});
			}else if(obj.parent().hasClass('bottom_toolbar')){
				var offset_left = obj.offset().left-menu.outerWidth()+obj.outerWidth()-5;
				menu.css({left:offset_left,top:obj.offset().top-menu.outerHeight()});
			}
			if(menu.find('input').length>=1){
				setTimeout(function(){//自动焦点
					menu.find('input').focus();
				},10);                
			}
		}

		$.contextMenu({
			selector: '.menuViewGotoline',
			trigger:"none",
			callback:doAction,
			items: {
				"gotoline": {name:LNG.goto,className:'disable gotoline_input',type:'text'},
			}
		});
		$.contextMenu({
			selector: '.menuViewTab',
			trigger:"none",
			callback:doAction,
			items: {
				"soft_tab": {name:"Soft Tabs (spaces)",className:'soft_tab'},
				"sep1": "---------",
				"tab_size_2": {name:"Tab with:2",className:'tab_size_set tab_size_2'},
				"tab_size_3": {name:"Tab with:3",className:'tab_size_set tab_size_3'},
				"tab_size_4": {name:"Tab with:4",className:'tab_size_set tab_size_4'},
				"tab_size_8": {name:"Tab with:8",className:'tab_size_set tab_size_8'}
			}
		});

		var fontFamilyAll= ["Consolas","Courier","Courier New","DejaVu Sans Mono",
						"Liberation Mono","Menlo","Monaco","Monospace","Source Code Pro"];
		var font_family_obj={};
		for (var i = 0; i < fontFamilyAll.length; i++) {
			var cur = fontFamilyAll[i];
			var className = replaceAll(cur,' ','_');
			font_family_obj['set_font_family_'+cur] = {name:cur,className:'set_font_family_'+className};
		}
		$.contextMenu({
			selector: '.menuViewSetting',
			trigger:"none",
			callback:doAction,
			items: {
				"function_list": {name:LNG.function_list+'<b>Ctrl+Shift+E</b>',className:'function_list'},
				"auto_complete": {name:LNG.auto_complete,className:'auto_complete'},
				"sep1": "---------",
				"auto_wrap": {name:LNG.wordwrap,className:'auto_wrap'},
				"display_char": {name:LNG.char_all_display,className:'display_char'},                
				"sep2": "---------",
				"font_family":{
					name:LNG.font_family,
					icon:"italic",
					className:"code_font_family_list",
					accesskey: "m",
					items:font_family_obj
				},
				"ace_mode":{
					name:LNG.keyboard_type,
					icon:"code",
					accesskey: "m",
					items:{
						"keyboard_type_ace":{name:'Default',className:'keyboard_type_ace'},
						"keyboard_type_vim":{name:'vim',className:'keyboard_type_vim'},
						"keyboard_type_emacs":{name:'emacs',className:'keyboard_type_emacs'}
					}
				},
				"sep3": "---------",
				"others":{
					name:LNG.tools,
					icon:"ellipsis-horizontal",
					accesskey: "m",
					items:{
						"preview": {name:LNG.preview+'<b>Ctrl+Shift+S</b>', icon: "edit"},
						"open_ie":{name:LNG.open_ie,icon:"external-link",accesskey: "b"},

						"beautify_html":{name:LNG.beautify_html,className:'line_top',icon:"angle-right"},
						"beautify_css":{name:LNG.beautify_css,icon:"angle-right"},
						"beautify_js":{name:LNG.beautify_js,icon:"angle-right"}
					}
				},
				"about": {name:LNG.about, icon: "info-sign"}
			}
		});

		$('.tools a[action]').bind('click',function(e){
			var action = $(this).attr('action');
			doAction(action);
			Editor.current() && Editor.current().focus();
		});

		$(".tab_size_set").click(function(){
			var value = $(this).text().split(":");
			Editor.set_config('tab_size',value[1]);
			Editor.current() && Editor.current().focus();
		});

		//字体选择
		$("ul.code_font_family_list .context-menu-item").click(function () {
			Editor.set_config('font_family',$(this).find('span').html(),'');
			Editor.current() && Editor.current().focus();
			toolbarSelected();
		});

		//清空右键和工具栏选中
		$('body').click(function(e){
			try{
				$('.toolMenu').removeClass('select');
				window.parent.rightMenu.hidden();
				if (!(e && $(e.target).is('textarea')) && 
					!$(e.target).is('input') &&
					$(e.target).parents(".right_main").length==0 ){
					Editor.current() && Editor.current().focus();
				}
			}catch(e){}
		});
		$('.tools a,.preview_tool a').tooltip({placement:'bottom'});
		$('.gotoline_input input').keyup(function(event) {
			Editor.current().gotoLine($(this).val());
		});
	};

	//设置字体，高亮模式，主题
	var bind_menu_event = function(){
		$('.top_boolbar a').attr('draggable','false');
		$('.bottom_toolbar a').attr('draggable','false');
		var fontSizeAll = [12,13,14,15,16,18,20,22,24,26,28,32],
			themeAll    = G.code_theme_all.split(','),
			modeAll     = Editor.aceModeList.modes,
			font_obj    = {},
			theme_obj   = {},
			mode_obj    = {};
		for (var i = 0; i < fontSizeAll.length; i++) {
			var size = fontSizeAll[i];
			font_obj['set_code_font-'+size] = {name:size+'px',className:'set_code_font_'+size}
		}
		for (var i = 0; i < themeAll.length; i++) {
			var theme = themeAll[i];
			var info = {name:theme,className:'set_code_theme_'+theme};
			if(theme == 'ambiance'){//黑色白色主题区分
				info.className += ' line_top';
			}
			theme_obj['set_code_theme-'+theme] = info;
		}
		for (var i = 0; i < modeAll.length; i++) {
			var the_mode = modeAll[i];
			mode_obj['set_code_mode-'+the_mode.name] = {name:the_mode.caption,className:'set_code_mode_'+the_mode.name};
		}
		$.contextMenu({
			selector: '.menuViewFont',
			trigger:"none",
			className:"code_font_list",
			callback:doAction,
			items: font_obj
		});
		$.contextMenu({
			selector: '.menuViewTheme',
			trigger:"none",
			className:"code_theme_list",
			callback:doAction,
			items: theme_obj
		});
		$.contextMenu({
			selector: '.menuViewMode',
			trigger:"none",
			className:"code_mode_list",
			callback:doAction,
			items: mode_obj
		});

		//===========字体、主题、模式修改==============
		//字体大小预览
		$("ul.code_font_list .context-menu-item").mouseenter(function(){
			Editor.current().setFontSize($(this).text());
			$(this).unbind('click').click(function(){
				var value = $(this).text();
				Editor.set_config('font_size',value);
				Editor.current() && Editor.current().focus();
			});
		}).mouseleave(function (){
			Editor.current().setFontSize(G.code_config.font_size);
		});
		var code_theme_change = function(code_theme){
			var black_theme = ["ambiance","idle_fingers","monokai","pastel_on_dark",
				"solarized_dark","tomorrow_night_blue","tomorrow_night_eighties"];
			if(inArray(black_theme,code_theme)){
				$('body').addClass('code_theme_black');               
			}else{
				$('body').removeClass('code_theme_black');
			}
		}
		//主题预览
		$("ul.code_theme_list .context-menu-item").mouseenter(function () {
			var the_theme = $(this).find('span').html();
			code_theme_change(the_theme);
			Editor.current() && Editor.current().setTheme("ace/theme/"+the_theme);
			$(this).unbind('click').click(function(){
				var value = $(this).find('span').html();
				Editor.set_config('theme',value);
				Editor.current() && Editor.current().focus();
				code_theme_change(value);
			});
		}).mouseleave(function (){
			Editor.current() && Editor.current().setTheme("ace/theme/"+G.code_config.theme);
			code_theme_change(G.code_config.theme);
		});

		//代码模式
		$("ul.code_mode_list .context-menu-item").mouseenter(function () {
			var get_mode = function($dom){
				var classNameArr = $dom.attr('class').split(' ');
				for (var i = 0; i < classNameArr.length; i++) {
					if(classNameArr[i].indexOf('set_code_mode_')==0){
						return classNameArr[i].substr('set_code_mode_'.length);
					}
				}
				return 'text';
			}
			Editor.current().getSession().setMode("ace/mode/"+get_mode($(this)));
			$(this).unbind('click').click(function(){
				Editor.current().kod.mode = get_mode($(this));
				Editor.current() && Editor.current().focus();
				toolbarSelected();
			});
		}).mouseleave(function (){
			Editor.current().getSession().setMode("ace/mode/"+Editor.current().kod.mode);
		});
	}

	var code_beautify = function(type){
		var value = Editor.current().getValue();
		var select_all = Editor.current().session.getTextRange()==""?true:false;
		if(!select_all){
			value = Editor.current().session.getTextRange();
		}
		var js_config = {
			brace_style: "collapse",
			break_chained_methods: false,
			indent_char: " ",
			indent_scripts: "keep",
			indent_size: "4",
			keep_array_indentation: true,
			preserve_newlines: true,
			space_after_anon_function: true,
			space_before_conditional: true,
			unescape_strings: false,
			wrap_line_length: "120"
		};
		switch(type){
			case 'beautify_html':value=html_beautify(value,js_config);break;
			case 'beautify_css':value=css_beautify(value);break;
			case 'beautify_js':value=js_beautify(value);break;
		}
		if(!select_all){
			Editor.current().insert(value);
		}else{
			Editor.current().setValue(value);
		}   
	}
	var doAction = function(action,option){
		if($('.markdown_full_page').length!=0){//最大化屏蔽相关功能
			return;
		}
		if(action=='newfile'){//不需要有打开的文件
			Editor.add();
			return;
		}
		//必须有编辑器的动作
		if (!Editor.current()) return;
		switch (action) {
			case 'fullscreen':
				$('.icon-resize-full').toggleClass('icon-resize-small');
				FrameCall.father('core.editorFull',"''");
				break;
			case 'save':Editor.save();break;
			case 'saveall':Editor.saveall();break;
			case 'undo'  :Editor.current().undo();break;
			case 'redo' :Editor.current().redo();break;
			case 'refresh' :Editor.refresh();break;

			case 'delete' :Editor.current().execCommand('del');break;
			case 'selectAll' :Editor.current().execCommand('selectall');break;
			case 'startAutocomplete' :Editor.current().execCommand('startAutocomplete');break;
			case 'search' :Editor.current().execCommand('find');break;
			case 'searchReplace' :Editor.current().execCommand('replace');break;
			case 'auto_wrap':Editor.set_config('auto_wrap');break;
			case 'display_char':Editor.set_config('display_char');break;

			case 'setting':Editor.do_action('setting');break;  
			case 'soft_tab':Editor.set_config('soft_tab');break;          
			case 'auto_complete':Editor.set_config('auto_complete');break;

			case "keyboard_type_ace":Editor.set_config('keyboard_type','ace');break;
			case "keyboard_type_vim":Editor.set_config('keyboard_type','vim');break;
			case "keyboard_type_emacs":Editor.set_config('keyboard_type','emacs');break;

			case "beautify_html":code_beautify(action);break;
			case "beautify_css":code_beautify(action);break;
			case "beautify_js":code_beautify(action);break;

			// case 'convert_to_space':Editor.do_action('convert_to_space');break;
			// case 'convert_to_tab':Editor.do_action('convert_to_tab');break;

			case 'open_ie':
				var url = urlDecode(urlDecode(Editor.current().kod.filename));
				url = core.path2url(url);
				window.open(url);
				break;
			case 'function_list':
				var preview = Editor.current().kod.preview;
				preview.openFunctionList();                   
				break;
			case 'preview':
				var preview = Editor.current().kod.preview;
				preview.previewForce();
				break;
			case 'close':Editor.remove();break;
			case 'about':core.setting('about');break;
			case 'learnMore':window.open('http://kalcaddle.com/editor.html');break;
			default:break;
		}        
	}

	var toolbarSelected = function(){
		var config = G.code_config;
		var switch_change = ["display_char","function_list","auto_complete","auto_wrap","soft_tab"];//开关
		$(".context-menu-root .context-menu-item").removeClass('selected');
		for (var i = 0; i < switch_change.length; i++) {
			if (config[switch_change[i]]=='1'){
				$('.context-menu-root .'+switch_change[i]).addClass('selected');
			}
		}

		$('.set_code_theme_'+config.theme).addClass('selected');
		$('.set_code_font_'+config.font_size.substr(0,2)).addClass('selected');
		$('.tab_size_'+config.tab_size).addClass('selected');        
		$('.keyboard_type_'+config.keyboard_type).addClass('selected');

		var className = replaceAll(config.font_family,' ','_');
		$('.set_font_family_'+className).addClass('selected');

		//底部信息更新
		if (Editor.current() && Editor.current().kod && Editor.current().kod.mode) {
			var mode = Editor.aceModeList.modesByName[Editor.current().kod.mode].caption;
			$('.set_code_mode_'+Editor.current().kod.mode).addClass('selected');
			$('.bottom_toolbar .file_type').html(mode);
			$('.bottom_toolbar .config_tab').html('Tabs'+':'+config.tab_size);
		}
	};

	return{
		doAction:doAction,
		toolbarSelected:toolbarSelected,
		init:function(){
			bindToolbarMenu();			
			Mousetrap.bind(['ctrl+s', 'command+s'],function(e) {//保存
				e.preventDefault();e.returnvalue = false;
				Editor.save();
			});
			Mousetrap.bind(['ctrl+shift+e', 'command+shift+e'],function(e) {//函数列表
				e.preventDefault();e.returnvalue = false;
				Toolbar.doAction('function_list');
			});
			Mousetrap.bind(['f5'],function(e) {//刷新
				Editor.refresh();
			});
		}
	};
});