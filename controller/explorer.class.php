<?php 
/*
* @link http://www.kalcaddle.com/
* @author warlee | e-mail:kalcaddle@qq.com
* @copyright warlee 2014.(Shanghai)Co.,Ltd
* @license http://kalcaddle.com/tools/licenses/license.txt
*/  

class explorer extends Controller{
	public $path;
	public $user;
	public function __construct(){
		parent::__construct();
		$this->tpl = TEMPLATE.'explorer/';
		$this->user = $_SESSION['kod_user'];
		if (isset($this->in['path'])) {
			$this->path = _DIR($this->in['path']);
		}
	}
	public function index(){
		if(isset($this->in['path']) && $this->in['path'] !=''){
			$dir = _DIR_CLEAR($_GET['path']);
		}else if(isset($_SESSION['this_path'])){
			$dir = _DIR_CLEAR($_SESSION['this_path']);
		}else{
			$dir = '/';//首次进入系统,不带参数
			//管理员进入也只能查看云存储相关文件及文件夹
			// if ($GLOBALS['is_root']) $dir = WEB_ROOT;
		}
		$dir = rtrim($dir,'/').'/';
		$this->assign('dir',$dir);

		if (is_wap() && !isset($this->in['use_desktop'])) {
			$this->display('index_wap.php');
		}else{
			$this->display('index.php');
		}
	}
	public function pathInfo(){
		$info_list = json_decode($this->in['list'],true);
		foreach ($info_list as &$val) {          
			$val['path'] = _DIR($val['path']);
		}
		$data = path_info_muti($info_list,$this->L['time_type_info']);
		if(!$data){
			show_json($this->L['not_exists'],false);
		}
		//属性查看，单个文件则生成临时下载地址。没有权限则不显示
		if (count($info_list)==1 && 
			$info_list[0]['type']=='file' &&
			($GLOBALS['is_root'] || $GLOBALS['auth']['explorer:fileDownload']==1)) {
			$data['download_path'] = _make_file_proxy($info_list[0]['path']);
		}
		$data['path'] = _DIR_OUT($data['path']);
		show_json($data);
	}

	public function pathChmod(){
		$info_list = json_decode($this->in['list'],true);
		$mod = octdec('0'.$this->in['mod']);
		$success=0;$error=0;
		foreach ($info_list as $val) {
			$path = _DIR($val['path']);
			if(chmod_path($path,$mod)){
				$success++;
			}else{
				$error++;
			}
		}
		$state = $error==0?true:false;
		$info = $success.' success,'.$error.' error';
		if (count($info_list) == 1 && $error==0) {
			$info = $this->L['success'];
		}
		show_json($info,$state);
	}

	private function _pathAllow($path){
		$name = get_path_this($path);
		$path_not_allow  = array('*','?','"','<','>','|');
		foreach ($path_not_allow as $tip) {
			if (strstr($name,$tip)) {
				show_json($this->L['path_not_allow']."*,?,<,>,|",false);
			}
		}
	}
	public function pathRname(){
		if (!is_writable($this->path)) {
			show_json($this->L['no_permission_write_all'],false);
		}
		$rname_to=_DIR($this->in['rname_to']);
		$this->_pathAllow($rname_to);
		if (file_exists($rname_to)) {
			show_json($this->L['name_isexists'],false);
		}
		if(@rename($this->path,$rname_to)){
			show_json($this->L['rname_success']);
		}else{
			show_json($this->L['error'],false);
		}		
	}

	public function search(){
		if (!isset($this->in['search'])) show_json($this->L['please_inpute_search_words'],false);
		$is_content = false;
		$is_case    = false;
		$ext        = '';
		if (isset($this->in['is_content'])) $is_content = true;
		if (isset($this->in['is_case'])) $is_case = true;
		if (isset($this->in['ext'])) $ext= str_replace(' ','',$this->in['ext']);

		//共享根目录不支持搜索
		if( $GLOBALS['path_type'] == KOD_USER_SHARE && 
			strstr($this->path,KOD_USER_SHARE)){
			show_json($this->L['path_cannot_search'],false);
		}
		$list = path_search(
			$this->path,
			iconv_system(rawurldecode($this->in['search'])),
			$is_content,$ext,$is_case);
		show_json(_DIR_OUT($list));
	}

	public function pathList(){
		$user_path = $this->in['path'];
		if ($user_path=="")  $user_path='/';
		session_start();//re start
		$_SESSION['this_path']=$user_path;
		$list=$this->path($this->path);

		//自己的根目录
		if($this->path== MYHOME || $this->path==HOME){
			$this->_self_root_load($list['folderlist']);
		}

		//群组根目录
		if( $list['info']['path_type'] == KOD_GROUP_PATH &&
			!strstr(trim(_DIR_CLEAR($this->in['path']),'/'),'/')
		   ){//自己的根目录
			$this->_self_group_load($list['folderlist']);
		}
		$list['user_space'] = $this->user['config'];
		show_json($list);
	}

