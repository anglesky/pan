define(function(require, exports) {
	return function(the_editor){
		var $main = $('#'+the_editor.kod.uuid).parent('.edit_content');
		var $box_right = $main.find('.edit_right_frame'),//侧边栏工具
			$box_left = $('#'+the_editor.kod.uuid),

			$function_list_frame = $main.find('.function_list_frame'),
			$preview_url_frame = $main.find('.preview_url_frame'),
			$preview_markdown_frame = $main.find('.preview_markdown_frame');
		
		var markdownCreate = require('./preview_markdown');
		var functionListCreate = require('./function_list');
		var markdown = new markdownCreate(the_editor);
		var functionList = new functionListCreate(the_editor);
		var resize_min = 10;

		var bindPreviewResize = function(){
			$main.find('.preview_url_tool input').keyEnter(htmlRefresh);
			var $drag_line = $main.find('.resize');
			var leftwidthFirst = 0;

			$drag_line.drag({
				start:function(){
					leftwidthFirst = $box_right.width();
					$drag_line.addClass('resize_active');
					$("body").css("cursor","col-resize");
					$box_right.append('<div class="preview_frame mask_view"></div>');
					$box_right.addClass('can_not_select');
				},
				move:function(offsetx,offsety){
					var offset = leftwidthFirst-offsetx;
					var w_width = $(window).width();
					if (offset >= w_width-resize_min) offset= w_width-resize_min;//最宽
					if (offset <= resize_min ) offset =resize_min;//最窄

					$box_left.width(w_width-offset);
					$box_right.width(offset);
					$drag_line.css("left",(w_width-offset)+'px');  
				},
				end:function(offsetx,offsety){
					$drag_line.removeClass('resize_active');
					$("body").css("cursor","default");
					$box_right.find('.mask_view').remove();
					$box_right.removeClass('can_not_select');
					resize();
				}
			});
		}
		var resize=function () {//调整frame宽度时  自动调整宽度
			if($('.markdown_full_page').length!=0){
				return;//全屏预览则不处理缩放
			}
			if ($box_right.css('display') == 'block') {//有预览则更新对应宽度
				var offset  = $box_right.width();
				var w_width = $(window).width();
				if (offset >= w_width-resize_min) offset= w_width-resize_min;//最宽
				if (offset <= resize_min ) offset = resize_min;//最窄
				var percent = parseFloat(offset/w_width)*100;
				$box_right.width(percent+'%');
				$box_left.width((100-percent)+'%');

				var $drag_line = $main.find('.resize');
				$drag_line.css("left",(100.0-percent)+'%');  
			}
			
			Editor.do_action('resize');
			if(!$preview_markdown_frame.hasClass('hidden')){
				markdown.refreshScroll();
			}			
		};

		var bindTool = function(){
			$main.find('.edit_right_frame .box a,.function_list_tool .box a,.tools_markdown_more button').bind('click',function(e){
				var action = $(this).attr('class');
				if($(this).attr('markdown_action')){
					action = $(this).attr('markdown_action');
				}
				switch(action){
					case 'tool_markdown_menu':					
						$main.find('.markdown_menu_box').toggleClass('hidden');
						if(!$main.find('.markdown_menu_box').hasClass('hidden')){
							var html = markdown.markdownMenu($main.find('.markdown_preview'));
							$main.find('.markdown_menu_box .content').html(html);
						}
						stopPP(e);
						break;
					case 'tool_markdown_download':	
						markdown.markdownDownload($main.find('.markdown_preview').html());
						break;
					case 'tool_markdown_max':
						$main.toggleClass('markdown_full_page');
						if(!$main.hasClass('markdown_full_page')){//还原
							resize();
						}
						break;
					case 'tool_open_url':
						openUrl();
						break;
					case 'tool_refresh':
						htmlRefresh();
						break;
					case 'tool_close':
						close();					
						break;
					case 'tool_markdown_help':					
						break;
					default:break;
				}
			});
		}

		//对应不同工具
		var openPreview = function(type){
			var width=0;
			$box_right.removeClass('hidden');
			$function_list_frame.addClass('hidden');
			$preview_markdown_frame.addClass('hidden');
			$preview_url_frame.addClass('hidden');
			$main.find('.resize').removeClass('hidden');
			if(type == 'function_list'){
				//if (!auto_function_list) return;
				$function_list_frame.removeClass('hidden');
				width = 200;
				functionList.refresh();
				$box_right.find('.function_search input').focus();
			}else if (type == 'markdown') {//打开
				width = $(window).width()*0.45;
				$preview_markdown_frame.removeClass('hidden');
				markdown.refresh();
			}else if(type=="html"){// 网页浏览
				width = $(window).width()*0.45;
				$preview_url_frame.removeClass('hidden');

				var url = urlDecode(urlDecode(the_editor.kod.filename));
				url = core.path2url(url);
				$box_right.find('.preview_url_tool input').val(url);
				$box_right.find('iframe').attr('src',url);
			}
			$box_right.css({"width":width});
			$box_left.css({"width":$(window).width() - width});
			resize();
		}

		var editChange = function(){
			if(!$function_list_frame.hasClass('hidden')){
				functionList.refresh();
			}else if(!$preview_markdown_frame.hasClass('hidden')){
				markdown.refresh();
			}
		}

		var openUrl=function(e){
			if(!$preview_markdown_frame.hasClass('hidden')){//markdown
				var html = markdown.markdown2html($main.find('.markdown_preview').html());
				var winname = window.open( "", "_blank", "");
				winname.document.open( "text/html", "replace" );
				winname.opener = null;
				winname.document.write(html);
				winname.document.close();
			}else{
				window.open($main.find('.preview_url_frame input').attr('value'));
			}
			stopPP(e);
		};

		//函数列表
		//已有则关闭,并记录配置,提交服务器
		//没有则切换至函数列表
		var openFunctionList = function(){
			if(!functionList.support(the_editor.kod.mode)){
				tips(LNG.not_support,'warning');return;
			}
			if(!$function_list_frame.hasClass('hidden')){//已有
				auto_function_list = 0;
				close();
			}else{
				auto_function_list = 1;
				openPreview('function_list');
			}
			Editor.set_config('function_list',auto_function_list); 
		}
		//预览
		//没有任何则——自动预览
		//除了markdown不预览；其他切换至预览
		var previewForce = function(){
			if($box_right.hasClass('hidden')){
				if(!previewAuto()){
					openPreview('html');
				}
			}else{
				if($preview_markdown_frame.hasClass('hidden')){
					openPreview('html');
				}
			}
		}
		var previewAuto = function(){
			if(auto_function_list && functionList.support(the_editor.kod.mode)){
				openPreview('function_list');
				return true;
			}else if(the_editor.kod.mode == 'markdown'){
				openPreview('markdown');
				return true;
			}
			return false;
		}
		
		var close=function(){
			if(!$preview_url_frame.hasClass('hidden')){//关闭html则尝试是否还有其他预览
				if(previewAuto()){
					return;
				}
			}
			$box_right.addClass('hidden');
			$function_list_frame.addClass('hidden');
			$preview_markdown_frame.addClass('hidden');
			$preview_url_frame.addClass('hidden');
			$main.find('.resize').addClass('hidden');

			$('.markdown_full_page').removeClass('markdown_full_page');
			$box_left.css('width','100%');
			Editor.do_action('resize');
		};
		
		var htmlRefresh=function(){
			var $address = $main.find('.preview_url_tool input');
			var url = $address.attr('value');
			$main.find('.open_ie').attr('href',url);
			$main.find('iframe').attr('src',url);
		}
		var init = function(){
			bindPreviewResize();
			bindTool();
			previewAuto();
		}

		init();
		return {
			open:openPreview,
			editChange:editChange,
			close:close,
			resize:resize,

			openFunctionList:openFunctionList,
			previewForce:previewForce
		};
	}
});

