define(function(require, exports) {
	//生成目录
	var make_markdown_menu = function(buffer){
		var link_html = '';
		buffer.find('h1,h2,h3,h4,h5,h6').each(function(){
			var link = 'markdown-'+$(this).text().replace('/\s*/g','-');
			var className = 'markdown_menu_'+$(this)[0].tagName.toLowerCase();
			$(this).attr('id',link);
			link_html+= '<li class="'+className+'"><a href="#'+link+'">'+$(this).text()+'</a></li>';
		});
		link_html = "<div class='markdown_menu'><ul>"+link_html+'</ul></div>';
		return link_html;
	}
	var markdown_content = function(buffer){
		buffer.find('a').attr('target','_blank');
		var content_menu = "<p>[TOC]</p>";
		if(buffer.html().indexOf(content_menu)==-1){
			return;
		}
		var html = buffer.html();
		html = html.replace(content_menu,make_markdown_menu(buffer));
		buffer.html(html);		
	}

	var markdown_code_heightlight = function(buffer){
		//语法着色
		require.async('lib/markdown/highlight.min',function(){
			buffer.find('pre code').each(function(i,block){
				$(this).removeAttr('class');//自动判断语言
				hljs.highlightBlock(block);
			});
		});
	}
	var markdown_mathJS=function(buffer,callback){
		//LaTeX公式
		//http://www.forkosh.com/mathtex.cgi?%20\Large%20x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}
		require.async('lib/markdown/MathJax/MathJax.js',function(){
			require.async('lib/markdown/MathJax/config/TeX-AMS_HTML-full',function(){
				if(!MathJax.isConfig){
					MathJax.Hub.Config({
						// extensions: ["tex2jax.js"],
						jax: ["input/TeX","output/SVG"],
						tex2jax: {
							inlineMath: [['$','$'], ['\\(','\\)']],
							displayMath: [['$$','$$'], ["\\[","\\]"]]
						},
						SVG: {
							blacker: 1,
							EqnChunk: 10,
							EqnChunkFactor: 1,
							font: "STIX-Web"
						},
						TeX: { equationNumbers: { autoNumber: "AMS" } },
						showMathMenu:false,
						showMathMenuMSIE:false,
						messageStyle: "none"
					});
				}								
				MathJax.Hub.Queue(["Typeset", MathJax.Hub,buffer.get(0)],function(){
					if (typeof(callback) == 'function')callback();
				});
			});
		});
	}
	var _markdown2html = function(content_html){
		var html = require('./tpl/markdown_preview.html')
		var render = template.compile(html);
		return render({content:content_html});
	}

	var markdown_download=function(content_html){
		var html = _markdown2html(content_html);
		var name = 'newfile.html';
		var edit_name = Editor.current().kod.filename;
		if(edit_name!=''){
			edit_name = urlDecode(urlDecode(edit_name));
			edit_name = core.pathThis(edit_name);
			name = edit_name.substr(0,edit_name.indexOf("."))+'.html';
		}
		if(!/Trident|MSIE/.test(navigator.userAgent)){//html5 支持保存文件
			var aLink = document.createElement('a');
			var blob = new Blob([html]);
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
			aLink.download = name;
			if (window.createObjectURL != undefined) { // basic
				aLink.href = window.createObjectURL(blob);
			} else if (window.URL != undefined) { // mozilla(firefox)
				aLink.href = window.URL.createObjectURL(blob);
			} else if (window.webkitURL != undefined) { // webkit or chrome
				aLink.href = window.webkitURL.createObjectURL(blob);
			}
			//aLink.href = URL.createObjectURL(blob);
			aLink.dispatchEvent(evt);
		}else{//ie 下载
			var ifr = document.createElement('iframe');
			ifr.style.display = 'none';
			ifr.src = html;
			document.body.appendChild(ifr);
			ifr.contentWindow.document.execCommand('SaveAs', false, name);
			document.body.removeChild(ifr);
		}
	};

	//========================
	//
	return function(){
		var the_editor;
		var $thePreview;
		var $thePreviewContiner;
		var isFirstEditorScroll = false,
			isFirstHtmlScroll = false;

		var init = function(){
			the_editor = Editor.current();
			if (!the_editor|| typeof(the_editor.focus) == 'undefined'){
				return;
			}
			var uuid = the_editor.kod.uuid;
			$thePreview = $("#"+uuid).parent().find('.markdown_preview');
			$thePreviewContiner = $("#"+uuid).parent().find('.edit_right_frame');

			bindHtmlScroll();
			bindEditorScroll();
		}
		var refresh = function(isReset){
			require.async('lib/markdown/markdown-it.min',function(){
				if (!$thePreview || $thePreview.length==0){
					return;
				}
				var md = window.markdownit();
				var code = the_editor.getValue();
				code = code.replace(/ \\\\/g,' \\\\\\\\');
				var html = md.render(code);
				$("<div class='markdown_make_buffer hidden'></div>").appendTo('body');
				var $buffer = $('.markdown_make_buffer');
				$buffer.html(html);
				markdown_content($buffer);
				markdown_code_heightlight($buffer);

				if($thePreview.html().length==0 || isReset===true){
					$thePreview.html($buffer.html());
				}
			    markdown_mathJS($buffer,function(){
			    	$thePreview.html($buffer.html());
			    	$buffer.remove();
			    	refreshScroll();
			    });
			});
		}

		var bindEditorScroll = function(){
			var hasMarkdown= function(){
				return !$thePreviewContiner.find('.preview_markdown_frame').hasClass('hidden');
			}
			the_editor.session.on("changeScrollTop", function(scrollTop){
				if(!isFirstHtmlScroll && hasMarkdown()){
					//console.log("editor scroll",isFirstEditorScroll,isFirstHtmlScroll)
					isFirstEditorScroll = true;
					setScroll(true);
					setTimeout(function(){
						isFirstEditorScroll = false;
					},1000);
				}
			});
			the_editor.on("change", function(e){
				//console.log("editor change",isFirstEditorScroll,isFirstHtmlScroll)
				if(!isFirstHtmlScroll && hasMarkdown()){
					isFirstEditorScroll = true;
					refreshScroll(function(){
						setScroll(true);
						setTimeout(function(){//避免循环调用
							isFirstEditorScroll = false;
						},1000);
					});
				}
			});
		}
		var bindHtmlScroll = function(){
			$thePreviewContiner.unbind('scroll').bind('scroll',function(){
				if(!isFirstEditorScroll){
					//console.log("html",isFirstEditorScroll,isFirstHtmlScroll)
					isFirstHtmlScroll = true;
					setScroll(false);
					isFirstHtmlScroll = false;
				}
			});
		}

		var markdownTitle=[];
		var htmlTitle=[];
		var markdownTitleMake = function() {
			if(!the_editor || !the_editor.focus){
				return;
			}
			markdownTitle=[];
			var text = "\n...\n"+the_editor.getValue();
			var start_before = 0,index=0;
			// 匹配title 优化；TODO:不够严谨：table & >个数限制
			// /^ *```.*\n[\s\S]*?\n```|(^.+[ \t]*\n=+[ \t]*\n+|^.+[ \t]*\n-+[ \t]*\n+|^[ \t>]*\#{1,6}[ \t]*.+?[ \t]*\#*\n+)/gm
			// /^ *```.*\n[\s\S]*?\n```|(^.+[ \t]*\n=+[ \t]*\n+|^.+[ \t]*\n-+[ \t]*\n+|^[ \t>-]*\#{1,6}[ \t]*.+?[ \t]*\#*\n+)/gm
			text.replace(/^ *```.*\n[\s\S]*?\n```|(^[ \t>-]*\#{1,6}[ \t]*.*?[ \t]*\#*\n+)/gm,function(match,title,offset) {
				if(title) {
					var position = the_editor.session.doc.indexToPosition(offset), 
						p_screen = the_editor.session.documentToScreenPosition(position.row,position.column ), 
						end = p_screen.row * the_editor.renderer.lineHeight;
					if(index==0){
						end += 20;//预览页面头部留白
					}
					index++;
					markdownTitle.push({
						"start":start_before,
						"end":end,
						"height":end-start_before,
						info:title
					});
					start_before = end;
				}
				return "";
			});
		};

		var htmlTitleMake = function() {
			if (!$thePreviewContiner || $thePreviewContiner.length==0){
				return;
			}
			htmlTitle=[];
			var start_before = 0,
				scroller_top = $thePreviewContiner.scrollTop();
			$thePreview.find("h1,h2,h3,h4,h5,h6").each(function() {
				var end = $(this).position().top + scroller_top + parseInt($(this).css('margin-top'));
				htmlTitle.push({
					start:start_before,
					end:end,
					height:end-start_before,
					info:$(this).text()
				});
				start_before = end;
			});
		};

		var changeDelayTimer;//快速变化屏蔽
		var refreshScroll = function(callback){
			clearTimeout(changeDelayTimer);changeDelayTimer=false;
			changeDelayTimer = setTimeout(function(){
				markdownTitleMake();
				htmlTitleMake();
				if (typeof (callback) == 'function'){
					callback();
				}
			},200);
		}

		var setScroll = function(isScrollEditor){
			var editorTop = the_editor.session.getScrollTop();
			var htmlTop   = $thePreviewContiner.scrollTop();
			var move = function(srcScrollList,srcTop,destMoveList,moveAction){
				var findIndex = -1,findTitle;
				for (var i = 0; i < srcScrollList.length; i++) {//找到滚动条内最后一条title
					findIndex = i;findTitle = srcScrollList[i];
					if(srcTop<srcScrollList[i]['end']){
						break;
					}
				}
				//console.log('setScroll;find:',findIndex,';md:',markdownTitle.length,';html:',htmlTitle.length);
				if(findIndex === -1 || destMoveList.length<=findIndex) {
					return;
				}
				var posInSection = (srcTop - findTitle.start) / findTitle.height;
				var destTitle = destMoveList[findIndex];
				var destScrollTop = destTitle.start + destTitle.height * posInSection;

				if(findIndex==srcScrollList.length-1 && srcTop>=findTitle.end-5){
					destScrollTop = destTitle.end;
				}
				moveAction(destScrollTop);
			}
			if(isScrollEditor){//scrollEditor  moveHtml
				move(markdownTitle,editorTop,htmlTitle,function(dest){
					$thePreviewContiner.scrollTop(dest);
				});
			}else{//预览滚动， 自动定位编辑器位置
				//预览滚动到底部
				if(htmlTop+$thePreviewContiner.height()>=$thePreviewContiner.prop("scrollHeight")-5){
					the_editor.gotoLine(the_editor.session.getLength());
				}else{
					move(htmlTitle,htmlTop,markdownTitle,function(dest){
						the_editor.session.setScrollTop(dest);
					});
				}
			}
		}
		init();
		return {
			refresh:refresh,
			refreshScroll:refreshScroll,

			markdownMenu:make_markdown_menu,
			markdown2html:_markdown2html,
			markdownDownload:markdown_download
		}
	}
});

