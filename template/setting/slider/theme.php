<div class="section">
	<div class='box' data-type="theme">
	<?php 
		$tpl="<div class='{this} list' data-value='{0}'><div class='theme ico'><img src='".
		STATIC_PATH."images/thumb/theme/{0}.jpg'/></div><div class='info'>{1}</div></div>";
		echo getTplList(',',':',$config['setting_all']['themeall'],$tpl,$config['user']['theme']);
	?>
	<div style="clear:both;"></div>
	</div>
</div>
