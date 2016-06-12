define(function(require, exports) {
	var _skin = {
		ting:{path:'music/ting',width:410,height:530},
		beveled:{path:'music/beveled',width:350,height:200},
		kuwo:{path:'music/kuwo',width:480,height:200},
		manila:{path:'music/manila',width:320,height:400},
		mp3player:{path:'music/mp3player',width:320,height:410},
		qqmusic:{path:'music/qqmusic',width:300,height:400},
		somusic:{path:'music/somusic',width:420,height:137},
		xdj:{path:'music/xdj',width:595,height:235},

		//---适合视频播放
		webplayer:{path:'movie/webplayer',width:600,height:400},
		qqplayer:{path:'movie/qqplayer',width:600,height:400},
		tvlive:{path:'movie/tvlive',width:600,height:400},
		youtube:{path:'movie/youtube',width:600,height:400},
		vplayer:{path:'movie/vplayer',width:600,height:400}
	};

	var _getPlayer = function(type){
		if (type =='music' ) return 'music_player';
		if(type == undefined) type = 'mp3';
		if (inArray(core.filetype['music'],type)) {
			return 'music_player';
		}else {
			return 'movie_player';
		}
	};

	// 创建播放器；动态获取皮肤以及对应大小尺寸
	var _create = function(player,callback){
		var playerSkin,playerTitle,resize,ico;	
		if (player == 'music_player') {
			ico='mp3';
			playerSkin = _skin[G.musictheme];
			playerTitle= 'music player';
			resize = false;
		}else {
			ico='flv';
			playerSkin = _skin[G.movietheme];
			playerTitle= 'movie player';
			resize = true;
		}
		var html = core.createFlash(G.static_path+'js/lib/cmp4/cmp.swf',
			'context_menu=2&auto_play=1&play_mode=1&skin=skins/'+playerSkin.path+'.zip',player);
		var playerDialog = {
			id:player+'_dialog',
			simple:true,
			ico:core.ico(ico),
			title:playerTitle,
			width:playerSkin.width+10,
			height:playerSkin.height,
			content:'<div class="wmp_player"></div><div class="flash_player">'+html+'</div>',
			resize:resize,
			padding:0,
			fixed:true,
			close:function(){
				var cmpo = _get(player);
				if (cmpo && cmpo.sendEvent) {
					cmpo.sendEvent('view_stop');
				}
			}
		}
		var top = share.system_top();
		if (top.CMP){
			art.dialog.through(playerDialog);
		}else{
			$.dialog(playerDialog);
		}
	};
	// 文件数组创建播放器列表
	var _makeList = function(fileList){
		var play_url,i,xml='';
		for (i = fileList.length - 1; i >= 0; i--) {
			var path,name;
			if (fileList[i].search('fileProxy') == -1) {
				path = urlEncode(fileList[i]);
				name = core.pathThis(fileList[i]);
			}else{//非服务器路径下文件  或者网络文件
				path = fileList[i];
				name = core.pathThis(urlDecode(path));
			}
			path = path.replace(/%2F/g,'/');
			path = path.replace(/%3F/g,'?');
			path = path.replace(/%26/g,'&');
			path = path.replace(/%3A/g,':');
			path = path.replace(/%3D/g,'=');
			xml +='<list><m type="" stream="true" src="'+path+'" label="'+name+'"/></list>';
		};
		return xml;
	};
	//获取播放器
	var _get = function(player){
		var top = share.system_top();
		if (top && top.CMP) {
			return top.CMP.get(player);
		}else{
			return CMP.get(player);
		}
	};
	var _insert = function(fileList,player){
		var cmpo = _get(player);
		var new_list = _makeList(fileList);
		try{
			cmpo.config('play_mode','normal');//写入配置,播放模式改为自动跳到next
			var old_length = cmpo.list().length;
			cmpo.list_xml(new_list,true);
			cmpo.sendEvent('view_play',old_length+1);
		}catch(e){};		
	};

	var _bindWMV = function(type){
		if (type == 'music_player') return;
		var cmpo = _get(_getPlayer('movie'));
		if (!cmpo) return;
		cmpo.addEventListener("control_load","new_play");
		cmpo.addEventListener("control_play","new_play");
	};
	return {
		changeTheme:function (key,value) {
			var player,playerSkin,cmpo;
			if (key =='music') {
				G.musictheme = value;
				player = 'music_player';
			}else if(key == 'movie'){
				G.movietheme = value;
				player = 'movie_player';
			}

			//如果存在播放器，则实时改变皮肤。
			cmpo = _get(player);
			if (cmpo){
				var top = share.system_top();
				playerSkin = _skin[value];
				top.art.dialog.list[player+'_dialog'].size(playerSkin.width,playerSkin.height);
				cmpo.sendEvent("skin_load",'skins/'+playerSkin.path+'.zip');
			}
		},
		play:function(fileList,type){
			var player = _getPlayer(type);
			var cmpo = _get(player);
			if (!cmpo) {
				_create(player);
				var repeat = setInterval(function(){
					if (_get(player)) {
						_insert(fileList,player);
						_bindWMV(player);
						new_play(player);
						clearInterval(repeat);
						repeat=false;
					};					
				},1000);
			}else{
				_insert(fileList,player);
				_bindWMV(player);
				var top = share.system_top();	
				top.art.dialog.list[player+'_dialog'].display(true);
			}		
		}
	};
});

