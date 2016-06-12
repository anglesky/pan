<?php
/*
* @link http://www.kalcaddle.com/
* @author warlee | e-mail:kalcaddle@qq.com
* @copyright warlee 2014.(Shanghai)Co.,Ltd
* @license http://kalcaddle.com/tools/licenses/license.txt
*/

//虚拟目录
define('KOD_GROUP_PATH','{group_path}');
define('KOD_GROUP_SHARE','{group_share}');
define('KOD_USER_SHARE','{user_share}');
define('KOD_USER_RECYCLE','{user_recycle}');

//处理成标准目录
function _DIR_CLEAR($path){
	$path = htmlspecial_decode($path);
	$path = str_replace('\\','/',trim($path));
	if (strstr($path,'../')) {
		$path = preg_replace('/\.+\/+/', '/', $path);
	}
	$path = preg_replace('/\/+/', '/', $path);
	return $path;
}

//处理成用户目录，并且不允许相对目录的请求操作
function _DIR($before_path){
	$before_path = rawurldecode($before_path);
	$path = _DIR_CLEAR($before_path);
	$path = iconv_system($path);
	$path_arr = array(
		'group_path'    => KOD_GROUP_PATH,    //后面跟组id；检查权限；owner or exit
		'group_share'   => KOD_GROUP_SHARE,   //后面跟组id；检查权限；owner/guest
		'user_share'    => KOD_USER_SHARE,    //后面跟用户id；检查权限；owner or guest
		'recycle'       => KOD_USER_RECYCLE,  //后面目录；不检查权限
	);
	$GLOBALS['path_type'] = '';
	$GLOBALS['path_pre'] = HOME;
	$GLOBALS['path_id']  = '';
	unset($GLOBALS['path_id_user_share']);
	foreach ($path_arr as $key=>$val) {
		if (substr($path,0,strlen($val)) == $val){
			$GLOBALS['path_type'] = $val;
			$temp = explode('/',$path);
			$kod_path = $temp[0];
			unset($temp[0]);
			$add_path = implode('/',$temp);
			$id_arr = explode(':',$kod_path);
			if(count($id_arr)>1){
				$GLOBALS['path_id'] = trim($id_arr[1]);
			}else{
				$GLOBALS['path_id'] = '';
			}			
			break;
		}
	}	
	switch ($GLOBALS['path_type']) {
		case '':
			$path = HOME.$path;
			break;
		case $path_arr['recycle']://回收站
			$GLOBALS['path_pre'] = rtrim(USER_RECYCLE,'/');
			$GLOBALS['path_id'] = '';
			return USER_RECYCLE.'/'.str_replace($path_arr['recycle'],'',$path);
		case $path_arr['group_path']://自己组文档
			$info = system_group::get_info($GLOBALS['path_id']);
			if(!$GLOBALS['path_id'] || !$info) return false;
			owner_group_check($GLOBALS['path_id']);                
			$GLOBALS['path_pre'] = GROUP_PATH.$info['path'].'/home/';
			$path = $GLOBALS['path_pre'].$add_path;
			break;
		case $path_arr['group_share']://组共享
			$info = system_group::get_info($GLOBALS['path_id']);
			if(!$GLOBALS['path_id'] || !$info) return false;
			owner_group_check($GLOBALS['path_id']);                
			$GLOBALS['path_pre'] = GROUP_PATH.$info['path'].'/home/share/';
			$path = $GLOBALS['path_pre'].$add_path;
			break;
		case $path_arr['user_share']://用户分享
			$info = system_member::get_info($GLOBALS['path_id']);
			if(!$GLOBALS['path_id'] || !$info) return false;
			if ($GLOBALS['path_id'] != $_SESSION['kod_user']['user_id']) {
				owner_check();//自己时拥有所有权限。
			}
			$GLOBALS['path_pre'] = '';
			$GLOBALS['path_id_user_share'] = $before_path;
			if($add_path==''){//共享根目录
				return $path;
			}else{
				$share_cell = explode('/',$add_path);
				$share_info=system_member::user_share_get($GLOBALS['path_id'],$share_cell[0]);
				//目录分享根目录
				$GLOBALS['path_id_user_share'] = $path_arr['user_share'].':'.$GLOBALS['path_id'].'/'.$share_cell[0].'/';

				unset($share_cell[0]);
				if(!$share_info) return false;
				$path_last = rtrim($share_info['path'],'/').'/'.implode('/',$share_cell);
				if($info['role']!='1'){
					$GLOBALS['path_pre'] = USER_PATH.$info['path'].'/home/'.$path_last;
					$path = $GLOBALS['path_pre'];
				}else{//admin的共享
					$GLOBALS['path_pre'] = $share_info['path'];
					$path = $path_last;
				}
			}
			break;
		default:break;
	}
	if($path!='/'){// 没处理单纯/问题
		$path = rtrim($path,'/');
		if (is_dir($path)) $path = $path.'/';
	}
	return $path;
}
//处理成用户目录输出
function _DIR_OUT($arr){
	xxsClear($arr);
	//if (isset($GLOBALS['is_root'])&&$GLOBALS['is_root']==1) return $arr;//管理员输出真实路径
	if (is_array($arr)) {
		foreach ($arr['filelist'] as $key => &$value) {
			$value['path'] = pre_clear($value['path']);
		}
		foreach ($arr['folderlist'] as $key => &$value) {
			$value['path'] = pre_clear($value['path'].'/');
		}
	}else{
		$arr = pre_clear($arr);
	}
	return $arr;
}
//前缀处理 非root用户目录/从HOME开始
function pre_clear($path){
	if (ST=='share') {
		return str_replace(rtrim(HOME,'/'),'',$path);
	}
	$pre_path = $GLOBALS['path_type'];
	if($GLOBALS['path_id']!=''){
		$pre_path.=':'.$GLOBALS['path_id'].'/';
	}
	if(isset($GLOBALS['path_id_user_share'])){
		$pre_path =$GLOBALS['path_id_user_share'];
	}
	//debug_out($pre_path,$GLOBALS['path_pre'],$GLOBALS['path_id'],$path);
	return $pre_path.str_replace(rtrim($GLOBALS['path_pre'],'/'),'', $path);
}
function xxsClear(&$list){
	if (is_array($list)) {
		foreach ($list['filelist'] as $key => &$value) {
			$value['ext'] = htmlspecial($value['ext']);
			$value['path'] = htmlspecial($value['path']);
			$value['name'] = htmlspecial($value['name']);
		}
		foreach ($list['folderlist'] as $key => &$value) {
			$value['path'] = htmlspecial($value['path']);
			$value['name'] = htmlspecial($value['name']);
		}
	}else{
		$list = htmlspecial($list);
	}
}

