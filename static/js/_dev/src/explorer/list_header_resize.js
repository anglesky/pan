//对文件打开，文件操作的封装
define(function(require, exports) {
	var default_size = {filename:250,filetype:80,filesize:80,filetime:215,left_tree_width:300};//默认值
	var min_size = {filename:150,filetype:70,filesize:70,filetime:120,left_tree_width:1};
	var size_config = default_size;

	var init_config = function(){
		if (Cookie.get('resize_config')){
			size_config= json_decode(Cookie.get('resize_config'));
		}else{
			if(typeof(G.resize_config) != "undefined"){
				size_config = json_decode(html_decode(G.resize_config));
			}
			var config = json_encode(size_config);
			Cookie.set('resize_config',config);
		}
	}
	var save_config = function(){
		var config = json_encode(size_config);
		Cookie.set('resize_config',config);
		$.get('index.php?setting/set&k=resize_config&v='+config);
	}
	var file_title_resize = function(the_size){
		if(G.list_type == "icon") return;
		if (!the_size) {
			the_size = size_config;
		};
		$(".frame-right-main #main_title")
		var title_pre = ".frame-right-main #main_title";
		var file_pre = ".frame-right-main .fileList_list .file";
		$.each(the_size,function(key,value){
			if (value<=min_size[key]) {
				value = min_size[key];
			}
			$(title_pre+' .'+key).css("width",value);
			if(key == 'filename'){
				$(file_pre+' .titleBox').css("width",(value-25));
			}else{
				$(file_pre+' .'+key).css("width",value);
			}
		});
	};

	//设置左侧树目录宽度调整
	var file_tree_change_size = function(the_size,is_save,is_animate){
		if( $.getUrlParam('type')=='file_list' || 
			$.getUrlParam('type')=='explorer'){
			return;
		}
		var key = 'left_tree_width';
		var temp = $.extend(true,{}, size_config);
		temp[key]+= the_size;
		if (temp[key] <= min_size[key]) {
			temp[key] = min_size[key];
		}

		//设置左侧树目录宽度
		var offset = temp[key];
		var $left = $('.frame-left');
		var $left_bottom = $('.frame-left .bottom_box');
		var $drag = $('.frame-resize');
		var $right = $('.frame-right');

		if(is_animate){//首次；设定
			var time = 400;
			$left.animate({width:offset},time);
			$left_bottom.animate({width:offset},time);
			$drag.animate({left:offset-5},time);
			$right.animate({left:offset+1},time);
		}else{//拖动
			$left.css('width',offset);
			$left_bottom.css('width',offset);
			$drag.css('left',offset-5);
			$right.css('left',offset+1);
		}
		if(typeof(ui.setStyle)!='undefined'){
			ui.setStyle();
		}
		if(is_save){
			size_config = temp;
			save_config();
		}
	}

	//发生变更
	var file_title_change_size = function(key,offset_value,is_save){
		var temp = $.extend(true,{}, size_config);
		temp[key]+= offset_value;
		file_title_resize(temp);

		if(is_save){
			size_config = temp;
			$.each(size_config,function(key,value){
				if (value<=min_size[key]) {
					size_config[key] = min_size[key];
				}
			});
			save_config();
		}
	}

	var bind_list_resize = function(){
		//分别绑定tab
		$.each(default_size,function(key,value){
			$("#main_title ."+key+"_resize").drag({
				start:function(){
				},
				move:function(offsetx,offsety){
					file_title_change_size(key,offsetx,false);
				},
				end:function(offsetx,offsety){
					file_title_change_size(key,offsetx,true);
				}
			});
		});
	}
	var bind_tree_resize = function(){
		//树目录
		var $drag_line = $('.frame-resize');
		$drag_line.drag({
			start:function(){
				$drag_line.addClass('active');
				$('.resizeMask').css('display','block');
			},
			move:function(offsetx,offsety){
				file_tree_change_size(offsetx,false,false);
			},
			end:function(offsetx,offsety){
				file_tree_change_size(offsetx,true,false);
				$drag_line.removeClass('active');
				$('.resizeMask').css('display','none');
			}
		});
	}
	return {
		init:function(){
			init_config();
			file_title_resize(size_config);
			file_tree_change_size(0,false,true);
			bind_tree_resize();
		},
		bind_list_resize:bind_list_resize,
		set_tree_width:function(width){
			file_tree_change_size(width,false,true);
		},
		resize:file_title_resize
	}
});