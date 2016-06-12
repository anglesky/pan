<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" scroll="no">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="description" content="webpage"> 
<meta name="keywords" content="kalcaddle">
<meta name="author" content="kalcaddle.">
  <head>
	<title><?php echo $share_info['name'].' - '.$L['share_title'].' - '.$L['kod_name'].$L['kod_power_by'];?></title>
  	<link href="<?php echo STATIC_PATH;?>style/bootstrap.css?ver=<?php echo KOD_VERSION;?>" rel="stylesheet"/>
	<link rel="stylesheet" href="./static/style/font-awesome/css/font-awesome.css">
	<!--[if IE 7]>
	<link rel="stylesheet" href="./static/style/font-awesome/css/font-awesome-ie7.css">
	<![endif]-->

	
	<link rel="stylesheet" href="<?php echo STATIC_PATH;?>style/skin/base/app_code_edit.css?ver=<?php echo KOD_VERSION;?>"/>
	<link rel="stylesheet" href="<?php echo STATIC_PATH;?>style/skin/<?php echo $config_theme;?>.css?ver=<?php echo KOD_VERSION;?>" id='link_css_list'/>
	
  </head>
  <body>
	<div class="edit_main" style="height: 100%;" oncontextmenu="return core.contextmenu();">
		<div class="tools">
			<div class="left top_toolbar">
				<div class="disable_mask"></div>
				<a action="save" href="javascript:;" title="<?php echo $L['button_save'];?>(Ctrl-S)"><i class="font-icon icon-save"></i></a>
				<a action="saveall" href="javascript:;" title="<?php echo $L['button_save_all'];?>"><i class="font-icon icon-paste"></i></a> 
				<span class="line"></span>
				<a action="undo" href="javascript:;" title="<?php echo $L['undo'];?>(Ctrl-Z)"><i class="font-icon icon-undo"></i></a>
				<a action="redo" href="javascript:;" title="<?php echo $L['redo'];?>(Ctrl-Y)"><i class="font-icon icon-repeat"></i></a>
				<a action="refresh" href="javascript:;" title="<?php echo $L['refresh'];?>(F5)"><i class="font-icon icon-refresh"></i></a>
				<span class="line"></span>	
				<a href="javascript:;" class="toolMenu menuViewGotoline" title="<?php echo $L['gotoline'];?>(Ctrl-L)"><i class="font-icon icon-pushpin"></i></a>		
				<a action="search" href="javascript:;" title="<?php echo $L['search'];?>(Ctrl-F)"><i class="font-icon icon-search"></i></a>
				<a action="searchReplace" href="javascript:;" title="<?php echo $L['replace'];?>(Ctrl-F-F)"><i class="font-icon icon-random"></i></a>
				<span class="line"></span>				
				<a action="font" class="toolMenu menuViewFont" href="javascript:;" title="<?php echo $L['font_size'];?>">
					<i class="font-icon icon-font"></i><i class="font-icon icon-caret-down"></i>
				</a>
				<span class="line"></span>
				<a class="toolMenu menuViewTheme" href="javascript:;" title="<?php echo $L['code_theme'];?>">
					<i class="font-icon icon-magic"></i><i class="font-icon icon-caret-down"></i>
				</a>
				<a class="toolMenu menuViewSetting" href="javascript:;" title="<?php echo $L['setting'];?>">
					<i class="font-icon icon-cog"></i><i class="font-icon icon-caret-down"></i>
				</a>				
				<a action="preview" href="javascript:;" title="<?php echo $L['preview'];?>(Ctrl-Shift-S)"><i class="font-icon icon-eye-open"></i></a>
			</div>
			<div class="right">
				<a action="fullscreen" href="javascript:;" title="<?php echo $L['full_screen'];?>"><i class="font-icon icon-resize-full"></i></a>
				<a action="close" href="javascript:;" title="<?php echo $L['close'];?>"><i class="font-icon icon-remove"></i></a>
			</div>
			<div style="clear:both"></div>
		</div><!-- end tools -->

		<!-- 主体部分 -->
		<div class="frame_left">
			<div class="edit_tab">
				<div class="tabs">
					<a  href="javascript:Editor.add()" class="add icon-plus"></a>
					<div style="clear:both"></div>
				</div>
			</div>
			<div class="edit_body">
				<div class="introduction">
					<?php include(LANGUAGE_PATH.LANGUAGE_TYPE.'/edit.html');?>
					<div style="clear:both"></div>
				</div>
				<div class="tabs"></div>
				<div class="bottom_toolbar hidden">
					<a class="toolMenu menuViewGotoline editor_position" href="javascript:;">0:0</a>
					<a class="toolMenu menuViewMode file_type" href="javascript:;">text</a>
					<a class="toolMenu menuViewTab config_tab" href="javascript:;">Tabs:4</a>
					<a class="toolMenu menuViewSetting config" href="javascript:;"><i class="font-icon icon-cog"></i></a>
					<div style="clear:both"></div>
				</div>
			</div>
		</div>
		<!-- 预览 -->
		<div class="frame_right">
			<div class="resize"></div>
			<div class="right_main">
				<div class="function_list" style="display:none;">
					<div class="function_list_tool">
						<div class="box">
						<span> <i class="icon-code"></i> <?php echo $L['function_list'];?></span>
						<a action="close_preview" href="javascript:preview.close();"><i class="font-icon icon-remove"></i></a>
						</div>
					</div>
					<div class="function_list_parent">
						<div class="function_list_box"></div>
					</div>
				</div>
				<div class="preview can_right_menu" style="display:none;">
					<div class="preview_tool">
						<div class="input_content"><input type="text" value=""/></div>
						<div class="box">
							<a action='' class="tool_download" href="javascript:preview.download();" title="<?php echo $L['download'];?>"><i class="font-icon icon-cloud-download"></i></a>
							<a class="tool_refresh" href="javascript:preview.refresh();" title="<?php echo $L['refresh'];?>"><i class="font-icon icon-refresh"></i></a>
							<a href="javascript:preview.openUrl();" title="<?php echo $L['open_ie'];?>"><i class="font-icon icon-globe"></i></a>
							<a action='' href="javascript:preview.close();" title="<?php echo $L['close'];?>"><i class="font-icon icon-remove"></i></a>
						</div>
					</div>
					<div class="preview_frame">
						<iframe src="" style="width:100%;height:98%;border:0;"></iframe>
					</div>
					<div class="markdown_preview"></div>
				</div>
			</div>
		</div>
	</div>