function hash_path($key=''){
	$rand = rand_string(30).$key;
	return md5($rand);
}
//可读写判断
function owner_group_check($group_id){
	if (!$group_id) show_json($GLOBALS['L']['group_not_exist'].$group_id,false);
	if ($GLOBALS['is_root'] || 
		(isset($GLOBALS['path_from_auth_check']) && $GLOBALS['path_from_auth_check']===true)){
		return;
	}
	$auth = system_member::user_auth_group($group_id);//read write ''——无权限
	if($auth != 'write'){
		owner_check();
		if($auth== false && $GLOBALS['path_type'] == KOD_GROUP_PATH){
			show_json($GLOBALS['L']['no_permission_group'],false);
		}
	}
}
//读写权限判断
function owner_check(){
	if ($GLOBALS['is_root'] || 
		(isset($GLOBALS['path_from_auth_check']) && $GLOBALS['path_from_auth_check']===true)){
		return;
	}
	$check = $GLOBALS['config']['role_guest_check'];

	if (!array_key_exists(ST,$check) ) return;
	if (in_array(ACT,$check[ST])){
		show_json($GLOBALS['L']['no_permission_action'],false);
	}
}

function htmlspecial($str){
	return str_replace(
		array('<','>','"',"'"),
		array('&lt;','&gt;','&quot;','&#039;','&amp;'),
		$str
	);
}
function htmlspecial_decode($str){
	return str_replace(        
		array('&lt;','&gt;','&quot;','&#039;'),
		array('<','>','"',"'"),
		$str
	);
}

//-----解压缩跨平台编码转换；自动识别编码-----
//压缩前，文件名处理；
//ACT=zip——压缩到当前
//ACT=zipDownload---打包下载[判断浏览器&UA——得到地区自动转换为目标编码]； 
function zip_pre_name($file_name){
	if(get_path_this($file_name) == '.DS_Store') return '';//过滤文件
	if (!function_exists('iconv')){
		return $file_name;
	}
	$to_charset = $charset = get_charset($file_name);
	if(client_is_windows() && (LANGUAGE_TYPE=='zh_CN' || LANGUAGE_TYPE=='zh_TW')){
		$to_charset = 'gbk';//压缩或者打包下载压缩时文件名采用的编码
	}
	return iconv($charset,$to_charset, $file_name);
}
//解压到kod，文件名处理;识别编码并转换到当前系统编码
function unzip_pre_name($file_name){
	if (!function_exists('iconv')){
		return $file_name;
	}
	$charset = get_charset($file_name);
	return iconv($charset,$GLOBALS['config']['system_charset'], $file_name);
}

