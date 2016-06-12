define(function(require, exports, module) {
	var _bindToolbar = function(){
		$('.tools-left a').click(function(e){
			var action = $(this).attr('class');
			switch(action){
				case 'home':tree.init();break;
				case 'view':tree.explorer();break;
				case 'folder':tree.create('folder');break;
				case 'file':tree.create('txt');break;
				case 'refresh':tree.refresh();break;
				default:break;
			}
		});
	};
	return{	
		init:function(){
			tree.init();
			_bindToolbar();			
			$("html").die('click').live('click',function (e) {
				rightMenu.hidden();
			});

			Mousetrap.bind(['ctrl+s', 'command+s'],function(e) {
	            e.preventDefault();e.returnvalue = false;
	            FrameCall.top('OpenopenEditor','Editor.save','');
	        });
		},
		setTheme:function(thistheme){
			core.setSkin(thistheme);
			FrameCall.top('OpenopenEditor','Editor.setTheme','"'+thistheme+'"');
		},
		//编辑器全屏
		editorFull:function(){
			var $frame = $('iframe[name=OpenopenEditor]');
			$frame.toggleClass('frame_fullscreen');
		}
	}
});
