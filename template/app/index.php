<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" scroll="no">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title><?php echo $L['kod_name'].$L['kod_power_by'];?></title>
	<link href="<?php echo STATIC_PATH;?>style/bootstrap.css?ver=<?php echo KOD_VERSION;?>" rel="stylesheet"/>
	<link rel="stylesheet" href="./static/style/font-awesome/css/font-awesome.css">
	<!--[if IE 7]>
	<link rel="stylesheet" href="./static/style/font-awesome/css/font-awesome-ie7.css">
	<![endif]-->

	
	<link rel="stylesheet" href="<?php echo STATIC_PATH;?>style/skin/base/app_setting.css?ver=<?php echo KOD_VERSION;?>"/>
	<link rel="stylesheet" href="<?php echo STATIC_PATH;?>style/skin/<?php echo $config['user']['theme'];?>.css?ver=<?php echo KOD_VERSION;?>" id='link_css_list'/>
	
</head>
<body>
	<div id="body">
		<div class="app_menu_left menu_left">	
			<h1><?php echo $L['app'];?></h1>
			<ul class='setting'>
				<a id="all"><i class="font-icon icon-user"></i><?php echo $L['app_group_all'];?></a>
				<a id="game"><i class="font-icon icon-dashboard"></i><?php echo $L['app_group_game'];?></la>
				<a id="tools"><i class="font-icon icon-picture"></i><?php echo $L['app_group_tools'];?></a>
				<a id="reader"><i class="font-icon icon-star"></i><?php echo $L['app_group_reader'];?></a>
				<a id="movie"><i class="font-icon icon-music"></i><?php echo $L['app_group_movie'];?></a>
				<a id="music"><i class="font-icon icon-info-sign"></i><?php echo $L['app_group_music'];?></a>
				<a id="life"><i class="font-icon icon-question"></i><?php echo $L['app_group_life'];?></a>
				<a id="others"><i class="font-icon icon-question"></i><?php echo $L['app_group_others'];?></a>
			</ul>
		</div>		
		<div class='app_list main'>
			<?php if($GLOBALS['is_root']){ ?><a class="create_app button"><?php echo $L['app_create'];?></a><?php } ?>
			<div class='h1'><i class="font-icon icon-user"></i><?php echo $L['app_group_all'];?></div>
			<ul class="app-list"></ul>
		</div>
	</div>
<script src="<?php echo STATIC_PATH;?>js/lib/seajs/sea.js?ver=<?php echo KOD_VERSION;?>"></script>
<script src="./index.php?user/common_js#id=<?php echo rand_string(8);?>"></script>
<script type="text/javascript">
	seajs.config({
		base: "<?php echo STATIC_PATH;?>js/",
		preload: ["lib/jquery-1.8.0.min"],
		map:[
			[ /^(.*\.(?:css|js))(.*)$/i,'$1$2?ver='+G.version]
		]
	});
	seajs.use('app/src/app/main');
</script>
</body>
</html>