//扩展名权限判断
function check_ext_unzip($code,$info){
	return checkExt($info['stored_filename']);
}
//扩展名权限判断 有权限则返回1 不是true
function checkExt($file,$changExt=false){
	if (strstr($file,'<') || strstr($file,'>') || $file=='') {
		return 0;
	}
	if ($GLOBALS['is_root'] == 1) return 1;
	$not_allow = $GLOBALS['auth']['ext_not_allow'];
	$ext_arr = explode('|',$not_allow);
	foreach ($ext_arr as $current) {
		if ($current !== '' && stristr($file,'.'.$current)){//含有扩展名
			return 0;
		}
	}
	return 1;
}

function _make_file_proxy($file_path){
	if (!file_exists($file_path)) {
		return '';
	}
	load_class('mcrypt');
	$pass = $GLOBALS['config']['setting_system']['system_password'];
	$fid = Mcrypt::encode($file_path,$pass,$GLOBALS['config']['settings']['download_url_time']);
	//文件对外界公开的地址;有效期在user_setting.php中设定；末尾追加文件名为了kod远程下载
	$file_name = urlencode(get_path_this($file_path));
	return APPHOST.'index.php?user/public_link&fid='.$fid.'&file_name=/'.$file_name;
}

function get_charset(&$str) {
	if ($str == '' || !function_exists("mb_detect_encoding")){
		return 'utf-8';
	}
	//前面检测成功则，自动忽略后面
	$charset=strtolower(@mb_detect_encoding($str,$GLOBALS['config']['check_charset']));
	if (substr($str,0,3)==chr(0xEF).chr(0xBB).chr(0xBF)){
		$charset='utf-8';
	}else if($charset=='cp936'){
		$charset='gbk';
	}    
	if ($charset == 'ascii') $charset = 'utf-8';
	return $charset;
}


//空间变更；空间满则处理
//'pathDelete','pathDeleteRecycle','mkfile','mkdir','pathCuteDrag',
//'pathCopyDrag','pathPast','zip','unzip','serverDownload','fileUpload'
function space_size_use_check(){
	if ($GLOBALS['is_root']==1) return;//root不限制上限
	//空间变更记录
	if($GLOBALS['path_type'] == KOD_GROUP_SHARE || 
	   $GLOBALS['path_type'] == KOD_GROUP_PATH){
		system_group::space_check($GLOBALS['path_id']);
	}else{		
		if(ST=='share'){//公共目录上传
			$user_id = $GLOBALS['in']['user'];
		}else{
			$user_id = $_SESSION['kod_user']['user_id'];
		}
		system_member::space_check($user_id);
	}
}

//空间大小变更 [自动判断个人空间还是群组空间，分别记录到个人和群组]
// type:		user_path,group_path
// path_type:	'',KOD_GROUP_PATH,KOD_GROUP_SHARE,KOD_USER_SHARE,KOD_USER_RECYCLE,
function space_size_use_change($path,$is_add=true,$path_type=false,$path_id=false){
	if($path_type===false){
		$path_type = $GLOBALS['path_type'];
		$path_id = $GLOBALS['path_id'];
	}
	$is_add = $is_add?1:-1;//加或减
	if(is_file($path)){
		$size = get_filesize($path);
	}else if(is_dir($path)){
		$pathinfo = _path_info_more($path);
		$size = $pathinfo['size'];
	}else{
		return;
	}
	//空间变更记录 组空间和用户空间
	if($path_type == KOD_GROUP_SHARE || $path_type == KOD_GROUP_PATH){
		system_group::space_change($path_id,$size*$is_add);
	}else{		
		if(ST=='share'){//公共目录上传
			$user_id = $GLOBALS['in']['user'];
		}else{
			$user_id = $_SESSION['kod_user']['user_id'];
		}
		system_member::space_change($user_id,$size*$is_add);
	}
}

//使用空间重置 彻底删除时触发重置
function space_size_use_reset(){
	$path_type = isset($GLOBALS['path_type'])?$GLOBALS['path_type']:'';
	$path_id   = isset($GLOBALS['path_id'])?$GLOBALS['path_id']:'';
	if($path_type == KOD_GROUP_SHARE || $path_type == KOD_GROUP_PATH){
		system_group::space_change($path_id);
	}else{		
		$user_id = $_SESSION['kod_user']['user_id'];
		system_member::space_change($user_id);
	}
}

