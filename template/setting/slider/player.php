<div class="section">
	<div class='box' data-type="musictheme">
	<?php 
		$tpl="<div class='{this} list' data-value='{0}'><div class='theme ico'><img src='./static/images/thumb/music/{0}.jpg'/></div><div class='info'>{0}</div></div>";
		echo getTplList(',',':',$config['setting_all']['musicthemeall'],$tpl,$config['user']['musictheme']);
	?>
	<div style="clear:both;"></div>
	</div>
</div>
<div class='h1'><?php echo $L['setting_player_movie'];?></div>
<div class="section">
	<div class='box' data-type="movietheme">
		<?php 
			$tpl="<div class='{this} list' data-value='{0}'><div class='theme ico'><img src='./static/images/thumb/movie/{0}.jpg'/></div><div class='info'>{0}</div></div>";
			echo getTplList(',',':',$config['setting_all']['moviethemeall'],$tpl,$config['user']['movietheme']);
		?>
		<div style="clear:both;"></div>
	</div>	
</div>