	public function treeList(){//树结构
		$app = $this->in['app'];//是否获取文件 传folder|file
		if (isset($this->in['type']) && $this->in['type']=='init'){
			$this->_tree_init($app);
		}

		//共享资源池:
		$is_pub_group = false;
		//根树目录请求
		switch(trim(rawurldecode($this->in['path']))){
			case "{tree_self_fav}":
				show_json($this->_tree_fav(),true);
				break;
			case "{tree_group_self}":
				show_json($this->_group_self(),true);
				break;
			case "{tree_group_all}":
				show_json($this->_group_tree('1', $is_pub_group),true);
				break;
			case "{tree_group_public}":
				$is_pub_group = true;
				show_json($this->_group_tree('1', $is_pub_group),true);
				break;
			default:break;
		}

		if (isset($this->in['tree_icon']) && $this->in['tree_icon']=='pubGroup') {
			$is_pub_group = true;
		}

		//树目录组处理	
		if ( (isset($this->in['tree_icon']) && $this->in['tree_icon']!='groupPublic') &&  //公共目录刷新排除
			!strstr(trim(rawurldecode($this->in['path']),'/'),'/') &&
			($GLOBALS['path_type'] == KOD_GROUP_PATH||
			$GLOBALS['path_type'] == KOD_GROUP_SHARE)) {
			$list = $this->_group_tree($GLOBALS['path_id'], $is_pub_group, false);
			show_json($list,true);
			return;
		}

		//正常目录
		$path=_DIR($this->in['path']);
		if (!is_readable($path)) show_json($this->L['no_permission_read'],false);
		$list_file = ($app == 'editor'?true:false);//编辑器内列出文件
		$list=$this->path($path,$list_file,true);
		function sort_by_key($a, $b){
			if ($a['name'] == $b['name']) return 0;
			return ($a['name'] > $b['name']) ? 1 : -1;
		}
		usort($list['folderlist'], "sort_by_key");
		usort($list['filelist'], "sort_by_key");
		if($path == MYHOME || $path==HOME){//自己的根目录
			$this->_self_root_load($list['folderlist']);
		}
		if ($app == 'editor') {
			$res = array_merge($list['folderlist'],$list['filelist']);
			show_json($res,true);
		}else{
			show_json($list['folderlist'],true);
		}
	}

	//用户根目录
	private function _self_group_load(&$root){
		foreach ($root as $key => $value) {
			if($value['name'] == 'share'){
				$root[$key] = array(
					'name'		=> $this->L['group_share'],
					'menuType'  => "menufolder folderBox",
					'tree_icon' => "share",
					
					'path' 		=> KOD_GROUP_PATH.':'.$GLOBALS['path_id'].'/share/',
					'type'      => 'folder',
					'open'      => false,
					'isParent'  => false
				);
				break;
			}
		}
		$root = array_values($root);
	}

	//用户根目录
	private function _self_root_load(&$root){
		foreach ($root as $key => $value) {
			if($value['name'] == 'share'){
				$root[$key] = array(
					'name'		=> $this->L['my_share'],
					'menuType'  => "menuTreeUser",
					'tree_icon' => "share",
					
					'path' 		=> KOD_USER_SHARE.':'.$this->user["user_id"].'/',
					'type'      => 'folder',
					'open'      => false,
					'isParent'  => false
				);
				break;
			}
		}
		$root = array_values($root);
		//不开启回收站则不显示回收站
		if($this->config['user']['recycle_open']=="1"){
			$root[] = array(
				'name'=>$this->L['recycle'],
				'menuType'  =>"menuRecycleButton",
				'tree_icon' =>"recycle",

				'path' 		=> KOD_USER_RECYCLE,
				'type'      => 'folder',
				'open'      => true,
				'isParent'  => false
			);
		}
	}


	private function _tree_fav(){
		$check_file = ($this->in['app'] == 'editor'?true:false);
		$favData=new fileCache(USER.'data/fav.php');
		$fav_list = $favData->get();
		$fav = array();

		$GLOBALS['path_from_auth_check'] = true;//组权限发生变更。导致访问group_path 无权限退出问题
		foreach($fav_list as $key => $val){
			$has_children = path_haschildren(_DIR($val['path']),$check_file);
			$path_type = 'file';
			if(!isset($val['type'])||
				in_array($val['type'],array('user','group','recycle','folder'))){
				$path_type = 'folder';
			}
			if( in_array($val['type'],array('group'))){
				$has_children = true;
			}
			$the_fav = array(
				'name'      => $val['name'],
				'ext' 		=> 'treeFav',
				'menuType'  => "menuTreeFav",

				'path' 		=> $val['path'],
				'type'      => $path_type,
				'open'      => false,
				'isParent'  => $has_children
			);
			if(isset($val['type']) && $val['type']!='folder'){//icon优化
				$the_fav['ext'] = $val['type'];
			}
			$fav[] = $the_fav;
		}
		$GLOBALS['path_from_auth_check'] = false;
		return $fav;
	}

