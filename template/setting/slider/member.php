<div class="system_conennt">
    <div class="left_freame">
        <div class="left_header">
            <div class="tab this" id="system_group"><?php echo $L['system_group_edit'];?></div>
            <div class="tab" id="system_role"><?php echo $L['system_group_role'];?></div>                
            <div style="clear:both"></div>
        </div>
        <div class="left_content system_group">
            <div id="folderList"  class="ztree"></div>
        </div>

        <div class="left_content system_role">
            <div class="role_box">
                <ul class="role_list_cell"></ul>
            </div>
        </div>
    </div>
    <!-- left_frame end -->

    <div class="right_frame" id="content_system_group">
        <div class="header_content">
            <div class="group_title" data-id="0">
                <a href="javascript:void(0);" class="group_title_span title_tooltip" title="<?php echo $L['edit'];?>" data-action="group_edit">--</a>
                <a href="javascript:void(0);" class="font-icon-label ml-20 title_tooltip" title="<?php echo $L['system_group_add'];?>" data-action="group_add_child">
                <i class="font-icon icon-plus"></i></a>

                <a href="javascript:void(0);" class="font-icon-label title_tooltip" title="<?php echo $L['open_the_path'];?>" data-action="group_home" >
                <i class="font-icon icon-folder-open"></i></a>
                <span class="group_size">111/1.5</span>
            </div>
        </div>

        <div class="content user_liser_content">            
        </div>
    </div>
    <!-- content_system_group end -->

    <div class="right_frame" id="content_system_role">
        <div class="header_content">
            <div class="group_title">
                <span class="role_title"></span>
                <a href="javascript:void(0);" class="font-icon-label ml-20" data-action="role_add"><i class="font-icon icon-plus"></i></a>
                <a href="javascript:void(0);" class="font-icon-label" data-action="role_delete" ><i class="font-icon icon-trash"></i></a>
            </div>
        </div>

        <div class="section group_editor">
            <div class="together input">
                <div class="title"><i><?php echo $L['group_name'];?></i></div>
                <input type="text" id='name' data-before=""/>        
                <a href="javascript:;" class="button warning" title='<?php echo $L['group_tips'];?>'><i class="icon-warning-sign"></i><?php echo $L['tips'];?>!</a>
                <div style="clear:both;"></div>

                <div class="title"><i><?php echo $L['group_role_ext'];?></i></div>
                <input type="text" id='ext_not_allow' default='php|asp|jsp' value="php|asp|jsp"/>
                <a href="javascript:;" class="button warning path_ext_tips" title='<?php echo $L['group_role_ext_warning'];?>'><i class="icon-warning-sign"></i><?php echo $L['tips'];?>!</a>
                <div style="clear:both;"></div>
            </div>
            <div class="together">
                <div class="title" style="height:75px"><i><?php echo $L['group_role_file'];?></i></div>
                <div class="tagdiv">
                    <a class="tag" href="javascript:;" data-role='explorer:mkfile;app:user_app'>
                        <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_mkfile'];?></span>
                    </a>
                    <a class="tag" href="javascript:;" data-role='explorer:mkdir'>
                        <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_mkdir'];?></span>
                    </a>
                    <a class="tag" href="javascript:;" data-role='explorer:pathRname'>
                        <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_pathrname'];?></span>
                    </a>
                    <a class="tag" href="javascript:;" data-role='explorer:pathDelete'>
                        <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_pathdelete'];?></span>
                    </a>
                    <a class="tag" href="javascript:;" data-role='explorer:pathInfo;explorer:pathInfoMuti'>
                        <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_pathinfo'];?></span>
                    </a>

                    <a class="tag" href="javascript:;" 
                    data-role='explorer:pathCopy;explorer:pathCute;explorer:pathCuteDrag;explorer:clipboard;explorer:pathPast'>
                        <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_pathmove'];?></span>
                    </a>
                    <a class="tag" href="javascript:;" data-role='explorer:zip'>
                        <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_zip'];?></span>
                    </a>
                    <a class="tag" href="javascript:;" data-role='explorer:unzip'>
                        <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_unzip'];?></span>
                    </a>
                    <a class="tag" href="javascript:;" data-role='explorer:search'>
                        <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_search'];?></span>
                    </a> 
                    <a class="tag" href="javascript:;" data-role='editor:fileSave'>
                        <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_filesave'];?></span>
                    </a>
                    <div style="clear:both;"></div>
                </div>
                <div style="clear:both;"></div>
            </div>
            <div class="together">
                <div class="title"><i><?php echo $L['group_role_can_upload'];?></i></div>
                <a class="tag" href="javascript:;" data-role='explorer:fileUpload'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_upload'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='explorer:serverDownload'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_download'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='explorer:fileDownload'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_fileDownload'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='userShare:set;userShare:del'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_share'];?></span>
                </a>
                <div style="clear:both;"></div>   
            </div>

            <div class="together">
                <div class="title"><i><?php echo $L['group_role_config'];?></i></div>
                <a class="tag" href="javascript:;" data-role='user:changePassword'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_passowrd'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='setting:set'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['group_role_config'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='fav:edit;fav:add;fav:del'>
                    <input type="checkbox" id="23" class="checkbox"><span><?php echo $L['group_role_fav'];?></span>
                </a>
                <div style="clear:both;"></div>
            </div>

            <div class="together combox">
                <div class="title"><i><?php echo $L['system_member_action'];?></i></div>
                <a class="tag" href="javascript:;" data-role='system_member:get'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['action_list'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='system_member:add'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['action_add'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='system_member:edit'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['action_edit'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='system_member:do_action'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['action_del'];?></span>
                </a>
                <div style="clear:both;"></div>
            </div>
            <div class="together combox">
                <div class="title"><i><?php echo $L['system_group_action'];?></i></div>
                <a class="tag" href="javascript:;" data-role='system_group:get'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['action_list'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='system_group:add'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['action_add'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='system_group:edit'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['action_edit'];?></span>
                </a>
                <a class="tag" href="javascript:;" data-role='system_group:del'>
                    <input type="checkbox" class="checkbox"><span><?php echo $L['action_del'];?></span>
                </a>
                <div style="clear:both;"></div>
            </div>
            <a href="javascript:;" class="role_save_button button" data-action="role_edit_save"><?php echo $L['button_save_submit'];?></a>
            <a href="javascript:;" class="revert" data-action="revert_all"><?php echo $L['button_select_all'];?></a>
        </div>

    </div>
    <!-- content_system_role end -->
</div> 
</div><!-- 父元素结束 -->


