<?php
/*
* @link http://www.kalcaddle.com/
* @author warlee | e-mail:kalcaddle@qq.com
* @copyright warlee 2014.(Shanghai)Co.,Ltd
* @license http://kalcaddle.com/tools/licenses/license.txt
*/

class user extends Controller{
	private $user;  //用户相关信息
	private $auth;  //用户所属组权限
	private $notCheck;
	function __construct(){
		parent::__construct();
		$this->tpl  = TEMPLATE  . 'user/';
		if(!isset($_SESSION)){//避免session不可写导致循环跳转
			$this->login("session write error!");
		}else{
			$this->user = &$_SESSION['kod_user'];
			if(!isset($this->user['path']) && isset($this->user['name'])){//旧版本数据
				$this->user['path'] = $this->user['name'];
			}
		}
		//不需要判断的action
		$this->notCheck = array('loginFirst','login','logout','loginSubmit',
			'checkCode','public_link','qrcode'
		);
	}
	
	/**
	 * 登录状态检测;并初始化数据状态
	 */
	public function loginCheck(){
		if (ST == 'share') return true;//共享页面
		if(in_array(ACT,$this->notCheck)){//不需要判断的action
			return;
		}
		if(isset($_SESSION['kod_login']) && $_SESSION['kod_login']===true){
			$user = $this->user = system_member::get_info($this->user['user_id']);
			if(!$user['path']){//服务器管理后立即生效
				$this->login($this->L['kod_version_error']);
			}else if($user['status'] == 0){				
				$this->login($this->L['login_error_user_not_use']);
			}else if($user['role']==''){
				$this->login($this->L['login_error_role']);
			}

			define('USER',USER_PATH.$this->user['path'].'/');
			define('USER_TEMP',USER.'data/temp/');
			define('USER_RECYCLE',USER.'recycle/');
			if (!file_exists(USER)) {
				$this->logout();
			}
			if ($this->user['role'] == '1') {
				define('MYHOME',USER.'home/');
				define('HOME','');
				$GLOBALS['web_root'] = WEB_ROOT;//服务器目录
				$GLOBALS['is_root'] = 1;
			}else{
				define('MYHOME','/');
				define('HOME',USER.'home/');
				$GLOBALS['web_root'] = str_replace(WEB_ROOT,'',HOME);//从服务器开始到用户目录
				$GLOBALS['is_root'] = 0;
			}

			$this->config['user']  = fileCache::load(USER.'data/config.php');
			if(!isset($this->config['user']['file_repeat'])){
				$this->config['user']['file_repeat'] = $this->config['setting_default']['file_repeat'];
				$this->config['user']['recycle_open'] = $this->config['setting_default']['recycle_open'];
				$this->config['user']['resize_config'] = '{"filename":250,"filetype":80,"filesize":80,"filetime":215,"left_tree_width":200}';
			}
			if($this->config['user']['theme']==''){
				$this->config['user'] = $this->config['setting_default'];
			}
			return;
		}else if($_COOKIE['kod_user_id']!='' && $_COOKIE['kod_token']!=''){
			$user = system_member::get_info($_COOKIE['kod_user_id']);
			if (!is_array($user) || !isset($user['password'])) {
				$this->logout();
			}
			if(md5($user['password'].get_client_ip()) == $_COOKIE['kod_token']){
				session_start();//re start
				$_SESSION['kod_login'] = true;
				$_SESSION['kod_user']= $user;
				setcookie('kod_user_id', $_COOKIE['kod_user_id'], time()+3600*24*365); 
				setcookie('kod_token',$_COOKIE['kod_token'],time()+3600*24*365); //密码的MD5值再次md5
				header('location:'.get_url());
				exit;
			}
			$this->logout();//session user数据不存在
		}else{
			if ($this->config['setting_system']['auto_login'] != '1') {
				$this->logout();//不自动登录
			}else{
				if (!file_exists(USER_SYSTEM.'install.lock')) {
					$this->display('install.html');exit;
				}
				header('location:./index.php?user/loginSubmit&name=guest&password=guest');
			}
		}
	}

	//临时文件访问
	public function public_link(){
		load_class('mcrypt');
		$pass = $this->config['setting_system']['system_password'];
		$path = Mcrypt::decode($this->in['fid'],$pass);
		if (strlen($path) == 0) {
			show_json($this->L['error'],false);
		}
		$is_download = false;
		if(isset($_GET['download'])){
			$is_download = true;
		}
		file_put_out($path,$is_download);
	}

