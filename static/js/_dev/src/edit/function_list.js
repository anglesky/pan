define(function(require, exports, module) {
    //匹配参数 \([\w,\s\*\[\]\<\>&]*\)  
    //匹配c函数修饰与返回值：([\w*]+\s+)+\*? 
    var language_match={
        "php":[//ok
            {
                reg:/\s*function\s+(\w*)\s*\(.*\)*/g,
                reg_name:/.*function\s+(.*\))/,
                //reg_name:/.*function\s+(\w*)\s*\(/,
                reg_index:1,//name对应匹配的位置eg:\1
                type:'function'
            },
            {
                reg:/\s*class\s+(\w*)\s*.*\{/g,
                reg_name:/\s*class\s+(\w*)\s*.*\{/,
                reg_index:1,
                type:'class'
            }
        ],
        "javascript":[//ok
            {//var test = function()
                reg:/\s*([\w\.]+)\s*=\s*function\s*\(.*\)\s*\{/g,
                reg_name:/\s*([\w\.]+)\s*=\s*function\s*(\(.*\))/,
                reg_index:1,
                reg_name_all:[1,2],
                type:'function function_var'
            },
            {//function test()
                reg:/\s*function\s+([\w\s]+)\s*\(.*\)\s*\{/g,
                reg_name:/\s*function\s+([\w\s]+)\s*(\(.*\))/,
                reg_index:1,
                reg_name_all:[1,2],
                type:'function function_define'
            },
            {//a:function()
                reg:/\s*([\w\.]+)\s*:\s*function\s*\(.*\)\s*\{/g,
                reg_name:/\s*([\w\.]+)\s*:\s*function\s*(\(.*\))/,
                reg_index:1,
                reg_name_all:[1,2],
                type:'function function_value'
            }
        ],
        "python":[//ok
            {// class MethodCommenter 
                reg:/\s*class\s+(\w+)\s*\(/g,
                reg_name:/\s*class\s+(\w+)\s*\(/,
                reg_index:1,
                type:'class'
            },
            {//def getSort(arr)
                reg:/\s*def\s+(\w+)\s*\(.*\)/g,
                reg_name:/\s*def\s+(\w+)\s*\(.*\)/,
                reg_index:1,
                type:'function'
            }
        ],
        "ruby":[//ok
            {// class MethodCommenter 
                reg:/\s*class\s+(\w+)\s*/g,
                reg_name:/\s*class\s+(\w+)\s*/,
                reg_index:1,
                type:'class'
            },
            {//def getSort(arr)
                reg:/\s*def\s+(\w+)\s*/g,
                reg_name:/\s*def\s+(\w+)\s*/,
                reg_index:1,
                type:'function'
            }
        ],
        "golang":[//ok
            {// class MethodCommenter 
                reg:/\s*class\s+(\w+)\s*/g,
                reg_name:/\s*class\s+(\w+)\s*/,
                reg_index:1,
                type:'class'
            },
            {//def getSort(arr)
                reg:/\s*func\s+(\w+)\s*.*\{/g,
                reg_name:/\s*func\s+(\w+)\s*/,
                reg_index:1,
                type:'function'
            }
        ],
        "java":[//ok
            {
                reg:/\s*(final)?\s*(public|private|protected)\s*.*\s+(\w+)\s*\(.*\).*\{/g,
                reg_name:/\s*(final)?\s*(public|private|protected)\s*.*\s+(\w+)\s*\(.*\).*\{/,
                reg_index:3,
                type:'function'
            },
            {
                reg:/\s*class\s+(\w+)\s*/g,
                reg_name:/\s*class\s+(\w+)\s*/,
                reg_index:1,
                type:'class'
            }
        ],
        "csharp":[//ok
            {
                reg:/\s*(public|private|protected)\s*.*\s+(\w+)\s*\(.*\).*/g,
                reg_name:/\s*(public|private|protected)\s*.*\s+(\w+)\s*\(.*\).*/,
                reg_index:2,
                type:'function'
            },
            {
                reg:/\s*class\s+(\w+)\s*/g,
                reg_name:/\s*class\s+(\w+)\s*/,
                reg_index:1,
                type:'class'
            }
        ],

        "actionscript":[//ok
            {
                reg:/\s*function\s*(\w+)\s*\(.*\).*\s*\{/g,
                reg_name:/\s*function\s*(\w+)\s*\(.*\).*\s*\{/,
                reg_index:1,
                type:'function'
            },
            {
                reg:/\s*class\s+(\w+)\s*.*\{/g,
                reg_name:/\s*class\s+(\w+)\s*.*\{/,
                reg_index:1,
                type:'class'
            }
        ],
        "objectivec":[//ok
            {//-(int) test:(){};
                reg:/[\+-]\s*\(.*\)\s*(\w+)\s*\:\s*\(.*/g,
                reg_name:/[\+-]\s*\(.*\)\s*(\w+)\s*\:\s*\(.*/,
                reg_index:1,
                type:'function'
            },
            {//-(int) test{};
                reg:/[\+-]\s*\([^:\{\}]*\)\s*(\w*)\s*\{/g,
                reg_name:/[\+-]\s*\([^:\{\}]*\)\s*(\w*)\s*\{/,
                reg_index:1,
                type:'function'
            },            
            {//@implementation BLEDeviceViewController
                reg:/@implementation\s+(\w*)/g,
                reg_name:/@implementation\s+(\w*)/,
                reg_index:1,
                type:'class'
            },          
            {//#pragma mark - BleClientDelegate
                reg:/#pragma\s+(mark\s+)?(.*)/g,
                reg_name:/#pragma\s+(mark\s+)?(.*)/,
                reg_index:2,
                type:'mark'
            }
        ],
        "c_cpp":[//
            {// int *test(int argc, char const *argv[])
                reg:/([\w*]+\s+)+\*?(\w+)\s*\([\w,\s\*\[\]\<\>&]*\)\s*\{/g,
                reg_name:/(\w+\s*)+\s\*?(\w+)\s*\(/,
                reg_index:2,
                type:'function'
            },
            {//void Robot::closedb(){  Robot::~Robot(){
                reg:/\s*(\w+)::~?(\w+)\s*\([\w,\s\*\[\]\<\>&]*\)\s*\{/g,
                reg_name:/\s*(\w+)::~?(\w+)\s*\(/,
                reg_index:2,
                type:'function function_define'
            },
            {// class CkxlolDlgBuild : public CDialogEx
                reg:/\s*class\s+(\w+)\s*:/g,
                reg_name:/\s*class\s+(\w+)\s*:/,
                reg_index:1,
                type:'class'
            }
            // {// template <class T,int MAXSIZE> void Stack<T, MAXSIZE>::push(T const& elem)
            //  reg:/\s*template\s*\<[\w,\s\*\[\]\<\>]*\>\s*.*(\w+)\s*\(/g,
            //  reg_name:/(\w+\s*)+\s(\*?\w+)\s*\(/,
            //  reg_index:2,
            //  type:'function function_define'
            // },
        ]
    };

    //正则匹配查找；并定位字符所在位置。
    var reg_exec = function (str,reg_info){
        var match_list = str.match(reg_info.reg);
        if (!match_list) return;
        var result = [],
            match_len=match_list.length,
            str_start=0,
            current_str=str;    
        //console.log(111,match_list,match_list.length); 
        for(var i=0;i<match_len;i++){
            var info = {};
            info.the_match = match_list[i];         
            var match_name = info.the_match.match(reg_info.reg_name);
            if (!match_name || match_name.length<2 || !match_name[reg_info.reg_index]){//匹配出错则跳过
                //console.log('跳过',match_name);
                continue;
            }

            info.name = match_name[reg_info.reg_index];
            var match_pos = current_str.indexOf(info.the_match);
            var name_match_pos = info.the_match.indexOf(info.name);
            info.pos_start = str_start+match_pos+name_match_pos;
            info.pos_end = info.pos_start+info.name.length;

            //展示全部
            if (typeof(reg_info['reg_name_all']) == "object") {
                info.name = '';
                var arr = reg_info['reg_name_all'];
                for (var j = 0; j < arr.length; j++) {
                    info.name += match_name[arr[j]];
                    //console.log(arr,match_name,arr[j])
                }
            }

            //console.log(info.name,'----',match_name,'-----',info.the_match,reg_info.reg_name);
            //从剩下的str中匹配
            str_start=str_start + match_pos+info.the_match.length;
            current_str = str.substr(str_start);
            info.type = reg_info.type;
            result.push(info);
        }
        return result;
    }

    //list_make(editor.getValue(),'php');   
     var list_make = function(string,type){
        if (typeof(language_match[type]) == 'undefined') return;
        var reg_match = language_match[type];
        var match_result = [];
        //匹配多个类型
        for (var i = 0; i < reg_match.length; i++) {
            var match_type = reg_exec(string,reg_match[i]);         
            if (match_type) {
                Array.prototype.push.apply(match_result,match_type);
            }
        }

        //排序
        match_result.sort(function(a, b) {
            var filed = 'pos_start';
            if (a[filed] < b[filed]) { return -1; }
            if (a[filed] >= b[filed]) { return 1; }
        });
        //根据在字符串的位置，定位行列数
        var str_arr = string.split('\n');
        var str_arr_len = str_arr.length;
        var match_index = 0,//函数列表的位置
            info = match_result[match_index],//函数列表位置pose
            str_pose=0;//字符串截止到当前行当前位置
        for (var line = 0;line<str_arr_len;line++){
            if (!info) break;
            while (info && info.pos_start >= str_pose && info.pos_start<=str_pose+str_arr[line].length) {
                match_result[match_index].range = {//range 追加到info
                    start:{row:line,column:info.pos_start-str_pose},
                    end:  {row:line,column:info.pos_end-str_pose}
                };       
                match_index++;
                info = match_result[match_index];//        
            }           
            str_pose = str_pose+str_arr[line].length+1;//=1 回车符
        }
        return match_result;
    };
    var outStr = function(str){
        str = str.replace(/[\r\n {]+/ig,' ');
        str = str.replace(/"/ig,"'");
        str = str.replace(/\</ig,"&lt;");
        str = str.replace(/\>/ig,"&gt;");
        return str;
    };

    return function(the_editor){
        var list_html= '';//每次函数刷新后记录
        var list_html_null = '<div class="cell_null">No outline for the active view</div>';
        var $main = $('#'+the_editor.kod.uuid).parent();
        var $search_input = $main.find('.function_search input');
        var $function_list_box = $main.find('.function_list_box');

        var refresh = function(){
            var editor = Editor.current();
            if (!editor|| typeof(editor.kod) == 'undefined'){
                $function_list_box.html(list_html_null);
                return;
            }
            var trim = function(str){ 
                var s = str.replace(/(^\s*)|(\s*$)/g,"");
                return s.replace(/(\{$)/,"");
            };
            var type   = editor.kod.mode,
                list = list_make(editor.getValue(),type);        
            if (typeof(list) == 'undefined' || list.length==0){
                $function_list_box.html(list_html_null);
                return;
            }

            var curline = editor.getCursorPosition().row;
            list_html = '';
            for (var i = 0;i<list.length; i++){
                var info = list[i],range=info.range;
                if (!range) continue;            
                if (i<list.length-1&& curline>=list[i].range.start.row
                    && list[i+1].range
                    && curline< list[i+1].range.start.row){
                    info.type += ' row_select';
                }
                if (i==list.length-1 && curline>=list[i].range.start.row){
                    info.type += ' row_select';
                }
                var range_html = range.start.row+','+range.start.column+','+
                                 range.end.row+','+range.end.column;
                var range_title = trim(trim(info.the_match)).substr(0,150);
                list_html+= '<div class="list_row '+outStr(info.type)+' " title="'+outStr(range_title)+
                    '" data-range="'+range_html+'">' +
                    '<span class="icon"></span>'+
                    '<span class="cell">'+outStr(info.name)+'</span></div>'
            }
            if(!$search_input.val()){
                function_search($search_input.val());
            }
            _select_function_set_display();
        };
        var function_search = function(search){
            if(list_html==''){
                $function_list_box.html(list_html_null);
                return;
            }
            if(search==''){
                $function_list_box.html(list_html);
                _select_function_set_display();
                return;
            }

            var $list = $("<div>"+list_html+"</div>");
            $list.find('.cell').each(function(){
                var text  = $(this).text();
                var index = text.toLowerCase().indexOf(search.toLowerCase());
                if(index!= -1){//忽略大小写的查找标记。
                    text = text.substr(0,index)+'<b>'+text.substr(index,search.length)+'</b>'+text.substr(index+search.length);
                    $(this).html(text);
                }else{
                    $(this).parent().remove();
                }
            });
            $function_list_box.html($list.html());
            select_function($($function_list_box.find(".list_row").get(0)));
        }

        var select_function = function($dom){
            if($dom.length!=1){
                return;
            }
            $function_list_box.find('.list_row').removeClass('row_select');
            $dom.addClass("row_select");
            var range_str = $dom.attr('data-range');
            var range_arr = range_str.split(',');
            var range     = {//range 追加到info
                start:{row:range_arr[0],column:range_arr[1]},
                end:  {row:range_arr[2],column:range_arr[3]}
            }
            if (!Editor.current()) return;
            Editor.current().gotoLine(range_arr[0]);
            Editor.current().selection.setSelectionRange(range,true);
            $search_input.textFocus();        
        }
        var _select_function_set_display = function(){
            //设置选中的滚动条位置；有滚动条
            var $box = $function_list_box;
            if( $box.outerHeight() == $box.prop("scrollHeight")){
                return;
            }
            var start = $box.scrollTop();
            var end   = start + $box.height();        
            var index = $box.find('.row_select').index();
            var row_height = $box.find(".list_row:eq(0)").outerHeight();

            var scroll_to = $box.scrollTop();
            if(index*row_height<start){
                scroll_to = index*row_height;
            }else if((index+1)*row_height>end){
                scroll_to = index*row_height-$box.height()+row_height;
            }
            //$box.stop(1,0).animate({'scrollTop':scroll_to+'px'},200);
            $box.scrollTop(scroll_to);
        }

        //绑定点击事件
        var init = function(){
            var clickClass = 'mouse_is_down';
            $function_list_box.delegate('.list_row','mouseover mousedown mouseout mouseup',function () {
                var $this = $(this);
                switch(event.type){
                    case 'mouseover':
                        if(!$this.parent().hasClass(clickClass)){
                            $this.addClass("row_hover");
                        }else{
                            select_function($this);
                        }                        
                        break;
                    case 'mousedown':
                        select_function($this);
                        $this.parent().addClass(clickClass);
                        break;
                    case 'mouseout':
                        $this.removeClass("row_hover");
                        break;
                    case 'mouseup':
                        $this.parent().removeClass(clickClass);
                        $search_input.textFocus();
                        break;
                    default:break;
                }                
            });
            
            //窗口外松起处理
            $function_list_box.bind('mousedown',function(e){
                if (e.which != 1) return true;
                if($function_list_box.setCapture) $function_list_box.setCapture();
                $(document).one('mouseup',function(e) {
                    $function_list_box.removeClass(clickClass);
                    if($function_list_box.releaseCapture) {$function_list_box.releaseCapture();}
                });
            });

            var search_change = function(){
                var search = $search_input.val();
                function_search(search);
                if(search==''){
                    $main.find('.search_reset').addClass('hidden');
                }else{
                    $main.find('.search_reset').removeClass('hidden');
                }
            }
            $search_input.unbind('keydown').bind('keydown',function(e){
                switch(e.keyCode){
                    case 37:break;
                    case 39:break;
                    case 38://up
                        if($main.find(".row_select").prev().length!=0){
                            select_function($main.find(".row_select").prev());
                            _select_function_set_display();
                        }
                        break;
                    case 40://down
                        if($main.find(".row_select").next().length!=0){
                            select_function($main.find(".row_select").next());
                            _select_function_set_display();
                        }
                        break;
                    case 27://esc
                    case 13://enter
                        select_function($main.find(".row_select"));
                        $search_input.val("");
                        search_change();
                        Editor.current() && Editor.current().focus();
                        stopPP(e);
                        break;
                    default:
                        setTimeout(search_change,5);
                        break;
                }
            });
            $main.find('.search_reset').unbind('click').bind('click',function(){
                $search_input.val("");
                search_change();
                Editor.current() && Editor.current().focus();
            });
        }

        init();
        return {
            refresh:refresh,
            support:function(mode){
                if($.inArray(mode,objectKeys(language_match)) == -1){
                    return false;
                }else{
                    return true;
                }
            }
        }
    }
});

