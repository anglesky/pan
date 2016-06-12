define(function(require, exports) {
	var download_url = 'index.php?share/fileDownload&user='+G.user+'&sid='+G.sid;
	var show_url = 'index.php?share/fileProxy&user='+G.user+'&sid='+G.sid;
	var init =function(){
		if (typeof(G.share_info) != "undefined"){
			var ext = core.pathExt(G.share_info.path);
			if(G.share_info['type']!='file'){
				show_url+= '&path='+G.path;
				download_url+= '&path='+G.path;
			}
			if(G.share_info['not_download'] == '1'){
				download_url = "javascript:core.tips.tips('"+LNG.share_not_download_tips+"',false);"
			}
			topbar.init();
			file_show(ext);
		}else{
			$(".share_info").addClass('hidden');
		}
	};
	var show_bindary = function(){
		var ext = core.pathExt(G.share_info.path);
		var box = $('.bindary_box');
		box.removeClass('hidden');
		box.find('.name').html(G.share_info.name);
		box.find('.ico').addClass(ext);
		box.find('.btn_download').attr('href',download_url);
		var time = date('Y/m/d h:i',G.share_info['mtime']);
	    box.find('.share_time').html(time);
	    box.find('.size span').html(G.share_info['size']);
	};

	var htmlHexEncode=function(str){
	    var res=[];
	    for(var i=0;i < str.length;i++)
	        res[i]=str.charCodeAt(i).toString(16);
	    return "&#"+String.fromCharCode(0x78)+res.join(";&#"+String.fromCharCode(0x78))+";";//x ，防止ff下&#x 转义
	};
	var show_code = function(){
		var ace_tools = ace.require("ace/ext/language_tools");
		var aceModeList = ace.require("ace/ext/modelist");
		$.get(show_url,function(data){
			var theMode = aceModeList.getModeForPath(G.share_info.path).mode;
			var html = '<pre class="code" id="ace_text_show">'+ htmlHexEncode(data)+'</pre>';
			$('.content_box').addClass('show_code').append(html);

			var this_editor = ace.edit('ace_text_show');
			this_editor.setTheme("ace/theme/tomorrow");//tomorrow monokai
			this_editor.setReadOnly(true);
			this_editor.setShowPrintMargin(false);//代码宽度提示
			this_editor.getSession().setMode(theMode);
			this_editor.getSession().setTabSize(4);
			this_editor.getSession().setUseWrapMode(1);
			this_editor.setFontSize(15);
		});
	}
	//文件展示
	var file_show = function(ext){
		if (ext=='html' || ext =='htm'){
			// show_iframe();
			// return;
		}
		if (ext=='md'){//markdown
            require.async('lib/markdown/markdown-it.min',function(){
                var md = window.markdownit();
		        $.get(show_url,function(data){
		        	var html = md.render(data);
					$('.content_box').addClass('markdown can_select').append(html);
				});
            });
            return;
        }
		if (inArray(core.filetype['text'],ext)||
			inArray(core.filetype['code'],ext)){
			show_code();
			return;
		}
		if (ext == 'swf') {
			var html = core.createFlash(show_url,'');
			$('.content_box').addClass('show_swf').append(html);
			return;
		}
		if (inArray(core.filetype['image'],ext)){//单张图片打开
			var html = '<img src="'+show_url+'"/>';
			$('.content_box').addClass("show_image").append(html);
			return;
		}
		if (inArray(core.filetype['music'],ext) ||
			inArray(core.filetype['movie'],ext)){
			var theme = 'skins/music/manila.zip';
			var media_type = 'music_player';
			if(inArray(core.filetype['movie'],ext)){
				theme = 'skins/movie/webplayer.zip';
				media_type = 'movie_player';
			}
			var play_url = G.app_host+show_url+'#name_'+G.share_info['path'];
			var swf = G.static_path+'js/lib/cmp4/cmp.swf';
			var vars = 'url=&lists=&context_menu=2&auto_play=1&play_mode=1&name=kodExplorer&src='+
						urlEncode(play_url)+'&skin='+urlEncode(theme)+'&label='+G.share_info['path'];
			var html = core.createFlash(swf,vars);
			$('.content_box').addClass(media_type).append(html);
			return;
		}
		if (inArray(core.filetype['doc'],ext) || ext=='pdf'){
			var path = G.share_info['path'];
			if(G.share_info['type']!='file'){
				path=G.path;
			}
			var url = G.app_host+'index.php?share/officeView&user='+G.user+'&sid='+G.sid+'&path='+path;
			var html = '<iframe src="'+url+'" frameborder="0" class="show_office"></iframe>';
			$('.frame-main').addClass('office_page').append(html);
			$('.content_box').addClass('hidden');
			return;
		}
		show_bindary();
	};		
	return{	
		init:init,
	}
});
