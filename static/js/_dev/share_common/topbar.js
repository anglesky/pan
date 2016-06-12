define(function(require, exports) {
	var download_url = 'index.php?share/fileDownload&user='+G.user+'&sid='+G.sid;
	var show_url = 'index.php?share/fileProxy&user='+G.user+'&sid='+G.sid;
	var init_topbar =function(){
		//非文件页面

		if(G.share_info['type']!='file' && typeof(G.path)!='undefined'){//文件预览
			show_url+= '&path='+G.path;
			download_url+= '&path='+G.path;
			$('.btn.button_my_share').hide();
			$('.share_info_user .btn-group').show();//下载+分享
		}else{
			$('.btn.button_my_share').show();
			$('.share_info_user .btn-group').hide();//分享
		}
		if (G.share_info['type']=='file') {
			$('.btn.button_my_share').hide();
			$('.share_info_user .btn-group').show();//下载+分享
		}

		if(G.share_info['not_download'] == '1'){
			download_url = "javascript:core.tips.tips('"+LNG.share_not_download_tips+"',false);"
		}

		//信息展示
	    $('.share_info_user').removeClass('hidden');
	    $('.btn_download').attr('href',download_url);
	    var time = date('Y/m/d H:i:s',G.share_info['mtime']);
	    $('.topbar .time').html(time);
	    if (G.share_info['type'] == 'file') {
	        $('.topbar .size').html(G.share_info['size']);
	    };
	    $('.topbar .info').html(LNG.share_view_num+G.share_info['num_view']+'  '+
	    						LNG.share_download_num+G.share_info['num_download']);
	    $('#button_share').die('click').live('click',function(){
	    	share();
	    });
	}
	var share = function(){
		
	}
	return{	
		init:init_topbar,
	}
});
