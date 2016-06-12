/*changed by warlee 
* @link http://www.kalcaddle.com/
* @author warlee | e-mail:kalcaddle@qq.com
* @copyright warlee 2014.(Shanghai)Co.,Ltd
* @license http://kalcaddle.com/tools/licenses/license.txt
*/

/*
* iframe之间函数调用
*
* main frame中每个frame需要name和id，以便兼容多浏览器
* 如果需要提供给其他frame调用，则需要在body中加入
* <input id="FrameCall" type='hidden' action='' value='' onclick='FrameCall.api()'/>
* 调用例子：Frame.doFunction('main','goUrl','"'+url+'"');该frame调用id为main的兄弟frame的goUrl方法，参数为后面的
* 参数为字符串时需要加引号，否则传过去会被理解成一个未定义变量
*/
var FrameCall = (function(){
	var idName 		= "FrameCall";
	var idNameAll	= "#"+idName;
	var ie = !-[1,];//是否ie
	return{
		apiOpen:function(){
			var html = '<input id="FrameCall" type="hidden" action="1" value="1" onclick="FrameCall.api()" />';
			$(html).prependTo('body');
		},
		//其他窗口调用该窗口函数，调用另一个frame的方法
		api:function(){
			var action = $(idNameAll).attr('action');
			var value=$(idNameAll).attr('value');
			
			if (action == 'get') {//获取变量
				share.data('create_app_path',eval(value));
				return;
			}			
			var fun=action+'('+value+');';//拼装执行语句，字符串转换到代码
			try{
				eval(fun);
			} catch(e) {};
		},
		//该窗口调用顶层窗口的子窗口api,调用iframe框架的js函数.封装控制器。
		top:function(iframe,action,value){
			if (!window.parent.frames[iframe]) return;
			//var obj = window.top.frames[iframe].document;
			var obj = window.parent.frames[iframe].document;
            if(!obj) return;
			obj=obj.getElementById(idName);		
			$(obj).attr("action",action);
			$(obj).attr("value",value);
			obj.click();
		},
		//该窗口调用父窗口的api
		child:function(iframe,action,value){
			if (!window.frames[iframe]) return;
			var obj = window.frames[iframe].document;
            if(!obj) return;
			obj=obj.getElementById(idName);
			$(obj).attr("action",action);
			$(obj).attr("value",value);
			obj.click();
		},
		//该窗口调用父窗口的api
		father:function(action,value){
			var obj=window.parent.document;
			obj=obj.getElementById(idName);	
			$(obj).attr("action",action);
			$(obj).attr("value",value);
			obj.click();	
		},
		//___自定义通用方法，可在页面定义更多提供给接口使用的api。
		goUrl:function(url){
			window.location.href=url;
		},
		goRefresh:function(){
			window.location.reload(); 
		}
	}
})();

$(document).ready(function() {
	FrameCall.apiOpen();
});

//return 时间戳到秒
var time = function(){
    var time = (new Date()).valueOf();
    return parseInt(time/1000);
}
//return 时间戳，含小数点；小数点部分为毫秒；date('Y/m/d H:i:s',time()) or date('Y/m/d H:i:s')
var time_float = function(){
    var time = (new Date()).valueOf();
    return time/1000;
}
var urlEncode = encodeURIComponent;
var urlDecode = decodeURIComponent;
var urlEncode2 = function (str){
	return urlEncode(urlEncode(str));
};
var UUID = function(){
	return 'uuid_'+time()+'_'+Math.ceil(Math.random()*10000)
}
var round = function(val,point){//随机数
    if (!point) point = 2;
    point = Math.pow(10,parseInt(point));
    return  Math.round(parseFloat(val)*point)/point;
}
var replaceAll = function(str, find, replace_to){
    while (str.indexOf(find) >= 0){
       str = str.replace(find, replace_to);
    }
    return str;
}
var ltrim = function (str,remove){
    var i;remove==undefined?' ':remove;
    for(i=0;i<str.length;i++) {
        if(str.charAt(i)!=remove) break;
    }
    return str.substring(i,str.length);
}
var rtrim = function (str,remove){
	var i;remove==undefined?' ':remove;
    for(i=str.length-1;i>=0;i--) {
        if(str.charAt(i)!=remove) break;
    }
    return str.substring(0,i+1);
}
var trim = function (str,remove){
    return ltrim(rtrim(str,remove),remove);
}


//var obj1 = $.extend({}, obj);//浅拷贝
//var obj2 = $.extend(true, {}, obj);//深拷贝