	private function _tree_init($app){
		if ($app == 'editor' && isset($this->in['project'])) {
			$list_project = $this->path(_DIR($this->in['project']),true,true);
			$project = array_merge($list_project['folderlist'],$list_project['filelist']);
			$tree_data = array(           
				array('name'=> get_path_this($this->in['project']),
					'children'	=>$project,					
					'menuType'  => "menuTreeRoot",
					'tree_icon' => "folder",
					
					'path' 		=> $this->in['project'],
					'type'      => 'folder',
					'open'      => true,
					'isParent'  => count($project)>0?true:false)
			);
			show_json($tree_data);
			return;
		}
		$check_file = ($app == 'editor'?true:false);
		$fav = $this->_tree_fav($app);

		$public_path = KOD_GROUP_PATH.':1/';
		if(system_member::user_auth_group(1) == false){
			$public_path = KOD_GROUP_SHARE.':1/';//不在公共组则只能读取公共组共享目录
		}
		$list_public = $this->path(_DIR($public_path),$check_file,true);
		$list_root  = $this->path(_DIR(MYHOME),$check_file,true);
		if ($check_file) {//编辑器
			$root = array_merge($list_root['folderlist'],$list_root['filelist']);
			$public = array_merge($list_public['folderlist'],$list_public['filelist']);
		}else{//文件管理器
			$root  = $list_root['folderlist'];
			$public = $list_public['folderlist'];			
			$this->_self_root_load($root);//自己的根目录
		}

		$root_isparent = count($root)>0?true:false;
		$public_isparent = count($public)>0?true:false;
		$tree_data = array(
			'webroot'=>array(),
			'fav'=>array(
				'name'      => $this->L['fav'],
				'tree_icon' => "treeFav",
				'menuType'  => "menuTreeFavRoot",
				'children'  => $fav,

				'path' 		=> '{tree_self_fav}',
				'type'      => 'folder',
				'open'      => true,
				'isParent'  => count($fav)>0?true:false
			),
			'my_home'=>array(
				'name'		=> $this->L['root_path'],
				'menuType'  => "menuTreeRoot",
				'tree_icon' => "treeSelf",
				'children'  => $root,

				'path' 		=> MYHOME,
				'type'      => 'folder',
				'open'      => true,
				'isParent'  => $root_isparent
			),
			
			'public'=>array(
				'name'		=> $this->L['public_path'],
				'menuType'  => "menuTreeGroupRoot",
				'tree_icon' => "groupPublic",
				'children'  => $public,

				'path' 		=> $public_path,
				'type'      => 'folder',
				'open'      => true,
				'isParent'  => $public_isparent
			),
			'my_group'=>array(
				'name'		=> $this->L['my_kod_group'],//TODO
				'menuType'  => "menuTreeGroupRoot",
				'tree_icon' => "groupSelfRoot",
				'children'  => $this->_group_self(),

				'path' 		=> '{tree_group_self}',
				'type'      => 'folder',
				'open'      => true,
				'isParent'  => true
			),
			'pub_group'=>array(
			    'name'		=> $this->L['kod_pub_group'],
			    'menuType'  => "menuTreeGroupRoot",
			    'tree_icon' => "pubGroup",
			    'children'  => $this->_group_tree('1',true),

			    'path' 		=> '{tree_group_public}',
			    'type'      => 'folder',
			    'open'      => true,
			    'isParent'  => true
			),
			'group'=>array(
				'name'		=> $this->L['kod_group'],
				'menuType'  => "menuTreeGroupRoot",
				'tree_icon' => "groupRoot",
				'children'  => $this->_group_tree('1',false),

				'path' 		=> '{tree_group_all}',
				'type'      => 'folder',
				'open'      => true,
				'isParent'  => true
			),
		);

		//编辑器简化树目录
		if($app == 'editor'){
			unset($tree_data['my_group']);
			unset($tree_data['group']);
			unset($tree_data['public']);			
			//管理员，优化编辑器树目录
			if($GLOBALS['is_root']==1){
				$list_web  = $this->path(_DIR(WEB_ROOT),$check_file,true);
				$web = array_merge($list_web['folderlist'],$list_web['filelist']);
				$tree_data['webroot'] = array(
					'name'      => "webroot",
					'menuType'  => "menuTreeRoot",
					'tree_icon' => "folder",
					'children'  => $web,

					'path' 		=> WEB_ROOT,
					'type'      => 'folder',
					'open'      => true,
					'isParent'  => true
				);
			}
		}else{//目录管理
			unset($tree_data['webroot']);
		}

		$result = array();
		foreach ($tree_data as $key => $value) {
			if(count($value['children'])<1 && $key!='fav'){
				continue;
				//$value['isParent'] = false;
			}
			$result[] = $value;
		}
		show_json($result);
	}

	//session记录用户可以管理的组织；继承关系
	//$is_pub_group 为新增参数,用于记录"共享资源池",共享资源池只显示到二级文件夹,而且不显示用户
	//$is_init是否为初始化
	private function _group_tree($node_id, $is_pub_group, $is_init = true){//获取组织架构的用户和子组织；为空则获取根目录
		$group_sql = system_group::load_data();
		$groups = $group_sql->get(array('parent_id',$node_id));
		
		if ($is_pub_group&&!$is_init) {
			//向上找两代
			$pG1 = $group_sql->get(array('group_id', $node_id));
			if(isset($pG1)){
				$pG1 = array_slice($pG1,0,1);
				$pG2 = $group_sql->get(array('group_id', $pG1[0]['parent_id']));
				if(isset($pG2)){
					$pG2 = array_slice($pG2,0,1);
					$pG3 = $group_sql->get(array('group_id', $pG2[0]['parent_id']));
					if($pG3){
						$groups = false;
					}
				}
			}
		}
		
		$group_list = $this->_make_node_list($groups, $is_pub_group);

		//user
		$user_list = array();
		if($node_id !='1' && !$is_pub_group){//根组不显示用户,共享资源池不显示用户
			$user = system_member::get_user_at_group($node_id);
			foreach($user as $key => $val){
				$tree_icon = 'user';
				if ($val['user_id'] == $this->user['user_id']) {
					$tree_icon = 'userSelf';
				}
				$user_list[] = array(
					'name'      => $val['name'],
					'menuType'  => "menuTreeUser",
					'tree_icon' => $tree_icon,

					'path' 		=> KOD_USER_SHARE.':'.$val['user_id'].'/',
					'type'      => 'folder',
					'open'      => false,
					'isParent'  => false
				);
			}
		}
		$arr = array_merge($group_list,$user_list);
		return $arr;
	}
	//session记录用户可以管理的组织；继承关系
	private function _group_self(){//获取组织架构的用户和子组织；为空则获取根目录
		$groups = array();
		foreach ($this->user['group_info'] as $group_id=>$val){
			if($group_id=='1') continue;
			$groups[] = system_group::get_info($group_id);
		}
		return $this->_make_node_list($groups, false);
	}

