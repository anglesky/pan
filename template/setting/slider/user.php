<?php
	function check_file_repeat($value){
		if ($value == $GLOBALS['config']['user']['file_repeat']) {
			echo 'checked="checked"';
		}
	}
?>

<div class="nav">
    <a href="javascript:;"  class="this" data-page="setting_basic"><?php echo $L['setting_basic'];?></a>
    <a href="javascript:;" class="" data-page="setting_menu"><?php echo $L['setting_password'];?></a>
    <div style="clear:both;"></div>
</div>

<div class="section setting_basic system_setting">
	<!--
	<div class="box_line">
	<span class='infotitle'><?php echo $L['system_name'];?>:</span><input type="text" name="system_name" 
	value="<?php echo $config['setting_system']['system_name'];?>" />
	<i><?php echo $L['system_name_desc'];?></i>
	</div> 
	-->

	<div class="box_line recycle_open_check">
	<span class='infotitle'><?php echo $L['recycle_open_if'];?>:</span>
		<label>
		<input type="checkbox" name="recycle_open" 
	      <?php if($config['user']['recycle_open']=="1") echo 'checked="checked"';?> />
	    <i><?php echo $L['recycle_open'];?></i>
	    </label>		
	</div>

	<div class="box_line file_repeat_check">
		<span class='infotitle'><?php echo $L['upload_exist'];?>:</span>
		<label><input type="radio" name="file_repeat" value="rename" <?php check_file_repeat('rename');?> /><?php echo $L['upload_exist_rename'];?></label>
		<label><input type="radio" name="file_repeat" value="replace" <?php check_file_repeat('replace');?> /><?php echo $L['upload_exist_replace'];?></label>
		<label><input type="radio" name="file_repeat" value="skip" <?php check_file_repeat('skip');?> /><?php echo $L['upload_exist_skip'];?></label>
		<div style="clear:both"></div>
	</div>
	<!--   
	<div class="box_line">
	<a href="javascript:void(0);" class="setting_basic_save button"><?php echo $L['button_save'];?></a>
	</div> 
	-->
	<div style="clear:both;"></div>
</div>

<div class="section setting_menu hidden">
	<div class='box'>
		<span ><?php echo $L['setting_password_old'];?></span>
		<input type="text" id="password_now"value="" />
		<div class='line'></div>
		<span ><?php echo $L['setting_password_new'];?></span>
		<input type="password" id="password_new" value=""/><div class='upasswordinfo'></div>
		<a onclick="Setting.tools();" href="javascript:void(0);" class="save button"><?php echo $L['button_save'];?></a>
	</div>
</div>