//跨框架数据共享;排除
var KOD_NAMESPACE = 'kod';
var share = {
	system_top:function(){
		var top = window;
		var testParent = function (page) {
			try {
				if(page.parent && page.parent.KOD_NAMESPACE){
					return page.parent;
				}else{
					return false;
				}
			} catch (e) {
				return false;
			}				
		};
		while(testParent(top)!==false && top!=testParent(top)){
			top = testParent(top);
		}				
		return top;
	},
	data: function (name, value) {
		var top = share.system_top();
		var cache = top['_CACHE'] || {};
		top['_CACHE'] = cache;
		if(name==undefined){
			return cache;
		}
		return value !== undefined ? cache[name] = value : cache[name];
	},
	remove: function (name) {
		var top = share.system_top();
		var cache = top['_CACHE'];
		if (cache && cache[name]) delete cache[name];
	}
};
jQuery.easing.def="easeInOutCubic";//easeOutExpo,easeInOutExpo,easeInOutSine
//cookie操作
var Cookie = (function(){
	var cookie = {};
	var _init = function(){
		cookie = {};//初始化cookie
        var cookieArray=document.cookie.split("; ");
        for (var i=0;i<cookieArray.length;i++){
            var arr=cookieArray[i].split("=");
            cookie[arr[0]] = unescape(arr[1]);
        }
        return cookie;
	}
	var get = function(key){//没有key代表获取所有
		_init();
		if (key == undefined) return cookie;
		return cookie[key];		
	};
	var set = function(key,value,timeout){
		var str = escape(key)+"="+escape(value);//不设置时间代表跟随页面生命周期
		if (timeout == undefined){//时间以小时计
			timeout = 365;
		}
		var expDate=new Date(); 
		expDate.setTime(expDate.getTime() + timeout*3600*24*1000);
        str += "; expires="+expDate.toGMTString();
        document.cookie = str;
	};
	var del = function(key){
		document.cookie = key+"=;expires="+(new Date(0)).toGMTString();
	};	
	var clear = function(){
		_init();
		for(var key in cookie){
			del(key);
		}
	}
	return {
		get:get,
		set:set,
		del:del,
		clear:clear
	}
})();

//是否在数组中。
var inArray = function(arr,value) {
    for (var i=0,l = arr.length ; i <l ; i++) {
        if (arr[i] === value) {
            return true;
        }
    }
    return false;
}
var stopPP = function(e){//防止事件冒泡
	e = e || window.event;
    if(!e) return;
	if (e.stopPropagation) {
		e.stopPropagation();
	}
	if (e.preventDefault) {
		e.preventDefault();
	}
	e.cancelBubble = true;
	e.keyCode = 0;  
    e.returnValue = false;  
}
//通用提示信息框
var tips = function(msg,code){
	Tips.tips(msg,code);
}
var Tips =  (function(){
	var in_time  = 600;
	var delay = 800;
	var opacity  = 0.9;
	var _init = function(msg,code){
		var tipsIDname = "messageTips";
		var tipsID = "#"+tipsIDname;
		if ($(tipsID).length ==0) {
			var html='<div id="'+tipsIDname+'" class="tips_box animate zoomIn"><i></i><span></span>'+
                '<a class="tips_close">×</a></div>'
			$('body').append(html);

            $(tipsID).show().css({'left':($(window).width() - $(tipsID).innerWidth())/2});
			$(window).bind('resize',function(){
				if ($(tipsID).css('display') =="none") return;
				self.stop(true,true)
				$(tipsID).css({'left':($(window).width() - $(tipsID).width()) / 2});
			});
            $(tipsID).find('.tips_close').click(function(){
                $(tipsID).animate({opacity:0},
                    in_time,0,function(){
                        $(this).hide();
                    });
            });
		}
		var self = $(tipsID),icon,color;
		switch(code){
			case 100:delay = 1000;//加长时间 5s
			case true:
			case undefined:
			case 'succcess':color = '#5cb85c';icon = 'icon-ok';break;
			case 'info':color = '#519AF6';icon = 'icon-info';break;
			case 'warning':color = '#ed9c28';icon = 'icon-exclamation';break;
			case false:
			case 'error':delay = 2000;color = '#d9534f';icon = 'icon-remove';break;
			default:color = '';icon = '';break;
		}
		if (color != '') {
			self.css({'background':color,'color':'#fff'});
			self.find('i').removeClass().addClass(icon);		
		}
		if (msg != undefined) self.find('span').html(msg);
        $(tipsID).show().css({'left':($(window).width() - $(tipsID).innerWidth())/2});
		return self;
	};
	var tips = function(msg,code,offset_top){
		if (typeof(msg) == 'object'){
			code=msg.code;msg = msg.data;
		}
		if (offset_top == undefined) offset_top = 0;
		var self = _init(msg,code);
		self.stop(true,true)
			.css({'opacity':'0','top':offset_top+self.height()})
            .show()
			.animate({opacity:opacity,top:offset_top},in_time,0)
			.delay(delay)
			.animate({opacity:0,top:'-='+(offset_top+self.height())},in_time,0,function(){
				$(this).hide();
			});
	};
	var loading = function(msg,code,offset_top){
		if (typeof(msg) == 'object'){
			code=msg.code;msg = msg.data;
		}
		if (offset_top == undefined) offset_top = 0;
		if (msg == undefined) msg = 'loading...'
		msg+= "&nbsp;&nbsp; <img src='./static/images/loading.gif'/>";

		var self = _init(msg,code);
		self.stop(true,true)
			.css({'opacity':'0','top':offset_top+self.height()})
			.animate({opacity:opacity,top:offset_top},in_time,0);
	};
	var close = function(msg,code,offset_top){
		if (typeof(msg) == 'object'){
            try{
                code=msg.code;msg = msg.data;
            }catch(e){
                code=0;msg ='';
            };			
		}
		if (offset_top == undefined) offset_top = 0;
		var self = _init(msg,code);
		self.delay(delay)
            .show()
			.animate({
				opacity:0,
				top:'-='+(offset_top+self.height())},
				in_time,0,function(){
                    $(this).hide();
			});
	};
	return{
		tips:tips,
		loading:loading,
		close:close
	}
})();