<script src="./index.php?share/common_js&user=<?php echo clear_html($_GET['user']);?>&sid=<?php echo clear_html($_GET['sid']);?>&#=<?php echo rand_string(8);?>"></script>
<script src="<?php echo STATIC_PATH;?>js/lib/seajs/sea.js?ver=<?php echo KOD_VERSION;?>"></script>
<script src="<?php echo STATIC_PATH;?>js/lib/ace/src-min-noconflict/ace.js?ver=<?php echo KOD_VERSION;?>"></script>
<script src="<?php echo STATIC_PATH;?>js/lib/ace/src-min-noconflict/ext-language_tools.js?ver=<?php echo KOD_VERSION;?>"></script>
<script type="text/javascript">
	AUTH  = {'explorer:fileDownload':<?php echo $can_download;?>};
	G.frist_file = "<?php echo (isset($_GET['filename']) ? clear_html($_GET['filename']) :'') ;?>";
	G.code_config = <?php echo $editor_config;?>;
	G.code_theme_all = "<?php echo $config['setting_all']['codethemeall']?>";
	G.user = "<?php echo clear_html($_GET['user']);?>";
	G.sid = "<?php echo clear_html($_GET['sid']);?>";
	G.theme = "<?php echo $config_theme;?>";
	seajs.config({
		base: "<?php echo STATIC_PATH;?>js/",
		preload: ["lib/jquery-1.8.0.min"],
		map:[
			[ /^(.*\.(?:css|js))(.*)$/i,'$1$2?ver='+G.version]
		]
	});
	seajs.use("app/src/edit/main");
</script>
</body>
</html>

