define(function(require, exports) {
	var zTree;
	var group_list_tree;
	var group_list_all;
	var current_group_id;

	// 目录树操作
	var init=function(){
		_bind_menu();
		_init_data();
		$('.ztree .switch').die('mouseenter').live('mouseenter',function(){
			$(this).addClass('switch_hover');
		}).die('mouseleave').live('mouseleave',function(){
			$(this).removeClass('switch_hover');
		});
		$('.menuGroup').die('mouseenter').live('mouseenter',function(){
			$(this).addClass('hover');
		}).die('mouseleave').live('mouseleave',function(){
			$(this).removeClass('hover');
		});

		if(!G.is_root){
			$('[data-action=group_home').addClass('hidden');
		}
	};

	var setting={
		view: {
			showLine: false,
			selectedMulti: false,
			dblClickExpand: true,
			addDiyDom: function(treeId, treeNode) {
				var spaceWidth = 18;//层级的宽度
				var switchObj = $("#"+treeId+" #" + treeNode.tId + "_switch"),
				icoObj = $("#"+treeId+" #" + treeNode.tId + "_ico");
				icoObj.before(switchObj)
					.before('<span class="tree_icon button group"></span>')
					.remove();

				if (treeNode.level >= 1) {
					var spaceStr = "<span class='space' style='display: inline-block;width:"
					 + (spaceWidth * treeNode.level)+ "px'></span>";
					switchObj.before(spaceStr);
				}
				$("#"+treeId+" #"+treeNode.tId+"_a")
					.addClass('menuGroup')
					.append("<i class='sub_menu icon-reorder'><i>")
					.attr('data-group-id',treeNode.id);
			}
		},
		callback: {//事件处理回调函数
			onClick: function(event,treeId,treeNode){
				set_select_group(treeId,treeNode.id);
			},
			beforeRightClick:function(treeId, treeNode){
				set_select_group(treeId,treeNode.id);
			}
		}
	};

	var set_select_group = function(treeId,group_id){
		if(treeId == 'folderList'){
			current_group_id = group_id;
			var select_node = zTree.getNodeByParam("id",group_id, null);
			zTree.selectNode(select_node);
			select_group(group_id);
		}else if(treeId == 'group_parent_select'){
			$('#group_parent').val(group_id);
			$('.select_group').addClass('hidden');
			dialog_reset_name();
		}
	}

	var _init_data = function(){//初始化
		$.ajax({
			url: "./index.php?&system_group/get",
			dataType:'json',
			error:function(){
				$('#folderList').html('<div style="text-align:center;">'+LNG.system_error+'</div>');
			},
			success:function(data){
				if (!data.code){
					$('#folderList').html('<div style="text-align:center;">'+LNG.system_error+'</div>');
					return;
				}
				group_list_tree = data.data;
				group_list_all = data.info;
				$.fn.zTree.init($("#folderList"),setting,group_list_tree);
				zTree = $.fn.zTree.getZTreeObj("folderList");
				zTree.expandAll(true);
				if(current_group_id==undefined){
					current_group_id = '1';
				}
				set_select_group('folderList',current_group_id);
				if($("#group_parent_select").length!=0){
					dialog_select_parent();
				}
			}
		});
	}

	var _menu_hidden = function(){
		$('.context-menu-list').filter(':visible').trigger('contextmenu:hide');
	};
	var _bind_menu = function(){//右键绑定
		$('body').click(_menu_hidden).contextmenu(_menu_hidden);
		$.contextMenu({
			zIndex:9999,
			selector: '.menuGroup',
			items: {
				"add_child":{name:LNG.system_group_add,icon:"plus",accesskey: "u"},
				"edit":{name:LNG.edit,icon:"edit",accesskey: "e"},
				"sep1":"--------",
				"add_user":{name:LNG.system_member_add,icon:"user",accesskey: "g"},
				"remove":{name:LNG.remove,icon:"remove-sign",accesskey: "r"}
			},
			callback: function(key, options) {
				var id =options.$trigger.attr('id');
				id = id.replace('_a','');
				var node = zTree.getNodeByTId(id);
				switch(key){
					case 'add_user':
						System.system_member.add(node['id']);
						break;
					case 'add_child':
						var info = get_group_info();
						info['parent_id'] = node['id'];
						group_add(info);
						break;
					case 'edit':
						var info = get_group_info(node['id']);
						group_add(info);
						break;
					case 'remove':
						group_remove(node['id']);
						break;
					default:break;
				}
			}
		});

		$('.sub_menu').die('click').live('click', function(e) {
	        $(this).contextMenu({x:e.pageX,y:e.pageY});
	    });
	};

	/*
 	'group_id'  =>  '1',
    'name'      =>  'root',
    'parent_id' =>  '',
    'children'  =>  '',
    'config'    =>  array('size_max' => floatval(0),
                          'size_use' => floatval(5*1000)),//总大小，目前使用大小
    'path'      =>  hash_path(),
    'create_time'=>  
    */
	var get_group_info = function(group_id){
		if (group_id==undefined) {
			return {group_id:"",name:'',parent_id:"",children:"",config:{size_max:"0",size_use:""},path:"",'create_time':''};
		};
		return group_list_all[group_id];
	}

	var group_remove = function(group_id,callback){
		var current_node = zTree.getSelectedNodes()[0];
		var pre_node = current_node.getParentNode();
		var del_url = './index.php?system_group/del&group_id='+group_id;

		$.dialog({
			id:'dialog_path_remove',
			fixed: true,//不跟随页面滚动
			icon:'question',
			title:LNG.system_group_remove,
			padding:40,
			width:200,
			lock:true,
			background:"#000",
			opacity:0.3,
			content:LNG.system_group_remove_tips,
			ok:function() {
				$.ajax({
					url: del_url,
					type:'POST',
					dataType:'json',
					beforeSend:function(){
						core.tips.loading();
					},
					error:core.ajaxError,
					success: function(data) {
						core.tips.close(data);
						System.system_member.reset_list();//重置用户列表
						set_select_group('folderList',pre_node.id);
						_init_data();
						if (typeof(callback) == 'function')callback(group_id);
					}
				});
			},
			cancel: true
		});
	}

	//input空间大小变更 和界面绑定
    var size_display = function(){
        var size = parseFloat($('.size_max_set input').val())*1073741824;
        var the_size = core.file_size(size);
        if(size==0 || isNaN(size)){
            $('.size_max_set i').html(LNG.space_tips_default);
        }else{
            $('.size_max_set i').html(the_size);
        }
    }
    var dialog_reset_name = function(){
    	var $tree = $('#group_parent_select');
    	var the_id = $('#group_parent').val();
    	$tree.find("a.menuGroup").removeClass('curSelectedNode');
    	if(the_id==''){
    		$('.select_parent_content .group_title').html('is root');
    		return false;
    	}
    	var group_info = System.system_group.get_group_info(the_id);
    	$('.select_parent_content .group_title').html(group_info.name);
    	$tree.find("a[data-group-id="+the_id+"]").addClass('curSelectedNode');
    	return true;
	}

    var dialog_select_parent = function(){
    	var $tree = $('#group_parent_select');
    	$.fn.zTree.init($tree,setting,group_list_tree);
		var selectTree = $.fn.zTree.getZTreeObj("group_parent_select");
		selectTree.expandAll(true);
    	if(!dialog_reset_name())return;

    	$(".select_parent_content .btn").unbind('click').bind('click',function(){
			$('.select_group').toggleClass('hidden');
		});
    }

	//添加组或编辑组
	var group_add = function(group_info){
		var tpl_list = require('./tpl/group.html');
		var render = template.compile(tpl_list);
		var html = render({LNG:LNG,group_info:group_info});
		var add_dialog = $.dialog({
			id:"share_dialog",
			simple:true,
			resize:false,
			width:425,
			background:"#000",
			opacity:0.1,
			title:"",
			padding:'0',
			fixed:true,
			lock:true,
			content:html
		});
		size_display();
		System.size_use($('.share_view_info'));
		dialog_select_parent();

		$('.input_line #name').textFocus();
		var save_url = './index.php?system_group/add';
		if(group_info.name != ''){//新建
			var save_url = './index.php?system_group/edit&group_id='+group_info['group_id'];
		}
		$("#system_save").unbind('click').bind('click',function(){
			post_data();
		});
		$(".dlg_goto_path").unbind('click').bind('click',function(){
            System.open_path(group_info);
        });

		$(".remove_button").unbind('click').bind('click',function(){
			group_remove(group_info['group_id'],function(){
				add_dialog.close();
			});
		});
		$(".content_box input").keyEnter(function(){
			post_data(true);
		});
		$("#system_save_goon_add").unbind('click').bind('click',function(){
			post_data(true);
		});
		var post_data = function(keep_add_go_on){
			var param="";
			$('.share_dialog .content_info input[name]').each(function(){
				var value = urlEncode($(this).val());
				if(value=="") return;
				param+='&'+$(this).attr('name')+'='+value;
			});
			$.ajax({
				url: save_url,
				data:param,
				type:'POST',
				dataType:'json',
				beforeSend:function(){
					core.tips.loading();
				},
				error:core.ajaxError,
				success: function(data) {
					core.tips.close(data);
					if(data.code){
						_init_data();
						if(group_info.name != '' || keep_add_go_on!=true){//编辑 or保存
							add_dialog.close();
						}else{
							setTimeout(function(){//焦点转移了
								$('.input_line #name').val('').textFocus();
							},200);
						}
					}
				}
			});
		}
	}

	var select_group = function(group_id){
		var group_info = get_group_info(group_id);
		$('.group_title .group_title_span').html(group_info.name);
		$('.group_title').attr('data-id',group_info.group_id);
		$('.group_size').html(group_info.config.size_use+'/'+group_info.config.size_max);
		System.size_use($('.group_size'));
		System.system_member.load_list(group_id);
	}
	var bind_event = function(){
		$('.size_max_set input').live("input",size_display);//
		$("#content_system_group .header_content [data-action]").live('click',function(e){
            var action = $(this).attr('data-action');
            var group_id = $('#content_system_group .group_title').attr('data-id');
            var group_info = get_group_info(group_id);
            switch(action){
                case 'group_edit':
                    group_add(group_info);
                    break;//编辑分组
                case 'group_home':
                	System.open_path(group_info);
                    break;//进入组目录
                case 'group_add_child':
                	var info = get_group_info();
					info['parent_id'] = group_id;
					group_add(info);
                    break;//进入组目录
                default:break;
            }
        });
	}
	bind_event();

	var get_group_list = function(){
		return group_list_all;
	}
	var get_group_tree = function(){
		return group_list_tree;
	}
	//对外接口
	return {
		init:init,
		get_group_tree:get_group_tree,
		get_group_list:get_group_list,
		get_group_info:get_group_info
	}
});