	private function _make_node_list($list, $is_pub_group){
		$group_list = array();
		if(!is_array($list)){
			return $group_list;
		}
		foreach($list as $key => $val){
			$group_path = KOD_GROUP_PATH;
			$auth = system_member::user_auth_group($val['group_id']);
			if($auth==false){//是否为该组内部成员
				$group_path = KOD_GROUP_SHARE;
				$tree_icon = 'groupGuest';
			}else if($auth=='read'){
				$tree_icon = 'groupSelf';
			}else{
				$tree_icon = 'groupSelfOwner';
			}

			//共享资源组要控制图标
			if ($is_pub_group) {
				$tree_icon = 'pubGroup';
			}
			$has_children = true;
			$user_list = system_member::get_user_at_group($val['group_id']);

			if(count($user_list)==0 && $val['children']==''){
				$has_children = false;
			}
			$group_list[] = array(
				'name'      => $val['name'],
				'type'      => 'folder',
				'path' 		=> $group_path.':'.$val['group_id'].'/',
				'tree_icon' => $tree_icon,
				
				'menuType'  => "menuTreeGroup",
				'isParent'  => $has_children
			);
		}
		return $group_list;
	}
	public function pathDelete(){
		$list = json_decode($this->in['list'],true);
		if (!is_dir(USER_RECYCLE)){
			mk_dir(USER_RECYCLE);
		}
		if (!is_writable(USER_RECYCLE)){
			show_json($this->L['no_permission_write'],false);
		}
		$success=0;$error=0;
		foreach ($list as $val) {
			$path_this = _DIR($val['path']);
			//群组没有回收站  个人是否开启回收站
			if( $GLOBALS['path_type'] == KOD_GROUP_SHARE || 
				$GLOBALS['path_type'] == KOD_GROUP_PATH  ||
				$GLOBALS['path_type'] == KOD_USER_RECYCLE  ||
				$this->config['user']['recycle_open']!="1"){//回收站删除 or 共享删除等直接删除
				if ($val['type'] == 'folder') {
					if(del_dir($path_this)) $success ++;
					else $error++;
				}else{
					if(del_file($path_this)) $success++;
					else $error++;
				}
				space_size_use_reset();//使用空间重置
			}else{
				$filename = USER_RECYCLE.get_path_this($path_this);
				$filename = get_filename_auto($filename,date('-h:i:s'),'folder_rename');//已存在则追加时间
				if (@rename($path_this,$filename)) {
					$success++;
				}else{
					$error++;
				}
			}
		}
		$state = $error==0?true:false;
		$info = $success.' success,'.$error.' error';
		if ($error==0) {
			$info = $this->L['remove_success'];
		}
		show_json($info,$state);
	}
	public function pathDeleteRecycle(){
		if(!isset($this->in['list'])){
			if (!del_dir(USER_RECYCLE)) {
				show_json($this->L['remove_fali'],false);
			}else{
				mkdir(USER_RECYCLE);
				space_size_use_reset();//使用空间重置
				show_json($this->L['recycle_clear_success'],true);
			}
		}
		$list = json_decode($this->in['list'],true);
		$success = 0;$error   = 0;
		foreach ($list as $val) {
			$path_full = _DIR($val['path']);
			if ($val['type'] == 'folder') {
				if(del_dir($path_full)) $success ++;
				else $error++;
			}else{
				if(del_file($path_full)) $success++;
				else $error++;
			}
		}
		space_size_use_reset();//使用空间重置
		if (count($list) == 1) {
			if ($success) show_json($this->L['remove_success']);
			else show_json($this->L['remove_fali'],false);
		}else{
			$code = $error==0?true:false;
			show_json($this->L['remove_success'].$success.'success,'.$error.'error',$code);
		}       
	}

