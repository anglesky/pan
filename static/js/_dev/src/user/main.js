define(function(require, exports, module) {
    require('lib/jquery-lib');
    require('lib/util');
    require('lib/artDialog/jquery-artDialog');
    core= require('../../common/core');
    
    $(document).ready(function() {
        core.init();     
		var login = function(){
        	var name = $('#username').val();
        	var pass = $('#password').val();
            var rember_password = $('input[name=rember_password]').attr('checked')?1:0;
        	var url ='./index.php?user/loginSubmit&name='+urlEncode(name)+
                '&check_code='+$('input.check_code').val()+'&password='+urlEncode(pass)+'&rember_password='+rember_password;
        	window.location.href = url;
		}
		$("#username").focus();
        $('#submit').bind('click',login);
        $('#username,#password,input.check_code').keyEnter(login);
	});
});