function php_env_check(){
	$L = $GLOBALS['L'];
	$error = '';
	if(!function_exists('iconv')) $error.= '<li>'.$L['php_env_error_iconv'].'</li>';
	if(!function_exists('mb_convert_encoding')) $error.= '<li>'.$L['php_env_error_mb_string'].'</li>';
	if(!version_compare(PHP_VERSION,'5.0','>=')) $error.= '<li>'.$L['php_env_error_version'].'</li>';
	if(!function_exists('file_get_contents')) $error.='<li>'.$L['php_env_error_file'].'</li>';

	$parent = get_path_father(BASIC_PATH);
	$arr_check = array(BASIC_PATH,BASIC_PATH.'data',BASIC_PATH.'data/system',
		BASIC_PATH.'data/User',BASIC_PATH.'data/Group',BASIC_PATH.'data/session');
	foreach ($arr_check as $value) {
		if(!path_writable($value)){
			$error.= '<li>'.str_replace($parent,'',$value).'/	'.$L['php_env_error_path'].'</li>';
		}
	}
	if( !function_exists('imagecreatefromjpeg')||
		!function_exists('imagecreatefromgif')||
		!function_exists('imagecreatefrompng')||	
		!function_exists('imagecolorallocate')){
		$error.= '<li>'.$L['php_env_error_gd'].'</li>';
	}
	return $error;
}


function init_config(){
	init_setting();
	init_lang();
	init_user_setting();
}

//语言包加载：优先级：cookie获取>自动识别
//首次没有cookie则自动识别——存入cookie,过期时间无限
function init_lang(){
	if (isset($_COOKIE['kod_user_language'])) {
		$lang = $_COOKIE['kod_user_language'];
	}else{//没有cookie
		preg_match('/^([a-z\-]+)/i', $_SERVER['HTTP_ACCEPT_LANGUAGE'], $matches);
		$lang = $matches[1];
		switch (substr($lang,0,2)) {
			case 'zh':
				if ($lang != 'zh-TW'){
					$lang = 'zh-CN';
				}
				break;
			case 'en':$lang = 'en';break;
			default:$lang = 'en';break;
		}
		$lang = str_replace('-', '_',$lang);
		setcookie('kod_user_language',$lang, time()+3600*24*365);
	}
	if ($lang == '') $lang = 'en';		
	$lang = str_replace(array('/','\\','..','.'),'',$lang);

	if(isset($GLOBALS['config']['settings']['language'])){
		$lang = $GLOBALS['config']['settings']['language'];
	}
	define('LANGUAGE_TYPE', $lang);
	include(LANGUAGE_PATH.$lang.'/main.php');
	$GLOBALS['L'] = $L;
}

function init_setting(){
	$setting_file = USER_SYSTEM.'system_setting.php';
	if (!file_exists($setting_file)){//不存在则建立
		$setting = $GLOBALS['config']['setting_system_default'];
		$setting['menu'] = $GLOBALS['config']['setting_menu_default'];
		fileCache::save($setting_file,$setting);
	}else{
		$setting = fileCache::load($setting_file);   
	}
	if (!is_array($setting)) {
		$setting = $GLOBALS['config']['setting_system_default'];
	}
	if (!is_array($setting['menu'])) {
		$setting['menu'] = $GLOBALS['config']['setting_menu_default'];
	}

	$GLOBALS['app']->setDefaultController($setting['first_in']);//设置默认控制器
	$GLOBALS['app']->setDefaultAction('index');    //设置默认控制器函数
	$GLOBALS['config']['setting_system'] = $setting;//全局
	define('STATIC_PATH',$GLOBALS['config']['settings']['static_path']);//静态文件目录
}
function init_user_setting(){
    $GLOBALS['L']['kod_name'] = $GLOBALS['config']['setting_system']['system_name'];
	$GLOBALS['L']['kod_name_desc'] = $GLOBALS['config']['setting_system']['system_desc'];
	if (isset($setting['powerby'])) {
		$GLOBALS['L']['kod_power_by'] = $GLOBALS['config']['setting_system']['powerby'];
	}
	//加载用户自定义配置
	$setting_user = BASIC_PATH.'config/setting_user.php';
	if (file_exists($setting_user)) {
		include($setting_user);
	}
}

function user_logout(){
	setcookie(SESSION_ID, '', time()-3600,'/'); 
	setcookie('kod_name', '', time()-3600); 
	setcookie('kod_token', '', time()-3600);
	setcookie('kod_user_language', '', time()-3600);
	session_destroy();
	header('location:./index.php?user/login');
	exit;
}