	public function mkfile(){
		space_size_use_check();
		$new= rtrim($this->path,'/');
		$this->_pathAllow($new);
		if(@touch($new)){
			chmod_path($new,0777);
			if (isset($this->in['content'])) {
				file_put_contents($new,$this->in['content']);
				space_size_use_change($new);
			}
			show_json($this->L['create_success'],true,get_path_this($new));
		}else{
			show_json($this->L['create_error'],false);
		}
	}
	public function mkdir(){
		space_size_use_check();
		$new = rtrim($this->path,'/');
		$this->_pathAllow($new);
		if(@mkdir($new,0777)){
			chmod_path($new,0777);
			show_json($this->L['create_success']);
		}else{
			show_json($this->L['create_error'],false);
		}
	}
	public function pathCopy(){
		session_start();//re start
		$the_list = json_decode($this->in['list'],true);
		foreach ($the_list as $key => &$value) {
			$value['path'] = rawurldecode($value['path']);
		}
		$_SESSION['path_copy']= json_encode($the_list);
		$_SESSION['path_copy_type']='copy';
		show_json($this->L['copy_success']);
	}
	public function pathCute(){
		session_start();//re start
		$the_list = json_decode($this->in['list'],true);
		foreach ($the_list as $key => &$value) {
			$value['path'] = rawurldecode($value['path']);
			_DIR($value['path']);
		}
		$_SESSION['path_copy']= json_encode($the_list);
		$_SESSION['path_copy_type']='cute';
		show_json($this->L['cute_success']);
	}
	public function pathCuteDrag(){
		$clipboard = json_decode($this->in['list'],true);
		$path_past=$this->path;
		$before_path_type = $GLOBALS['path_type'];
		$before_path_id = $GLOBALS['path_id'];

		if (!is_writable($this->path)) show_json($this->L['no_permission_write'],false);
		$success=0;$error=0;
		foreach ($clipboard as $val) {
			$path_copy = _DIR($val['path']);
			$filename  = get_path_this($path_copy);
			$filename = get_filename_auto($path_past.$filename,'',$this->config['user']['file_repeat']);//已存在处理 创建副本

			//跨空间检测
			if($before_path_id != $GLOBALS['path_id']){
				space_size_use_check();
			}
			if (@rename($path_copy,$filename)) {
				$success++;
				//跨空间操作  用户——组——其他组 任意两者见处理；移动到此处；之前的空间使用量减少，目前的增加
				if($before_path_id != $GLOBALS['path_id']){
					space_size_use_change($filename);
					space_size_use_change($filename,false,$before_path_type,$before_path_id);
				}
			}else{
				$error++;
			}
		}
		$state = $error==0?true:false;
		$info = $success.' success,'.$error.' error';
		show_json($info,$state);
	}

	public function pathCopyDrag(){
		$clipboard = json_decode($this->in['list'],true);
		$path_past=$this->path;
		$before_path_type = $GLOBALS['path_type'];
		$before_path_id = $GLOBALS['path_id'];
		space_size_use_check();

		$data = array();
		if (!is_writable($this->path)) show_json($this->L['no_permission_write'],false);
		foreach ($clipboard as $val) {
			$path_copy = _DIR($val['path']);
			$filename = get_path_this($path_copy);
			if ($this->in['filename_auto']==1) {
				$path = get_filename_auto($path_past.$filename,'','folder_rename');
			}else{
				$path = get_filename_auto($path_past.$filename,'',$this->config['user']['file_repeat']);
			}
			space_size_use_change($filename);//空间使用增加
			copy_dir($path_copy,$path);
			$data[] = iconv_app(get_path_this($path));
		}
		show_json($data,true);
	}