var new_play=function(type){
	if (type == 'music_player'){
		$('.music_player_dialog .wmp_player').html('').css({'width':'0px','height':'0px'});
		$('.music_player_dialog .flash_player').css({'width':'100%','height':'100%'});
		return;
	}
	var cmpo;
	var top = share.system_top();
	if (top.CMP) {
		cmpo = top.CMP.get('movie_player');
	}else{
		cmpo = CMP.get('movie_player');
	}
	var _getWMV = function(url){
		var html='<object id="the_wmp_player" ';
		var userAg=navigator.userAgent;
		if(-1!=userAg.indexOf("MSIE")){
			html+='classid="clsid:6BF52A52-394A-11d3-B153-00C04F79FAA6" ';
		}else if(-1!=userAg.indexOf("Firefox")
			||-1!=userAg.indexOf("Chrome")
			||-1!=userAg.indexOf("Opera")
			||-1!=userAg.indexOf("Safari")){
			html+='type="application/x-ms-wmp" ';
		}
		html+='width="100%" height="100%">';
		html+='<param name="URL" value="'+url+'">';
		html+='<param name="autoStart" value="true">';
		html+='<param name="autoSize" value="true">';
		html+='<param name="invokeURLs" value="false">';
		html+='<param name="playCount" value="100">';
		html+='<param name="Volume" value="100">';
		html+='<param name="defaultFrame" value="datawindow">';
		html+='</object>';
		return html;
	}

	try{
		var src = cmpo.item('src').toLowerCase();
		if (src.indexOf('wmv')>1 
			|| src.indexOf('mpg')>1 
			|| src.indexOf('avi')>1
			|| src.indexOf('wvx')>1
			|| src.indexOf('3gp')>1
			) {
			$("div[id^='DIV_CMP_']").remove();
			var html = _getWMV(src);
			$('.movie_player_dialog .wmp_player').html('');
			$('.movie_player_dialog .flash_player').css({'width':'0px','height':'0px'});
			setTimeout(function(){
				$('.movie_player_dialog .wmp_player').html(html).css({'width':'100%','height':'100%'});
			},300);
		}else{
			$('.movie_player_dialog .wmp_player').html('').css({'width':'0px','height':'0px'});
			setTimeout(function(){
				$('.movie_player_dialog .flash_player').css({'width':'100%','height':'100%'});
			},200);
		}
	}catch(e){};
};