	public function common_js(){
		$basic_path = BASIC_PATH;
		if (!$GLOBALS['is_root']) {
			$basic_path = '/';//对非root用户隐藏所有地址
		}
		$office_have = false;
		if (file_exists(PLUGIN_DIR.'officeView')) {
			$office_have = true;
		}
		$the_config = array(
			'lang'          => LANGUAGE_TYPE,
			'is_root'       => $GLOBALS['is_root'],
			'user_id'       => $this->user['user_id'],
			'web_root'      => $GLOBALS['web_root'],
			'web_host'      => HOST,
			'static_path'   => STATIC_PATH,
			'basic_path'    => $basic_path,
			'app_host'      => APPHOST,
			'myhome'        => MYHOME,
			'upload_max'	=> get_post_max(),	
			'version'       => KOD_VERSION,
			'version_desc'  => $this->config['settings']['version_desc'],
			'office_have'   => $office_have,
			'json_data'     => "",
			'self_share'	=> system_member::user_share_list($this->user['user_id']),

			'KOD_GROUP_PATH'	=>	KOD_GROUP_PATH,
			'KOD_GROUP_SHARE'	=>	KOD_GROUP_SHARE,
			'KOD_USER_SHARE'	=>	KOD_USER_SHARE,
			'KOD_USER_RECYCLE'	=>	KOD_USER_RECYCLE,
		);
		$the_config = array_merge($the_config,$this->config['user']);
		if (!isset($GLOBALS['auth'])) {
			$GLOBALS['auth'] = array();
		}
		$js  = 'LNG='.json_encode($GLOBALS['L']).';';
		$js .= 'AUTH='.json_encode($GLOBALS['auth']).';';
		$js .= 'G='.json_encode($the_config).';';
		header("Content-Type:application/javascript");
		echo $js;
	}

	/**
	 * 登录view
	 */
	public function login($msg = ''){
		if (!file_exists(USER_SYSTEM.'install.lock')) {
			chmod_path(BASIC_PATH,0777);
			$this->display('install.html');exit;
		}
		$this->assign('msg',$msg);
		if (is_wap()) {
			$this->display('login_wap.html');
		}else{
			$this->display('login.html');
		} 
		exit;
	}

	/**
	 * 首次登录
	 */
	public function loginFirst(){
		touch(USER_SYSTEM.'install.lock');
		header('location:./index.php?user/login');
		exit;
	}
	/**
	 * 退出处理
	 */
	public function logout(){
		session_start();
		user_logout();
	}
	
	/**
	 * 登录数据提交处理
	 */
	public function loginSubmit(){
		if(!isset($this->in['name']) || !isset($this->in['password'])) {
			$this->login($this->L['login_not_null']);
		}
		//错误三次输入验证码            
		session_start();//re start 有新的修改后调用
		if(isset($_SESSION['code_error_time'])  && 
		   intval($_SESSION['code_error_time']) >=3 && 
		   $_SESSION['check_code'] !== strtolower($this->in['check_code'])){
			$this->login($this->L['code_error']);
		}
		
		$name = rawurldecode($this->in['name']);
		$password = rawurldecode($this->in['password']);
		$member = system_member::load_data();
		$user = $member->get('name',$name);

		$api_login_token = $this->config['settings']['api_login_tonken'];
		if(!isset($_SESSION['code_error_time'])){
			$_SESSION['code_error_time'] = 0;
		}
		if ($user === false){
			$_SESSION['code_error_time'] = intval($_SESSION['code_error_time']) + 1;
			$this->login($this->L['password_error']);
		}else if(isset($this->in['api_login_token']) && $api_login_token!=''
			 && md5(md5($name.$api_login_token)) != $this->in['api_login_token']){
			$_SESSION['code_error_time'] = intval($_SESSION['code_error_time']) + 1;
			$this->login($this->L['password_error']);
		}else if (md5($password)!=$user['password']){//密码错误或者
			$_SESSION['code_error_time'] = intval($_SESSION['code_error_time']) + 1;
			$this->login($this->L['password_error']);
		}else if($user['status'] == 0){				
			$this->login($this->L['login_error_user_not_use']);
		}else if($user['role']==''){
			$this->login($this->L['login_error_role']);
		}

		//登陆成功
		if($user['last_login'] == ''){//初始化app 没有最后登录时间
			$app = init_controller('app');
			$app->init_app($user);
		}
		
		$user['last_login'] = time();//记录最后登录时间
		$member->set($user['user_id'],$user);
		$_SESSION['kod_login'] = true;
		$_SESSION['kod_user']= $user;
		setcookie('kod_user_id', $user['user_id'], time()+3600*24*365);
		if ($this->in['rember_password'] == '1') {
			setcookie('kod_token',md5($user['password'].get_client_ip()),time()+3600*24*365);
		}
		header('location:./index.php');
	}