	public function clipboard(){
		$clipboard = json_decode($_SESSION['path_copy'],true);
		$msg = '';
		if (count($clipboard) == 0){
			$msg = '<div style="padding:20px;">null!</div>';
		}else{
			$msg='<div style="height:200px;overflow:auto;padding:10px;width:400px"><b>'.$this->L['clipboard_state']
				.($_SESSION['path_copy_type']=='cute'?$this->L['cute']:$this->L['copy']).'</b><br/>';
			$len = 40;
			foreach ($clipboard as $val) {
				$val['path'] = rawurldecode($val['path']);
				$path=(strlen($val['path'])<$len)?$val['path']:'...'.substr($val['path'],-$len);
				$msg.= '<br/>'.$val['type'].' :  '.$path;
			}            
			$msg.="</div>";
		}
		show_json($msg);
	}
	public function pathPast(){
		if (!isset($_SESSION['path_copy'])){
			show_json($this->L['clipboard_null'],false,array());
		}

		$path_past=$this->path;//之前就自动处理权限判断；
		session_start();//re start
		$error = '';
		$data = array();
		$clipboard = json_decode($_SESSION['path_copy'],true);
		$copy_type = $_SESSION['path_copy_type'];		
		$before_path_type = $GLOBALS['path_type'];
		$before_path_id = $GLOBALS['path_id'];
		if (!is_writable($path_past)) show_json($this->L['no_permission_write'],false,$data);
		
		$GLOBALS['path_from_auth_check'] = true;//粘贴来源检测权限；和粘贴到目标位置冲突
		$list_num = count($clipboard);
		if ($list_num == 0) {
			show_json($this->L['clipboard_null'],false,$data);
		}
		for ($i=0; $i < $list_num; $i++) {
			$path_copy = _DIR($clipboard[$i]['path']);
			$filename  = get_path_this($path_copy);
			$filename_out  = iconv_app($filename);

			if (!file_exists($path_copy) && !is_dir($path_copy)){
				$error .=$path_copy."<li>{$filename_out}'.$this->L['copy_not_exists'].'</li>";
				continue;
			}
			if ($clipboard[$i]['type'] == 'folder'){
				if ($path_copy == substr($path_past,0,strlen($path_copy))){
					$error .="<em style='color:#fff;'>{$filename_out}".$this->L['current_has_parent']."</em>";
					continue;
				}
			}
			$auto_path = get_filename_auto($path_past.$filename,'',$this->config['user']['file_repeat']);
			$filename = get_path_this($auto_path);
			if ($copy_type == 'copy') {
				space_size_use_check();
				copy_dir($path_copy,$auto_path);
				space_size_use_change($filename);
			}else{
				if($before_path_id != $GLOBALS['path_id']){
					space_size_use_check();
				}
				rename($path_copy,$auto_path);
				//跨空间操作  用户——组——其他组 任意两者见处理；移动到此处；之前的空间使用量减少，目前的增加
				if($before_path_id != $GLOBALS['path_id']){
					space_size_use_change($filename);
					space_size_use_change($filename,false,$before_path_type,$before_path_id);
				}
			}
			$data[] = iconv_app($filename);
		}
		if ($copy_type == 'copy') {
			$msg=$this->L['past_success'].$error;
		}else{
			$_SESSION['path_copy'] = json_encode(array());
			$_SESSION['path_copy_type'] = '';
			$msg=$this->L['cute_past_success'].$error;
		}
		$state = ($error ==''?true:false);
		show_json($msg,$state,$data);
	}
	public function fileDownload(){
		file_put_out($this->path,true);
	}
	//文件下载后删除,用于文件夹下载
	public function fileDownloadRemove(){
		$path = rawurldecode(_DIR_CLEAR($this->in['path']));
		$path = USER_TEMP.iconv_system($path);
		space_size_use_change($path,false);//使用空间回收
		file_put_out($path,true);
		del_file($path);
	}
	public function zipDownload(){
		if(!file_exists(USER_TEMP)){
			mkdir(USER_TEMP);
		}else{//清除未删除的临时文件，一天前
			$list = path_list(USER_TEMP,true,false);
			$max_time = 3600*24;//自动清空一天前的缓存
			if ($list['filelist']>=1) {
				for ($i=0; $i < count($list['filelist']); $i++) { 
					$create_time = $list['filelist'][$i]['mtime'];//最后修改时间
					if(time() - $create_time >$max_time){
						del_file($list['filelist'][$i]['path'].$list['filelist'][$i]['name']);
					}
				}
			}
		}
		$zip_file = $this->zip(USER_TEMP);
		show_json($this->L['zip_success'],true,get_path_this($zip_file));
	}
	public function zip($zip_path=''){
		load_class('pclzip');
		ini_set('memory_limit', '2028M');//2G;
		$zip_list = json_decode($this->in['list'],true);
		$list_num = count($zip_list);
		for ($i=0; $i < $list_num; $i++) { 
			$zip_list[$i]['path'] = rtrim(_DIR($zip_list[$i]['path']),'/');
		}
		//指定目录
		$basic_path = $zip_path;
		if ($zip_path==''){
			$basic_path =get_path_father($zip_list[0]['path']);    
		}
		if (!is_writeable($basic_path)) {
			show_json($this->L['no_permission_write'],false);
		}

		if ($list_num == 1){
			$path_this_name=get_path_this($zip_list[0]['path']);
		}else{
			$path_this_name=get_path_this(get_path_father($zip_list[0]['path']));
		}
		$zipname = $basic_path.$path_this_name.'.zip';
		$zipname = get_filename_auto($zipname,'',$this->config['user']['file_repeat']);
		space_size_use_check();
		$files = array();
		for ($i=0; $i < $list_num; $i++) {
			if(file_exists($zip_list[$i]['path'])){
				$files[] = $zip_list[$i]['path'];
			}
		}
		if(count($files)==0){
			show_json($this->L['not_exists'],false);
		}
		$remove_path_pre = _DIR_CLEAR(get_path_father($zip_list[0]['path']));
		$archive = new PclZip($zipname);
		$v_list = $archive->create(implode(',',$files),
			PCLZIP_OPT_REMOVE_PATH,$remove_path_pre,
			PCLZIP_CB_PRE_FILE_NAME,'zip_pre_name'
		);
		space_size_use_change($zipname);//使用的空间增加
		if ($v_list == 0) {
			show_json("Error:".$archive->errorInfo(false),false);
		}
		$info = $this->L['zip_success'].$this->L['size'].":".size_format(filesize($zipname));
		if ($zip_path=='') {
			show_json($info,true,iconv_app(get_path_this($zipname)));
		}else{
			return iconv_app($zipname);
		}
	}
	public function unzip(){
		ini_set('memory_limit', '2028M');//2G;
		$path=$this->path; 
		$name = get_path_this($path);
		$name = substr($name,0,strrpos($name,'.'));
		$ext  = get_path_ext($path);
		$unzip_to=get_path_father($path).$name;//解压在该文件夹内：
		if(isset($this->in['to_this'])){//直接解压
			$unzip_to=get_path_father($path);
		}

		//$unzip_to=get_path_father($path);//解压到当前
		if (isset($this->in['path_to'])) {//解压到指定位置
			$unzip_to = _DIR($this->in['path_to']);
		}
		//所在目录不可写
		if (!is_writeable(get_path_father($path))){
			show_json($this->L['no_permission_write'],false);
		}
		space_size_use_check();
		load_class('pclzip');
		$zip = new PclZip($path);
		$result = $zip->extract(PCLZIP_OPT_PATH,$unzip_to,
								PCLZIP_OPT_SET_CHMOD,0777,
								PCLZIP_CB_PRE_FILE_NAME,'unzip_pre_name',
								PCLZIP_CB_PRE_EXTRACT,"check_ext_unzip",
								PCLZIP_OPT_REPLACE_NEWER);//解压到某个地方,覆盖方式
		if ($result == 0) {
			show_json("Error : ".$zip->errorInfo(true),fasle);
		}else{
			space_size_use_change($path);//使用的空间增加 近似使用压缩文件大小；
			show_json($this->L['unzip_success']);
		}	
	}
	public function image(){
		if (filesize($this->path) <= 1024*20) {//小于20k 不再生成缩略图
			file_put_out($this->path);
			return;
		}
		load_class('imageThumb');
		$image= $this->path;
		$image_md5  = @md5_file($image);//文件md5
		if (strlen($image_md5)<5) {
			$image_md5 = md5($image);
		}
		$image_thum = DATA_THUMB.$image_md5.'.png';
		if (!is_dir(DATA_THUMB)){
			mk_dir(DATA_THUMB);
		}
		if (!file_exists($image_thum)){//如果拼装成的url不存在则没有生成过
			if ($_SESSION['this_path']==DATA_THUMB){//当前目录则不生成缩略图
				$image_thum=$this->path;
			}else {
				$cm=new CreatMiniature();
				$cm->SetVar($image,'file');
				//$cm->Prorate($image_thum,72,64);//生成等比例缩略图
				$cm->BackFill($image_thum,72,64,true);//等比例缩略图，空白处填填充透明色
			}
		}
		if (!file_exists($image_thum) || filesize($image_thum)<100){//缩略图生成失败则用默认图标
			$image_thum=STATIC_PATH.'images/image.png';
		}
		//输出
		file_put_out($image_thum);
	}