//获取keys
var objectKeys = function(obj){
	var keys = [];
    for(var p in obj){
        if(obj.hasOwnProperty(p)){
            keys.push(p);
        }
    }
    return keys;
}
//获取values
var objectValues = function(obj){
	var values = [];
    for(var p in obj){
        keys.push(obj[p]);
    }
    return values;
}

var $sizeInt = function($obj){
	var str = $obj+'';
	var theSize = parseInt(str.replace('px',''));
	if (isNaN(theSize)) {
		return 0;
	}else{
		return theSize;
	}
}

//打印调用堆栈
if (!('console' in window)) {
    window.console = {};
}
if (!console.trace) {
	function getFunctionName(func) {//获取函数名称
	    if ( typeof func == 'function' || typeof func == 'object' ) {
	        var name = ('' + func).match(/function\s*([\w\$]*)\s*\(/);
	    }
	    return name && name[1];
	}
    console.trace = function() {
        var stack = [],caller = arguments.callee.caller;
        while (caller) {
            stack.unshift(getFunctionName(caller));
            caller = caller && caller.caller;
        }
        alert('functions on stack:' + '\n' + stack.join('\n'));
    }
}


var html_encode=function(str){   
	var s = "";   
	if (str.length == 0) return "";   
	s = str.replace(/&/g, "&gt;");   
	s = s.replace(/</g, "&lt;");   
	s = s.replace(/>/g, "&gt;");   
	s = s.replace(/ /g, "&nbsp;");   
	s = s.replace(/\'/g, "&#39;");   
	s = s.replace(/\"/g, "&quot;");   
	s = s.replace(/\n/g, "<br>");   
	return s;   
}   
 
var html_decode=function(str){   
	var s = "";   
	if (str.length == 0) return "";   
	s = str.replace(/&gt;/g, "&");   
	s = s.replace(/&lt;/g, "<");   
	s = s.replace(/&gt;/g, ">");   
	s = s.replace(/&nbsp;/g, " ");   
	s = s.replace(/&#39;/g, "\'");   
	s = s.replace(/&quot;/g, "\"");   
	s = s.replace(/<br>/g, "\n");   
	return s;   
}

//点击水波效果；按钮
var loadRipple = function(search_arr){
	var get_target = function($target){
		for (var i = 0; i < search_arr.length; i++) {
			var se = search_arr[i];
			if( se.substr(0,1) == '#'){
				if($target.attr('id') == se.substr(1) ){
					return $target;
				}else if($target.parent(se).length!=0){
					return $($target.parents(se)[0]);
				}
			}else if( se.substr(0,1) == '.'){
				if($target.hasClass(se.substr(1)) ){
					return $target;
				}else if($target.parents(se).length!=0){
					return $($target.parents(se)[0]);
				}
			}else{
				if($target.is(se)){
					return $target;
				}else if($target.parents(se).length!=0){
					return $($target.parents(se)[0]);
				}
			}
		}
		return '';
	}
	//|| $(e.target).parents(".aui_state_focus").length!=0
	$('body').on('mousedown', function (e) {
		if (typeof(Worker) == "undefined") {
		   return;//不支持html5 css3
		}
		if($.browser.msie && $.browser.version<11){
			return;
		}
		var $target= get_target($(e.target));
		if($target==''){
			return;
		}
		if(typeof($target.attr("treenode_a"))!='undefined'){
			return;
		}
	    var uuid = 'ripple_'+UUID();
	    $('<span class="ripple_father" id="'+uuid+'"><span class="ripple"></span></span>').appendTo(this);
	    var circle_width = $target.outerWidth();
	    if($target.outerWidth()<$target.outerHeight()){
	    	circle_width = $target.outerHeight();
	    }
	    circle_width = circle_width>150?150:circle_width;
	    circle_width = circle_width<50?50:circle_width;

	    $('#'+uuid).css({
	    	left: $target.offset().left,
	    	top:  $target.offset().top,
	    	'border-radius':$target.css("border-radius"),
	    	width: $target.outerWidth(),
	        height:$target.outerHeight()
	    });
	    $('#'+uuid+' .ripple').css({
	    	'background':$target.css('color'),
	    	"margin-left":e.pageX - circle_width/2 - $target.offset().left,
	    	"margin-top": e.pageY - circle_width/2 - $target.offset().top,
	    	"width": circle_width,
	        "height":circle_width
	    });
	    setTimeout(function(){
	    	$('#'+uuid).remove();
	    },1200);
	});
}

//通用遮罩层
var MaskView =  (function(){
	var opacity = 0.5;
	var animatetime = 250;
	var color   ='#000';
	var maskId  = "#windowMaskView";
	var maskContent = '#maskViewContent';
	var add = function(content,t_opacity,t_color,time){
		if (t_opacity != undefined) opacity == t_opacity;
		if (t_color != undefined) color == t_color;
		if (time != undefined) animatetime == time;

		if ($(maskId).length == 0) {
			var html ='<div id="windowMaskView" style="position:fixed;top:0;left:0;right:0;bottom:0;background:'+
			color+';opacity:'+opacity+';z-index:9998;"></div><div id="maskViewContent" style="position:absolute;z-index:9999"></div>';
			$('body').append(html);
			$(maskId).bind('click',close);
			$(maskContent).bind('click',function(e){
				e.stopPropagation();
			});
			$(window).unbind('resize').bind('resize',_resize);
		}
		$(maskContent).html(content).fadeIn(animatetime);_resize();
		$(maskId).hide().fadeIn(animatetime);
	};
	var _resize = function(){
		var $content = $(maskContent);
		$content.css({'width':'auto','height':'auto'}).css({
			top:($(window).height()-$content.height())/2,
			left:($(window).width()-$content.width())/2});
		imageSize();
	}

	var tips = function(msg){
		add("<div style='font-size:50px;color:#fff;opacity:0.6;'>"+msg+"</div>");
	}
	var image = function(url){
		add("<img class='kod_image_view_loading' src='"+G.static_path+"js/lib/picasa/style/loading.gif' style='position:fixed;top:50%;left:50%;opacity:0.5;z-index:99'/>"+
			"<img src='"+url+"' class='image kod_image_view' "+
			" style='opacity:0.01;-webkit-box-reflect: below 1px -webkit-gradient(linear,left top,left bottom,from(transparent),"+
			"color-stop(80%,transparent),color-stop(70%,rgba(255,255,255,0)),to(rgba(255,255,255,0.3)));'/>");
		var $content = $(maskContent)
		var $dom = $content.find('.image');
		var dragFlag = false,E;
		var old_left,old_top;

		$('#maskViewContent .kod_image_view_loading').fadeIn(300);
		$('#maskViewContent .kod_image_view').load(function(){
			$('#maskViewContent .kod_image_view_loading').stop(true).fadeOut(500, function() {
				$(this).remove();
			});
			_resize();
			$(this).css('opacity',1.0).addClass('animated-500 dialogShow');
		});
		$(document).bind({
			mousedown:function(e){
				if (!$(e.target).hasClass('image')) return;
				dragFlag = true;
				$dom.css('cursor','move');
				stopPP(e);E = e;
				old_top = parseInt($content.css('top').replace('px',''));
				old_left = parseInt($content.css('left').replace('px',''));
			},
			mousemove:function(e){
				if (!dragFlag) return;
				$content.css({
					'left':old_left+(e.clientX-E.clientX),
					'top':old_top+(e.clientY-E.clientY)
				});
			},
			mouseup:function(){
				dragFlag = false;
				$dom.css('cursor','default');
			},
            keydown:function(e){
                if ($(maskId).length > 0 && e.keyCode == 27){
                    MaskView.close();
                    stopPP(e);
                }
            }
		});

        $('#windowMaskView,#maskViewContent img').mousewheel(function(delta){
        	var offset = delta>0?1:-1;
        	offset = offset * Math.abs(delta/3);
        	var o_w = parseInt($dom.width()),
        		o_h=parseInt($dom.height()),
	        	w =  o_w * (1+offset/5),
	        	h =  o_h * (1+offset/5);
	        if(w<=20 || h<=20) return;
	        if(w>=10000 || h>=10000) return;

	        var top  = parseInt($content.css("top"))-(h-o_h)/2;
	        var left = parseInt($content.css("left"))-(w-o_w)/2;
	        $(maskContent+','+maskContent+' .image').stop(false)
	        	.animate({'width':w,'height':h,'top':top,'left':left},200);
	    });
	}
	var imageSize = function(){
		var $dom = $(maskContent).find('.image');
		if ($dom.length == 0) return;
		var image=new Image(); 
		image.src = $dom.attr('src');
		var percent = 0.7,
			w_width = $(window).width(),
			w_height= $(window).height(),
			m_width = image.width,
			m_height= image.height,
			width,height;
		if (m_width >= w_width*percent){
			width = w_width*percent;
			height= m_height/m_width * width;
		}else{
			width = m_width;
			height= m_height;
		}
		$dom.css({'width':width,'height':height});
		var $content = $(maskContent);
		$content.css({'width':'auto','height':'auto'}).css({
			top:($(window).height()-$content.height())/2,
			left:($(window).width()-$content.width())/2});
	}
	var close = function(){
		$(maskId).fadeOut(animatetime);
		if ($(maskContent).find('.image').length!=0) {
			$(maskContent+','+maskContent+' .image').animate({
				'width':0,
				'height':0,
				'top':$(window).height()/2,
				'left':$(window).width()/2
			},animatetime*1.3,0,function(){
				$(maskContent).hide();
				_resize();
			});
		}else{
			$(maskContent).fadeOut(animatetime);
		}
	};
	return{
		image:image,
		tips:tips,
		close:close
	}
})();


//textarea自适应高度
(function($){
    $.fn.autoTextarea = function(options) {
        var defaults={
            minHeight:20,
            padding:0
        };
        var opts = $.extend({},defaults,options);
        var ie = !!window.attachEvent && !window.opera;

        this.each(function(){
	        $(this)
	        .die("paste cut keydown keyup focus blur")
	        .live("paste cut keydown keyup focus blur",function(){
			    if(!ie) this.style.height = options.minHeight+"px";
			    var height = this.scrollHeight-options.padding;
			    if(height<=options.minHeight){
			        this.style.height = options.minHeight+"px";
			    }else{
			    	this.style.height = height+"px";
			    }
	        });
	    });
    };

    //自动focus，并移动光标到指定位置，默认移到最后
    $.fn.textFocus=function(v){
        var range,len,v=v===undefined?0:parseInt(v);
        this.each(function(){
        	if($(this).is(':focus')){
        		return;
        	}
            if($.browser.msie){
                range=this.createTextRange();
                v===0?range.collapse(false):range.move("character",v);
                range.select();
            }else{
                len=this.value.length;
                v===0?this.setSelectionRange(len,len):this.setSelectionRange(v,v);
            }
            this.focus();
        });
        return this;
    }
})(jQuery);

//拖动事件
(function($){
    $.fn.drag = function(obj) {
		this.each(function(){
			var isDraging 		= false;
			var mouseFirstX		= 0;
			var mouseFirstY		= 0;

			var $that = $(this);
			$that.die('mousedown').live('mousedown',function(e){
				if (e.which != 1) return true;
				_dragStart(e);
				if($that.setCapture) $that.setCapture();
				$(document).mousemove(function(e) {_dragMove(e);});
				$(document).one('mouseup',function(e) {				
					_dragEnd(e);
					if($that.releaseCapture) {$that.releaseCapture();}
					stopPP(e);
					return false;
				});
			});
			var _dragStart = function(e){
				isDraging = true;
				mouseFirstX = e.pageX;
				mouseFirstY = e.pageY;			
				if (typeof(obj["start"]) == 'function'){
					obj["start"](e);
				}
			};
			var _dragMove = function(e){
				if (!isDraging) return true;
				if (typeof(obj["move"]) == 'function'){
					obj["move"](e.pageX-mouseFirstX,e.pageY-mouseFirstY,e);
				}
			};
			var _dragEnd = function(e){
				if (!isDraging) return false;
				isDraging = false;
				if (typeof(obj["end"]) == 'function'){
					obj["end"](e.pageX-mouseFirstX,e.pageY-mouseFirstY,e);
				}
			};
		});
    };
})(jQuery);


(function($){
	$.getUrlParam = function(name){  
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");  
        var r = window.location.search.substr(1).match(reg);  
        if (r!=null) return unescape(r[2]); return null;  
    };
	$.fn.extend({
		//dom绑定enter事件  用于input
		keyEnter:function(callback){
			this.each(function(){
				$(this).die('keydown').live('keydown',function(e){      
					if (e.keyCode == 13 && callback){
						callback();
					}
				});
			});
		},
		//dom绑定鼠标滚轮事件
		mousewheel: function(fn){
	        var mousewheel = jQuery.browser.mozilla ? "DOMMouseScroll" : "mousewheel";
	        this.each(function(){
		        $(this).bind(mousewheel ,function(e){
		            e= window.event || e;
		            var delta = e.wheelDelta ? (e.wheelDelta / 120) : (- e.detail / 3);
		            fn.call(this,delta);
		            return false;
		        });
		    });
	    },
	    //晃动 $('.wrap').shake(4,4,100);
		shake: function(times,offset,delay){
			this.each(function(){
		        this.stop().each(function(){
				    var Obj = $(this);
				    var marginLeft = parseInt(Obj.css('margin-left'));
				    var delay = delay > 50 ? delay : 50; 
				    Obj.animate({'margin-left':marginLeft+offset},delay,function(){
			        	Obj.animate({'margin-left':marginLeft},delay,function(){
				            times = times - 1;
				            if(times > 0)
				            Obj.shake(times,offset,delay);
			            })
			        });
			    });
		    });
		    return this;
	    },
	    scale:function(xScale, yScale) {
	    	var Obj = $(this);  
            if($.browser.mozilla || $.browser.opera || $.browser.safari) {  
                // x轴方向和y方向分别缩放的比例  
                Obj.css('transform', 'scale(' + xScale + ', ' + yScale + ')');  
                // 缩放后，相对于父元素左上角的偏移量  
                Obj.css('transform-origin', '0px 0px');  
            }else if($.browser.msie && parseInt($.browser.version)>= 9) {  
                Obj.css('-ms-transform', 'scale(' + xScale + ')');  
                Obj.css('-ms-transform-origin', '0px 0px');  
            }else if($.browser.msie && parseInt($.browser.version) < 9) {  
                Obj.css('zoom', xScale);
            }else {  
                Obj.css('-webkit-transform', 'scale(' + xScale + ', ' +  yScale + ')');  
                Obj.css('-webkit-transform-origin', '0px 0px');  
            }  
        }
    });
})(jQuery);

(function($){
    $.tooltipsy = function (el, options) {
        this.options = options;
        this.$el = $(el);
        this.title = this.$el.attr('title') || '';
        this.$el.attr('title', '');
        this.random = parseInt(Math.random()*10000);
        this.ready = false;
        this.shown = false;
        this.width = 0;
        this.height = 0;
        this.delaytimer = null;

        this.$el.data("tooltipsy", this);
        this.init();
    };

    $.tooltipsy.prototype = {
        init: function () {
            var base = this,
                settings,
                $el = base.$el,
                el = $el[0];

            base.settings = settings = $.extend({}, base.defaults, base.options);
            settings.delay = +settings.delay;

            if (typeof settings.content === 'function') {
                base.readify(); 
            }

            if (settings.showEvent === settings.hideEvent && settings.showEvent === 'click') {
                $el.toggle(function (e) {
                    if (settings.showEvent === 'click' && el.tagName == 'A') {
                        e.preventDefault();
                    }
                    if (settings.delay > 0) {
                        base.delaytimer = window.setTimeout(function () {
                            base.show(e);
                        }, settings.delay);
                    }
                    else {
                        base.show(e);
                    }
                }, function (e) {
                    if (settings.showEvent === 'click' && el.tagName == 'A') {
                        e.preventDefault();
                    }
                    window.clearTimeout(base.delaytimer);
                    base.delaytimer = null;
                    base.hide(e);
                });
            }
            else {
                $el.bind(settings.showEvent, function (e) {
                    if (settings.showEvent === 'click' && el.tagName == 'A') {
                        e.preventDefault();
                    }
                    base.delaytimer = window.setTimeout(function () {
                        base.show(e);
                    }, settings.delay || 0);
                }).bind(settings.hideEvent, function (e) {
                    if (settings.showEvent === 'click' && el.tagName == 'A') {
                        e.preventDefault();
                    }
                    window.clearTimeout(base.delaytimer);
                    base.delaytimer = null;
                    base.hide(e);
                });
            }
        },

        show: function (e) {
            if (this.ready === false) {
                this.readify();
            }

            var base = this,
                settings = base.settings,
                $tipsy = base.$tipsy,
                $el = base.$el,
                el = $el[0],
                offset = base.offset(el);

            if (base.shown === false) {
                if ((function (o) {
                    var s = 0, k;
                    for (k in o) {
                        if (o.hasOwnProperty(k)) {
                            s++;
                        }
                    }
                    return s;
                })(settings.css) > 0) {
                    base.$tip.css(settings.css);
                }
                base.width = $tipsy.outerWidth();
                base.height = $tipsy.outerHeight();
            }

            if (settings.alignTo === 'cursor' && e) {
                var tip_position = [e.clientX + settings.offset[0], e.clientY + settings.offset[1]];
                if (tip_position[0] + base.width > $(window).width()) {
                    var tip_css = {top: tip_position[1] + 'px', right: tip_position[0] + 'px', left: 'auto'};
                }
                else {
                    var tip_css = {top: tip_position[1] + 'px', left: tip_position[0] + 'px', right: 'auto'};
                }
            }
            else {
                var tip_position = [
                    (function () {
                        if (settings.offset[0] < 0) {
                            return offset.left - Math.abs(settings.offset[0]) - base.width;
                        }
                        else if (settings.offset[0] === 0) {
                            return offset.left - ((base.width - $el.outerWidth()) / 2);
                        }
                        else {
                            return offset.left + $el.outerWidth() + settings.offset[0];
                        }
                    })(),
                    (function () {
                        if (settings.offset[1] < 0) {
                            return offset.top - Math.abs(settings.offset[1]) - base.height;
                        }
                        else if (settings.offset[1] === 0) {
                            return offset.top - ((base.height - base.$el.outerHeight()) / 2);
                        }
                        else {
                            return offset.top + base.$el.outerHeight() + settings.offset[1];
                        }
                    })()
                ];
            }
            $tipsy.css({top: tip_position[1] + 'px', left: tip_position[0] + 'px'});
            base.settings.show(e, $tipsy.stop(true, true));
        },

        hide: function (e) {
            var base = this;

            if (base.ready === false) {
                return;
            }

            if (e && e.relatedTarget === base.$tip[0]) {
                base.$tip.bind('mouseleave', function (e) {
                    if (e.relatedTarget === base.$el[0]) {
                        return;
                    }
                    base.settings.hide(e, base.$tipsy.stop(true, true));
                });
                return;
            }
            base.settings.hide(e, base.$tipsy.stop(true, true));
        },

        readify: function () {
            this.ready = true;
            this.$tipsy = $('<div id="tooltipsy' + this.random + '" style="position:fixed;z-index:2147483647;display:none">').appendTo('body');
            this.$tip = $('<div class="' + this.settings.className + '">').appendTo(this.$tipsy);
            this.$tip.data('rootel', this.$el);
            var e = this.$el;
            var t = this.$tip;
            this.$tip.html(this.settings.content != '' ? (typeof this.settings.content == 'string' ? this.settings.content : this.settings.content(e, t)) : this.title);
        },

        offset: function (el) {
            return this.$el[0].getBoundingClientRect();
        },

        destroy: function () {
            if (this.$tipsy) {
                this.$tipsy.remove();
                $.removeData(this.$el, 'tooltipsy');
            }
        },

        defaults: {
            alignTo: 'element',
            offset: [0, -1],
            content: '',
            show: function (e, $el) {
                $el.fadeIn(100);
            },
            hide: function (e, $el) {
                $el.fadeOut(100);
            },
            css: {},
            className: 'tooltipsy',
            delay: 200,
            showEvent: 'mouseenter',
            hideEvent: 'mouseleave'
        }
    };

    $.fn.tooltipsy = function(options) {
        return this.each(function() {
            new $.tooltipsy(this, options);
        });
    };

})(jQuery);



var date = function(format, timestamp){ 
	timestamp = parseInt(timestamp);
    var a, jsdate=((timestamp) ? new Date(timestamp*1000) : new Date());
    var pad = function(n, c){
        if((n = n + "").length < c){
            return new Array(++c - n.length).join("0") + n;
        } else {
            return n;
        }
    };
    var txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var txt_ordin = {1:"st", 2:"nd", 3:"rd", 21:"st", 22:"nd", 23:"rd", 31:"st"};
    var txt_months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; 
    var f = {
        // Day
        d: function(){return pad(f.j(), 2)},
        D: function(){return f.l().substr(0,3)},
        j: function(){return jsdate.getDate()},
        l: function(){return txt_weekdays[f.w()]},
        N: function(){return f.w() + 1},
        S: function(){return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th'},
        w: function(){return jsdate.getDay()},
        z: function(){return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0},
       
        // Week
        W: function(){
            var a = f.z(), b = 364 + f.L() - a;
            var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;
            if(b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b){
                return 1;
            } else{
                if(a <= 2 && nd >= 4 && a >= (6 - nd)){
                    nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
                    return date("W", Math.round(nd2.getTime()/1000));
                } else{
                    return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
                }
            }
        },
       
        // Month
        F: function(){return txt_months[f.n()]},
        m: function(){return pad(f.n(), 2)},
        M: function(){return f.F().substr(0,3)},
        n: function(){return jsdate.getMonth() + 1},
        t: function(){
            var n;
            if( (n = jsdate.getMonth() + 1) == 2 ){
                return 28 + f.L();
            } else{
                if( n & 1 && n < 8 || !(n & 1) && n > 7 ){
                    return 31;
                } else{
                    return 30;
                }
            }
        },
       
        // Year
        L: function(){var y = f.Y();return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0},
        Y: function(){return jsdate.getFullYear()},
        y: function(){return (jsdate.getFullYear() + "").slice(2)},
       
        // Time
        a: function(){return jsdate.getHours() > 11 ? "pm" : "am"},
        A: function(){return f.a().toUpperCase()},
        B: function(){
            var off = (jsdate.getTimezoneOffset() + 60)*60;
            var theSeconds = (jsdate.getHours() * 3600) + (jsdate.getMinutes() * 60) + jsdate.getSeconds() + off;
            var beat = Math.floor(theSeconds/86.4);
            if (beat > 1000) beat -= 1000;
            if (beat < 0) beat += 1000;
            if ((String(beat)).length == 1) beat = "00"+beat;
            if ((String(beat)).length == 2) beat = "0"+beat;
            return beat;
        },
        g: function(){return jsdate.getHours() % 12 || 12},
        G: function(){return jsdate.getHours()},
        h: function(){return pad(f.g(), 2)},
        H: function(){return pad(jsdate.getHours(), 2)},
        i: function(){return pad(jsdate.getMinutes(), 2)},
        s: function(){return pad(jsdate.getSeconds(), 2)},

        O: function(){
            var t = pad(Math.abs(jsdate.getTimezoneOffset()/60*100), 4);
            if (jsdate.getTimezoneOffset() > 0) t = "-" + t; else t = "+" + t;
            return t;
        },
        P: function(){var O = f.O();return (O.substr(0, 3) + ":" + O.substr(3, 2))},
        c: function(){return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P()},
        U: function(){return Math.round(jsdate.getTime()/1000)}
    };
    return format.replace(/[\\]?([a-zA-Z])/g, function(t, s){
        if( t!=s ){
            ret = s;
        } else if( f[s] ){
            ret = f[s]();
        } else{
            ret = s;
        }
        return ret;
    });
}


var Base64 =  (function(){
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";  
    var encode = function (input) {  
        var output = "";  
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;  
        var i = 0;  
        input = _utf8_encode(input);  
        while (i < input.length) {  
            chr1 = input.charCodeAt(i++);  
            chr2 = input.charCodeAt(i++);  
            chr3 = input.charCodeAt(i++);  
            enc1 = chr1 >> 2;  
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);  
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);  
            enc4 = chr3 & 63;  
            if (isNaN(chr2)) {  
                enc3 = enc4 = 64;  
            } else if (isNaN(chr3)) {  
                enc4 = 64;  
            }  
            output = output +  
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +  
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);  
        }  
        return output;  
    }  
    // public method for decoding  
    var decode = function (input) {  
        var output = "";  
        var chr1, chr2, chr3;  
        var enc1, enc2, enc3, enc4;  
        var i = 0;  
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");  
        while (i < input.length) {  
            enc1 = _keyStr.indexOf(input.charAt(i++));  
            enc2 = _keyStr.indexOf(input.charAt(i++));  
            enc3 = _keyStr.indexOf(input.charAt(i++));  
            enc4 = _keyStr.indexOf(input.charAt(i++));  
            chr1 = (enc1 << 2) | (enc2 >> 4);  
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);  
            chr3 = ((enc3 & 3) << 6) | enc4;  
            output = output + String.fromCharCode(chr1);  
            if (enc3 != 64) {  
                output = output + String.fromCharCode(chr2);  
            }  
            if (enc4 != 64) {  
                output = output + String.fromCharCode(chr3);  
            }  
        }  
        output = _utf8_decode(output);  
        return output;  
    }
    // private method for UTF-8 encoding  
    var _utf8_encode = function (string) {  
        string = string.replace(/\r\n/g,"\n");  
        var utftext = "";  
        for (var n = 0; n < string.length; n++) {  
            var c = string.charCodeAt(n);  
            if (c < 128) {  
                utftext += String.fromCharCode(c);  
            } else if((c > 127) && (c < 2048)) {  
                utftext += String.fromCharCode((c >> 6) | 192);  
                utftext += String.fromCharCode((c & 63) | 128);  
            } else {  
                utftext += String.fromCharCode((c >> 12) | 224);  
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);  
                utftext += String.fromCharCode((c & 63) | 128);  
            }  
   
        }  
        return utftext;  
    }  
   
    // private method for UTF-8 decoding  
    var _utf8_decode = function (utftext) {  
        var string = "";  
        var i = 0;  
        var c = 0;
        var c1 = 0;
        var c2 = 0;  
        while ( i < utftext.length ) {  
            c = utftext.charCodeAt(i);  
            if (c < 128) {  
                string += String.fromCharCode(c);  
                i++;  
            } else if((c > 191) && (c < 224)) {  
                c2 = utftext.charCodeAt(i+1);  
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));  
                i += 2;  
            } else {  
                c2 = utftext.charCodeAt(i+1);  
                c3 = utftext.charCodeAt(i+2);  
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));  
                i += 3;  
            }  
        }  
        return string;  
    };
    return {
        encode:encode,
        decode:decode
    }
})();
var base64_encode = Base64.encode;
var base64_decode = Base64.decode;
