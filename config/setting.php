<?php
/*
* @link http://www.kalcaddle.com/
* @author warlee | e-mail:kalcaddle@qq.com
* @copyright warlee 2014.(Shanghai)Co.,Ltd
* @license http://kalcaddle.com/tools/licenses/license.txt
*/

//配置数据,可在setting_user.php中更改覆盖
$config['settings'] = array(
	'download_url_time'	=> 0,			//下载地址生效时间，按秒计算，0代表不限制，默认不限制
	'version_desc'		=> 'product',
	'api_login_tonken'	=> '',			//设定则认为开启服务端api通信登陆，同时作为加密密匙
);

//初始化系统配置
$config['setting_system_default'] = array(
	'system_password'	=> rand_string(10),
	'system_name'		=> "MapGIS 云存储",
	'system_desc'		=> "mapgis",
	'path_hidden'		=> ".DS_Store,.gitignore",//目录列表隐藏的项
	'auto_login'		=> "0",			// 是否自动登录；登录用户为guest
	'first_in'			=> "explorer",	// 登录后默认进入[explorer desktop,editor]
	'new_user_app'		=> "365日历,pptv直播,ps,qq音乐,搜狐影视,时钟,天气,水果忍者,计算器,豆瓣电台,音悦台,icloud",
	'new_user_folder'	=> "document,desktop",
);

$config['setting_group_default'] = array(
	'new_group_folder'	=> "share,doc",//新建分组默认建立文件夹
);

//新用户初始化默认配置
$config['setting_default'] = array(
	'list_type'			=> "icon",		// list||icon
	'list_sort_field'	=> "name",		// name||size||ext||mtime
	'list_sort_order'	=> "up",		// asc||desc
	'theme'				=> "mac",		// app theme [mac,win7,metro,metro_green,alpha]
	'wall'				=> "2",			// wall picture
	"file_repeat"		=> "rename",	// rename,replace
	"recycle_open"		=> "1",			// 1 | 0 代表是否开启
	'musictheme'		=> "mp3player",	// music player theme
	'movietheme'		=> "webplayer"	// movie player theme
);
$config['editor_default'] = array(
	'font_size'		=> '15px',
	'theme'			=> 'tomorrow',
	'auto_wrap'		=> 1,
	'display_char'	=> 0,
	'auto_complete'	=> 1,
	'function_list' => 1
);

// 配置项可选值
$config['setting_all'] = array(
	'language' 		=> "en:English,zh_CN:简体中文,zh_TW:繁體中文",
	'themeall'		=> "mac:Mac white,win7:Window 7,".
					   "metro:Metro,metro_green:Metro green,metro_purple:Metro purple,metro_pink:Metro pink,metro_orange:Metro orange,".
					   "alpha_image:Alpha image,alpha_image_mounting:Alpha image mounting,alpha_image_sun:Alpha image sun,alpha_image_cartoon:Alpha image cartoon,alpha_image_sky:Alpha image sky,alpha_image_ocean:Alpha image ocean,alpha_image_green:Alpha image green,alpha_image_black:Alpha image black",
	'codethemeall'	=> "chrome,clouds,crimson_editor,eclipse,github,solarized_light,tomorrow,xcode,ambiance,idle_fingers,monokai,pastel_on_dark,solarized_dark,tomorrow_night_blue,tomorrow_night_eighties",
	'wallall'		=> "1,2,3,4,5,6,7,8,9,10,11,12,13,14",
	'musicthemeall'	=> "ting,beveled,kuwo,manila,mp3player,qqmusic,somusic,xdj",
	'moviethemeall'	=> "webplayer,qqplayer,vplayer,youtube_theme"
);

//初始化默认菜单配置
$config['setting_menu_default'] = array(
	// array('name'=>'desktop','type'=>'system','url'=>'index.php?desktop','target'=>'_self','use'=>'1'),
	array('name'=>'explorer','type'=>'system','url'=>'index.php?explorer','target'=>'_self','use'=>'1')
	// array('name'=>'editor','type'=>'system','url'=>'index.php?editor','target'=>'_self','use'=>'1'),
	// array('name'=>'adminer','type'=>'','url'=>'./lib/plugins/adminer/','target'=>'_blank','use'=>'1')
);

//用户组默认配置数据
$config['group_setting_default'] = array(
	'group_size'=>0,//0不限制；单位为M  1024代表 1G
);

//权限配置；精确到需要做权限控制的控制器和方法
//需要权限认证的Action;root组无视权限
$config['role_setting'] = array(
	'explorer'	=> array(
		'mkdir','mkfile','pathRname','pathDelete','zip','unzip','pathCopy','pathChmod',
		'pathCute','pathCuteDrag','pathCopyDrag','clipboard','pathPast','pathInfo',
		'serverDownload','fileUpload','search','pathDeleteRecycle',
		'fileDownload','zipDownload','fileDownloadRemove','fileProxy','officeView','officeSave'),
	'app'		=> array('user_app','init_app','add','edit','del'),//
	'user'		=> array('changePassword'),//可以设立公用账户
	'editor'	=> array('fileGet','fileSave'),
	'userShare' => array('set','del'),
	'setting'	=> array('set','system_setting','php_info'),
	'fav'		=> array('add','del','edit'),

	'system_member'	=> array('get','add','do_action','edit'),
	'system_group'	=> array('get','add','del','edit'),
	'system_role'	=> array('add','del','edit'),//不开放此功能设置【避免扩展名修改，导致系统安全问题】
);

//只读配置；guest需要检查path的action
$config['role_guest_check'] = array(
	'explorer'	=> array(//排除只读：pathCopy、clipboard、pathInfo、search
		'mkdir','mkfile','pathRname','pathDelete','zip','unzip','pathCute',
		'pathCuteDrag','pathCopyDrag','pathPast','serverDownload','fileUpload'),
	'app'		=> array('user_app','add','edit','del'),//
	'editor'	=> array('fileSave'),
);