	// 远程下载
	public function serverDownload() {
		$uuid = 'download_'.$this->in['uuid'];
		if ($this->in['type'] == 'percent') {//获取下载进度
			//show_json($_SESSION[$uuid]);
			if (isset($_SESSION[$uuid])){
				$info = $_SESSION[$uuid];
				$result = array(
					'uuid'      => $this->in['uuid'],
					'length'    => (int)$info['length'],
					'size'      => (int)@filesize(iconv_system($info['path'])),
					'time'      => mtime()
				);
				show_json($result);
			}else{
				show_json('',false);
			}
		}else if($this->in['type'] == 'remove'){//取消下载;文件被删掉则自动停止
			del_file($_SESSION[$uuid]['path']);
			unset($_SESSION[$uuid]);
			show_json('',false);
		}
		//下载
		$save_path = _DIR($this->in['save_path']);
		if (!is_writeable($save_path)){
		   show_json($this->L['no_permission_write'],false); 
		}
		$url = rawurldecode($this->in['url']);
		$header = url_header($url);
		if (!$header){
			show_json($this->L['download_error_exists'],false);
		}
		$save_path = $save_path.rawurldecode($header['name']);
		if (!checkExt($save_path)){//不允许的扩展名
			$save_path = _DIR($this->in['save_path']).date('-h:i:s').'.txt';
		}

		space_size_use_check();
		$save_path = get_filename_auto(iconv_system($save_path),'',$this->config['user']['file_repeat']);
		$save_path_temp = $save_path.'.downloading';
		session_start();
		$_SESSION[$uuid] = array('length'=>$header['length'],'path'=>$save_path_temp);
		session_write_close();
		if (file_download_this($url,$save_path_temp)){
			if (@rename($save_path_temp,$save_path)) {//下载完后重命名
				$name = get_path_this(iconv_app($save_path));
				space_size_use_change($save_path);//使用的空间增加
				show_json($this->L['download_success'],true,$name);
			}else{
				show_json($this->L['download_error_create'],false);
			}
		}else{
			show_json($this->L['download_error_create'],false);
		}
	}

	//生成临时文件key
	public function officeView(){
		if (!file_exists($this->path)) {
			show_tips($this->L['not_exists']);
		}
		$file_ext = get_path_ext($this->path);
		$file_url = _make_file_proxy($this->path);
		if($file_ext=='pdf'){
			header('location:./lib/plugins/pdfjs/web/viewer.html?file='.rawurlencode($file_url));
			return;
		}

		//插件支持：flash转换 or 在线编辑
		if (file_exists(PLUGIN_DIR.'officeView')) {
			if(isset($_GET['is_edit']) || !isset($this->config['settings']['office_server_doc2pdf'])){
				include(PLUGIN_DIR.'officeView/index.php');
			}else{
				include(PLUGIN_DIR.'officeView/flexpapper.php');
			}
			exit;
		}

		//office live 浏览
		$host = $_SERVER['HTTP_HOST'];   
		if (OFFICE_DEFAULT != OFFICE_SERVER) {//本地搭建了
			$office_url = OFFICE_SERVER.rawurlencode($file_url);
			header("location:".$office_url);
		}else{
			//微软接口调用的预览
			if (strstr($host,'10.10.') ||
				strstr($host,'192.168.')||
				strstr($host,'127.0.') ||
				!strstr($host,'.')) {
				$local_tips = $this->L['unknow_file_office'];
				show_tips($local_tips);
			}else{
				$office_url = OFFICE_SERVER.rawurlencode($file_url);
				header("location:".$office_url);
			}
		}
	}
	public function officeSave(){
		if ($_FILES["file"]["error"] > 0){
			exit("Return Code: ".$_FILES["file"]["error"]);
		}else{
			// $str=file_get_contents($_FILES["file"]["tmp_name"]);
			// file_put_contents($this->path.'.doc',$str);
			move_uploaded_file($_FILES["file"]["tmp_name"],$this->path);
			echo 'succeed';
		}
	}

	//代理输出
	public function fileProxy(){
		file_put_out($this->path);
	}   
	/**
	 * 上传,html5拖拽  flash 多文件
	 */
	public function fileUpload(){
		$save_path = _DIR($this->in['upload_to']);
		if (!is_writeable($save_path)) show_json($this->L['no_permission_write'],false);
		if ($save_path == '') show_json($this->L['upload_error_big'],false);
		if (strlen($this->in['fullPath']) > 1) {//folder drag upload
			$full_path = _DIR_CLEAR(rawurldecode($this->in['fullPath']));
			$full_path = get_path_father($full_path);
			$full_path = iconv_system($full_path);
			if (mk_dir($save_path.$full_path)) {
				$save_path = $save_path.$full_path;
			}
		}
		$repeat_action = $this->config['user']['file_repeat'];
		//分片上传
		$temp_dir = USER_TEMP;
		mk_dir($temp_dir);
		if (!is_writeable($temp_dir)) show_json($this->L['no_permission_write'],false);
		upload_chunk('file',$save_path,$temp_dir,$repeat_action);
	}