	/**
	 * 修改密码
	 */
	public function changePassword(){
		$password_now=rawurldecode($this->in['password_now']);
		$password_new=rawurldecode($this->in['password_new']);
		if (!$password_now && !$password_new)show_json($this->L['password_not_null'],false);
		if ($this->user['password']==md5($password_now)){
			$sql=system_member::load_data();
			$this->user['password'] = md5($password_new);
			$sql->set($this->user['user_id'],$this->user);
			setcookie('kod_token',md5(md5($password_new)),time()+3600*24*365);
			show_json('success');
		}else {
			show_json($this->L['old_password_error'],false);
		}
	}

	/**
	 * 权限验证；统一入口检验
	 */
	public function authCheck(){
		if (isset($GLOBALS['is_root']) && $GLOBALS['is_root'] == 1) return;
		if (in_array(ACT,$this->notCheck)) return;
		if (!array_key_exists(ST,$this->config['role_setting']) ) return;
		if (!in_array(ACT,$this->config['role_setting'][ST]) &&
			ST.':'.ACT != 'user:common_js') return;//输出处理过的权限

		//有权限限制的函数
		$key = ST.':'.ACT;
		$auth= system_role::get_info($this->user['role']);
		
		//向下版本兼容处理
		//未定义；新版本首次使用默认开放的功能
		if(!isset($auth['userShare:set'])){
			$auth['userShare:set'] = 1;
		}
		if(!isset($auth['explorer:fileDownload'])){
			$auth['explorer:fileDownload'] = 1;
		}
		//默认扩展功能 等价权限
		$auth['user:common_js'] = 1;//权限数据配置后输出到前端
		$auth['explorer:pathDeleteRecycle'] = $auth['explorer:pathDelete'];
		$auth['explorer:pathCopyDrag']      = $auth['explorer:pathCuteDrag'];
		
		$auth['explorer:officeSave']        = $auth['editor:fileSave'];
		$auth['explorer:fileDownloadRemove']= $auth['explorer:fileDownload'];
		$auth['explorer:zipDownload']       = $auth['explorer:fileDownload'];

		//彻底禁止下载；文件获取
		//$auth['explorer:fileProxy']         = $auth['explorer:fileDownload'];
		//$auth['editor:fileGet']             = $auth['explorer:fileDownload'];
		//$auth['explorer:officeView']        = $auth['explorer:fileDownload'];			
		$auth['explorer:fileProxy']         = true;
		$auth['editor:fileGet']             = true;
		$auth['explorer:officeView']        = true;
		if(!$auth['explorer:fileDownload']){
			$auth['explorer:zip'] = false;
		}

		$auth['userShare:del']              = $auth['userShare:set'];
		if ($auth[$key] != 1) show_json($this->L['no_permission'],false);

		$GLOBALS['auth'] = $auth;//全局
		//扩展名限制：新建文件&上传文件&重命名文件&保存文件&zip解压文件
		$check_arr = array(
			'mkfile'    =>  $this->check_key('path'),
			'pathRname' =>  $this->check_key('rname_to'),
			'fileUpload'=>  isset($_FILES['file']['name'])?$_FILES['file']['name']:'',
			'fileSave'  =>  $this->check_key('path')
		);
		if (array_key_exists(ACT,$check_arr) && !checkExt($check_arr[ACT])){
			show_json($this->L['no_permission_ext'],false);
		}
	}
	private function check_key($key){
		if(!isset($this->in[$key])){
			return '';
		}
		return is_string($this->in[$key])? rawurldecode($this->in[$key]):'';
	}

	public function checkCode() {
		session_start();//re start
		$code = rand_string(4);
		$_SESSION['check_code'] = strtolower($code);
		check_code($code);
	}

	public function qrcode(){
		include CLASS_DIR.'phpqrcode.php';
		QRcode::png(rawurldecode($this->in['url']));
	}
}

