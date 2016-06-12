## 版本：`Version 1.2.3`
- 下载：https://github.com/ajaxorg/ace-builds/tags
- 插件：https://github.com/ajaxorg/ace/wiki/Extensions

**自行修改**
1. iframe鼠标丢失问题：修改ace.js  允许事件冒泡
	
    this.onMouseDown方法的 2459行 this.onMouseDown 去掉了阻止事件冒泡
	去掉了ev.preventDefault()；

2. 搜索优化：界面优化&立即搜索&搜索匹配数及当前位置显示
    1. 修改ext-searchbox.js  【修改模板】
        1. 模板修改：
         - 搜索框 class="ace_search_field" 外层加入<div class="ace_search_input">；后面加入 <span class="search_info"></span>
         - button外面包一层<div class="ace_search_action">
        2. 首次搜索自动搜索：
            在this.show()函数最后一行 加入:  this.find(false, false);
        3. this.find函数最后加入：（匹配结果展示）
        ```
        //搜索信息展示
        var range = n;
        var ranges = this.editor.findAllInfo(this.searchInput.value, {
            regExp: this.regExpOption.checked,
            caseSensitive: this.caseSensitiveOption.checked,
            wholeWord: this.wholeWordOption.checked
        });
        var html = '';
        if(range && ranges.length!==0){
            var index = 0; 
            for(index=0;index<ranges.length;index++){
                if( ranges[index].start.column == range.start.column && 
                    ranges[index].start.row == range.start.row){
                    break;
                }
            }
            html =  '<span class="search_at_index">'+(index+1)
                    +'</span>of<span class="search_total_num">'+ranges.length+'</span>'
        }
        this.searchBox.querySelector(".search_info").innerHTML = html;
        ```
    2. 修改ace.js  【this.findAll后面加入搜索结果相关信息函数：】
    ```
    this.findAllInfo = function(needle, options, additive) {
        options = options || {};
        options.needle = needle || options.needle;
        if (options.needle == undefined) {
            var range = this.selection.isEmpty()
                ? this.selection.getWordRange()
                : this.selection.getRange();
            options.needle = this.session.getTextRange(range);
        }    
        this.$search.set(options);
        var ranges = this.$search.findAll(this.session);
        return ranges;
    };
    ```
3. 修改自动补全,php不生效问题 ace 1.2.3已经修复