	//分享根目录
	private function path_share(&$list){
		$arr = explode(',',$GLOBALS['path_id']);
		$share_list = system_member::user_share_list($arr[0]);
		$before_share_id = $GLOBALS['path_id_user_share'];
		foreach ($share_list as $key => $value) {
			$the_path = _DIR(KOD_USER_SHARE.':'.$arr[0].'/'.$value['name']);
			$value['path'] = $value['name'];
			$value['atime']='';$value['ctime']='';
			$value['mode']='';$value['is_readable'] = 1;$value['is_writable'] = 1;
			$value['exists'] = intval(file_exists($the_path));
			$value['meta_info'] = 'path_self_share';

			//分享列表oexe
			if(get_path_ext($value['name']) == 'oexe'){
				$json = json_decode(@file_get_contents($the_path),true);
				if(is_array($json)) $value = array_merge($value,$json);
			}
			if ($value['type']=='folder') {
				$list['folderlist'][] = $value;
			}else{
				$list['filelist'][] = $value;
			}
		}
		$list['path_read_write'] = 'readable';
		$GLOBALS['path_id_user_share'] = $before_share_id;
		if($arr[0] == $this->user['user_id']){//自己分享列表
			$list['share_list'] = $share_list;
		}
		return $list;
	}

	//获取文件列表&哦exe文件json解析
	private function path($dir,$list_file=true,$check_children=false){
		$ex_name = explode(',',$this->config['setting_system']['path_hidden']);
		$list = array('folderlist'=> array(),'filelist'=> array(),'info'=>array(),'path_read_write'=>'not_exists');
		//真实目录读写权限判断
		if (!file_exists($dir)) {
			$list['path_read_write'] = "not_exists";
		}else if (is_writable($dir)) {
			$list['path_read_write'] = 'writeable';
		}else if (is_readable($dir)) {
			$list['path_read_write'] = 'readable';
		}else{
			$list['path_read_write'] = 'not_readable';
		}

		//处理
		if ($dir===false){
			return $list;
		}else if ($GLOBALS['path_type'] == KOD_USER_SHARE && 
			!strstr(trim($this->in['path'],'/'),'/')) {//分享根目录 {user_share}:1/ {user_share}:1/test/
			$list = $this->path_share($list);
		}else{
			$list_file = path_list($dir,$list_file,$check_children);
			$list['folderlist'] = $list_file['folderlist'];
			$list['filelist'] = $list_file['filelist'];
		}
		$filelist_new = array();
		$folderlist_new = array();
		foreach ($list['filelist'] as $key => $val) {
			if (in_array($val['name'],$ex_name)) continue;
			$val['ext'] = get_path_ext($val['name']);
			if ($val['ext'] == 'oexe' && !isset($val['content'])){
				$path = iconv_system($val['path']);
				$json = json_decode(@file_get_contents($path),true);
				if(is_array($json)) $val = array_merge($val,$json);
			}
			$filelist_new[] = $val;
		}
		foreach ($list['folderlist'] as $key => $val) {
			if (in_array($val['name'],$ex_name)) continue;
			$folderlist_new[] = $val;
		}
		$list['filelist'] = $filelist_new;
		$list['folderlist'] = $folderlist_new;
		$list = _DIR_OUT($list);
		$this->_role_check_info($list);
		return $list;
	}
	private function _role_check_info(&$list){
		if(!$GLOBALS['path_type']){
			$list['info'] = array("path_type"=>'',"role"=>'',"id"=>'','name'=>'');
			return;
		}
		$list['info']= array(
			"path_type" => $GLOBALS['path_type'],
			"role"      => $GLOBALS['is_root']?'owner':'guest',
			"id"        => $GLOBALS['path_id'],
			'name'      => '',
		);

		if ($GLOBALS['path_type'] == KOD_USER_SHARE) {
			$GLOBALS['path_id'] = explode(':',$GLOBALS['path_id']);
			$GLOBALS['path_id'] = $GLOBALS['path_id'][0];//id 为前面
			$list['info']['id'] = $GLOBALS['path_id'];
			$user = system_member::get_info($GLOBALS['path_id']);
			$list['info']['name'] = $user['name'];
			if($GLOBALS['is_root']){
				$list['info']['admin_real_path'] = USER_PATH.$user['path'].'/home/';
			}
		}
		//自己管理的目录
		if ($GLOBALS['path_type']==KOD_GROUP_PATH || 
			$GLOBALS['path_type']==KOD_GROUP_SHARE) {
			$group = system_group::get_info($GLOBALS['path_id']);
			$list['info']['name'] = $group['name'];
			$auth = system_member::user_auth_group($GLOBALS['path_id']);
			if ($auth=='write' || $GLOBALS['is_root']) {
				$list['info']['role'] = 'owner';
				$list['group_space_use'] = $group['config'];//自己
			}
			if($GLOBALS['is_root']){
				$list['info']['admin_real_path'] = GROUP_PATH.$group['path'].'/home/';
			}
		}
	}
}

