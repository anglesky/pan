define("app/src/explorer/main", ["lib/jquery-lib", "lib/util", "lib/ztree/js/ztree", "lib/contextMenu/jquery-contextMenu", "lib/artDialog/jquery-artDialog", "lib/picasa/picasa", "./ui", "./fileSelect", "../../common/taskTap", "../../common/core", "../../tpl/copyright.html", "../../tpl/search.html", "../../tpl/search_list.html", "../../tpl/upload.html", "../../common/rightMenu", "../../common/tree", "../../common/pathOperate", "../../tpl/share.html", "../../tpl/fileinfo/file_info.html", "../../tpl/fileinfo/path_info.html", "../../tpl/fileinfo/path_info_more.html", "../../tpl/app.html", "../../common/pathOpen", "../../common/CMPlayer", "./path", "./list_header_resize"], function(e) {
	Config = {
		BodyContent: ".bodymain",
		FileBoxSelector: ".fileContiner",
		FileBoxClass: ".fileContiner .file",
		FileBoxClassName: "file",
		FileBoxTittleClass: ".fileContiner .title",
		SelectClass: ".fileContiner .select",
		SelectClassName: "select",
		TypeFolderClass: "folderBox",
		TypeFileClass: "fileBox",
		HoverClassName: "hover",
		FileOrderAttr: "number",
		TreeId: "folderList",
		pageApp: "explorer",
		treeAjaxURL: "index.php?explorer/treeList&app=explorer",
		AnimateTime: 200
	}, Global = {
		fileListAll: "",
		fileListNum: 0,
		fileRowNum: 0,
		ctrlKey: !1,
		shiftKey: !1,
		fileListSelect: "",
		fileListSelectNum: ""
	}, e("lib/jquery-lib"), e("lib/util"), e("lib/ztree/js/ztree"), e("lib/contextMenu/jquery-contextMenu"), e("lib/artDialog/jquery-artDialog"), e("lib/picasa/picasa"), ui = e("./ui"), TaskTap = e("../../common/taskTap"), core = e("../../common/core"), rightMenu = e("../../common/rightMenu"), ui.tree = e("../../common/tree"), ui.path = e("./path"), fileSelect = e("./fileSelect"), fileLight = fileSelect.fileLight, list_header_resize = e("./list_header_resize"), $(document).ready(function() {
		function t(e) {
			var t = RegExp("(^|&)" + e + "=([^&]*)(&|$)"),
				a = window.location.search.substr(1).match(t);
			return null != a ? unescape(a[2]) : null
		}
		core.init(), $(".init_loading").fadeOut(450).addClass("pop_fadeout"), e.async("lib/webuploader/webuploader-min", function() {
			core.upload_init()
		}), ui.init(), list_header_resize.init(), ui.tree.init(), TaskTap.init(), fileSelect.init(), rightMenu.initExplorer(), $(".path_tips").tooltip({
			placement: "bottom",
			html: !0
		}), "file_list" == t("type") && ($(".tools .tools-left").remove(), $(".header-middle").appendTo(".tools"))
	})
}), define("app/src/explorer/ui", ["./fileSelect"], function(require, exports) {
	var fileSelect = require("./fileSelect"),
		fileLight = fileSelect.fileLight,
		MyPicasa = new Picasa,
		_ajaxLive = function() {
			fileLight.init(), ui.setStyle(), "icon" == G.list_type && $(".fileContiner .picture img").lazyload({
				effect: "fadeIn",
				container: $(".bodymain"),
				placeholder: G.static_path + "images/image.png"
			})
		},
		_initListType = function(e) {
			$(".tools-right button").removeClass("active"), $("#set_" + e).addClass("active"), "list" == e ? ($(Config.FileBoxSelector).removeClass("fileList_icon").addClass("fileList_list"), $("#list_type_list").html('<div id="main_title"><div class="filename" field="name">' + LNG.name + '<span></span></div><div class="resize filename_resize"></div>' + '<div class="filetype" field="ext">' + LNG.type + '<span></span></div><div class="resize filetype_resize"></div>' + '<div class="filesize" field="size">' + LNG.size + '<span></span></div><div class="resize filesize_resize"></div>' + '<div class="filetime" field="mtime">' + LNG.modify_time + '<span></span></div><div class="resize filetime_resize"></div>' + '<div style="clear:both"></div>' + "</div>"), $(Config.FileBoxSelector + " textarea").autoTextarea({
				minHeight: 19,
				padding: 4
			}), list_header_resize.bind_list_resize()) : ($(Config.FileBoxSelector).removeClass("fileList_list").addClass("fileList_icon"), $("#list_type_list").html(""), $(Config.FileBoxSelector + " textarea").autoTextarea({
				minHeight: 32,
				padding: 4
			})), $(".menu_seticon").removeClass("selected"), $(".set_set" + G.list_type).addClass("selected")
		},
		_setListType = function(e, t) {
			G.list_type = e, void 0 == t ? $.ajax({
				url: "index.php?setting/set&k=list_type&v=" + e,
				dataType: "json",
				success: function() {
					_initListType(e), _f5(!1, !1)
				}
			}) : (_initListType(e), _f5(!1, !0))
		},
		_sortBy = function(e, t) {
			var t = "down" == t ? -1 : 1;
			return function(a, i) {
				return a = a[e], i = i[e], i > a ? -1 * t : a > i ? 1 * t : 0
			}
		},
		_setListSort = function(e, t) {
			0 != e && (G.list_sort_field = e, $(".menu_set_sort").removeClass("selected"), $(".set_sort_" + e).addClass("selected")), 0 != t && (G.list_sort_order = t, $(".menu_set_desc").removeClass("selected"), $(".set_sort_" + t).addClass("selected")), _f5(!1, !0), $.ajax({
				url: "index.php?setting/set&k=list_sort_field,list_sort_order&v=" + G.list_sort_field + "," + G.list_sort_order
			})
		},
		_jsonSortTitle = function() {
			var up = '<i class="font-icon icon-chevron-up"></i>',
				down = '<i class="font-icon icon-chevron-down"></i>';
			$("#main_title .this").toggleClass("this").attr("id", "").find("span").html(""), $("#main_title div[field=" + G.list_sort_field + "]").addClass("this").attr("id", G.list_sort_order).find("span").html(eval(G.list_sort_order))
		},
		_bindEventSort = function() {
			$("#main_title div").die("click").live("click", function() {
				$(this).hasClass("resize") || ("up" == $(this).attr("id") ? $(this).attr("id", "down") : $(this).attr("id", "up"), _setListSort($(this).attr("field"), $(this).attr("id")))
			})
		},
		_bindEventTools = function() {
			$(".tools a,.tools button").bind("click", function() {
				var e = $(this).attr("id");
				_toolsAction(e)
			})
		},
		_bindEventTheme = function() {
			$(".dropdown-menu-theme li").click(function() {
				var e = $(this).attr("theme");
				$.ajax({
					url: "index.php?setting/set&k=theme&v=" + e,
					dataType: "json",
					success: function(t) {
						ui.setTheme(e), t.code || (core.authCheck("setting:set") ? core.tips.tips(LNG.config_save_error_file, !1) : core.tips.tips(LNG.config_save_error_auth, !1))
					}
				}), $(".dropdown-menu li").removeClass("this"), $(this).addClass("this")
			})
		},
		_bindHotKey = function() {
			var e = 91;
			Global.ctrlKey = !1, $(document).keydown(function(t) {
				if ("none" != $("#PicasaView").css("display")) return !0;
				if (ui.isEdit()) return !0;
				if (rightMenu.isDisplay()) return !0;
				var a = !1;
				if (Global.ctrlKey || t.keyCode == e || t.ctrlKey) switch (a = !0, Global.ctrlKey = !0, t.keyCode) {
				case 8:
					ui.path.history.next(), a = !0;
					break;
				case 65:
					fileSelect.selectPos("all");
					break;
				case 67:
					ui.path.copy();
					break;
				case 88:
					ui.path.cute();
					break;
				case 83:
					break;
				case 86:
					ui.path.past();
					break;
				case 70:
					core.search($(".header-right input").val(), G.this_path);
					break;
				default:
					a = !1
				} else if (t.shiftKey) Global.shiftKey = !0;
				else switch (t.keyCode) {
				case 8:
					ui.path.history.back(), a = !0;
					break;
				case 32:
					ui.path.open();
					break;
				case 35:
					fileSelect.selectPos("end");
					break;
				case 36:
					fileSelect.selectPos("home");
					break;
				case 37:
					fileSelect.selectPos("left"), a = !0;
					break;
				case 38:
					fileSelect.selectPos("up"), a = !0;
					break;
				case 39:
					fileSelect.selectPos("right"), a = !0;
					break;
				case 40:
					fileSelect.selectPos("down"), a = !0;
					break;
				case 13:
					ui.path.open(), a = !1;
					break;
				case 46:
					ui.path.remove(), a = !0;
					break;
				case 113:
					ui.path.rname(), a = !0;
					break;
				default:
					a = !1
				}
				return a && (stopPP(t), t.keyCode = 0, t.returnValue = !1), !0
			}).keyup(function(t) {
				t.shiftKey || (Global.shiftKey = !1), t.keyCode != e && t.ctrlKey || (Global.ctrlKey = !1)
			})
		},
		_menuActionBind = function() {
			$(".drop-menu-action li").bind("click", function() {
				if (!$(this).hasClass("disabled")) {
					var e = $(this).attr("id");
					switch (e) {
					case "open":
						ui.path.open();
						break;
					case "copy":
						ui.path.copy();
						break;
					case "rname":
						ui.path.rname();
						break;
					case "cute":
						ui.path.cute();
						break;
					case "clone":
						ui.path.copyDrag(G.this_path, !0);
						break;
					case "past":
						ui.path.past();
						break;
					case "remove":
						ui.path.remove();
						break;
					case "zip":
						ui.path.zip();
						break;
					case "share":
						ui.path.share();
						break;
					case "createLink":
						ui.path.createLink();
						break;
					case "add_to_fav":
						ui.path.fav();
						break;
					case "download":
						ui.path.download();
						break;
					case "info":
						ui.path.info();
						break;
					default:
					}
				}
			}), $(".dlg_goto_path").bind("click", function() {
				var e = G.json_data.info.admin_real_path;
				ui.path.list(e)
			})
		},
		_hover_title = function(e) {
			var t = "'",
				a = "";
			0 == e.is_writeable && (t = " file_not_writeable" + t, a = "【" + LNG.system_role_read + "】"), 0 == e.is_readable && (t = " file_not_readable" + t, a = "【" + LNG.no_permission_read_all + "】");
			var i = LNG.size + ":" + core.file_size(e.size) + "&#10;";
			return "folder" == e.type && (i = ""), t += " data-path='" + e.path + "'", t += " data-name='" + e.name + "'", t + " title='" + LNG.name + ":" + e.name + "&#10;" + i + LNG.permission + ":" + e.mode + a + " &#10;" + LNG.create_time + ":" + e.ctime + "&#10;" + LNG.modify_time + ":" + e.mtime + "' "
		},
		_getFolderBox = function(e) {
			var t = "",
				a = e.name;
			return "number" == typeof e.exists && 0 == e.exists && (a = '<b style="color:red;" class="file_not_exists">' + a + "</b>"), void 0 != e.menuType ? (t += "<div class='file systemBox " + e.menuType + _hover_title(e) + ">", t += "<div class='ico " + e.tree_icon + "' filetype='folder'></div>") : (t += "<div class='file folderBox menufolder " + _hover_title(e) + ">", t += "<div class='folder ico' filetype='folder'></div>"), void 0 != e.meta_info && (t += '<div class="' + e.meta_info + '"></div>'), t += "<div id='" + e.name + "' class='titleBox'><span class='title' title='" + LNG.double_click_rename + "'>" + a + "</span></div></div>"
		},
		_getFileBox = function(e) {
			var t = "",
				a = e.name;
			if ("number" == typeof e.exists && 0 == e.exists && (a = '<b style="color:red;" class="file_not_exists">' + a + "</b>"), "oexe" == e.ext && void 0 != e.icon) {
				var i = e.icon; - 1 == e.icon.search(G.static_path) && "http" != e.icon.substring(0, 4) && (i = G.static_path + "images/app/" + e.icon);
				var n = base64_encode(json_encode(e));
				a = a.replace(".oexe", ""), t = "<div data-app='" + n + "' class='file fileBox menufile" + _hover_title(e) + ">", "app_link" == e.type ? (t += 0 == e.content.search("ui.path.open") ? "<div class='" + core.pathExt(e.name.replace(".oexe", "")) + " ico'" : "<div class='folder ico'", t += ' filetype="oexe"></div><div class="app_link"></div>') : t += "<div class='ico' filetype='oexe' style='background-image:url(" + i + ")'></div>"
			} else if (inArray(core.filetype.image, e.ext)) {
				var o = core.path2url(e.path),
					s = "index.php?explorer/image&path=" + urlEncode(e.path);
				G.static_path + "/images/file_icon/file_64/jpg.png", t += "<div class='file fileBox menufile " + _hover_title(e) + ">", t += "<div picasa='" + o + "' thumb='" + s + "' class='picasaImage picture ico' filetype='" + e.ext + "' style='background:none'><img data-original='" + s + "' draggable='false'/></div>"
			} else t += "<div class='file fileBox menufile " + _hover_title(e) + ">", t += "<div class='" + e.ext + " ico' filetype='" + e.ext + "'></div>";
			return void 0 != e.meta_info && (t += '<div class="' + e.meta_info + '"></div>'), t += "<div id='" + e.name + "' class='titleBox'><span class='title' title='" + LNG.double_click_rename + "'>" + a + "</span></div></div>"
		},
		_getFolderBoxList = function(e) {
			var t = e.name;
			"number" == typeof e.exists && 0 == e.exists && (t = '<b style="color:red;" class="file_not_exists">' + t + "</b>");
			var a = "<div class='file_list_cell'>";
			return void 0 != e.menuType ? (a += "<div class='file systemBox " + e.menuType + _hover_title(e) + ">", a += "<div class='ico " + e.tree_icon + "' filetype='folder'></div>") : (a += "<div class='file folderBox menufolder " + _hover_title(e) + ">", a += "<div class='folder ico' filetype='folder'></div>"), a += "	<div id='" + e.name + "' class='titleBox'><span class='title' title='" + LNG.double_click_rename + "'>" + t + "</span></div>", a += "	<div class='filetype'>" + LNG.folder + "</div>", a += "	<div class='filesize'></div>", a += "	<div class='filetime'>" + e.mtime + "</div>", void 0 != e.meta_info && (a += '<div class="' + e.meta_info + '"></div>'), a += "	<div style='clear:both'></div>", a += "</div><div style='clear:both'></div></div>"
		},
		_getFileBoxList = function(e) {
			var t = "<div class='file_list_cell'>",
				a = e.name;
			if ("number" == typeof e.exists && 0 == e.exists && (a = '<b style="color:red;" class="file_not_exists">' + a + "</b>"), "oexe" == e.ext) {
				var i = base64_encode(json_encode(e));
				t += "<div data-app='" + i + "' class='file fileBox menufile " + _hover_title(e) + ">", a = a.replace(".oexe", ""), "app_link" == e.type ? (t += 0 == e.content.search("ui.path.open") ? "<div class='" + core.pathExt(e.name.replace(".oexe", "")) + " ico'" : "<div class='folder ico'", t += ' filetype="oexe"></div><div class="app_link"></div>') : t += "<div class='oexe ico' filetype='oexe'></div>"
			} else if (inArray(core.filetype.image, e.ext)) {
				var n = core.path2url(e.path),
					o = "index.php?explorer/image&path=" + urlEncode(e.path);
				t += "<div picasa='" + n + "' thumb='" + o + "' class='picasaImage file fileBox menufile'" + _hover_title(e) + ">", t += "	<div class='" + e.ext + " ico' filetype='" + e.ext + "'></div>"
			} else t += "<div class='file fileBox menufile " + _hover_title(e) + ">", t += "	<div class='" + e.ext + " ico' filetype='" + e.ext + "'></div>";
			return t += "	<div id='" + e.name + "' class='titleBox'><span class='title' title='" + LNG.double_click_rename + "'>" + a + "</span></div>", t += "	<div class='filetype'>" + e.ext + "  " + LNG.file + "</div>", t += "	<div class='filesize'>" + core.file_size(e.size) + "</div>", t += "	<div class='filetime'>" + e.mtime + "</div>", void 0 != e.meta_info && (t += '<div class="' + e.meta_info + '"></div>'), t += "	<div style='clear:both'></div>", t += "</div><div style='clear:both'></div></div>"
		},
		_mainSetData = function(e) {
			G.json_data && G.json_data.filelist && G.json_data.folderlist || _mainSetDataShare();
			var t = "",
				a = G.json_data.folderlist,
				i = G.json_data.filelist;
			a = "size" == G.list_sort_field || "ext" == G.list_sort_field ? a.sort(_sortBy("name", G.list_sort_order)) : a.sort(_sortBy(G.list_sort_field, G.list_sort_order)), i = i.sort(_sortBy(G.list_sort_field, G.list_sort_order)), G.json_data.folderlist = a, G.json_data.filelist = i;
			var n = "",
				o = "";
			list_page_max = 1e5;
			var s = 0;
			if ("list" == G.list_type) {
				for (var r = 0; i.length > r && !(s >= list_page_max); r++) s++, n += _getFileBoxList(i[r]);
				for (var r = 0; a.length > r && !(s >= list_page_max); r++) s++, o += _getFolderBoxList(a[r])
			} else {
				for (var r = 0; i.length > r && !(s >= list_page_max); r++) s++, n += _getFileBox(i[r]);
				for (var r = 0; a.length > r && !(s >= list_page_max); r++) s++, o += _getFolderBox(a[r])
			}
			t = "up" == G.list_sort_order ? o + n : n + o, "" == t && (t = '<div style="text-align:center;color:#aaa;">' + LNG.path_null + "</div>"), t += "<div style='clear:both'></div>", e ? $(Config.FileBoxSelector).hide().html(t).fadeIn(Config.AnimateTime) : $(Config.FileBoxSelector).html(t), "list" == G.list_type && $(Config.FileBoxSelector + " .file_list_cell:nth-child(2n)").find(".file").addClass("file2"), list_header_resize.resize(), _ajaxLive()
		},
		_f5 = function(e, t, a) {
			if (void 0 == e && (e = !0), void 0 == t && (t = !1), _jsonSortTitle(), e) $.ajax({
				url: "index.php?explorer/pathList&path=" + urlEncode(G.this_path),
				dataType: "json",
				beforeSend: function() {
					$(".tools-left .msg").stop(!0, !0).fadeIn(100)
				},
				success: function(e) {
					if ($(".tools-left .msg").fadeOut(100), e) {
						if (!e.code) return core.tips.tips(e), $(Config.FileBoxSelector).html(""), !1;
						G.json_data = e.data, f5_jsondata_filter(), _mainSetData(t), ui.header.addressSet(), pathTypeChange(), "function" == typeof a && a(e)
					}
				},
				error: function(e, t, a) {
					$(".tools-left .msg").fadeOut(100), $(Config.FileBoxSelector).html(""), core.ajaxError(e, t, a)
				}
			});
			else {
				var i = fileLight.getAllName();
				_mainSetData(t), pathTypeChange(), ui.path.setSelectByFilename(i)
			}
		},
		_f5_callback = function(e) {
			_f5(!0, !1, e)
		},
		f5_jsondata_filter = function() {
			if (G.json_data) {
				void 0 != G.json_data.share_list && (G.self_share = G.json_data.share_list), G.json_data.this_path && (G.this_path = G.json_data.this_path);
				for (var e in G.json_data) if ("filelist" == e || "folderlist" == e) for (var t = 0; G.json_data[e].length > t; t++) {
					if (G.json_data[e][t].atime = date(LNG.time_type, G.json_data[e][t].atime), G.json_data[e][t].ctime = date(LNG.time_type, G.json_data[e][t].ctime), G.json_data.info.path_type == G.KOD_USER_SHARE && -1 == trim(G.this_path, "/").indexOf("/")) {
						var a = parseInt(G.json_data[e][t].num_view);
						a = isNaN(a) ? 0 : a;
						var i = parseInt(G.json_data[e][t].num_download);
						i = isNaN(i) ? 0 : i;
						var n = date("Y/m/d ", G.json_data[e][t].mtime) + "  ";
						n += LNG.share_view_num + a + "  " + LNG.share_download_num + i, G.json_data[e][t].mtime = n
					} else G.json_data[e][t].mtime = date(LNG.time_type, G.json_data[e][t].mtime);
					path_is_share(G.json_data[e][t].path) && (G.json_data[e][t].meta_info = "path_self_share")
				}
				"explorer" != Config.pageApp
			}
		},
		path_is_share = function(e) {
			for (var t in G.self_share) if (core.pathClear(G.self_share[t].path) == core.pathClear(e)) return !0;
			return !1
		},
		_toolsAction = function(e) {
			switch (e) {
			case "recycle_clear":
				ui.path.recycle_clear();
				break;
			case "newfile":
				ui.path.newFile();
				break;
			case "refresh":
				ui.f5();
				break;
			case "newfolder":
				ui.path.newFolder();
				break;
			case "upload":
				core.upload();
				break;
			case "set_icon":
				$("#set_icon").hasClass("active") || _setListType("icon");
				break;
			case "set_list":
				$("#set_list").hasClass("active") || _setListType("list");
				break;
			default:
			}
		},
		pathTypeChange = function() {
			var e = G.json_data.info,
				t = e.path_type,
				a = G.json_data.path_read_write,
				i = "menuBodyMain menuRecycleBody menuShareBody",
				n = "folderBox menufolder fileBox menufile",
				o = $(".html5_drag_upload_box");
			void 0 != a && "writeable" != a || t == G.KOD_USER_RECYCLE || t == G.KOD_USER_SHARE || t == G.KOD_GROUP_SHARE ? G.json_data.info.can_upload = !1 : (G.json_data.info.can_upload = !0, 1 != G.is_root && t == G.KOD_GROUP_PATH && "guest" == e.role && (G.json_data.info.can_upload = !1)), t == G.KOD_USER_RECYCLE ? (o.removeClass(i).addClass("menuRecycleBody"), $(".tools-left>.btn-group").addClass("hidden").parent().find(".kod_recycle_tool").removeClass("hidden"), $(".fileContiner .file").removeClass(n).addClass("menuRecyclePath")) : t == G.KOD_USER_SHARE ? -1 == core.pathClear(G.this_path).indexOf("/") ? (o.removeClass(i).addClass("menuShareBody"), $(".tools-left>.btn-group").addClass("hidden").parent().find(".kod_share_tool").removeClass("hidden"), $(".fileContiner .file").removeClass(n).addClass("menuSharePath"), e.id == G.user_id ? ($(".menuSharePathMenu").find(".open_the_path,.share_edit,.remove").removeClass("hidden"), $(".menuSharePathMore").find(".remove").removeClass("hidden")) : ($(".menuSharePathMenu").find(".open_the_path,.share_edit,.remove").addClass("hidden"), $(".menuSharePathMore").find(".remove").addClass("hidden"))) : (o.removeClass(i).addClass("menuBodyMain"), $(".tools-left>.btn-group").addClass("hidden").parent().find(".kod_path_tool").removeClass("hidden")) : (o.removeClass(i).addClass("menuBodyMain"), $(".tools-left>.btn-group").addClass("hidden").parent().find(".kod_path_tool").removeClass("hidden")), menuCurrentPath()
		},
		menuCurrentPath = function() {
			var e = G.json_data.info,
				t = G.json_data.path_read_write,
				a = e.path_type,
				i = ".createLink,.createProject,.cute,.remove,.rname,.zip,.unzip,.newfile,.newfolder,.newfileOther,.app_create,.app_install,.past,.upload,.clone",
				n = "#download,#rename,#cute,#remove,#zip,#past,#clone,#share,#rname,#createLink,.divider",
				o = "disable";
			if (e.can_upload ? ($("ul.menufolder,ul.menuMore,ul.menufile,ul.fileContiner_menu").find(i).removeClass(o), $(".path_tips").hide(), $(".kod_path_tool>button").removeClass("disabled"), $(".kod_path_tool").find(n).removeClass("hidden")) : ($(".kod_path_tool").find(n).addClass("hidden"), $(".kod_path_tool>button").addClass("disabled"), $("ul.menufolder,ul.menuMore,ul.menufile,ul.fileContiner_menu").find(i).addClass(o), $(".path_tips span").html(LNG.only_read), a == G.KOD_USER_RECYCLE || a == G.KOD_USER_SHARE ? ($(".path_tips").hide(), $(".kod_path_tool>button").removeClass("disabled"), a == G.KOD_USER_SHARE && G.user_id != e.id && $(".kod_path_tool>button").addClass("disabled")) : $(".path_tips").show()), (a == G.KOD_GROUP_PATH || a == G.KOD_GROUP_SHARE) && G.is_root || a == G.KOD_GROUP_PATH && "owner" == e.role) {
				var s = G.json_data.group_space_use;
				if (s) {
					var r = core.user_space_html(s.size_use + "/" + s.size_max);
					$(".group_space_use").removeClass("hidden").html(r)
				} else $(".group_space_use").addClass("hidden")
			} else $(".group_space_use").addClass("hidden");
			if (G.json_data.user_space) {
				var s = G.json_data.user_space,
					r = core.user_space_html(s.size_use + "/" + s.size_max);
				$(".user_space_info").html(r)
			}
			if ("not_exists" == t && ($(".path_tips span").html(LNG.not_exists), $(".path_tips").show()), a == G.KOD_USER_RECYCLE || a == G.KOD_USER_SHARE || a == G.KOD_GROUP_SHARE || a == G.KOD_GROUP_PATH ? $("ul.menufolder,ul.menuMore,ul.menufile,ul.fileContiner_menu").find(".share").addClass("hidden") : $("ul.menufolder,ul.menuMore,ul.menufile,ul.fileContiner_menu").find(".share").removeClass("hidden"), 1 == G.is_root && e.admin_real_path ? $(".admin_real_path").removeClass("hidden") : $(".admin_real_path").addClass("hidden"), "folder" == $.getUrlParam("path_select")) {
				var l = share.system_top();
				l.core.path_select_change($.getUrlParam("uuid_key"), G.this_path)
			}
		};
	return {
		f5: _f5,
		f5_callback: _f5_callback,
		picasa: MyPicasa,
		setListSort: _setListSort,
		setListType: _setListType,
		path_is_share: path_is_share,
		f5_jsondata_filter: f5_jsondata_filter,
		setTheme: function(e) {
			core.setSkin(e), FrameCall.top("OpenopenEditor", "Editor.setTheme", '"' + e + '"'), FrameCall.top("Opensetting_mode", "Setting.setThemeSelf", '"' + e + '"'), FrameCall.father("ui.setTheme", '"' + e + '"')
		},
		isEdit: function() {
			var e = $(document.activeElement).get(0);
			if (e) return e = e.tagName, "INPUT" == e || "TEXTAREA" == e ? !0 : !1
		},
		init: function() {
			_f5_callback(function() {
				ui.path.history.add(), _setListType(G.list_type, !0)
			}), _bindEventSort(), _bindEventTheme(), _bindEventTools(), _bindHotKey(), _menuActionBind(), ui.header.bindEvent(), $(window).bind("resize", function() {
				ui.setStyle(), ui.header.set_width(), "none" != $("#PicasaView").css("display") && MyPicasa.setFrameResize()
			}), $("html").bind("click", function() {
				rightMenu.hidden()
			}), Mousetrap.bind(["ctrl+s", "command+s"], function(e) {
				e.preventDefault(), FrameCall.top("OpenopenEditor", "Editor.save", "")
			});
			var e, t = 0,
				a = "",
				i = .2;
			Mousetrap.bind(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "`", "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+", "[", "{", "]", "}", "|", "/", "?", ".", ">", ",", "<", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"], function(n) {
				var o = String.fromCharCode(n.charCode);
				return 0 == t ? (t = time_float(), a = o, e = setTimeout(function() {
					ui.path.setSelectByChar(a), t = 0
				}, 1e3 * i), void 0) : o == a.substr(-1) ? (ui.path.setSelectByChar(a), t = 0, void 0) : (i > time_float() - t && (t = time_float(), a += o, clearTimeout(e), e = setTimeout(function() {
					ui.path.setSelectByChar(a), t = 0
				}, 1e3 * i)), void 0)
			}), Mousetrap.bind(["f5"], function(e) {
				stopPP(e), ui.f5(!0, !0)
			}), Mousetrap.bind(["ctrl+u", "command+u"], function(e) {
				stopPP(e), core.upload()
			}), Mousetrap.bind(["ctrl+e", "command+e"], function(e) {
				stopPP(e), ui.path.openEditor()
			}), Mousetrap.bind(["alt+i", "alt+i"], function(e) {
				stopPP(e), ui.path.info()
			}), Mousetrap.bind(["alt+n", "alt+n"], function(e) {
				stopPP(e), ui.path.newFile()
			}), Mousetrap.bind(["alt+m", "alt+m"], function(e) {
				stopPP(e), ui.path.newFolder()
			}), MyPicasa.init(".picasaImage"), MyPicasa.initData()
		},
		setStyle: function() {
			Global.fileRowNum = "list" == G.list_type ? 1 : function() {
				var e = $(Config.FileBoxSelector).width(),
					t = $sizeInt($(Config.FileBoxClass).css("width")) + $sizeInt($(Config.FileBoxClass).css("border-left-width")) + $sizeInt($(Config.FileBoxClass).css("border-right-width")) + $sizeInt($(Config.FileBoxClass).css("margin-right"));
				return parseInt(e / t)
			}()
		},
		header: {
			bindEvent: function() {
				$("#yarnball li a").die("click").live("click", function(e) {
					var t = $(this).attr("title");
					$("input.path").val(t), ui.header.gotoPath(), stopPP(e)
				}), $("#yarnball").die("click").live("click", function() {
					return $("#yarnball").css("display", "none"), $("#yarnball_input").css("display", "block"), $("#yarnball_input input").focus(), !0
				}), $("#yarnball_input input").die("blur").live("blur", function() {
					ui.header.gotoPath()
				}), $("#yarnball_input input").keyEnter(function() {
					ui.header.gotoPath()
				}), $(".header-right input").keyEnter(function() {
					core.search($(".header-right input").val(), G.this_path)
				}), $(".header-right input").bind("keyup focus", function() {
					ui.path.setSearchByStr($(this).val())
				}), $(".header-content a,.header-content button").click(function() {
					var e = $(this).attr("id");
					switch (e) {
					case "history_back":
						ui.path.history.back();
						break;
					case "history_next":
						ui.path.history.next();
						break;
					case "refresh":
						ui.f5(!0, !0), ui.tree.init();
						break;
					case "home":
						ui.path.list(G.myhome);
						break;
					case "fav":
						ui.path.pathOperate.fav({
							path: G.this_path,
							type: "folder",
							name: $("ul.yarnball li:last .title_name").html()
						});
						break;
					case "up":
						ui.header.gotoFather();
						break;
					case "setting":
						core.setting();
						break;
					case "search":
						core.search($(".header-right input").val(), G.this_path);
						break;
					default:
					}
					return !0
				})
			},
			addressSet: function() {
				var e = G.this_path;
				$("input.path").val(e), $("#yarnball_input").css("display", "none"), $("#yarnball").css("display", "block");
				var t = function(e) {
						var t = G.json_data.info,
							a = t.path_type,
							i = '<li class="yarnlet first"><a title="@1@" style="z-index:{$2};"><span class="left-yarn"></span>{$3}</a></li>\n',
							n = '<li class="yarnlet "><a title="@1@" style="z-index:{$2};">{$3}</a></li>\n';
						e = e.replace(/\/+/g, "/");
						var o = e.split("/");
						"" == o[o.length - 1] && o.pop();
						var s = o[0] + "/",
							r = i.replace(/@1@/g, s),
							l = o[0],
							c = "";
						"" != o[0] && (a == G.KOD_USER_SHARE ? G.user_id == t.id ? (c = '<span class="address_ico userSelf"></span>', l = LNG.my_share) : (c = '<span class="address_ico user"></span>', l = t.name) : a == G.KOD_GROUP_PATH ? (c = "owner" == t.role ? '<span class="address_ico groupSelfOwner"></span>' : '<span class="address_ico groupSelf"></span>', l = t.name) : a == G.KOD_GROUP_SHARE ? (c = '<span class="address_ico groupGuest"></span>', l = t.name) : a == G.KOD_USER_RECYCLE && (c = '<span class="address_ico recycle"></span>', l = LNG.recycle)), r = r.replace("{$2}", o.length), r = r.replace("{$3}", c + '<span class="title_name">' + l + "</span>");
						for (var d = r, p = 1, u = o.length - 1; o.length > p; p++, u--) s += o[p] + "/", r = n.replace(/@1@/g, s), r = r.replace("{$2}", u), r = r.replace("{$3}", '<span class="title_name">' + o[p] + "</span>"), d += r;
						return '<ul class="yarnball">' + d + "</ul>"
					};
				$("#yarnball").html(t(e)), ui.header.set_width()
			},
			set_width: function() {
				$(".yarnball").stop(!0, !0);
				var e = $("#yarnball").innerWidth(),
					t = 0;
				$("#yarnball li a").each(function() {
					t += $(this).outerWidth() + parseInt($(this).css("margin-left")) + 5
				});
				var a = e - t;
				0 >= a ? $(".yarnball").css("width", t + "px").css("left", a + "px") : $(".yarnball").css({
					left: "3px",
					width: e + "px"
				})
			},
			gotoPath: function() {
				var e = rtrim(core.pathClear($("input.path").val())) + "/";
				$("input.path").val(e), ui.path.list(e), ui.header.addressSet()
			},
			gotoFather: function() {
				var e = rtrim(core.pathClear($("input.path").val()));
				if ("/" == e || -1 == e.indexOf("/")) return core.tips.tips(LNG.path_is_root_tips, "warning"), void 0;
				var t = core.pathFather(e);
				$("input.path").val(t), ui.header.gotoPath()
			}
		}
	}
}), define("app/src/explorer/fileSelect", [], function() {
	var e = !1,
		t = !1,
		a = !1,
		i = function() {
			o(), n(), s()
		},
		n = function() {
			$(Config.FileBoxClass).die("touchstart").live("touchstart", function() {
				$(this).hasClass("select") ? ui.path.open() : (d.clear(), $(this).removeClass("select"), $(this).addClass("select"), d.select())
			}), $(Config.FileBoxClass).live("mouseenter", function() {
				t && $(this).hasClass(Config.TypeFolderClass) && !$(this).hasClass(Config.SelectClassName) && $(this).addClass("selectDragTemp"), e || t || $(this).addClass(Config.HoverClassName), $(this).unbind("mousedown").mousedown(function(e) {
					if ($(this).focus(), rightMenu.hidden(), e.ctrlKey || e.metaKey || e.shiftKey || $(this).hasClass(Config.SelectClassName) || (d.clear(), $(this).addClass(Config.SelectClassName), d.select()), 3 != e.which || $(this).hasClass(Config.SelectClassName) || (d.clear(), $(this).addClass(Config.SelectClassName), d.select()), (e.ctrlKey || e.metaKey) && ($(this).hasClass(Config.SelectClassName) ? a = !0 : (d.setMenu($(this)), $(this).addClass(Config.SelectClassName)), d.select()), e.shiftKey) {
						var t = parseInt($(this).attr(Config.FileOrderAttr));
						if (0 == Global.fileListSelectNum) c(0, t);
						else {
							var i = parseInt(Global.fileListSelect.first().attr(Config.FileOrderAttr)),
								n = parseInt(Global.fileListSelect.last().attr(Config.FileOrderAttr));
							i > t ? c(t, i) : t > n ? c(n, t) : t > i && n > t && c(i, t)
						}
					}
				})
			}).die("mouseleave").live("mouseleave", function() {
				$(this).removeClass(Config.HoverClassName), $(".draggable-dragging").length > 0 && $(this).removeClass("selectDragTemp")
			}).die("click").live("click", function(e) {
				if ($("iframe").blur(), stopPP(e), $(".draggable-dragging").length > 0) return !1;
				if (e.ctrlKey || e.metaKey || e.shiftKey)(e.ctrlKey || e.metaKey) && a && (a = !1, d.resumeMenu($(this)), $(this).removeClass(Config.SelectClassName), d.select());
				else {
					d.clear(), $(this).addClass(Config.SelectClassName), d.select();
					var t = $(this).data("last_time");
					void 0 != t && .8 > time_float() - t && $(this).hasClass(Config.SelectClassName) && !$(e.target).hasClass("title") && !$(e.target).is("textarea") && !$(e.target).is("input") && (e.altKey ? ui.path.info() : ui.path.open()), $(this).data("last_time", time_float())
				}
			}), $(Config.FileBoxTittleClass).die("dblclick").live("dblclick", function(e) {
				return $(e.target).is("textarea") || $(e.target).is("input") ? void 0 : (ui.path.rname(), stopPP(e), !1)
			})
		},
		o = function() {
			var a, i, n, o = 100,
				s = 30,
				r = 0,
				l = !1,
				c = 50,
				p = 50,
				u = 0,
				f = 0;
			$(Config.FileBoxClass).die("mousedown").live("mousedown", function(t) {
				if (!Global.shiftKey) {
					if (ui.isEdit()) return !0;
					if (1 != t.which || e) return !0;
					a = $(this), h(t), this.setCapture && this.setCapture(), $(document).mousemove(function(e) {
						m(e)
					}), $(document).one("mouseup", function(e) {
						_(e), this.releaseCapture && this.releaseCapture()
					})
				}
			});
			var h = function(e) {
					rightMenu.hidden(), t = !0, r = $.now(), u = e.pageY, f = e.pageX, i = $(document).height(), n = $(document).width()
				},
				m = function(e) {
					if (!t) return !0;
					window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(), $.now() - r > o && !l && v();
					var a = e.clientX >= n - 50 ? n - 50 : e.clientX,
						s = e.clientY >= i - 50 ? i - 50 : e.clientY;
					a = 0 >= a ? 0 : a, s = 0 >= s ? 0 : s, a -= c, s -= p, $(".draggable-dragging").css({
						left: a,
						top: s
					}), $.browser.msie && $("." + Config.TypeFolderClass).each(function() {
						var t = e.pageX,
							a = e.pageY,
							i = $(this).offset(),
							n = $(this).width(),
							o = $(this).height();
						t > i.left && i.left + n > t && a > i.top && i.top + o > a ? $(this).addClass("selectDragTemp") : $(this).removeClass("selectDragTemp")
					})
				},
				_ = function(e) {
					if (!t) return !1;
					t = !1, l = !1, $("body").css("cursor", "auto"), $(".draggable-dragging").fadeOut(200, function() {
						$(this).remove()
					});
					var a = G.this_path,
						i = 0 == $(".selectDragTemp").length;
					Global.ctrlKey ? (i || (a = d.path($(".selectDragTemp"))), (Math.abs(e.pageX - f) > s || Math.abs(e.pageY - u) > s) && ui.path.copyDrag(a, i)) : i || (a = d.path($(".selectDragTemp")), ui.path.cuteDrag(a))
				},
				v = function() {
					l = !0, $("body").css("cursor", "move"), a.find(".ico").attr("filetype"), $('<div class="file draggable-dragging"><div class="drag_number">' + Global.fileListSelectNum + "</div>" + '<div class="ico" style="background:' + a.find(".ico").css("background") + '"></div>' + "</div>").appendTo("body")
				}
		},
		s = function() {
			var a = null,
				i = null,
				n = null,
				o = 0,
				s = 0,
				r = 0,
				l = 0,
				c = 0,
				p = 0;
			$(Config.BodyContent).die("mousedown").live("mousedown", function(e) {
				if (!($(e.target).hasClass("bodymain") && 20 > $(document).width() - e.pageX)) {
					if (c = $(".fileContiner").outerHeight(), p = $(".bodymain").outerHeight(), ui.isEdit()) return !0;
					if (1 != e.which || t) return !0;
					u(e), this.setCapture && this.setCapture(), $(document).unbind("mousemove").mousemove(function(e) {
						f(e)
					}), $(document).one("mouseup", function(e) {
						h(e), this.releaseCapture && this.releaseCapture()
					})
				}
			});
			var u = function(t) {
					o = $(".bodymain").offset().left, s = $(".bodymain").offset().top, r = $(Config.BodyContent).scrollTop(), l = s - r, $(t.target).parent().hasClass(Config.FileBoxClassName) || $(t.target).parent().parent().hasClass(Config.FileBoxClassName) || $(t.target).hasClass("fix") || (rightMenu.hidden(), t.ctrlKey || t.metaKey || t.shiftKey || d.clear(), 0 == $(t.target).hasClass("ico") && (0 == $("#selContainer").length && ($('<div id="selContainer"></div>').appendTo(Config.FileBoxSelector), n = $("#selContainer")), a = t.pageX - o, i = t.pageY + $(Config.BodyContent).scrollTop() - s, e = !0))
				},
				f = function(t) {
					if (!e) return !0;
					"none" == n.css("display") && n.css("display", "");
					var s = $(Config.BodyContent).scrollTop() - r,
						u = t.pageX - o,
						f = t.pageY - l + s,
						h = Math.abs(u - a),
						m = Math.abs(f - i);
					f > i && m > c - i && c > p && (m = c - i), n.css({
						left: Math.min(u, a),
						top: Math.min(f, i),
						width: h,
						height: m
					});
					for (var _ = n.offset().left - o, v = n.offset().top - l + s, g = n.width(), b = n.height(), y = 0; Global.fileListNum > y; y++) {
						var w = Global.fileListAll[y],
							x = $(Global.fileListAll[y]),
							k = w.offsetWidth + w.offsetLeft,
							G = w.offsetHeight + w.offsetTop;
						if (k > _ && G > v && _ + g > w.offsetLeft && v + b > w.offsetTop) {
							if (!x.hasClass("selectDragTemp")) {
								if (x.hasClass("selectToggleClass")) continue;
								if (x.hasClass(Config.SelectClassName)) {
									x.removeClass(Config.SelectClassName).addClass("selectToggleClass"), d.resumeMenu(x);
									continue
								}
								x.addClass("selectDragTemp")
							}
						} else x.removeClass("selectDragTemp"), x.hasClass("selectToggleClass") && x.addClass(Config.SelectClassName).removeClass("selectToggleClass")
					}
				},
				h = function() {
					return e ? (n.css("display", "none"), $(".selectDragTemp").addClass(Config.SelectClassName).removeClass("selectDragTemp"), $(".selectToggleClass").removeClass("selectToggleClass"), d.select(), e = !1, a = null, i = null, void 0) : !1
				}
		},
		r = function(e) {
			var t = 0,
				a = Global.fileListSelect;
			Global.fileListSelectNum;
			var i = Global.fileListNum,
				n = function() {
					if (1 == Global.fileListSelectNum) {
						var n = parseInt(a.attr(Config.FileOrderAttr));
						switch (e) {
						case "up":
						case "left":
							t = 0 >= n ? n : n - 1;
							break;
						case "down":
						case "right":
							t = n >= i - 1 ? n : n + 1;
							break;
						default:
						}
					} else if (Global.fileListSelectNum > 1) {
						var o = parseInt(a.first().attr(Config.FileOrderAttr)),
							s = parseInt(a.last().attr(Config.FileOrderAttr));
						switch (e) {
						case "up":
						case "left":
							t = 0 >= o ? o : o - 1;
							break;
						case "down":
						case "right":
							t = s >= i ? s : s + 1;
							break;
						default:
						}
					}
				},
				o = function() {
					var n = Global.fileRowNum;
					if (1 == Global.fileListSelectNum) {
						var o = parseInt(a.attr(Config.FileOrderAttr));
						switch (e) {
						case "up":
							t = n > o ? 0 : o - n;
							break;
						case "left":
							t = 0 >= o ? o : o - 1;
							break;
						case "down":
							t = o + n >= i - 1 ? i - 1 : o + n;
							break;
						case "right":
							t = o >= i - 1 ? o : o + 1;
							break;
						default:
						}
					} else if (Global.fileListSelectNum > 1) {
						var s = parseInt(a.first().attr(Config.FileOrderAttr)),
							r = parseInt(a.last().attr(Config.FileOrderAttr));
						switch (e) {
						case "up":
							t = n >= s ? s : s - n;
							break;
						case "left":
							t = 0 >= s ? s : s - 1;
							break;
						case "down":
							t = r + n >= i ? r : r + n;
							break;
						case "right":
							t = r >= i ? r : r + 1;
							break;
						default:
						}
					}
				};
			return "list" == G.list_type ? n() : o(), Global.fileListAll.eq(t)
		},
		l = function(e) {
			var t;
			switch (e) {
			case "home":
				t = Global.fileListAll.first();
				break;
			case "end":
				t = Global.fileListAll.last();
				break;
			case "left":
			case "up":
			case "right":
			case "down":
				t = r(e);
				break;
			case "all":
				t = Global.fileListAll;
				break;
			default:
			}
			d.clear(), t.addClass(Config.SelectClassName), d.select(), d.setInView()
		},
		c = function(e, t) {
			d.clear();
			for (var a = e; t >= a; a++) $(Global.fileListAll[a]).addClass(Config.SelectClassName);
			d.select()
		},
		d = {
			init: function() {
				var e = $(Config.FileBoxClass);
				e.each(function(e) {
					$(this).attr(Config.FileOrderAttr, e)
				}), Global.fileListSelect = "", Global.fileListAll = e, Global.fileListNum = e.length, Global.fileListSelectNum = 0, d.menuAction("clear")
			},
			select: function() {
				var e = $(Config.SelectClass);
				if (Global.fileListSelect = e, Global.fileListSelectNum = e.length, e.length > 1 && d.setMenu(e), "file" == $.getUrlParam("path_select") && 1 == e.length) {
					var t = $(Global.fileListSelect[0]);
					if (t.hasClass("fileBox")) {
						var a = share.system_top();
						a.core.path_select_change($.getUrlParam("uuid_key"), t.attr("data-path"))
					}
				}
				d.menuAction("menufile")
			},
			setInView: function() {
				var e = Global.fileListSelect;
				if (e && e.length >= 1) {
					var t = $(".bodymain"),
						a = $(e[e.length - 1]);
					t.scrollTop(a.offset().top - t.offset().top - t.height() / 2 + t.scrollTop())
				}
			},
			name: function(e) {
				return e.attr("data-name")
			},
			path: function(e) {
				return e.attr("data-path")
			},
			type: function(e) {
				return e.find(".ico").attr("filetype")
			},
			setMenu: function(e) {
				if (G.json_data.info.path_type != G.KOD_USER_RECYCLE) {
					if (G.json_data.info.path_type == G.KOD_USER_SHARE) return e.removeClass("menuSharePath").addClass("menuSharePathMore"), void 0;
					e.removeClass("menufile menufolder").addClass("menuMore"), d.menuAction()
				}
			},
			resumeMenu: function(e) {
				var t = {
					fileBox: "menufile",
					folderBox: "menufolder",
					menuRecyclePath: "menuRecyclePath",
					menuSharePathMore: "menuSharePath",
					systemBox: "menuDefault"
				};
				e.removeClass("menuMore");
				for (var a in t) e.hasClass(a) && e.addClass(t[a]);
				d.menuAction()
			},
			getAllName: function() {
				var e = [];
				if (0 != Global.fileListSelectNum) {
					var t = Global.fileListSelect;
					return t.each(function(t) {
						e[t] = d.name($(this))
					}), e
				}
			},
			clear: function() {
				if (0 != Global.fileListSelectNum) {
					var e = Global.fileListSelect;
					e.removeClass(Config.SelectClassName), e.each(function() {
						d.resumeMenu($(this))
					}), Global.fileListSelect = "", Global.fileListSelectNum = 0, d.menuAction()
				}
			},
			menuAction: function() {
				0 == Global.fileListSelectNum ? ($(".drop-menu-action li").addClass("disabled"), $(".drop-menu-action #past").removeClass("disabled"), $(".drop-menu-action #info").removeClass("disabled")) : Global.fileListSelectNum > 1 ? ($(".drop-menu-action li").removeClass("disabled"), $(".drop-menu-action").find("#open,#rname,#past,#share,#createLink,#add_to_fav").addClass("disabled")) : ($(".drop-menu-action li").removeClass("disabled"), $(".drop-menu-action").find("#open,#rname,#past,#share,#createLink,#add_to_fav").removeClass("disabled"))
			}
		};
	return {
		init: i,
		selectPos: l,
		fileLight: d
	}
}), define("app/common/taskTap", [], function() {
	var e = {},
		t = "",
		a = 160,
		i = function() {
			$(".task_tab .tab").die("mouseenter").live("mouseenter", function() {
				$(this).hasClass("this") || $(this).addClass("hover")
			}).die("mouseleave").live("mouseleave", function() {
				$(this).removeClass("hover")
			})
		},
		n = function(e) {
			var t = e.attr("id"),
				a = art.dialog.list[t];
			if (void 0 == a) return c(t), void 0;
			var i = $("." + t);
			"hidden" == i.css("visibility") ? a.display(!0).zIndex() : i.hasClass("aui_state_focus") ? a.display(!1) : a.zIndex()
		},
		o = function() {
			var e, t, i, o, s = !1,
				r = !1,
				l = 0,
				c = 0,
				d = 0,
				p = 0,
				u = 0,
				f = 0;
			$(".task_tab .tab").die("mousedown").live("mousedown", function(t) {
				1 == t.which && (e = $(this), h(t), this.setCapture && this.setCapture(), $(document).mousemove(function(e) {
					m(e)
				}), $(document).one("mouseup", function(t) {
					v(), this.releaseCapture && this.releaseCapture(), 10 > Math.abs(t.pageX - l) && n(e)
				}))
			});
			var h = function(a) {
					s = !0, r = !0, l = a.pageX, $tab_parent = $(".task_tab"), t = $(".task_tab .tab"), $(".tasktab-dragging").remove(), i = e.clone().addClass("tasktab-dragging").prependTo("body"), p = $sizeInt(t.css("margin-right")), u = $tab_parent.width(), f = $tab_parent.get(0).getBoundingClientRect().left, f += $(window).scrollLeft(), c = e.get(0).getBoundingClientRect().left, d = $sizeInt(t.css("width"));
					var n = e.get(0).getBoundingClientRect().top - $sizeInt(e.css("margin-top")),
						o = a.clientX - l + c;
					$("body").prepend("<div class='dragMaskView'></div>"), i.css({
						width: d + "px",
						top: n,
						left: o
					}), e.css("opacity", 0)
				},
				m = function(a) {
					if (r) {
						window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(), 0 == s && h(a);
						var n = a.clientX - l + c;
						f > n || n > f + u - d || (i.css("left", n), t.each(function() {
							var t = $(this).get(0).getBoundingClientRect().left;
							if (n > t && t + d / 2 + p > n) {
								if (e.attr("id") == $(this).attr("id")) return;
								_($(this).attr("id"), "left")
							}
							if (n > t - d / 2 + p && t > n) {
								if (e.attr("id") == $(this).attr("id")) return;
								_($(this).attr("id"), "right")
							}
						}))
					}
				},
				_ = function(i, n) {
					if (!e.is(":animated") || o != i) {
						o = i, e.stop(!0, !0), $(".insertTemp").remove(), t = $(".task_tab .tab");
						var s = e.width(),
							r = $(".task_tab #" + i),
							l = e.clone(!0).insertAfter(e).css({
								"margin-right": "0px",
								border: "none"
							}).addClass("insertTemp");
						"left" == n ? e.after(r).css("width", "0px") : (e.before(r).css("width", "0px"), r.before(l)), e.animate({
							width: s + "px"
						}, a), l.animate({
							width: "0px"
						}, a, function() {
							$(this).remove(), t = $(".task_tab .tab")
						})
					}
				},
				v = function() {
					r = !1, s = !1, startTime = 0, $(".dragMaskView").remove(), void 0 != i && (c = e.get(0).getBoundingClientRect().left, i.animate({
						left: c + "px"
					}, a, function() {
						e.css("opacity", 1), $(this).remove()
					}))
				}
		},
		s = function(e) {
			var t = 110,
				i = t,
				n = t + 12,
				o = $(".task_tab .tab"),
				s = $(".task_tab .tabs").width() - 10,
				r = o.length,
				l = Math.floor(s / n);
			switch (r > l && (i = Math.floor(s / r) - 12), e) {
			case "add":
				$(".task_tab .tabs .this").css("width", "0").animate({
					width: i + "px"
				}, a);
			case "close":
				o.animate({
					width: i + "px"
				}, a);
				break;
			case "resize":
				o.css("width", i + "px");
				break;
			default:
			}
		},
		r = function(t, a) {
			$(".task_tab").removeClass("hidden");
			var i = a.replace(/<[^>]+>/g, ""),
				n = '<div class="tab taskBarMenu" id="' + t + '" title="' + i + '">' + a + "</div>";
			$(n).insertBefore(".task_tab .last"), s("add"), e[t] = {
				id: t,
				name: name
			}
		},
		l = function(e) {
			$(".task_tab .this").removeClass("this"), $(".task_tab #" + e).addClass("this"), t = e
		},
		c = function(t) {
			$(".task_tab #" + t).animate({
				width: 0
			}, a, function() {
				if ($(".task_tab #" + t).remove(), s("close"), 0 == $(".tabs .tab").length && "desktop" != Config.pageApp) {
					var e = 31;
					$(".task_tab").animate({
						bottom: "-" + e + "px"
					}, 200, 0, function() {
						$(this).css({
							bottom: "0px"
						}).addClass("hidden")
					})
				}
			}), delete e[t]
		},
		d = function() {
			$('<i class="dialog_menu"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: ".dialog_menu",
				items: {
					quit_dialog: {
						name: LNG.close,
						className: "quit_dialog",
						icon: "remove",
						accesskey: "q"
					},
					hide_dialog: {
						name: LNG.dialog_min,
						className: "hide_dialog",
						icon: "minus",
						accesskey: "h"
					},
					refresh: {
						name: LNG.refresh,
						className: "refresh",
						icon: "refresh",
						accesskey: "r"
					},
					open_window: {
						name: LNG.open_ie,
						className: "open_window",
						icon: "globe",
						accesskey: "b"
					},
					qrcode: {
						name: LNG.qrcode,
						className: "qrcode line_top",
						icon: "qrcode",
						accesskey: "c"
					}
				},
				callback: function(e, t) {
					var a = t.$trigger.attr("id"),
						i = art.dialog.list[a];
					switch (e) {
					case "quit_dialog":
						i.close();
						break;
					case "hide_dialog":
						i.display(!1);
						break;
					case "refresh":
						i.refresh();
						break;
					case "open_window":
						i.open_window();
						break;
					case "qrcode":
						core.qrcode(i.DOM.wrap.find("iframe").attr("src"));
						break;
					default:
					}
				}
			})
		},
		p = function() {
			$('<i class="taskBarMenu"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: ".taskBarMenu",
				items: {
					quitOthers: {
						name: LNG.close_others,
						className: "quitOthers",
						icon: "remove-circle",
						accesskey: "o"
					},
					quit: {
						name: LNG.close,
						className: "quit",
						icon: "remove",
						accesskey: "q"
					}
				},
				callback: function(e, t) {
					var a = t.$trigger.attr("id"),
						i = art.dialog.list[a];
					switch (e) {
					case "quitOthers":
						$.each(art.dialog.list, function(e, t) {
							a != e && t.close()
						});
						break;
					case "quit":
						i.close()
					}
				}
			})
		},
		u = function() {
			$.contextMenu({
				zIndex: 9999,
				selector: ".task_tab",
				items: {
					closeAll: {
						name: LNG.dialog_close_all,
						icon: "remove-circle",
						accesskey: "q"
					},
					showAll: {
						name: LNG.dialog_display_all,
						icon: "th-large",
						accesskey: "s"
					},
					hideAll: {
						name: LNG.dialog_min_all,
						icon: "remove",
						accesskey: "h"
					}
				},
				callback: function(e, t) {
					var a = t.$trigger.attr("id");
					switch (art.dialog.list[a], e) {
					case "showAll":
						$.each(art.dialog.list, function(e, t) {
							t.display(!0)
						});
						break;
					case "hideAll":
						$.each(art.dialog.list, function(e, t) {
							t.display(!1)
						});
						break;
					case "closeAll":
						$.each(art.dialog.list, function(e, t) {
							t.close()
						});
						break;
					default:
					}
				}
			})
		};
	return {
		add: r,
		focus: l,
		close: c,
		init: function() {
			var e = '<div class="task_tab"><div class="tabs"><div class="last" style="clear:both;"></div></div></div>';
			$(e).appendTo("body"), "desktop" != Config.pageApp && $(".task_tab").addClass("hidden"), $(window).bind("resize", function() {
				s("resize")
			}), i(), d(), p(), u(), o()
		}
	}
}), define("app/common/core", [], function(require, exports) {
	loadRipple(["a", "button", "label", ".context-menu-item", "#picker"]), $("a,img").attr("draggable", "false"), $(document).bind("mouseup", function() {
		window.focus()
	});
	var init_first = function() {
			window.require = require, core.update(), "undefined" != typeof G && (1 != G.is_root && $(".menu_system_setting").remove(), G.is_root || 1 == AUTH["system_member:get"] || 1 == AUTH["system_group:get"] || $(".menu_system_group").remove())
		};
	return {
		init: init_first,
		filetype: {
			image: ["jpg", "jpeg", "png", "bmp", "gif", "ico"],
			music: ["mp3", "wma", "wav", "mid", "m4a", "aac", "midi"],
			movie: ["avi", "flv", "f4v", "wmv", "3gp", "mp4", "wmv", "asf", "m4v", "mov", "mpg"],
			doc: ["doc", "docx", "docm", "xls", "xlsx", "xlsb", "xlsm", "ppt", "pptx", "pptm"],
			text: ["oexe", "inc", "inf", "csv", "log", "asc", "tsv", "lnk", "url", "webloc", "meta"],
			code: ["abap", "abc", "as", "ada", "adb", "htgroups", "htpasswd", "conf", "htaccess", "htgroups", "htpasswd", "asciidoc", "asm", "ahk", "bat", "cmd", "c9search_results", "cpp", "c", "cc", "cxx", "h", "hh", "hpp", "cirru", "cr", "clj", "cljs", "CBL", "COB", "coffee", "cf", "cson", "Cakefile", "cfm", "cs", "css", "curly", "d", "di", "dart", "diff", "patch", "Dockerfile", "dot", "dummy", "dummy", "e", "ejs", "ex", "exs", "elm", "erl", "hrl", "frt", "fs", "ldr", "ftl", "gcode", "feature", "gitignore", "glsl", "frag", "vert", "go", "groovy", "haml", "hbs", "handlebars", "tpl", "mustache", "hs", "hx", "html", "htm", "xhtml", "erb", "rhtml", "ini", "strings", "cfg", "prefs", "io", "jack", "jade", "java", "js", "jsm", "json", "jq", "jsp", "jsx", "jl", "tex", "latex", "ltx", "bib", "lean", "hlean", "less", "liquid", "lisp", "ls", "logic", "lql", "lsl", "lua", "lp", "lucene", "Makefile", "makefile", "GNUmakefile", "makefile", "OCamlMakefile", "make", "md", "rst", "markdown", "mask", "matlab", "mel", "mc", "mush", "mysql", "nix", "m", "mm", "ml", "mli", "pas", "p", "pl", "pm", "pgsql", "php", "phtml", "ps1", "praat", "praatscript", "psc", "proc", "plg", "prolog", "properties", "proto", "py", "r", "Rd", "Rhtml", "rb", "ru", "gemspec", "rake", "Guardfile", "Rakefile", "Gemfile", "rs", "sass", "scad", "scala", "scm", "rkt", "scss", "sh", "bash", "bashrc", "sjs", "smarty", "tpl", "snippets", "soy", "space", "sql", "styl", "stylus", "svg", "tcl", "tex", "txt", "textile", "toml", "twig", "ts", "typescript", "str", "vala", "vbs", "vb", "vm", "v", "vh", "sv", "svh", "vhd", "vhdl", "xml", "rdf", "rss", "wsdl", "xslt", "atom", "mathml", "mml", "xul", "xbl", "xaml", "xq", "yaml", "yml", "htm", "xib", "xsd", "storyboard", "plist", "csproj", "pch", "pbxproj", "local", "xcscheme"],
			bindary: ["pdf", "bin", "zip", "swf", "gzip", "rar", "arj", "tar", "gz", "cab", "tbz", "tbz2", "lzh", "uue", "bz2", "ace", "exe", "so", "dll", "chm", "rtf", "odp", "odt", "pages", "class", "psd", "ttf", "fla", "7z", "dmg", "iso", "dat", "ipa", "lib", "a", "apk", "so", "o"]
		},
		ico: function(e) {
			var t = ["edit", "search", "upload", "setting", "appStore", "error", "info"],
				a = ["folder", "file", "mp3", "flv", "pdf", "doc", "xls", "ppt", "html", "swf", "php", "js", "zip", "rar", "txt", "jpg"];
			return $.inArray(e, t) >= 0 ? G.static_path + "images/file_icon/icon_others/" + e + ".png" : $.inArray(e, a) >= 0 ? G.static_path + "images/file_icon/file_16/" + e + ".png" : G.static_path + "images/file_icon/file_16/file.png"
		},
		contextmenu: function(e) {
			try {
				rightMenu.hidden()
			} catch (t) {}
			var t = e || window.event;
			return t ? t && $(t.target).is("textarea") || $(t.target).is("input") || $(t.target).is("p") || $(t.target).is("pre") || 0 != $(t.target).parents(".can_right_menu").length || 0 != $(t.target).parents(".topbar").length || 0 != $(t.target).parents(".edit_body").length || 0 != $(t.target).parents(".aui_state_focus").length ? !0 : !1 : !0
		},
		pathThis: function(e) {
			if (!e || "/" == e) return "";
			e = e = this.pathClear(e);
			var t = e.lastIndexOf("/"),
				a = e.substr(t + 1);
			if (0 == a.search("fileProxy")) {
				a = urlDecode(a.substr(a.search("&path=")));
				var i = a.split("/");
				a = i[i.length - 1], "" == a && (a = i[i.length - 2])
			}
			return a
		},
		pathClear: function(e) {
			return e = e.replace(/\\/g, "/"), e = rtrim(e, "/"), e = e.replace(/\/+/g, "/")
		},
		pathFather: function(e) {
			e = this.pathClear(e);
			var t = e.lastIndexOf("/");
			return e.substr(0, t + 1)
		},
		pathExt: function(e) {
			e = e.replace(/\\/g, "/"), e = e.replace(/\/+/g, "/");
			var t = e.lastIndexOf(".");
			return e = e.substr(t + 1), e.toLowerCase()
		},
		path2url: function(e) {
			if ("http" == e.substr(0, 4)) return e;
			if (e = e.replace(/\\/g, "/"), e = rtrim(e, "/"), e = e.replace(/\/+/g, "/"), e = e.replace(/\/\.*\//g, "/"), G.is_root && e.substring(0, G.web_root.length) == G.web_root) return G.web_host + e.replace(G.web_root, "");
			var t = G.app_host + "/index.php?explorer/fileProxy&path=" + urlEncode(e);
			return G.share_page !== void 0 && (t = G.app_host + "/index.php?share/fileProxy&user=" + G.user + "&sid=" + G.sid + "&path=" + urlEncode(e)), t
		},
		path_can_read: function(e) {
			if ("object" != typeof G.json_data) return !0;
			var t;
			t = G.json_data.filelist;
			for (var a = 0; t.length > a; a++) if (t[a].path == e) return void 0 == t[a].is_readable || 1 == t[a].is_readable ? !0 : !1;
			t = G.json_data.folderlist;
			for (var a = 0; t.length > a; a++) if (t[a].path == e) return void 0 == t[a].is_readable || 1 == t[a].is_readable ? !0 : !1;
			return !0
		},
		authCheck: function(e, t) {
			return G.is_root ? !0 : AUTH.hasOwnProperty(e) ? AUTH[e] ? !0 : (void 0 == t && (t = LNG.no_permission), core.tips.tips(t, !1), !1) : !0
		},
		ajaxError: function(e) {
			core.tips.close(LNG.system_error, !1);
			var t = e.responseText,
				a = '<div class="ajaxError">' + t + "</div>",
				i = $.dialog.list.ajaxErrorDialog;
			return "<!--user login-->" == t.substr(0, 17) ? (FrameCall.goRefresh(), void 0) : (i ? i.content(a) : $.dialog({
				id: "ajaxErrorDialog",
				padding: 0,
				width: "60%",
				height: "50%",
				fixed: !0,
				resize: !0,
				ico: core.ico("error"),
				title: "ajax error",
				content: a
			}), void 0)
		},
		file_get: function(e, t) {
			var a = "./index.php?editor/fileGet&filename=" + urlEncode2(e);
			G.share_page !== void 0 && (a = "./index.php?share/fileGet&user=" + G.user + "&sid=" + G.sid + "&filename=" + urlEncode2(e)), $.ajax({
				url: a,
				dataType: "json",
				beforeSend: function() {
					core.tips.loading(LNG.loading)
				},
				error: core.ajaxError,
				success: function(e) {
					core.tips.close(LNG.success), "function" == typeof t && t(e.data.content)
				}
			})
		},
		path_select: function(e, t, a) {
			var i = UUID(),
				n = "./index.php?/explorer&type=iframe&path_select=" + e + "&uuid_key=" + i,
				o = $.dialog.open(n, {
					id: i,
					resize: !0,
					fixed: !0,
					ico: core.ico("folder"),
					title: t,
					width: 840,
					height: 420,
					ok: function() {
						if ("function" == typeof a) {
							var e = o.DOM.wrap,
								t = e.find(".path_select_input").val();
							t && a(t)
						}
					},
					cancel: !0
				}),
				s = o.DOM.wrap;
			s.find(".aui_buttons").css("padding", "15px"), $('<input type="text" class="path_select_input"/>').insertBefore(s.find(".aui_state_highlight"))
		},
		path_select_change: function(e, t) {
			var a = $("." + e).find(".path_select_input");
			a.val(t).textFocus()
		},
		setting: function(e) {
			void 0 == e && (e = G.is_root ? "system" : "user");
			var t = share.system_top();
			void 0 == t.frames.Opensetting_mode ? $.dialog.open("./index.php?setting#" + e, {
				id: "setting_mode",
				fixed: !0,
				ico: core.ico("setting"),
				resize: !0,
				title: LNG.setting,
				width: 960,
				height: 600
			}) : ($.dialog.list.setting_mode.display(!0), FrameCall.top("Opensetting_mode", "Setting.setGoto", '"' + e + '"'))
		},
		copyright: function() {
			var e = require("../tpl/copyright.html"),
				t = template.compile(e),
				a = t({
					LNG: LNG,
					G: G
				});
			art.dialog.through({
				id: "copyright_dialog",
				bottom: 0,
				right: 0,
				simple: !0,
				resize: !1,
				title: LNG.about + " kod",
				width: 425,
				padding: "0",
				fixed: !0,
				content: a
			}), $(".copyright_dialog").addClass("animated-700 zoomIn")
		},
		qrcode: function(e) {
			"./" == e.substr(0, 2) && (e = G.app_host + e.substr(2));
			var t = "./index.php?user/qrcode&url=" + urlEncode(e),
				a = "<a href='" + e + "' target='_blank'><img src='" + t + "' style='border:1px solid #eee;'/></a>";
			$.dialog({
				fixed: !0,
				resize: !1,
				title: LNG.qrcode,
				padding: 30,
				content: a
			})
		},
		appStore: function() {
			$.dialog.open("./index.php?app", {
				id: "app_store",
				fixed: !0,
				ico: core.ico("appStore"),
				resize: !0,
				title: LNG.app_store,
				width: 900,
				height: 550
			})
		},
		openIE: function(e) {
			$.dialog.open(e, {
				fixed: !0,
				resize: !0,
				title: LNG.app_store,
				width: "80%",
				height: "70%"
			})
		},
		openApp: function(app) {
			if ("url" == app.type) {
				var icon = app.icon; - 1 == app.icon.search(G.static_path) && "http" != app.icon.substring(0, 4) && (icon = G.static_path + "images/app/" + app.icon), app.width = "number" != typeof app.width && -1 == app.width.search("%") ? parseInt(app.width) : "80%", "number" != typeof app.height && -1 == app.height.search("%") ? app.height = parseInt(app.height) : app.width = "60%";
				var dialog_info = {
					resize: app.resize,
					fixed: !0,
					ico: icon,
					title: app.name.replace(".oexe", ""),
					width: app.width,
					height: app.height,
					simple: app.simple,
					padding: 0
				};
				"swf" == core.pathExt(app.content) ? (dialog_info.content = core.createFlash(app.content), $.dialog(dialog_info)) : $.dialog.open(app.content, dialog_info)
			} else {
				var exec = app.content;
				eval("{" + exec + "}")
			}
		},
		update: function(e) {
			setTimeout(function() {
				var t = base64_decode("aHR0cDovL3N0YXRpYy5rYWxjYWRkbGUuY29tL3VwZGF0ZS9tYWluLmpz") + "?a=" + UUID();
				require.async(t, function(t) {
					try {
						t.todo(e)
					} catch (a) {}
				})
			}, 3e3)
		},
		open_path: function(e) {
			"undefined" != typeof Config && "explorer" == Config.pageApp ? ui.path.list(e, "tips") : core.explorer(e)
		},
		explorer: function(e, t) {
			void 0 == e && (e = ""), void 0 == t && (t = core.pathThis(e));
			var a = "./index.php?/explorer&type=iframe&path=" + e;
			G.share_page !== void 0 && (a = "./index.php?share/folder&type=iframe&user=" + G.user + "&sid=" + G.sid + "&path=" + e), $.dialog.open(a, {
				resize: !0,
				fixed: !0,
				ico: core.ico("folder"),
				title: t,
				width: 880,
				height: 550
			})
		},
		explorerCode: function(e) {
			void 0 == e && (e = "");
			var t = "index.php?/editor&project=" + e;
			G.share_page !== void 0 && (t = "./index.php?share/code_read&user=" + G.user + "&sid=" + G.sid + "&project=" + e), window.open(t)
		},
		setSkin_finished: function() {
			var e = $(".setSkin_finished").attr("src");
			e && ($("#link_css_list").attr("href", e), $(".setSkin_finished").remove())
		},
		setSkin: function(e) {
			var t = G.static_path + "style/skin/" + e + ".css";
			$("body").append('<img src="' + t + '" onload="core.setSkin_finished();" onerror="core.setSkin_finished();" class="setSkin_finished">')
		},
		editorFull: function() {
			var e = $("iframe[name=OpenopenEditor]");
			e.toggleClass("frame_fullscreen")
		},
		language: function(e) {
			Cookie.set("kod_user_language", e, 8760), window.location.reload()
		},
		tips: {
			topHeight: function() {
				return 1 == $(".topbar").length ? $(".topbar").height() : 0
			},
			loading: function(e) {
				Tips.loading(e, "info", core.tips.topHeight())
			},
			close: function(e, t) {
				"object" == typeof e ? Tips.close(e.data, e.code, core.tips.topHeight()) : Tips.close(e, t, core.tips.topHeight())
			},
			tips: function(e, t) {
				"object" == typeof e ? Tips.tips(e.data, e.code, core.tips.topHeight()) : Tips.tips(e, t, core.tips.topHeight())
			}
		},
		fullScreen: function() {
			"true" == $("body").attr("fullScreen") && core.exitfullScreen(), $("body").attr("fullScreen", "true");
			var e = share.system_top(),
				t = e.document.documentElement;
			t.requestFullscreen ? t.requestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitRequestFullScreen && t.webkitRequestFullScreen()
		},
		exitfullScreen: function() {
			$("body").attr("fullScreen", "false"), document.exitFullscreen ? document.exitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitCancelFullScreen && document.webkitCancelFullScreen()
		},
		createFlash: function(e, t, a) {
			var i = UUID();
			(a === void 0 || "" == a) && (a = i);
			var n = '<object type="application/x-shockwave-flash" class="' + i + '" id="' + a + '" data="' + e + '" width="100%" height="100%">' + '<param name="movie" value="' + e + '"/>' + '<param name="allowfullscreen" value="true" />' + '<param name="allowscriptaccess" value="always" />' + '<param name="flashvars" value="' + t + '" />' + '<param name="wmode" value="transparent" />' + '</object><div class="aui_loading" id="' + i + '_loading"><span>loading..</span></div>';
			return setTimeout(function() {
				var e = $("." + i);
				if (1 != e.length) {
					var t = share.system_top();
					e = t.$("." + i)
				}
				if (1 == e.length) var a = 0,
					n = e[0],
					o = setInterval(function() {
						try {
							a++, 100 == Math.floor(n.PercentLoaded()) ? (e.next(".aui_loading").remove(), clearInterval(o), o = null) : a > 100 && (e.next(".aui_loading").remove(), clearInterval(o), o = null)
						} catch (t) {}
					}, 100)
			}, 50), n
		},
		search: function(e, t) {
			var a, i, n = require("../tpl/search.html"),
				o = require("../tpl/search_list.html"),
				s = function() {
					var o = trim(core.pathClear(t), "/");
					if (0 == o.indexOf(G.KOD_USER_SHARE) && -1 == o.indexOf("/")) return core.tips.tips(LNG.path_cannot_search, !1), void 0;
					var s = template.compile(n);
					0 == $(".dialog_do_search").length ? (l(), i = {
						search: e,
						path: t,
						is_content: void 0,
						is_case: void 0,
						ext: ""
					}, "editor" == Config.pageApp && (i.is_content = 1, i.is_case = 1), a = $.dialog({
						id: "dialog_do_search",
						padding: 0,
						fixed: !0,
						ico: core.ico("search"),
						resize: !0,
						title: LNG.search,
						height: 480,
						content: s({
							param: i,
							LNG: LNG
						})
					}), c(i), $("#search_ext").tooltip({
						placement: "bottom",
						html: !0
					}), $("#search_path").tooltip({
						placement: "bottom",
						html: !0,
						title: function() {
							return $("#search_path").val()
						}
					})) : ($("#search_value").val(e), $("#search_path").val(t), r(), $.dialog.list.dialog_do_search.display(!0))
				},
				r = function() {
					i = {
						search: $("#search_value").val(),
						path: $("#search_path").val(),
						is_content: $("#search_is_content").attr("checked"),
						is_case: $("#search_is_case").attr("checked"),
						ext: $("#search_ext").val()
					}, c(i)
				},
				l = function() {
					$("#search_value").die("keyup").live("keyup", function() {
						"editor" == !Config.pageApp && ui.path.setSearchByStr($(this).val())
					}), $("#search_value,#search_ext,#search_path").keyEnter(r), $(".search_header a.button").die("click").live("click", r), $(".search_result .list .name a").die("click").live("click", function() {
						var e = $(this).parent().parent().attr("data-path"),
							t = $(this).parent().parent().attr("data-type");
						if ($(this).parent().parent().hasClass("file")) {
							var a = core.pathExt(e);
							(inArray(core.filetype.text, a) || inArray(core.filetype.code, a)) && share.data("FILE_SEARCH_KEY", {
								key: $("#search_value").val(),
								line: $(this).parent().attr("data-line")
							}), ui.pathOpen.open(e, t)
						} else core.open_path(e + "/")
					}), $(".search_result .list .path a").die("click").live("click", function() {
						var e = core.pathFather($(this).html());
						core.open_path(e)
					})
				},
				c = function(e) {
					var t = 150;
					$("#search_value").textFocus(), $(".search_result .list").remove();
					var a = $(".search_result .message td");
					if (!e.search || !e.path) return a.hide().html(LNG.search_info).fadeIn(t), void 0;
					e.search = urlEncode(e.search), e.path = urlEncode(e.path);
					var i = "index.php?explorer/search";
					G.share_page !== void 0 && (i = "index.php?share/search&user=" + G.user + "&sid=" + G.sid), $.ajax({
						url: i,
						dataType: "json",
						type: "POST",
						data: e,
						beforeSend: function() {
							a.hide().html(LNG.searching + '<img src="' + G.static_path + 'images/loading.gif">').fadeIn(t)
						},
						error: core.ajaxError,
						success: function(e) {
							if (!e.code) return a.hide().html(e.data).fadeIn(t), void 0;
							if (0 == e.data.filelist.length && 0 == e.data.folderlist.length) return a.hide().html(LNG.search_null).fadeIn(t), void 0;
							a.hide();
							var i = template.compile(o);
							for (var n in e.data) if ("filelist" == n || "folderlist" == n) for (var s = 0; e.data[n].length > s; s++) e.data[n][s].size = core.file_size(e.data[n][s].size);
							e.data.LNG = LNG, $(i(e.data)).insertAfter(".search_result .message")
						}
					})
				};
			s()
		},
		server_dwonload: function(e, t) {
			core.upload_check("explorer:serverDownload");
			var a = $(".download_box"),
				i = a.find("#download_list");
			if (a.find("input").val(""), !e || "http" != e.substr(0, 4)) return core.tips.tips("url false!", !1), void 0;
			var n = UUID(),
				o = '<div id="' + n + '" class="item">' + '<div class="info"><span class="title" tytle="' + e + '">' + core.pathThis(e) + "</span>" + '<span class="size">0b</span>' + '<span class="state">' + LNG.upload_ready + "</span>" + '<a class="remove font-icon icon-remove" href="javascript:void(0)"></a>' + '<div style="clear:both"></div></div></div>';
			i.find(".item").length > 0 ? $(o).insertBefore(i.find(".item:eq(0)")) : i.append(o);
			var s, r, l, c = 0,
				d = $("#" + n),
				p = $("#" + n + " .state").text(LNG.download_ready),
				u = $('<div class="progress progress-striped active"><div class="progress-bar" role="progressbar" style="width: 0%;text-align:right;"></div></div>').appendTo("#" + n).find(".progress-bar");
			$("#" + n + " .remove").bind("click", function() {
				clearInterval(s), s = !1, clearTimeout(r), r = !1, $.get("./index.php?explorer/serverDownload&type=remove&uuid=" + n), $(this).parent().parent().slideUp(function() {
					$(this).remove(), ui.f5()
				})
			}), $.ajax({
				url: "./index.php?explorer/serverDownload&type=download&save_path=" + t + "&url=" + urlEncode2(e) + "&uuid=" + n,
				dataType: "json",
				error: function(e, t, a) {
					core.ajaxError(e, t, a), clearInterval(s), s = !1, clearTimeout(r), r = !1, u.parent().remove(), p.addClass("error").text(LNG.download_error)
				},
				success: function(e) {
					clearInterval(s), s = !1, clearTimeout(r), r = !1, e.code ? (ui.f5_callback(function() {
						ui.path.setSelectByFilename(e.info)
					}), p.text(LNG.download_success), $("#" + n + " .info .title").html(e.info)) : p.addClass("error").text(LNG.error), u.parent().remove()
				}
			});
			var f = function() {
					$.ajax({
						url: "./index.php?explorer/serverDownload&type=percent&uuid=" + n,
						dataType: "json",
						success: function(e) {
							var t = "",
								a = e.data;
							if (s) {
								if (!e.code) return p.text(LNG.loading), void 0;
								if (a) {
									if (a.size = parseFloat(a.size), a.time = parseFloat(a.time), l) {
										var i = (a.size - l.size) / (a.time - l.time);
										if (c > .2 * i) {
											var n = c;
											c = i, i = n
										} else c = i;
										t = core.file_size(i) + "/s"
									}
									if (0 == a.length) d.find(".progress-bar").css("width", "100%").text(LNG.loading);
									else {
										var o = 100 * (a.size / a.length);
										d.find(".progress-bar").css("width", o + "%"), p.text(parseInt(o) + "%(" + t + ")")
									}
									d.find(".size").text(core.file_size(a.length)), l = a
								}
							}
						}
					})
				};
			r = setTimeout(function() {
				f(), s = setInterval(function() {
					f()
				}, 1e3)
			}, 100)
		},
		user_space_html: function(e) {
			var t = e.split("/"),
				a = parseFloat(t[0]),
				i = 1073741824 * parseFloat(t[1]),
				n = core.file_size(parseFloat(t[0])),
				o = core.file_size(i),
				s = n + "/",
				r = 100 * a / i;
			return r >= 100 && (r = 100), 0 == i || isNaN(i) ? (s += LNG.space_tips_full, r = "0%") : (s += o, r += "%"), s = "<div class='space_info_bar'><div class='space_process'><div class='space_process_use' style='width:" + r + "'></div></div>" + "<div class='space_info'>" + s + "</div>" + "</div>"
		},
		file_size: function(e, t) {
			if (void 0 == e && (e = 0), void 0 == t && (t = 1), 1024 >= e) return parseInt(e) + "B";
			e = parseInt(e);
			var a = {
				G: 1073741824,
				M: 1048576,
				K: 1024,
				B: 1
			};
			for (var i in a) if (e >= a[i]) return (e / a[i]).toFixed(t) + i
		},
		upload_check: function(e) {
			return "share" == G.share_page ? "1" == G.share_info.can_upload : (void 0 == e && (e = "explorer:fileUpload"), !G.is_root && AUTH.hasOwnProperty(e) && 1 != AUTH[e] ? (core.tips.tips(LNG.no_permission, !1), !1) : G.json_data && !G.json_data.info.can_upload ? (core.tips.tips(LNG.no_permission_write, !1), !1) : !0)
		},
		upload: function() {
			var e = "index.php?explorer/fileUpload";
			if ("share" == G.share_page && "1" == G.share_info.can_upload && (e = "index.php?share/fileUpload&user=" + G.user + "&sid=" + G.sid), uploader.option("server", e), 0 != $(".dialog_file_upload").length) return $.dialog.list.dialog_file_upload.display(!0), void 0;
			var t = require("../tpl/upload.html"),
				a = template.compile(t),
				i = WebUploader.Base.formatSize(G.upload_max);
			$.dialog({
				padding: 5,
				resize: !0,
				ico: core.ico("upload"),
				id: "dialog_file_upload",
				fixed: !0,
				title: LNG.upload_muti,
				content: a({
					LNG: LNG,
					maxsize: i
				}),
				close: function() {
					$.each(uploader.getFiles(), function(e, t) {
						uploader.skipFile(t), uploader.removeFile(t)
					}), $.each($("#download_list .item"), function() {
						$(this).find(".remove").click()
					})
				}
			}), $(".file_upload .tips").tooltip({
				placement: "bottom"
			}), $(".file_upload .top_nav a.menu").unbind("click").bind("click", function() {
				$(this).hasClass("tab_upload") ? ($(".file_upload .tab_upload").addClass("this"), $(".file_upload .tab_download").removeClass("this"), $(".file_upload .upload_box").removeClass("hidden"), $(".file_upload .download_box").addClass("hidden")) : ($(".file_upload .tab_upload").removeClass("this"), $(".file_upload .tab_download").addClass("this"), $(".file_upload .upload_box").addClass("hidden"), $(".file_upload .download_box").removeClass("hidden"))
			}), $(".file_upload .download_box .download_start").unbind("click").bind("click", function() {
				core.server_dwonload($(".download_box input").val(), G.this_path)
			}), $(".file_upload .download_box .download_start_all").unbind("click").bind("click", function() {
				$.dialog({
					id: "server_dwonload_textarea",
					fixed: !0,
					resize: !1,
					ico: core.ico("upload"),
					width: "420px",
					height: "270px",
					padding: 10,
					title: LNG.download,
					content: "<textarea style='width:400px;height:250px;border:1px solid #ddd;'></textarea>",
					ok: function() {
						for (var e = $(".server_dwonload_textarea textarea").val().split("\n"), t = 0; e.length > t; t++) core.server_dwonload(e[t], G.this_path)
					}
				})
			}), "share" == G.share_page && $(".top_nav").addClass("hidden"), uploader.addButton({
				id: "#picker"
			})
		},
		upload_init: function() {
			var  MD5 = null; //当前页面是生成的GUID作为标示
			var $ = jQuery;
			      WebUploader.Uploader.register({
			        'before-send-file': 'beforeSendFile',
			        'before-send' : 'beforeSend'
			      }, 
			      {
			        beforeSendFile: function(file){
			          //秒传验证
			          var task = new $.Deferred();
			          var start = new Date().getTime();
			          (new WebUploader.Uploader()).md5File(file, 0, 10*1024*1024).progress(function(percentage){
			            console.log(percentage);
			          }).then(function(val){
			            console.log("总耗时: "+((new Date().getTime()) - start)/1000);

			            $.ajax({
			              type: "POST"
			              , url: 'index.php?explorer/md5Check'
			              , data: {
			                status: "md5Check"
			                , md5: val
			              }
			              , cache: false
			              , timeout: 1000 //todo 超时的话，只能认为该文件不曾上传过
			              , dataType: "json"
			            }).then(function(data, textStatus, jqXHR){

			              //console.log(data);
			               if(data.ifExist){   //若存在，这返回失败给WebUploader，表明该文件不需要上传
			                task.reject();
			                uploader.skipFile(file);
			                file.path = data.path;
			                          // updateStatus();
			              }else{
			                task.resolve();
			                //拿到上传文件的唯一名称，用于断点续传
			                MD5 = md5(''+file.name+file.type+file.lastModifiedDate+file.size);
			                setCookie('file_md5',MD5);
			              }
			            }, function(jqXHR, textStatus, errorThrown){    //任何形式的验证失败，都触发重新上传
			              task.resolve();
			              //拿到上传文件的唯一名称，用于断点续传
			              MD5 = md5(''+file.name+file.type+file.lastModifiedDate+file.size);
			              setCookie('file_md5',MD5);
			            });
			          });
			          return $.when(task);
			        },
			        beforeSend: function(block){
			          //分片验证是否已传过，用于断点续传
			          var task = new $.Deferred();
			          $.ajax({
			            type: "POST"
			            , url: 'index.php?explorer/chunkCheck'
			            , data: {
			              status: "chunkCheck"
			              , chunkMD5: MD5
			              , chunkIndex: block.chunk
			              , size: block.end - block.start
			            }
			            , cache: false
			            , timeout: 1000 //todo 超时的话，只能认为该分片未上传过
			            , dataType: "json"
			          }).then(function(data, textStatus, jqXHR){
			            if(data.ifExist){   //若存在，返回失败给WebUploader，表明该分块不需要上传
			              task.reject();
			            }else{
			              task.resolve();
			            }
			          }, function(jqXHR, textStatus, errorThrown){    //任何形式的验证失败，都触发重新上传
			            task.resolve();
			          });
			          return $.when(task);
			        }
			      });

			var e = "#thelist",
				t = !0;
			$.browser.msie && (t = !1);
			var a = 10485760;
			a >= G.upload_max && (a = .5 * G.upload_max), uploader = WebUploader.create({
				swf: G.static_path + "js/lib/webuploader/Uploader.swf",
				dnd: "body",
				threads: 2,
				compress: !1,
				resize: !1,
				prepareNextFile: !0,
				duplicate: !0,
				chunked: t,
				chunkRetry: 3,
				chunkSize: a
			}), $("#uploader .success").die("click").live("click", function() {
				var e = $(this).find("span.title").attr("title");
				"explorer" == Config.pageApp ? ui.path.list(core.pathFather(e), "tips", function() {
					ui.path.setSelectByFilename(core.pathThis(e))
				}) : core.explorer(core.pathFather(e))
			}), $("#uploader .open").die("click").live("click", function(e) {
				var t = $(this).find("span.title").attr("title");
				ui.pathOpen.open(t), stopPP(e)
			}), $(".upload_box_clear").die("click").live("click", function() {
				$("#thelist .item.success,#thelist .item.error").each(function() {
					$(this).slideUp(300, function() {
						$(this).remove()
					})
				})
			}), $("#uploader .remove").die("click").live("click", function(e) {
				var t = $(this).parent().parent().attr("id");
				$(this).parent().parent().slideUp(function() {
					$(this).remove()
				}), uploader.skipFile(t), uploader.removeFile(t, !0), stopPP(e)
			});
			var i = 0,
				n = 0,
				o = "0B/s",
				s = 0,
				r = function(e, t) {
					if (.3 >= time_float() - s) return o;
					s = time_float();
					var a = e.size * t,
						i = 5;
					e.speed === void 0 ? e.speed = [
						[time_float() - .5, 0],
						[time_float(), a]
					] : i >= e.speed.length ? e.speed.push([time_float(), a]) : (e.speed = e.speed.slice(1, i), e.speed.push([time_float(), a]));
					var n = e.speed[e.speed.length - 1],
						r = e.speed[0],
						l = (n[1] - r[1]) / (n[0] - r[0]);
					return l = core.file_size(l) + "/s", o = l, l
				},
				l = [];
			uploader.on("fileQueued", function(t) {
				if (!core.upload_check()) return uploader.skipFile(t), uploader.removeFile(t), void 0;
				var a, n = $(e),
					a = t.fullPath;
				t.finished = !1, t.upload_to = urlDecode(G.this_path), (void 0 == a || "undefined" == a) && (a = t.name), i++, $(e).find(".item").length > 0 && (n = $(e).find(".item:eq(0)"));
				var o = '<div id="' + t.id + '" class="item"><div class="info">' + '<span class="title" title="' + G.this_path + a + '">' + core.pathThis(a) + "</span>" + '<span class="size">' + core.file_size(t.size) + "</span>" + '<span class="state">' + LNG.upload_ready + "</span>" + '<a class="remove font-icon icon-remove" href="javascript:void(0)"></a>' + '<div style="clear:both"></div></div></div>';
				$(e).find(".item").length > 0 ? $(o).insertBefore($(e).find(".item:eq(0)")) : $(e).append(o), uploader.upload()
			}).on("uploadBeforeSend", function(e, t) {
				var a = urlEncode(e.file.fullPath);
				(void 0 == a || "undefined" == a) && (a = ""), t.fullPath = a, t.upload_to = e.file.upload_to
			}).on("uploadProgress", function(e, t) {
				$(".dialog_file_upload .aui_title").text(LNG.uploading + ": " + n + "/" + i + " (" + o + ")");
				var a = r(e, t),
					s = $("#" + e.id),
					l = s.find(".progress .progress-bar");
				l.length || (l = $('<div class="progress progress-striped active"><div class="progress-bar" role="progressbar" style="width: 0%"></div></div>').appendTo(s).find(".progress-bar")), s.find(".state").text(parseInt(100 * t) + "%(" + a + ")"), l.css("width", 100 * t + "%")
			}).on("uploadAccept", function(e, t) {
				e.file.serverData = t;
				try {
					l.push(core.pathThis(t.info))
				} catch (a) {}
			}).on("uploadSuccess", function(e) {
				var t = 36 * $("#" + e.id).index(".item");
				$("#uploader").scrollTop(t), n++;
				var a = e.serverData;
				if (a.code ? ($("#" + e.id).addClass("success"), $("#" + e.id).find(".state").text(a.data), $("#" + e.id).find(".remove").removeClass("icon-remove").addClass("icon-ok").addClass("open").removeClass("remove")) : ($("#" + e.id).addClass("error").find(".state").addClass("error"), $("#" + e.id).find(".state").text(a.data).attr("title", a.data)), uploader.removeFile(e), $("#" + e.id).find(".progress").fadeOut(), !e.fullPath) {
					var i = l;
					ui.f5_callback(function() {
						ui.path.setSelectByFilename(i)
					})
				}
			}).on("uploadError", function(e, t) {
				n++, $("#" + e.id).find(".progress").fadeOut(), $("#" + e.id).addClass("error").find(".state").addClass("error"), $("#" + e.id).find(".state").text(LNG.upload_error + "(" + t + ")")
			}).on("uploadFinished", function() {
				$(".dialog_file_upload .aui_title").text(LNG.upload_success + ": " + n + "/" + i), i = 0, n = 0, uploader.reset();
				var e = l;
				if (ui.f5_callback(function() {
					ui.path.setSelectByFilename(e), l = []
				}), "explorer" == Config.pageApp) {
					if ("share" == G.share_page) return;
					ui.tree.checkIfChange(G.this_path)
				}
			}).on("error", function(e) {
				core.tips.tips(e, !1)
			});
			var c;
			inState = !1, dragOver = function() {
				0 == inState && (inState = !0, MaskView.tips(LNG.upload_drag_tips)), c && window.clearTimeout(c)
			}, dragLeave = function(e) {
				stopPP(e), c && window.clearTimeout(c), c = window.setTimeout(function() {
					inState = !1, MaskView.close()
				}, 100)
			}, dragDrop = function(e) {
				try {
					if (e = e.originalEvent || e, core.upload_check()) {
						var t = e.dataTransfer.getData("text/plain");
						t && "http" == t.substring(0, 4) ? ui.pathOperate.appAddURL(t) : core.upload()
					}
					stopPP(e)
				} catch (e) {}
				inState && (inState = !1, MaskView.close())
			}
		}
	}
}), define("app/tpl/copyright.html", [], '<div class="copyright_dialog_content">\n	<div class="title">\n		<div class="logo"><i class="icon-cloud"></i>KodExplorer v{{G.version}}</div>\n		<div class=\'info\'>——{{LNG.kod_name_copyright}}</div>\n	</div>\n	<div class="content">\n		<p>{{#LNG.copyright_desc}}</p>\n		<div>{{#LNG.copyright_contact}}</div>\n		<div>{{#LNG.copyright_info}}</div> \n	</div>\n</div>'), define("app/tpl/search.html", [], "<div class='do_search'>\n    <div class='search_header'>\n       <div class='s_br'>\n            <input type='text' id='search_value' value='{{param.search}}'/><a class='right button icon-search'></a>\n            <div style='float:right'>{{LNG.path}}:<input type='text' id='search_path' value='{{param.path}}'/></div>\n        </div>\n       <div class='s_br'>\n            <input type='checkbox' id='search_is_case' {{if param.is_case}}checked='true'{{/if}}/>\n            <label for='search_is_case'>{{LNG.search_uplow}}</label>\n            <input type='checkbox' id='search_is_content' {{if param.is_content}}checked='true'{{/if}}/>\n            <label for='search_is_content'>{{LNG.search_content}}</label>\n            <div style='float:right'>{{LNG.file_type}}:<input type='text' id='search_ext' value='{{param.ext}}' title='{{LNG.search_ext_tips}}'/></div>\n        </div>\n    </div>\n    <div class='search_result'>\n        <table border='0' cellspacing='0' cellpadding='0'>\n            <tr class='search_title'>\n               <td class='name'>{{LNG.name}}</td>\n               <td class='type'>{{LNG.type}}</td>\n               <td class='size'>{{LNG.size}}</td>\n               <td class='path'>{{LNG.path}}</td>\n            </tr>\n            <tr class='message'><td colspan='4'></td></tr>\n        </table>\n    </div>\n</div>\n\n"), define("app/tpl/search_list.html", [], "{{each folderlist as v i}}\n    <tr class='list folder' data-path='{{v.path}}' data-type='folder' data-size='0'>\n        <td class='name'><a href='javascript:void(0);' title='{{LNG.open}}{{v.name}}'>{{v.name}}</a></td>\n        <td class='type'>{{LNG.folder}}</td>\n        <td class='size'>0</td>\n        <td class='path'><a href='javascript:void(0);' title='{{LNG.goto}}{{v.path}}'>{{v.path}}</a></td>\n    </tr>\n{{/each}}\n{{each filelist as v i}}\n<tr class='list file'\n    data-path='{{v.path}}' \n    data-type='{{v.ext}}' \n    data-size='{{v.size}}'>\n    <td class='name' data-line=\"{{if v.search_line}}{{v.search_line}}{{/if}}\">\n        <a href='javascript:void(0);' title='{{LNG.open}}{{v.name}}'>{{v.name}}</a> \n        {{if v.search_line}}<span>&nbsp;({{v.search_line}})</span>{{/if}}\n    </td>\n    <td class='type'>{{v.ext}}</td>\n    <td class='size'>{{v.size}}</td>\n    <td class='path'><a href='javascript:void(0);' title='{{LNG.goto}}{{v.path}}'>{{v.path}}</a></td>\n</tr>\n{{/each}}"), define("app/tpl/upload.html", [], "<div class='file_upload'>\n    <div class='top_nav'>\n       <a href='javascript:void(0);' class='menu this tab_upload'>{{LNG.upload_local}}</a>\n       <a href='javascript:void(0);' class='menu tab_download''>{{LNG.download_from_server}}</a>\n       <div style='clear:both'></div>\n    </div>\n    <div class='upload_box'>\n        <div class='btns'>\n            <div id='picker'>{{LNG.upload_select}}</div>\n            <div class=\"upload_box_tips\">\n            <a href=\"javascript:void(0);\" class=\"upload_box_clear\">{{LNG.upload_clear}}</a> \n            </div>\n            <div style='clear:both'></div>\n        </div>\n        <div id='uploader' class='wu-example'>\n            <div id='thelist' class='uploader-list'></div>\n        </div>\n    </div>\n    <div class='download_box hidden'>\n        <div class='list'>{{LNG.download_address}}<input type='text' name='url'/>\n\n        <div class=\"download_btn_group btn-group\">\n          <button class='btn btn-default btn-sm download_start' type='button'>{{LNG.download}}</button>\n          <button type=\"button\" class=\"btn btn-default btn-sm dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n            <span class=\"caret\"></span>&nbsp;\n            <span class=\"sr-only\">Dropdown</span>\n          </button>\n          <ul class=\"dropdown-menu\">\n            <li><a href=\"javascript:void(0);\" class=\"download_start_all\">批量添加</a></li>\n          </ul>\n        </div>\n\n        </div>\n        <div style='clear:both'></div>\n        <div id='downloader'>\n            <div id='download_list' class='uploader-list'></div>\n        </div>\n    </div>\n</div>"), define("app/common/rightMenu", [], function() {
	var e = ".menufile",
		t = ".menufolder",
		a = ".menuMore",
		i = ".menuTreeRoot",
		n = ".menuTreeFolder",
		o = ".menuTreeFile",
		s = ".menuTreeGroupRoot",
		r = ".menuTreeGroup",
		l = ".menuTreeUser",
		c = {
			newfileOther: {
				name: LNG.newfile,
				icon: "expand-alt",
				accesskey: "w",
				className: "newfolder",
				items: {
					newfile: {
						name: "txt " + LNG.file,
						icon: "file-alt",
						className: "newfile"
					},
					newfile_md: {
						name: "md " + LNG.file,
						icon: "file-alt",
						className: "newfile"
					},
					newfile_html: {
						name: "html " + LNG.file,
						icon: "file-alt",
						className: "newfile"
					},
					newfile_php: {
						name: "php " + LNG.file,
						icon: "file-alt",
						className: "newfile"
					},
					newfile_js: {
						name: "js " + LNG.file,
						icon: "file-alt",
						className: "newfile"
					},
					newfile_css: {
						name: "css " + LNG.file,
						icon: "file-alt",
						className: "newfile"
					},
					app_install: {
						name: LNG.app_store,
						className: "app_install line_top",
						icon: "tasks",
						accesskey: "a"
					},
					app_create: {
						name: LNG.app_create,
						icon: "puzzle-piece",
						className: "newfile"
					}
				}
			},
			listIcon: {
				name: LNG.list_type,
				icon: "eye-open",
				items: {
					seticon: {
						name: LNG.list_icon,
						className: "menu_seticon set_seticon"
					},
					setlist: {
						name: LNG.list_list,
						className: "menu_seticon set_setlist"
					}
				}
			},
			sortBy: {
				name: LNG.order_type,
				accesskey: "y",
				icon: "sort",
				items: {
					set_sort_name: {
						name: LNG.name,
						className: "menu_set_sort set_sort_name"
					},
					set_sort_ext: {
						name: LNG.type,
						className: "menu_set_sort set_sort_ext"
					},
					set_sort_size: {
						name: LNG.size,
						className: "menu_set_sort set_sort_size"
					},
					set_sort_mtime: {
						name: LNG.modify_time,
						className: "menu_set_sort set_sort_mtime"
					},
					set_sort_up: {
						name: LNG.sort_up,
						className: "menu_set_desc set_sort_up line_top"
					},
					set_sort_down: {
						name: LNG.sort_down,
						className: "menu_set_desc set_sort_down"
					}
				}
			}
		},
		d = function() {
			$('<div id="rightMenu" class="hidden"></div>').appendTo("body"), $(".context-menu-list").die("click").live("click", function(e) {
				return stopPP(e), !1
			}), _(), b(), y(), w(), N(), L(), C(), z(), S(), T(), h(), m(), f(), $(".set_set" + G.list_type).addClass("selected"), $(".set_sort_" + G.list_sort_field).addClass("selected"), $(".set_sort_" + G.list_sort_order).addClass("selected"), $(".context-menu-root").addClass("animated fadeIn")
		},
		p = function() {
			$('<div id="rightMenu" class="hidden"></div>').appendTo("body"), $(".context-menu-list").die("click").live("click", function(e) {
				return stopPP(e), !1
			}), g(), v(), b(), y(), w(), h(), f(), $(".set_sort_" + G.list_sort_field).addClass("selected"), $(".set_sort_" + G.list_sort_order).addClass("selected"), $(".context-menu-root").addClass("animated fadeIn")
		},
		u = function() {
			$('<div id="rightMenu" class="hidden"></div>').appendTo("body"), $(".context-menu-list").die("click").live("click", function(e) {
				return stopPP(e), !1
			}), N(), L(), j(), z(), S(), T(), E(), f(), $(".context-menu-root").addClass("animated fadeIn")
		},
		f = function() {
			if (1 != G.is_root) {
				$(".context-menu-list .open_ie").addClass("hidden");
				var e = "hidden";
				AUTH["explorer:fileDownload"] || ($(".context-menu-list .down,.context-menu-list .download").addClass(e), $(".context-menu-list .share").addClass(e), $(".context-menu-list .open_text").addClass(e), $(".kod_path_tool #download").remove(), $(".pathinfo .open_window").addClass(e)), AUTH["explorer:zip"] || ($(".context-menu-list .zip").addClass(e), $(".kod_path_tool #zip").remove()), AUTH["explorer:search"] || $(".context-menu-list .search").addClass(e), AUTH["explorer:mkdir"] || $(".context-menu-list .newfolder").addClass(e), AUTH["userShare:set"] || ($(".context-menu-list .share").remove(), $(".kod_path_tool #share").remove())
			}
		},
		h = function() {
			$('<i class="menuRecycleBody"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: ".menuRecycleBody",
				callback: function(e) {
					x(e)
				},
				items: {
					recycle_clear: {
						name: LNG.recycle_clear,
						icon: "trash",
						accesskey: "c"
					},
					refresh: {
						name: LNG.refresh + "<b>F5</b>",
						className: "refresh",
						icon: "refresh",
						accesskey: "e"
					},
					sep1: "--------",
					listIcon: c.listIcon,
					sortBy: c.sortBy,
					sep2: "--------",
					info: {
						name: LNG.info + "<b>Alt+I</b>",
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			}), $('<i class="menuRecyclePath"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: ".menuRecyclePath",
				callback: function(e) {
					k(e)
				},
				items: {
					cute: {
						name: LNG.cute + "<b>Ctrl+X</b>",
						className: "cute",
						icon: "cut",
						accesskey: "k"
					},
					remove: {
						name: LNG.recycle_remove + "<b>Del</b>",
						className: "remove",
						icon: "trash",
						accesskey: "d"
					},
					sep2: "--------",
					down: {
						name: LNG.download,
						className: "down",
						icon: "cloud-download",
						accesskey: "x"
					},
					info: {
						name: LNG.info + "<b>Alt+I</b>",
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			}), $('<i class="menuRecycleButton"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: ".menuRecycleButton",
				callback: function(e) {
					x(e)
				},
				items: {
					recycle_clear: {
						name: LNG.recycle_clear,
						icon: "trash",
						accesskey: "c"
					}
				}
			})
		},
		m = function() {
			$('<i class="menuShareBody"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: ".menuShareBody",
				callback: function(e) {
					x(e)
				},
				items: {
					refresh: {
						name: LNG.refresh + "<b>F5</b>",
						className: "refresh",
						icon: "refresh",
						accesskey: "e"
					},
					sep1: "--------",
					listIcon: c.listIcon,
					sortBy: c.sortBy
				}
			}), $('<i class="menuSharePath"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				className: "menuSharePathMenu",
				selector: ".menuSharePath",
				callback: function(e) {
					k(e)
				},
				items: {
					share_edit: {
						name: LNG.share_edit,
						icon: "edit",
						accesskey: "e",
						className: "share_edit"
					},
					remove: {
						name: LNG.share_remove + "<b>Del</b>",
						icon: "trash",
						accesskey: "d",
						className: "remove"
					},
					open_the_path: {
						name: LNG.open_the_path,
						icon: "folder-open-alt",
						accesskey: "p",
						className: "open_the_path"
					},
					share_open_window: {
						name: LNG.share_open_page,
						icon: "globe",
						accesskey: "b"
					},
					sep1: "--------",
					down: {
						name: LNG.download,
						className: "down",
						icon: "cloud-download",
						accesskey: "x"
					},
					copy: {
						name: LNG.copy + "<b>Ctrl+C</b>",
						className: "copy",
						icon: "copy",
						accesskey: "c"
					},
					sep2: "--------",
					info: {
						name: LNG.info + "<b>Alt+I</b>",
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			}), $('<i class="menuSharePathMore"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: ".menuSharePathMore",
				className: "menuSharePathMore",
				callback: function(e) {
					k(e)
				},
				items: {
					remove: {
						name: LNG.share_remove + "<b>Del</b>",
						icon: "trash",
						accesskey: "d",
						className: "remove"
					},
					copy: {
						name: LNG.copy + "<b>Ctrl+C</b>",
						className: "copy",
						icon: "copy",
						accesskey: "c"
					}
				}
			})
		},
		_ = function() {
			$.contextMenu({
				selector: ".menuBodyMain",
				className: "fileContiner_menu",
				zIndex: 9999,
				callback: function(e, t) {
					x(e, t)
				},
				items: {
					refresh: {
						name: LNG.refresh + "<b>F5</b>",
						className: "refresh",
						icon: "refresh",
						accesskey: "e"
					},
					newfolder: {
						name: LNG.newfolder + "<b>Alt+M</b>",
						className: "newfolder",
						icon: "folder-close-alt",
						accesskey: "n"
					},
					newfileOther: c.newfileOther,
					sep1: "--------",
					upload: {
						name: LNG.upload + "<b>Ctrl+U</b>",
						className: "upload",
						icon: "upload",
						accesskey: "u"
					},
					past: {
						name: LNG.past + "<b>Ctrl+V</b>",
						className: "past",
						icon: "paste",
						accesskey: "p"
					},
					copy_see: {
						name: LNG.clipboard,
						className: "copy_see",
						icon: "eye-open",
						accesskey: "v"
					},
					sep2: "--------",
					listIcon: c.listIcon,
					sortBy: c.sortBy,
					sep10: "--------",
					info: {
						name: LNG.info + "<b>Alt+I</b>",
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			})
		},
		v = function() {
			$.contextMenu({
				selector: ".menuDefault",
				zIndex: 9999,
				items: {
					open: {
						name: LNG.open,
						className: "open",
						icon: "external-link",
						accesskey: "o"
					}
				},
				callback: function(e) {
					switch (e) {
					case "open":
						ui.path.open();
						break;
					default:
					}
				}
			})
		},
		g = function() {
			$.contextMenu({
				selector: Config.BodyContent,
				zIndex: 9999,
				callback: function(e) {
					x(e)
				},
				items: {
					refresh: {
						name: LNG.refresh + "<b>F5</b>",
						className: "refresh",
						icon: "refresh",
						accesskey: "e"
					},
					newfolder: {
						name: LNG.newfolder + "<b>Alt+M</b>",
						className: "newfolder",
						icon: "folder-close-alt",
						accesskey: "n"
					},
					newfileOther: c.newfileOther,
					sep1: "--------",
					upload: {
						name: LNG.upload + "<b>Ctrl+U</b>",
						className: "upload",
						icon: "upload",
						accesskey: "u"
					},
					past: {
						name: LNG.past + "<b>Ctrl+V</b>",
						className: "past",
						icon: "paste",
						accesskey: "p"
					},
					copy_see: {
						name: LNG.clipboard,
						className: "copy_see",
						icon: "eye-open",
						accesskey: "v"
					},
					sep2: "--------",
					sortBy: c.sortBy,
					app_install: {
						name: LNG.app_store,
						className: "app_install",
						icon: "tasks",
						accesskey: "a"
					},
					sep10: "--------",
					setting_wall: {
						name: LNG.setting_wall,
						className: "setting_wall",
						icon: "picture",
						accesskey: "b"
					},
					setting: {
						name: LNG.setting,
						className: "setting",
						icon: "cogs",
						accesskey: "t"
					}
				}
			})
		},
		b = function() {
			$('<i class="' + t.substr(1) + '"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: t,
				className: t.substr(1),
				callback: function(e) {
					k(e)
				},
				items: {
					open: {
						name: LNG.open + "<b>Enter</b>",
						className: "open",
						icon: "folder-open-alt",
						accesskey: "o"
					},
					down: {
						name: LNG.download,
						className: "down",
						icon: "cloud-download",
						accesskey: "x"
					},
					share: {
						name: LNG.share,
						className: "share",
						icon: "share-sign",
						accesskey: "e"
					},
					sep1: "--------",
					copy: {
						name: LNG.copy + "<b>Ctrl+C</b>",
						className: "copy",
						icon: "copy",
						accesskey: "c"
					},
					cute: {
						name: LNG.cute + "<b>Ctrl+X</b>",
						className: "cute",
						icon: "cut",
						accesskey: "k"
					},
					remove: {
						name: LNG.remove + "<b>Del</b>",
						className: "remove",
						icon: "trash",
						accesskey: "d"
					},
					rname: {
						name: LNG.rename + "<b>F2</b>",
						className: "rname",
						icon: "pencil",
						accesskey: "r"
					},
					sep2: "--------",
					open_ie: {
						name: LNG.open_ie,
						className: "open_ie",
						icon: "globe",
						accesskey: "b"
					},
					zip: {
						name: LNG.zip,
						className: "zip",
						icon: "folder-close",
						accesskey: "z"
					},
					search: {
						name: LNG.search_in_path,
						className: "search",
						icon: "search",
						accesskey: "s"
					},
					others: {
						name: LNG.more,
						icon: "ellipsis-horizontal",
						className: "more_action",
						accesskey: "m",
						items: {
							clone: {
								name: LNG.clone,
								className: "clone",
								icon: "external-link"
							},
							fav: {
								name: LNG.add_to_fav,
								className: "fav ",
								icon: "star",
								accesskey: "f"
							},
							explorer: {
								name: LNG.manage_folder,
								className: "explorer line_top",
								icon: "laptop",
								accesskey: "v"
							},
							createLink: {
								name: LNG.createLink,
								className: "createLink",
								icon: "share-alt",
								accesskey: "l"
							},
							createProject: {
								name: LNG.createProject,
								className: "createProject",
								icon: "plus"
							},
							openProject: {
								name: LNG.openProject,
								className: "openProject",
								icon: "edit"
							}
						}
					},
					sep5: "--------",
					info: {
						name: LNG.info + "<b>Alt+I</b>",
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			})
		},
		y = function() {
			$('<i class="' + e.substr(1) + '"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: e,
				className: e.substr(1),
				callback: function(e) {
					k(e)
				},
				items: {
					open: {
						name: LNG.open + "<b>Enter</b>",
						className: "open",
						icon: "external-link",
						accesskey: "o"
					},
					app_edit: {
						name: LNG.app_edit,
						className: "app_edit",
						icon: "code",
						accesskey: "a"
					},
					open_text: {
						name: LNG.edit + "<b>Ctrl+E</b>",
						className: "open_text",
						icon: "edit",
						accesskey: "e"
					},
					share: {
						name: LNG.share,
						className: "share",
						icon: "share-sign",
						accesskey: "e"
					},
					down: {
						name: LNG.download,
						className: "down",
						icon: "cloud-download",
						accesskey: "x"
					},
					sep1: "--------",
					copy: {
						name: LNG.copy + "<b>Ctrl+C</b>",
						className: "copy",
						icon: "copy",
						accesskey: "c"
					},
					cute: {
						name: LNG.cute + "<b>Ctrl+X</b>",
						className: "cute",
						icon: "cut",
						accesskey: "k"
					},
					rname: {
						name: LNG.rename + "<b>F2</b>",
						className: "rname",
						icon: "pencil",
						accesskey: "r"
					},
					remove: {
						name: LNG.remove + "<b>Del</b>",
						className: "remove",
						icon: "trash",
						accesskey: "d"
					},
					sep2: "--------",
					open_ie: {
						name: LNG.open_ie,
						className: "open_ie",
						icon: "globe"
					},
					unzip: {
						name: LNG.unzip,
						icon: "folder-open-alt",
						className: "unzip",
						accesskey: "u",
						items: {
							unzip_this: {
								name: LNG.unzip_this,
								icon: "external-link"
							},
							unzip_folder: {
								name: LNG.unzip_folder,
								icon: "external-link"
							},
							unzip_to: {
								name: LNG.unzip_to,
								icon: "external-link"
							}
						}
					},
					setBackground: {
						name: LNG.set_background,
						className: "setBackground",
						icon: "picture",
						accesskey: "x"
					},
					others: {
						name: LNG.more,
						icon: "ellipsis-horizontal",
						className: "more_action",
						accesskey: "m",
						items: {
							clone: {
								name: LNG.clone,
								className: "clone",
								icon: "external-link",
								accesskey: "l"
							},
							fav: {
								name: LNG.add_to_fav,
								className: "fav",
								icon: "star"
							},
							zip: {
								name: LNG.zip,
								className: "zip line_top",
								icon: "folder-close",
								accesskey: "z"
							},
							createLink: {
								name: LNG.createLink,
								className: "createLink",
								icon: "share-alt",
								accesskey: "l"
							}
						}
					},
					sep3: "--------",
					info: {
						name: LNG.info + "<b>Alt+I</b>",
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			})
		},
		w = function() {
			$('<i class="' + a.substr(1) + '"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: a,
				className: a.substr(1),
				callback: function(e) {
					k(e)
				},
				items: {
					copy: {
						name: LNG.copy + "<b>Ctrl+C</b>",
						className: "copy",
						icon: "copy",
						accesskey: "c"
					},
					cute: {
						name: LNG.cute + "<b>Ctrl+X</b>",
						className: "cute",
						icon: "cut",
						accesskey: "k"
					},
					remove: {
						name: LNG.remove + "<b>Del</b>",
						className: "remove",
						icon: "trash",
						accesskey: "d"
					},
					sep1: "--------",
					copy_to: {
						name: LNG.copy_to,
						className: "copy_to",
						icon: "copy"
					},
					cute_to: {
						name: LNG.cute_to,
						className: "cute_to",
						icon: "cut"
					},
					sep2: "--------",
					clone: {
						name: LNG.clone + "<b>Ctrl+C</b>",
						className: "clone",
						icon: "external-link",
						accesskey: "n"
					},
					playmedia: {
						name: LNG.add_to_play,
						className: "playmedia",
						icon: "music",
						accesskey: "p"
					},
					zip: {
						name: LNG.zip,
						className: "zip",
						icon: "folder-close",
						accesskey: "z"
					},
					down: {
						name: LNG.download,
						className: "down",
						icon: "cloud-download",
						accesskey: "x"
					},
					sep3: "--------",
					info: {
						name: LNG.info,
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			})
		},
		x = function(e) {
			switch (e) {
			case "refresh":
				ui.f5(!0, !0);
				break;
			case "back":
				ui.path.history.back();
				break;
			case "next":
				ui.path.history.next();
				break;
			case "seticon":
				ui.setListType("icon");
				break;
			case "setlist":
				ui.setListType("list");
				break;
			case "set_sort_name":
				ui.setListSort("name", 0);
				break;
			case "set_sort_ext":
				ui.setListSort("ext", 0);
				break;
			case "set_sort_size":
				ui.setListSort("size", 0);
				break;
			case "set_sort_mtime":
				ui.setListSort("mtime", 0);
				break;
			case "set_sort_up":
				ui.setListSort(0, "up");
				break;
			case "set_sort_down":
				ui.setListSort(0, "down");
				break;
			case "upload":
				core.upload();
				break;
			case "recycle_clear":
				ui.path.recycle_clear();
				break;
			case "past":
				ui.path.past();
				break;
			case "copy_see":
				ui.path.clipboard();
				break;
			case "newfolder":
				ui.path.newFolder();
				break;
			case "newfile":
				ui.path.newFile("txt");
				break;
			case "newfile_md":
				ui.path.newFile("md");
				break;
			case "newfile_html":
				ui.path.newFile("html");
				break;
			case "newfile_php":
				ui.path.newFile("php");
				break;
			case "newfile_js":
				ui.path.newFile("js");
				break;
			case "newfile_css":
				ui.path.newFile("css");
				break;
			case "newfile_oexe":
				ui.path.newFile("oexe");
				break;
			case "info":
				ui.path.info();
				break;
			case "open":
				ui.path.open();
				break;
			case "open_new":
				ui.path.open_new();
				break;
			case "app_install":
				ui.path.appList();
				break;
			case "app_create":
				ui.path.appEdit(!0);
				break;
			case "setting":
				core.setting();
				break;
			case "setting_wall":
				core.setting("wall");
				break;
			default:
			}
		},
		k = function(e) {
			switch (e) {
			case "open":
				ui.path.open();
				break;
			case "down":
				ui.path.download();
				break;
			case "share":
				ui.path.share();
				break;
			case "open_ie":
				ui.path.openIE();
				break;
			case "open_text":
				ui.path.openEditor();
				break;
			case "app_edit":
				ui.path.appEdit();
				break;
			case "playmedia":
				ui.path.play();
				break;
			case "share_edit":
				ui.path.share_edit();
				break;
			case "share_open_window":
				ui.path.share_open_window();
				break;
			case "open_the_path":
				ui.path.open_the_path();
				break;
			case "fav":
				ui.path.fav();
				break;
			case "search":
				ui.path.search();
				break;
			case "copy":
				ui.path.copy();
				break;
			case "clone":
				ui.path.copyDrag(G.this_path, !0);
				break;
			case "cute":
				ui.path.cute();
				break;
			case "cute_to":
				ui.path.cuteTo();
				break;
			case "copy_to":
				ui.path.copyTo();
				break;
			case "remove":
				ui.path.remove();
				break;
			case "rname":
				ui.path.rname();
				break;
			case "zip":
				ui.path.zip();
				break;
			case "unzip_folder":
				ui.path.unZip();
				break;
			case "unzip_this":
				ui.path.unZip("to_this");
				break;
			case "unzip_to":
				ui.path.unZip("unzip_to_folder");
				break;
			case "setBackground":
				ui.path.setBackground();
				break;
			case "createLink":
				ui.path.createLink();
				break;
			case "createProject":
				ui.path.createProject();
				break;
			case "openProject":
				ui.path.openProject();
				break;
			case "explorer":
				ui.path.explorer();
				break;
			case "explorerNew":
				ui.path.explorerNew();
				break;
			case "info":
				ui.path.info();
				break;
			default:
			}
		},
		N = function() {
			$('<i class="menuTreeFavRoot"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: ".menuTreeFavRoot",
				callback: function(e) {
					M(e)
				},
				items: {
					fav_page: {
						name: LNG.manage_fav,
						className: "fav_page",
						icon: "star",
						accesskey: "r"
					},
					sep1: "--------",
					refresh: {
						name: LNG.refresh,
						className: "refresh",
						icon: "refresh",
						accesskey: "e"
					}
				}
			}), $('<i class="menuTreeFav"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: ".menuTreeFav",
				callback: function(e) {
					M(e)
				},
				items: {
					fav_remove: {
						name: LNG.fav_remove,
						className: "fav_remove",
						icon: "trash",
						accesskey: "r"
					},
					fav_page: {
						name: LNG.manage_fav,
						className: "fav_page",
						icon: "star",
						accesskey: "f"
					},
					sep2: "--------",
					refresh: {
						name: LNG.refresh_tree,
						className: "refresh",
						icon: "refresh",
						accesskey: "e"
					},
					info: {
						name: LNG.info,
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			})
		},
		L = function() {
			$('<i class="' + i.substr(1) + '"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: i,
				callback: function(e) {
					M(e)
				},
				items: {
					explorer: {
						name: LNG.manage_folder,
						className: "explorer",
						icon: "laptop",
						accesskey: "v"
					},
					refresh: {
						name: LNG.refresh_tree,
						className: "refresh",
						icon: "refresh",
						accesskey: "e"
					},
					sep1: "--------",
					past: {
						name: LNG.past,
						className: "past",
						icon: "paste",
						accesskey: "p"
					},
					newfolder: {
						name: LNG.newfolder,
						className: "newfolder",
						icon: "folder-close-alt",
						accesskey: "n"
					},
					newfile: {
						name: LNG.newfile,
						className: "newfile",
						icon: "file-alt",
						accesskey: "j"
					},
					sep2: "--------",
					fav: {
						name: LNG.add_to_fav,
						className: "fav",
						icon: "star",
						accesskey: "f"
					},
					search: {
						name: LNG.search_in_path,
						className: "search",
						icon: "search",
						accesskey: "s"
					}
				}
			})
		},
		C = function() {
			$('<i class="' + n.substr(1) + '"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: n,
				callback: function(e) {
					M(e)
				},
				items: {
					refresh: {
						name: LNG.refresh_tree,
						className: "refresh",
						icon: "refresh",
						accesskey: "e"
					},
					download: {
						name: LNG.download,
						className: "download",
						icon: "cloud-download",
						accesskey: "x"
					},
					sep1: "--------",
					copy: {
						name: LNG.copy,
						className: "copy",
						icon: "copy",
						accesskey: "c"
					},
					cute: {
						name: LNG.cute,
						className: "cute",
						icon: "cut",
						accesskey: "k"
					},
					past: {
						name: LNG.past,
						className: "past",
						icon: "paste",
						accesskey: "p"
					},
					rname: {
						name: LNG.rename,
						className: "rname",
						icon: "pencil",
						accesskey: "r"
					},
					remove: {
						name: LNG.remove,
						className: "remove",
						icon: "trash",
						accesskey: "d"
					},
					sep2: "--------",
					newfolder: {
						name: LNG.newfolder,
						className: "newfolder",
						icon: "folder-close-alt",
						accesskey: "n"
					},
					search: {
						name: LNG.search_in_path,
						className: "search",
						icon: "search",
						accesskey: "s"
					},
					open_ie: {
						name: LNG.open_ie,
						className: "open_ie",
						icon: "globe"
					},
					others: {
						name: LNG.more,
						icon: "ellipsis-horizontal",
						accesskey: "m",
						items: {
							clone: {
								name: LNG.clone,
								className: "clone",
								icon: "external-link",
								accesskey: "l"
							},
							fav: {
								name: LNG.add_to_fav,
								className: "fav",
								icon: "star"
							},
							share: {
								name: LNG.share,
								className: "share",
								icon: "share-sign",
								accesskey: "e"
							},
							explorer: {
								name: LNG.manage_folder,
								className: "explorer line_top",
								icon: "laptop",
								accesskey: "v"
							},
							openProject: {
								name: LNG.openProject,
								className: "openProject",
								icon: "edit"
							}
						}
					},
					sep3: "--------",
					info: {
						name: LNG.info + '<b class="ml-20"></b>',
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			})
		},
		j = function() {
			$('<i class="' + n.substr(1) + '"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: n,
				callback: function(e) {
					M(e)
				},
				items: {
					explorer: {
						name: LNG.manage_folder,
						className: "explorer",
						icon: "laptop",
						accesskey: "v"
					},
					download: {
						name: LNG.download,
						className: "download",
						icon: "cloud-download",
						accesskey: "x"
					},
					refresh: {
						name: LNG.refresh_tree,
						className: "refresh",
						icon: "refresh",
						accesskey: "e"
					},
					sep1: "--------",
					copy: {
						name: LNG.copy,
						className: "copy",
						icon: "copy",
						accesskey: "c"
					},
					cute: {
						name: LNG.cute,
						className: "cute",
						icon: "cut",
						accesskey: "k"
					},
					past: {
						name: LNG.past,
						className: "past",
						icon: "paste",
						accesskey: "p"
					},
					rname: {
						name: LNG.rename,
						className: "rname",
						icon: "pencil",
						accesskey: "r"
					},
					remove: {
						name: LNG.remove,
						className: "remove",
						icon: "trash",
						accesskey: "d"
					},
					sep2: "--------",
					newfolder: {
						name: LNG.newfolder,
						className: "newfolder",
						icon: "folder-close-alt",
						accesskey: "n"
					},
					newfileOther: c.newfileOther,
					search: {
						name: LNG.search_in_path,
						className: "search",
						icon: "search",
						accesskey: "s"
					},
					open_ie: {
						name: LNG.open_ie,
						className: "open_ie",
						icon: "globe"
					},
					others: {
						name: LNG.more,
						icon: "ellipsis-horizontal",
						accesskey: "m",
						className: "more_action",
						items: {
							clone: {
								name: LNG.clone,
								className: "clone",
								icon: "external-link",
								accesskey: "l"
							},
							fav: {
								name: LNG.add_to_fav,
								className: "fav",
								icon: "star"
							},
							share: {
								name: LNG.share,
								className: "share",
								icon: "share-sign",
								accesskey: "e"
							},
							explorer: {
								name: LNG.manage_folder,
								className: "explorer line_top",
								icon: "laptop",
								accesskey: "v"
							},
							openProject: {
								name: LNG.openProject,
								className: "openProject",
								icon: "edit"
							}
						}
					},
					sep3: "--------",
					info: {
						name: LNG.info + '<b class="ml-20">Alt+I</b>',
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			})
		},
		z = function() {
			$('<i class="' + s.substr(1) + '"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: s,
				callback: function(e) {
					M(e)
				},
				items: {
					refresh: {
						name: LNG.refresh,
						className: "refresh",
						icon: "refresh",
						accesskey: "e"
					}
				}
			})
		},
		S = function() {
			$('<i class="' + r.substr(1) + '"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: r,
				callback: function(e) {
					M(e)
				},
				items: {
					fav: {
						name: LNG.add_to_fav,
						className: "fav",
						icon: "star",
						accesskey: "f"
					}
				}
			})
		},
		T = function() {
			$('<i class="' + l.substr(1) + '"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: l,
				callback: function(e) {
					M(e)
				},
				items: {
					fav: {
						name: LNG.add_to_fav,
						className: "fav",
						icon: "star",
						accesskey: "f"
					}
				}
			})
		},
		E = function() {
			$('<i class="' + o.substr(1) + '"></i>').appendTo("#rightMenu"), $.contextMenu({
				zIndex: 9999,
				selector: o,
				callback: function(e) {
					M(e)
				},
				items: {
					open: {
						name: LNG.open,
						className: "open",
						icon: "external-link",
						accesskey: "o"
					},
					edit: {
						name: LNG.edit,
						className: "edit",
						icon: "edit",
						accesskey: "e"
					},
					download: {
						name: LNG.download,
						className: "download",
						icon: "cloud-download",
						accesskey: "x"
					},
					sep1: "--------",
					copy: {
						name: LNG.copy,
						className: "copy",
						icon: "copy",
						accesskey: "c"
					},
					cute: {
						name: LNG.cute,
						className: "cute",
						icon: "cut",
						accesskey: "k"
					},
					rname: {
						name: LNG.rename,
						className: "rname",
						icon: "pencil",
						accesskey: "r"
					},
					remove: {
						name: LNG.remove,
						className: "remove",
						icon: "trash",
						accesskey: "d"
					},
					sep2: "--------",
					open_ie: {
						name: LNG.open_ie,
						className: "open_ie",
						icon: "globe"
					},
					clone: {
						name: LNG.clone,
						className: "clone",
						icon: "external-link",
						accesskey: "l"
					},
					others: {
						name: LNG.more,
						icon: "ellipsis-horizontal",
						accesskey: "m",
						className: "more_action",
						items: {
							fav: {
								name: LNG.add_to_fav,
								className: "fav",
								icon: "star"
							},
							share: {
								name: LNG.share,
								className: "share",
								icon: "share-sign",
								accesskey: "e"
							}
						}
					},
					sep3: "--------",
					info: {
						name: LNG.info + '<b class="ml-20">Alt+I</b>',
						className: "info",
						icon: "info",
						accesskey: "i"
					}
				}
			})
		},
		M = function(e) {
			switch (e) {
			case "edit":
				ui.tree.openEditor();
				break;
			case "open":
				ui.tree.open();
				break;
			case "refresh":
				ui.tree.refresh();
				break;
			case "copy":
				ui.tree.copy();
				break;
			case "cute":
				ui.tree.cute();
				break;
			case "past":
				ui.tree.past();
				break;
			case "clone":
				ui.tree.clone();
				break;
			case "rname":
				ui.tree.rname();
				break;
			case "remove":
				ui.tree.remove();
				break;
			case "info":
				ui.tree.info();
				break;
			case "cute_to":
				ui.tree.cuteTo();
				break;
			case "copy_to":
				ui.tree.copyTo();
				break;
			case "download":
				ui.tree.download();
				break;
			case "open_ie":
				ui.tree.openIE();
				break;
			case "search":
				ui.tree.search();
				break;
			case "share":
				ui.tree.share();
				break;
			case "search":
				ui.tree.search();
				break;
			case "newfolder":
				ui.tree.create("folder");
				break;
			case "newfile":
				ui.tree.create("txt");
				break;
			case "newfile_html":
				ui.tree.create("html");
				break;
			case "newfile_php":
				ui.tree.create("php");
				break;
			case "newfile_js":
				ui.tree.create("js");
				break;
			case "newfile_css":
				ui.tree.create("css");
				break;
			case "newfile_oexe":
				ui.tree.create("oexe");
				break;
			case "explorer":
				ui.tree.explorer();
				break;
			case "openProject":
				ui.tree.openProject();
				break;
			case "fav_page":
				core.setting("fav");
				break;
			case "fav":
				ui.tree.fav();
				break;
			case "fav_remove":
				ui.tree.fav_remove();
				break;
			case "refresh_all":
				ui.tree.init();
				break;
			case "quit":
				break;
			default:
			}
		};
	return {
		initDesktop: p,
		initExplorer: d,
		initEditor: u,
		show: function(e, t, a) {
			e && (rightMenu.hidden(), $(e).contextMenu({
				x: t,
				y: a
			}))
		},
		menuShow: function() {
			var e = "hidden",
				t = $(".context-menu-list").filter(":visible"),
				a = $(".context-menu-active");
			if (0 != t.length && 0 != a.length) {
				if (t.find(".disable").addClass("disabled"), a.hasClass("menufile")) {
					var i = fileLight.type(Global.fileListSelect);
					"zip" == i ? t.find(".unzip").removeClass(e) : t.find(".unzip").addClass(e), inArray(core.filetype.image, i) ? t.find(".setBackground").removeClass(e) : t.find(".setBackground").addClass(e), "oexe" == i ? t.find(".app_edit").removeClass(e) : t.find(".app_edit").addClass(e), inArray(core.filetype.image, i) || inArray(core.filetype.music, i) || inArray(core.filetype.movie, i) || inArray(core.filetype.bindary, i) || inArray(core.filetype.doc, i) && !G.office_have ? t.find(".open_text").addClass(e) : t.find(".open_text").removeClass(e)
				}
				if (a.hasClass("menufolder") || a.hasClass("menufile") || a.hasClass("menuTreeFolder") || a.hasClass("menuTreeFile")) {
					var n = "disabled",
						o = ".cute,.rname,.remove,.zip",
						s = ".open,.open_text,.down,.share,.copy,.cute,.rname,.remove,.open_ie,.zip,.unzip,.search,.more_action";
					a.hasClass("file_not_readable") ? t.find(s).addClass(n) : t.find(s).removeClass(n), a.hasClass("file_not_writeable") ? t.find(o).addClass(n) : t.find(o).removeClass(n)
				}
				if (a.hasClass("dialog_menu")) {
					var r = a.attr("id"),
						l = art.dialog.list[r];
					l.has_frame() ? (t.find(".open_window").removeClass(e), t.find(".refresh").removeClass(e), t.find(".qrcode").removeClass(e)) : (t.find(".open_window").addClass(e), t.find(".refresh").addClass(e), t.find(".qrcode").addClass(e))
				}
				if (a.hasClass("menuMore")) {
					var c = 0;
					Global.fileListSelect.each(function() {
						var e = core.pathExt(fileLight.name($(this)));
						(inArray(core.filetype.music, e) || inArray(core.filetype.movie, e)) && (c += 1)
					}), 0 == c ? t.find(".playmedia").addClass(e) : t.find(".playmedia").removeClass(e)
				}
			}
		},
		isDisplay: function() {
			var e = !1;
			return $(".context-menu-list").each(function() {
				"none" != $(this).css("display") && (e = !0)
			}), e
		},
		hidden: function() {
			$(".context-menu-list").filter(":visible").trigger("contextmenu:hide")
		}
	}
}), define("app/common/tree", ["./pathOperate", "./pathOpen", "./CMPlayer"], function(e) {
	var t, a = e("./pathOperate"),
		i = e("./pathOpen"),
		n = !1;
	ui.pathOpen = i, ui.pathOperate = a;
	var o, s = function() {
			0 != $("#windowMaskView").length && "block" == $("#windowMaskView").css("display") && inArray(core.filetype.image, p().type) && i.open(p().path, p().type)
		},
		r = function() {
			$.ajax({
				url: Config.treeAjaxURL + "&type=init",
				dataType: "json",
				error: function() {
					$("#folderList").html('<div style="text-align:center;">' + LNG.system_error + "</div>")
				},
				success: function(e) {
					if (!e.code) return $("#folderList").html('<div style="text-align:center;">' + LNG.system_error + "</div>"), void 0;
					var t = e.data;
					$.fn.zTree.init($("#folderList"), d, t), o = $.fn.zTree.getZTreeObj("folderList")
				}
			}), $(".ztree .switch").die("mouseenter").live("mouseenter", function() {
				$(this).addClass("switch_hover")
			}).die("mouseleave").live("mouseleave", function() {
				$(this).removeClass("switch_hover")
			}), "editor" == Config.pageApp && (Mousetrap.bind("up", function(e) {
				l(e, "up")
			}).bind("down", function(e) {
				l(e, "down")
			}).bind("left", function(e) {
				l(e, "left")
			}).bind("right", function(e) {
				l(e, "right")
			}), Mousetrap.bind("enter", function() {
				tree.open()
			}).bind(["del", "command+backspace"], function() {
				tree.remove()
			}).bind("f2", function(e) {
				stopPP(e), tree.rname()
			}).bind(["ctrl+f", "command+f"], function(e) {
				stopPP(e), tree.search()
			}).bind(["ctrl+c", "command+c"], function() {
				tree.copy()
			}).bind(["ctrl+x", "command+x"], function() {
				tree.cute()
			}).bind(["ctrl+v", "command+v"], function() {
				tree.past()
			}).bind("alt+m", function() {
				tree.create("folder")
			}).bind("alt+n", function() {
				tree.create("file")
			}))
		},
		l = function(e, t) {
			stopPP(e);
			var a = o.getSelectedNodes()[0];
			if (a) {
				switch (t) {
				case "up":
					var i = a.getPreNode();
					if (i) {
						if (i.open && i.children.length > 0) for (; i.open && i.children && i.children.length >= 1;) i = i.children[i.children.length - 1]
					} else i = a.getParentNode();
					o.selectNode(i);
					break;
				case "down":
					if (a.open && a.children.length >= 1) i = a.children[0];
					else {
						var n = a,
							i = n.getNextNode() || n.getParentNode().getNextNode();
						try {
							for (; !i;) n = n.getParentNode(), i = n.getNextNode() || n.getParentNode().getNextNode()
						} catch (e) {}
					}
					o.selectNode(i);
					break;
				case "left":
					a.isParent ? a.open ? o.expandNode(a, !1) : o.selectNode(a.getParentNode()) : o.selectNode(a.getParentNode());
					break;
				case "right":
					a.open ? o.selectNode(a.children[0]) : o.expandNode(a, !0);
					break;
				default:
				}
				s()
			}
		},
		c = function() {
			return "editor" == Config.pageApp ? !1 : !0
		},
		d = {
			async: {
				enable: !0,
				dataType: "json",
				url: Config.treeAjaxURL,
				autoParam: ["ajax_path=path", "tree_icon=tree_icon"],
				dataFilter: function(e, t, a) {
					return a.code ? a.data : null
				}
			},
			edit: {
				enable: !0,
				showRemoveBtn: !1,
				showRenameBtn: !1,
				drag: {
					isCopy: !1,
					isMove: !1
				}
			},
			view: {
				showLine: !1,
				selectedMulti: !1,
				dblClickExpand: c(),
				addDiyDom: function(e, t) {
					var a = 15,
						i = $("#" + t.tId + "_switch"),
						n = $("#" + t.tId + "_ico");
					i.remove(), t.iconSkin = t.tree_icon;
					var o = t.tree_icon;
					if (t.ext ? o = t.ext : t.tree_icon || (o = t.type), n.before(i).before('<span id="' + t.tId + '_my_ico"  class="tree_icon button ' + o + '"></span>').remove(), void 0 != t.ext && n.attr("class", "").addClass("file " + t.ext).removeAttr("style"), t.level >= 1) {
						var s = "<span class='space' style='display: inline-block;width:" + a * t.level + "px'></span>";
						i.before(s)
					}
					var r = "";
					void 0 != t.menuType ? r = t.menuType : (("file" == t.type || "oexe" == t.ext) && (r = "menuTreeFile"), "folder" == t.type && (r = "menuTreeFolder"));
					var l = LNG.name + ":" + t.name + "\n" + LNG.size + ":" + core.file_size(t.size) + "\n" + LNG.modify_time + ":" + t.mtime;
					"file" != t.type && (l = t.name), i.parent().addClass(r).attr("title", l), 0 == t.is_writeable && i.parent().addClass("file_not_writeable"), 0 == t.is_readable && i.parent().addClass("file_not_readable")
				}
			},
			callback: {
				onClick: function(e, t, a) {
					if (o.selectNode(a), "editor" == Config.pageApp && "folder" == a.type) return o.expandNode(a), void 0;
					if ("editor" == Config.pageApp || "folder" != a.type) ui.tree.openEditor();
					else {
						if (-1 != $.inArray(a.path, ["{tree_self_fav}", "{tree_group_self}", "{tree_group_all}", "{tree_group_public}"])) return;
						ui.path.list(a.path)
					}
				},
				beforeRightClick: function(e, t) {
					o.selectNode(t)
				},
				beforeAsync: function(e, t) {
					t.ajax_name = urlEncode(t.name), t.ajax_path = urlEncode(t.path), $("#" + t.tId + "_my_ico").addClass("ico_loading")
				},
				onAsyncSuccess: function(e, a, i, n) {
					return $("#" + i.tId + "_my_ico").removeClass("ico_loading"), 0 == n.data.length ? (o.removeChildNodes(i), void 0) : ("function" == typeof t && (t(), t = void 0), void 0)
				},
				onRename: function(e, i, n) {
					var s = n.getParentNode();
					if (o.getNodesByParam("name", n.name, s).length > 1) return core.tips.tips(LNG.name_isexists, !1), o.removeNode(n), void 0;
					if (n.create) {
						var r = n.path + "/" + n.name;
						"folder" == n.type ? a.newFolder(r, function(e) {
							e.code && (u(s), t = function() {
								var e = o.getNodesByParam("name", n.name, s)[0];
								o.selectNode(e), _()
							})
						}) : a.newFile(r, function(e) {
							e.code && (u(s), t = function() {
								var e = o.getNodesByParam("name", n.name, s)[0];
								o.selectNode(e), _()
							})
						})
					} else {
						var l = rtrim(n.path, "/"),
							c = core.pathFather(n.path) + n.name;
						a.rname(l, c, function(e) {
							e.code && (u(s), t = function() {
								var e = o.getNodesByParam("name", n.name, s)[0];
								o.selectNode(e), _()
							})
						})
					}
				},
				beforeDrag: function(e, t) {
					for (var a = 0, i = t.length; i > a; a++) if (t[a].drag === !1) return !1;
					return !0
				},
				beforeDrop: function(e, t, a) {
					return a ? a.drop !== !1 : !0
				},
				onDrop: function(e, t, i, n) {
					var o = "",
						s = "",
						r = i[0];
					(r.father || r.this_path) && (o = r.father + urlEncode(r.name), s = n.father + urlEncode(n.name), a.cuteDrag([{
						path: o,
						type: r.type
					}], s, function() {
						u(r)
					}))
				}
			}
		},
		p = function(e) {
			if (o) {
				var t = o.getSelectedNodes()[0],
					a = "";
				return t ? (a = t.type, ("_null_" == a || void 0 == a) && (a = "folder"), "file" == a && (a = t.ext), e ? [{
					path: t.path,
					type: a,
					node: t
				}] : {
					path: t.path,
					type: a,
					node: t
				}) : {
					path: "",
					type: ""
				}
			}
		},
		u = function(e) {
			return e || (e = o.getSelectedNodes()[0]), e.isParent || (e = e.getParentNode()) ? (o.reAsyncChildNodes(e, "refresh"), void 0) : (ui.tree.init(), void 0)
		},
		f = function() {
			m("{tree_self_fav}")
		},
		h = function() {
			m("{tree_self_fav}"), m("{tree_group_self}"), m("{tree_group_all}", m("{tree_group_public}"))
		},
		m = function(e) {
			var t = o.getNodesByParam("path", e, null);
			u(t[0])
		},
		_ = function() {
			"explorer" == Config.pageApp && ui.f5()
		};
	return {
		pathOpen: i,
		init: r,
		refresh: u,
		refresh_path: m,
		refresh_fav: f,
		refresh_group_change: h,
		zTree: function() {
			return o
		},
		openEditor: function() {
			i.openEditor(p().path)
		},
		openIE: function() {
			i.openIE(p().path)
		},
		share: function() {
			a.share(p())
		},
		download: function() {
			"folder" == p().type ? a.zipDownload(p(!0)) : i.download(p().path)
		},
		open: function() {
			if (!($(".dialog_path_remove").length >= 1)) {
				var e = p();
				"oexe" == e.type && (e.path = e.node), i.open(e.path, e.type)
			}
		},
		fav: function() {
			var e = p();
			e.name = e.node.name, a.fav(e)
		},
		search: function() {
			core.search("", p().path)
		},
		appEdit: function() {
			var e = p(),
				t = e.node;
			t.path = e.path, a.appEdit(t, function() {
				u(e.node.getParentNode())
			})
		},
		info: function() {
			a.info(p(!0))
		},
		copy: function() {
			a.copy(p(!0))
		},
		cute: function() {
			a.cute(p(!0))
		},
		copyTo: function() {
			core.path_select("folder", LNG.copy_to, function(e) {
				a.copyDrag(p(!0), e, "", !1)
			})
		},
		cuteTo: function() {
			core.path_select("folder", LNG.cute_to, function(e) {
				a.cuteDrag(p(!0), e, function() {
					m()
				})
			})
		},
		fav_remove: function() {
			$.dialog({
				id: "dialog_fav_remove",
				fixed: !0,
				icon: "question",
				title: LNG.fav_remove,
				width: 250,
				padding: 40,
				content: LNG.fav_remove + "?",
				ok: function() {
					$.ajax({
						url: "index.php?fav/del&name=" + p().node.name,
						dataType: "json",
						async: !1,
						success: function(e) {
							core.tips.tips(e), ui.tree.init()
						}
					})
				},
				cancel: !0
			})
		},
		past: function() {
			var e = p();
			e.node.isParent || (e.node = e.node.getParentNode()), a.past(e.path, function() {
				_(), u(e.node)
			})
		},
		clone: function() {
			var e = p();
			e.node.isParent || (e.node = e.node.getParentNode()), a.copyDrag(p(!0), core.pathFather(e.path), function() {
				_(), "folder" == e.type ? u(e.node.getParentNode()) : u(e.node)
			}, !0)
		},
		remove: function() {
			var e = p(!0),
				t = e[0].node.getParentNode();
			a.remove(e, function() {
				_(), u(t)
			})
		},
		checkIfChange: function(e) {
			n || (n = !0, o && (o.getNodesByFilter(function(t) {
				var a = t.path;
				return "folder" == t.type && core.pathClear(a) == core.pathClear(e) && u(t), !1
			}, !0), setTimeout(function() {
				n = !1
			}, 500)))
		},
		explorer: function() {
			var e = o.getSelectedNodes();
			if (0 >= e.length) {
				var t = o.getNodes();
				o.selectNode(t[0])
			}
			var a = p().path;
			"folder" != p().type && (a = core.pathFather(a)), core.explorer(a)
		},
		openProject: function() {
			core.explorerCode(p().path)
		},
		create: function(e) {
			var a = o.getSelectedNodes();
			if (0 >= a.length) {
				var i = o.getNodes();
				o.selectNode(i[0])
			}
			var n = p(),
				s = n.node,
				r = s.getParentNode(),
				l = "newfile",
				c = 0,
				d = LNG.newfolder;
			if ("folder" == e) {
				for (; o.getNodesByParam("name", d + "(" + c + ")", r).length > 0;) c++;
				newNode = {
					name: d + "(" + c + ")",
					ext: "",
					type: "folder",
					create: !0,
					path: n.path
				}
			} else {
				for (var u = e; o.getNodesByParam("name", l + "(" + c + ")." + u, r).length > 0;) c++;
				newNode = {
					name: l + "(" + c + ")." + u,
					ext: u,
					type: "file",
					create: !0,
					path: n.path
				}
			}
			if (void 0 != s.children) {
				var f = o.addNodes(s, newNode)[0];
				o.editName(f)
			} else "folder" != s.type && (s = s.getParentNode()), t = function() {
				var e = o.addNodes(s, newNode)[0];
				o.editName(e)
			}, s.isParent ? o.expandNode(s) : t()
		},
		show_file: function() {
			var e = "./index.php?share/file&sid=" + G.sid + "&user=" + G.user + "&path=" + p().path;
			window.open(e)
		},
		rname: function() {
			var e = o.getSelectedNodes()[0];
			o.editName(e), e.beforeName = e.name
		}
	}
}), define("app/common/pathOperate", [], function(e) {
	var t = ["/", "\\", ":", "*", "?", '"', "<", ">", "|"],
		a = function(e) {
			var a = function(e, t) {
					for (var a = t.length, i = 0; a > i; i++) if (e.indexOf(t[i]) > 0) return !0;
					return !1
				};
			return a(e, t) ? (core.tips.tips(LNG.path_not_allow + ':/  : * ? " < > |', !1), !1) : !0
		},
		i = function(e) {
			for (var t = "list=[", a = 0; e.length > a; a++) t += '{"type":"' + e[a].type + '","path":"' + urlEncode2(e[a].path) + '"}', e.length - 1 > a && (t += ",");
			return t + "]"
		},
		n = function(e, t) {
			if (e) {
				var i = core.pathThis(e);
				return a(i) ? ($.ajax({
					dataType: "json",
					url: "index.php?explorer/mkfile&path=" + urlEncode2(e),
					beforeSend: function() {
						core.tips.loading()
					},
					error: core.ajaxError,
					success: function(e) {
						core.tips.close(e), "function" == typeof t && t(e)
					}
				}), void 0) : ("function" == typeof t && t(), void 0)
			}
		},
		o = function(e, t) {
			if (e) {
				var i = core.pathThis(e);
				return a(i) ? ($.ajax({
					dataType: "json",
					url: "index.php?explorer/mkdir&path=" + urlEncode2(e),
					beforeSend: function() {
						core.tips.loading()
					},
					error: core.ajaxError,
					success: function(e) {
						core.tips.close(e), "function" == typeof t && t(e)
					}
				}), void 0) : ("function" == typeof t && t(), void 0)
			}
		},
		s = function(e, t, i) {
			return e && t && e != t ? a(core.pathThis(t)) ? ($.ajax({
				type: "POST",
				dataType: "json",
				url: "index.php?explorer/pathRname",
				data: "path=" + urlEncode(e) + "&rname_to=" + urlEncode(t),
				beforeSend: function() {
					core.tips.loading()
				},
				error: core.ajaxError,
				success: function(e) {
					core.tips.close(e), "function" == typeof i && i(e)
				}
			}), void 0) : ("function" == typeof i && i(), void 0) : void 0
		},
		r = function(e, t) {
			if (!(1 > e.length)) {
				var a = LNG.remove_title,
					n = LNG.remove_info,
					o = "index.php?explorer/pathDelete";
				G.this_path == G.USER_RECYCLE && (n = LNG.recycle_remove + "?", o = "index.php?explorer/pathDeleteRecycle", a = LNG.recycle_remove), "share" == e[0].type && (n = LNG.share_remove_tips, o = "index.php?userShare/del", a = LNG.share_remove), e.length > 1 && (n += ' ... <span class="badge">' + e.length + "</span>"), $.dialog({
					id: "dialog_path_remove",
					fixed: !0,
					icon: "question",
					title: a,
					padding: 40,
					width: 200,
					lock: !0,
					background: "#000",
					opacity: .1,
					content: n,
					ok: function() {
						$.ajax({
							url: o,
							type: "POST",
							dataType: "json",
							data: i(e),
							beforeSend: function() {
								core.tips.loading()
							},
							error: core.ajaxError,
							success: function(a) {
								if (core.tips.close(a), FrameCall.father("ui.f5", ""), "share" == e[0].type) {
									G.self_share = a.info;
									var i = art.dialog.list.share_dialog;
									void 0 != i && i.close()
								}
								"function" == typeof t && t(a)
							}
						})
					},
					cancel: !0
				})
			}
		},
		l = function(e) {
			1 > e.length || $.ajax({
				url: "index.php?explorer/pathCopy",
				type: "POST",
				dataType: "json",
				data: i(e),
				error: core.ajaxError,
				success: function(e) {
					core.tips.tips(e)
				}
			})
		},
		c = function(e) {
			var t = e.path,
				a = "folder" == e.type ? "folder" : "file";
			1 > t.length || core.authCheck("userShare:set") && $.ajax({
				url: "./index.php?userShare/checkByPath&path=" + urlEncode(t),
				dataType: "json",
				error: core.ajaxError,
				success: function(e) {
					if (e.code) core.tips.tips("该分享已存在", !0), d(e.data);
					else {
						G.self_share = e.info;
						var i = "&path=" + urlEncode(t) + "&type=" + a + "&name=" + urlEncode(core.pathThis(t));
						p(i, function(e) {
							e.code ? (core.tips.tips(LNG.success, !0), G.self_share = e.info, ui.f5()) : (core.tips.tips(e), d(void 0, function() {
								$(".content_info input[name=type]").val(a), $(".content_info input[name=path]").val(t), $(".content_info input[name=name]").val(core.pathThis(t) + "(1)"), "file" == a && ($(".label_code_read").addClass("hidden"), $(".label_can_upload").addClass("hidden"))
							}))
						})
					}
				}
			})
		},
		d = function(t, a) {
			0 != $(".share_dialog").length && $(".share_dialog").shake(2, 5, 100), seajs.use("lib/jquery.datetimepicker/jquery.datetimepicker.css"), e.async("lib/jquery.datetimepicker/jquery.datetimepicker", function() {
				u(t), void 0 != a && a()
			})
		},
		p = function(e, t) {
			$.ajax({
				url: "index.php?userShare/set",
				data: e,
				type: "POST",
				dataType: "json",
				beforeSend: function() {
					$(".share_create_button").addClass("disabled")
				},
				error: function() {
					core.tips.tips(LNG.error, !1)
				},
				success: function(e) {
					$(".share_create_button").removeClass("disabled"), void 0 != t && t(e)
				}
			})
		},
		u = function(t) {
			var a = e("../tpl/share.html"),
				i = template.compile(a),
				n = i({
					LNG: LNG
				});
			$.dialog({
				id: "share_dialog",
				simple: !0,
				resize: !1,
				width: 425,
				title: LNG.share,
				padding: "0",
				fixed: !0,
				content: n,
				cancel: function() {}
			});
			var o = "zh_CN" == G.lang ? "ch" : "en";
			$("#share_time").datetimepicker({
				format: "Y/m/d",
				formatDate: "Y/m/d",
				timepicker: !1,
				lang: o
			}), $("#share_time").unbind("blur").bind("blur", function(e) {
				stopPP(e)
			});
			var s = function(e) {
					if ($(".share_setting_more").addClass("hidden"), void 0 == e) $(".share_has_url").addClass("hidden"), $(".share_action .share_remove_button").addClass("hidden"), $(".content_info input[name=sid]").val(""), $(".content_info input[name=type]").val(""), $(".content_info input[name=name]").val(""), $(".content_info input[name=path]").val(""), $(".content_info input[name=time_to]").val(""), $(".content_info input[name=share_password]").val(""), $(".share_view_info").addClass("hidden");
					else {
						e.can_upload === void 0 && (e.can_upload = ""), t = e, $(".content_info input[name=sid]").val(e.sid), $(".content_info input[name=type]").val(e.type), $(".content_info input[name=name]").val(e.name), $(".content_info input[name=path]").val(e.path), $(".content_info input[name=time_to]").val(e.time_to), $(".content_info input[name=share_password]").val(e.share_password), $(".share_view_info").removeClass("hidden"), e.num_download === void 0 && (e.num_download = 0), e.num_view === void 0 && (e.num_view = 0);
						var a = LNG.share_view_num + e.num_view + "  " + LNG.share_download_num + e.num_download;
						$(".share_view_info").html(a), "1" == e.code_read ? $(".content_info input[name=code_read]").attr("checked", "checked") : $(".content_info input[name=code_read]").removeAttr("checked"), "1" == e.not_download ? $(".content_info input[name=not_download]").attr("checked", "checked") : $(".content_info input[name=not_download]").removeAttr("checked"), "1" == e.can_upload ? $(".content_info input[name=can_upload]").attr("checked", "checked") : $(".content_info input[name=can_upload]").removeAttr("checked"), $(".share_has_url").removeClass("hidden"), "file" == e.type ? ($(".label_code_read").addClass("hidden"), $(".label_can_upload").addClass("hidden")) : ($(".label_code_read").removeClass("hidden"), $(".label_can_upload").removeClass("hidden"));
						var i = e.type;
						"folder" == e.type && (i = 1 == e.code_read ? "code_read" : "folder");
						var n = G.app_host + "index.php?share/" + i + "&user=" + G.user_id + "&sid=" + e.sid;
						$(".content_info .share_url").val(n), ("1" == e.time_to || "1" == e.share_password || "1" == e.can_upload || "1" == e.code_read || "1" == e.not_download) && $(".share_setting_more").removeClass("hidden"), $(".share_remove_button").removeClass("hidden"), $(".share_create_button").text(LNG.share_save)
					}
				},
				l = function() {
					$(".share_action .share_remove_button").unbind("click").click(function() {
						r([{
							type: "share",
							path: t.sid
						}], function() {
							ui.f5()
						})
					}), $(".content_info .share_more").unbind("click").click(function() {
						$(".share_setting_more").toggleClass("hidden")
					}), $(".share_action .share_create_button").unbind("click").click(function() {
						var e = "";
						$(".share_dialog .content_info input[name]").each(function() {
							var t = urlEncode($(this).val());
							"checkbox" == $(this).attr("type") && (t = $(this).attr("checked") ? "1" : ""), e += "&" + $(this).attr("name") + "=" + urlEncode(t)
						}), p(e, function(e) {
							e.code ? (core.tips.tips(LNG.success, !0), G.self_share = e.info, ui.f5(), s(e.data), $(".share_create_button").text(LNG.share_save)) : core.tips.tips(e)
						})
					}), $(".content_info .open_window").unbind("click").bind("click", function() {
						window.open($("input.share_url").val())
					}), $(".content_info .qrcode").unbind("click").bind("click", function() {
						core.qrcode($("input.share_url").val())
					});
					var e = $("input.share_url"),
						a = e.get(0);
					e.unbind("hover click").bind("hover click", function() {
						$(this).focus();
						var t = e.val().length;
						if ($.browser.msie) {
							var i = a.createTextRange();
							i.moveEnd("character", -a.value.length), i.moveEnd("character", t), i.moveStart("character", 0), i.select()
						} else a.setSelectionRange(0, t)
					})
				};
			s(t), l()
		},
		f = function(e) {
			if (!(1 > e.length)) {
				var t = core.path2url(e);
				FrameCall.father("ui.setWall", '"' + t + '"'), $.ajax({
					url: "index.php?setting/set&k=wall&v=" + urlEncode(t),
					dataType: "json",
					success: function(e) {
						core.tips.tips(e)
					}
				})
			}
		},
		h = function(e, t, a) {
			if (!(1 > e.length)) {
				var i, n = core.pathThis(e),
					o = core.pathFather(e);
				i = "folder" == t ? "ui.path.list('" + urlEncode(e) + "');" : "ui.path.open('" + urlEncode(e) + "');";
				var s = urlEncode2(o + n + ".oexe");
				$.ajax({
					url: "./index.php?explorer/mkfile&path=" + s,
					type: "POST",
					dataType: "json",
					data: 'content={"type":"app_link","content":"' + i + '","icon":"app_s2.png"}',
					success: function(e) {
						e.code && "function" == typeof a && a(e)
					}
				})
			}
		},
		m = function(e, t) {
			if (!(1 > e.length)) {
				var a = core.pathThis(e),
					i = core.pathFather(e);
				jsrun = "core.explorerCode('" + urlEncode(e) + "');";
				var n = urlEncode2(i + a + "_project.oexe");
				$.ajax({
					url: "./index.php?explorer/mkfile&path=" + n,
					type: "POST",
					dataType: "json",
					data: 'content={"type":"app_link","content":"' + jsrun + '","icon":"folder.png"}',
					success: function(e) {
						e.code && "function" == typeof t && t(e)
					}
				})
			}
		},
		_ = function(e) {
			1 > e.length || $.ajax({
				url: "index.php?explorer/pathCute",
				type: "POST",
				dataType: "json",
				data: i(e),
				error: core.ajaxError,
				success: function(e) {
					core.tips.tips(e)
				}
			})
		},
		v = function(e, t) {
			if (e) {
				var a = "index.php?explorer/pathPast&path=" + urlEncode2(e);
				$.ajax({
					url: a,
					dataType: "json",
					beforeSend: function() {
						core.tips.loading(LNG.moving)
					},
					error: core.ajaxError,
					success: function(e) {
						core.tips.close(e), "function" == typeof t && t(e.info)
					}
				})
			}
		},
		g = function(t) {
			var a = {};
			a.file_info = e("../tpl/fileinfo/file_info.html"), a.path_info = e("../tpl/fileinfo/path_info.html"), a.path_info_more = e("../tpl/fileinfo/path_info_more.html"), 1 > t.length && (t = [{
				path: G.this_path,
				type: "folder"
			}]);
			var n = "index.php?explorer/pathInfo";
			G.share_page !== void 0 && (n = "index.php?share/pathInfo&user=" + G.user + "&sid=" + G.sid);
			var o = "info";
			1 == t.length && (o = "file" == t[0].type ? core.pathExt(t[0].path) : "folder"), $.ajax({
				url: n,
				type: "POST",
				dataType: "json",
				data: i(t),
				beforeSend: function() {
					core.tips.loading(LNG.getting)
				},
				error: core.ajaxError,
				success: function(e) {
					if (!e.code) return core.tips.close(e), void 0;
					core.tips.close(LNG.get_success, !0);
					var i = "path_info_more",
						n = LNG.info;
					1 == t.length && (i = "folder" == t[0].type ? "path_info" : "file_info", n = core.pathThis(t[0].path), n.length > 15 && (n = n.substr(0, 15) + "...  " + LNG.info));
					var s = template.compile(a[i]),
						r = UUID();
					e.data.is_root = G.is_root, e.data.LNG = LNG, e.data.atime = date(LNG.time_type_info, e.data.atime), e.data.ctime = date(LNG.time_type_info, e.data.ctime), e.data.mtime = date(LNG.time_type_info, e.data.mtime), e.data.size_friendly = core.file_size(e.data.size), $.dialog({
						id: r,
						padding: 5,
						ico: core.ico(o),
						fixed: !0,
						title: n,
						content: s(e.data),
						ok: !0
					}), b(r, t)
				}
			})
		},
		b = function(e, t) {
			var a = $("." + e);
			a.find(".open_window").bind("click", function() {
				window.open(a.find("input.download_url").val())
			}), a.find(".qrcode").unbind("click").bind("click", function() {
				core.qrcode(a.find("input.download_url").val())
			});
			var n = a.find("input.download_url"),
				o = n.get(0);
			n.unbind("hover click").bind("hover click", function() {
				$(this).focus();
				var e = n.val().length;
				if ($.browser.msie) {
					var t = o.createTextRange();
					t.moveEnd("character", -o.value.length), t.moveEnd("character", e), t.moveStart("character", 0), t.select()
				} else o.setSelectionRange(0, e)
			}), a.find(".edit_chmod").click(function() {
				var e = $(this).parent().find("input"),
					a = $(this);
				$.ajax({
					url: "index.php?explorer/pathChmod&mod=" + e.val(),
					type: "POST",
					data: i(t),
					beforeSend: function() {
						a.text(LNG.loading)
					},
					error: function() {
						a.text(LNG.button_save)
					},
					success: function(e) {
						a.text(e.data).animate({
							opacity: .6
						}, 400, 0).delay(1e3).animate({
							opacity: 1
						}, 200, 0, function() {
							a.text(LNG.button_save)
						})
					}
				})
			})
		},
		y = function(e) {
			if (core.authCheck("explorer:fileDownload") && !(1 > e.length)) {
				var t = "index.php?explorer/zipDownload";
				G.share_page !== void 0 && (t = "index.php?share/zipDownload&user=" + G.user + "&sid=" + G.sid), $.ajax({
					url: t,
					type: "POST",
					dataType: "json",
					data: i(e),
					beforeSend: function() {
						core.tips.loading(LNG.zip_download_ready)
					},
					error: core.ajaxError,
					success: function(e) {
						core.tips.close(e), core.tips.tips(e);
						var t = "index.php?explorer/fileDownloadRemove&path=" + urlEncode2(e.info);
						G.share_page !== void 0 && (t = "index.php?share/fileDownloadRemove&user=" + G.user + "&sid=" + G.sid + "&path=" + urlEncode2(e.info));
						var a = '<iframe src="' + t + '" style="width:0px;height:0px;border:0;" frameborder=0></iframe>' + LNG.download_ready + "...",
							i = $.dialog({
								icon: "succeed",
								title: !1,
								time: 1.5,
								content: a
							});
						i.DOM.wrap.find(".aui_loading").remove()
					}
				})
			}
		},
		w = function(e, t) {
			1 > e.length || $.ajax({
				url: "index.php?explorer/zip",
				type: "POST",
				dataType: "json",
				data: i(e),
				beforeSend: function() {
					core.tips.loading(LNG.ziping)
				},
				error: core.ajaxError,
				success: function(e) {
					core.tips.close(e), core.tips.tips(e), "function" == typeof t && t(e)
				}
			})
		},
		x = function(e, t, a) {
			if (e) {
				var i = function(e) {
						$.ajax({
							url: e,
							beforeSend: function() {
								core.tips.loading(LNG.unziping)
							},
							error: core.ajaxError,
							success: function(e) {
								core.tips.close(e), "function" == typeof t && t(e)
							}
						})
					},
					n = "index.php?explorer/unzip&path=" + urlEncode2(e);
				"to_this" == a && (n += "&to_this=1"), "unzip_to_folder" == a ? core.path_select("folder", LNG.unzip_to, function(e) {
					n += "&path_to=" + e, i(n)
				}) : i(n)
			}
		},
		k = function(e, t, a) {
			t && $.ajax({
				url: "index.php?explorer/pathCuteDrag",
				type: "POST",
				dataType: "json",
				data: i(e) + "&path=" + urlEncode2(t + "/"),
				beforeSend: function() {
					core.tips.loading(LNG.moving)
				},
				error: core.ajaxError,
				success: function(e) {
					core.tips.close(e), "function" == typeof a && a(e)
				}
			})
		},
		N = function(e, t, a, n) {
			t && (void 0 == n && (n = 0), $.ajax({
				url: "index.php?explorer/pathCopyDrag",
				type: "POST",
				dataType: "json",
				data: i(e) + "&path=" + urlEncode2(t + "/") + "&filename_auto=" + Number(n),
				beforeSend: function() {
					core.tips.loading(LNG.moving)
				},
				error: core.ajaxError,
				success: function(e) {
					core.tips.close(e), "function" == typeof a && a(e)
				}
			}))
		},
		L = function() {
			$.ajax({
				url: "index.php?explorer/clipboard",
				dataType: "json",
				error: core.ajaxError,
				success: function(e) {
					e.code && $.dialog({
						title: LNG.clipboard,
						padding: 0,
						height: 200,
						width: 400,
						content: e.data
					})
				}
			})
		},
		C = function(e) {
			if (e) {
				-1 == trim(core.pathClear(e.path), "/").indexOf("/") && (0 == e.path.indexOf(G.KOD_USER_SHARE) ? e.type = "user" : 0 == e.path.indexOf(G.KOD_GROUP_SHARE) ? e.type = "group" : 0 == e.path.indexOf(G.KOD_GROUP_PATH) ? e.type = "groupSelf" : 0 == e.path.indexOf(G.KOD_GROUP_PATH) ? e.type = "group" : trim(e.path, "/") == G.KOD_USER_RECYCLE && (e.type = "recycle", e.name = LNG.recycle));
				var t = "&name=" + urlEncode(e.name) + "&path=" + urlEncode(e.path) + "&type=" + e.type;
				core.setting("fav" + t)
			}
		},
		j = function(e) {
			var t = {};
			return t.type = e.find("input[type=radio]:checked").val(), t.content = e.find("textarea").val(), t.group = e.find("[name=group]").val(), e.find("input[type=text]").each(function() {
				var e = $(this).attr("name");
				t[e] = $(this).val()
			}), e.find("input[type=checkbox]").each(function() {
				var e = $(this).attr("name");
				t[e] = "checked" == $(this).attr("checked") ? 1 : 0
			}), t
		},
		z = function(e) {
			e.find(".type input").change(function() {
				var t = $(this).attr("apptype");
				e.find("[data-type]").addClass("hidden"), e.find("[data-type=" + t + "]").removeClass("hidden")
			})
		},
		S = function(t, a, i) {
			var n, o, s, r = LNG.app_create,
				l = UUID(),
				c = e("../tpl/app.html"),
				d = G.basic_path + "static/images/app/",
				p = template.compile(c);
			switch (void 0 == i && (i = "user_edit"), "root_edit" == i && (t = t), "user_edit" == i || "root_edit" == i ? (r = LNG.app_edit, s = p({
				LNG: LNG,
				iconPath: d,
				uuid: l,
				data: t
			})) : s = p({
				LNG: LNG,
				iconPath: d,
				uuid: l,
				data: {}
			}), $.dialog({
				fixed: !0,
				width: 450,
				id: l,
				padding: 15,
				title: r,
				content: s,
				button: [{
					name: LNG.preview,
					callback: function() {
						var e = j(n);
						return core.openApp(e), !1
					}
				}, {
					name: LNG.button_save,
					focus: !0,
					callback: function() {
						var e = j(n);
						switch (i) {
						case "user_add":
							var s = urlEncode2(G.this_path + e.name);
							o = "./index.php?app/user_app&action=add&path=" + s;
							break;
						case "user_edit":
							o = "./index.php?app/user_app&path=" + urlEncode2(t.path);
							break;
						case "root_add":
							o = "./index.php?app/add&name=" + e.name;
							break;
						case "root_edit":
							o = "./index.php?app/edit&name=" + e.name + "&old_name=" + t.name;
							break;
						default:
						}
						$.ajax({
							url: o,
							type: "POST",
							dataType: "json",
							data: "data=" + urlEncode2(json_encode(e)),
							beforeSend: function() {
								core.tips.loading()
							},
							error: core.ajaxError,
							success: function(e) {
								if (core.tips.close(e), e.code) if ("root_edit" == i || "root_add" == i) {
									if (!e.code) return;
									FrameCall.top("Openapp_store", "App.reload", '""')
								} else "function" == typeof a ? a() : ui.f5()
							}
						})
					}
				}]
			}), n = $("." + l), G.is_root || $(".appbox .appline .right a.open").remove(), t.group && n.find("option").eq(t.group).attr("selected", 1), n.find(".aui_content").css("overflow", "inherit"), i) {
			case "user_edit":
				n.find(".name").addClass("hidden"), n.find(".desc").addClass("hidden"), n.find(".group").addClass("hidden"), n.find("option[value=" + t.group + "]").attr("checked", !0);
				break;
			case "user_add":
				n.find(".desc").addClass("hidden"), n.find(".group").addClass("hidden"), n.find("[apptype=url]").attr("checked", !0), n.find("[data-type=url] input[name=resize]").attr("checked", !0), n.find("input[name=width]").attr("value", "800"), n.find("input[name=height]").attr("value", "600"), n.find("input[name=icon]").attr("value", "oexe.png");
				break;
			case "root_add":
				n.find("[apptype=url]").attr("checked", !0), n.find("[data-type=url] input[name=resize]").attr("checked", !0), n.find("input[name=width]").attr("value", "800"), n.find("input[name=height]").attr("value", "600"), n.find("input[name=icon]").attr("value", "oexe.png");
				break;
			case "root_edit":
				n.find("option[value=" + t.group + "]").attr("selected", !0);
				break;
			default:
			}
			z(n)
		},
		T = function() {
			core.appStore()
		},
		E = function(e) {
			e && 4 > e.length && "http" != e.substring(0, 4) || $.ajax({
				url: "./index.php?app/get_url_title&url=" + e,
				dataType: "json",
				beforeSend: function() {
					core.tips.loading()
				},
				success: function(t) {
					var a = t.data;
					core.tips.close(t);
					var i = {
						content: e,
						type: "url",
						desc: "",
						group: "others",
						icon: "internet.png",
						name: a,
						resize: 1,
						simple: 0,
						height: "60%",
						width: "80%"
					},
						n = urlEncode2(G.this_path + a);
					e = "./index.php?app/user_app&action=add&path=" + n, $.ajax({
						url: e,
						type: "POST",
						dataType: "json",
						data: "data=" + urlEncode2(json_encode(i)),
						success: function(e) {
							core.tips.close(e), e.code && ui.f5()
						}
					})
				}
			})
		};
	return {
		appEdit: S,
		appList: T,
		appAddURL: E,
		share: c,
		share_box: d,
		setBackground: f,
		createLink: h,
		createProject: m,
		newFile: n,
		newFolder: o,
		rname: s,
		unZip: x,
		zipDownload: y,
		zip: w,
		copy: l,
		cute: _,
		info: g,
		remove: r,
		cuteDrag: k,
		copyDrag: N,
		past: v,
		clipboard: L,
		fav: C
	}
}), define("app/tpl/share.html", [], '<div class=\'content_box\'>\n    <div class=\'title\'>\n        <div class="titleinfo">{{LNG.share_title}}</div>\n        <div class="share_view_info"></div>\n    </div>\n    <div class=\'content_info\'>\n\n    	<div class="input_line">\n			<span class="input_title">{{LNG.share_path}}:</span>\n			<input id="share_name" type="text" name="path" value="" />\n			<div style="clear:both"></div>\n		</div>\n		<div class="input_line">\n			<span class="input_title">{{LNG.share_name}}:</span>\n			<input type="hidden" name="sid"/>\n			<input type="hidden" name="type"/>\n			<input id="share_name" type="text" placeholder="{{LNG.share_name}}" name="name"/>\n			\n			<a href="javascript:void(0);" class="share_more">{{LNG.more}}<b class="caret"></b></a>\n			<div style="clear:both"></div>\n		</div>\n\n		<div class="share_setting_more hidden">\n			<div class="input_line">\n				<span class="input_title">{{LNG.share_time}}:</span>\n				<input id="share_time" type="text" placeholder="{{LNG.share_time}}" name="time_to"/>\n				<i class="desc">{{LNG.share_time_desc}}</i>\n				<div style="clear:both"></div>\n			</div>\n			<div class="input_line">\n				<span class="input_title">{{LNG.share_password}}:</span>\n				<input type="text" placeholder="{{LNG.share_password}}" name="share_password"/>\n				<i class="desc">{{LNG.share_password_desc}}</i>\n				<div style="clear:both"></div>\n			</div>\n			<div class="input_line share_others">\n				<span class="input_title">{{LNG.others}}:</span>\n				<label class="label_code_read">\n					<input type="checkbox" name="code_read" value="">{{LNG.share_code_read}}\n				</label>\n				<label>\n					<input type="checkbox" name="not_download" value="">{{LNG.share_not_download}}\n				</label>\n				<label class="label_can_upload">\n					<input type="checkbox" name="can_upload" value="">{{LNG.share_can_upload}}\n				</label>\n				\n				<div style="clear:both"></div>\n			</div>\n		</div>\n\n		<div class="input_line share_has_url clear">\n			<span class="input_title">{{LNG.share_url}}:</span>\n			<div class="input-group">\n	          <input type="text" class="share_url" aria-label="Text input with segmented button dropdown">\n	          <div class="input-group-btn">\n	            <button type="button" class="btn btn-default open_window">{{LNG.open}}</button>\n	            <button type="button" class="btn btn-default qrcode"><i class="icon-qrcode"></i></button>\n	          </div>\n	          <!-- <div class="share_jiathis_box"></div> -->\n	        </div>\n	        <div style="clear:both"></div>\n		</div>\n	</div>\n	<div class="share_action">		\n		<button type="button" class="btn btn-primary share_create_button">{{LNG.share_create}}</button>\n		<a type="button" href="javascript:void(0);" class="share_remove_button">{{LNG.share_cancle}}</a>\n	</div>\n</div>'), define("app/tpl/fileinfo/file_info.html", [], "<div class='pathinfo'>\n    <div class='p'>\n        <div class='icon file_icon'></div>\n        <input type='text' class='info_name' name='filename' value='{{name}}'/>\n        <div style='clear:both'></div>\n    </div>\n    \n    {{if download_path}}\n    <div class='line'></div>\n    <div class='p'>\n        <div class='title'>{{LNG.download_address}}:</div>\n        <div class=\"content input-group\">\n            <input type=\"text\" class=\"download_url\" value='{{download_path}}'>\n            <div class=\"input-group-btn\">\n                <button type=\"button\" class=\"btn btn-default open_window\">{{LNG.open}}</button>\n                <button type=\"button\" class=\"btn btn-default qrcode\"><i class=\"icon-qrcode\"></i></button>\n            </div>\n        </div>\n        <div style='clear:both'></div>\n    </div>\n    {{/if}}\n\n    <div class='line'></div>\n    <div class='p'>\n        <div class='title'>{{LNG.address}}:</div>\n        <div class='content' id='id_fileinfo_path'>{{path}}</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='p'>\n        <div class='title'>{{LNG.size}}:</div>\n        <div class='content'>{{size_friendly}}  ({{size}} Byte)</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='line'></div>\n    <div class='p'>\n        <div class='title'>{{LNG.create_time}}</div>\n        <div class='content'>{{ctime}}</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='p'>\n        <div class='title'>{{LNG.modify_time}}</div>\n        <div class='content'>{{mtime}}</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='p'>\n        <div class='title'>{{LNG.last_time}}</div>\n        <div class='content'>{{atime}}</div>\n        <div style='clear:both'></div>\n    </div>\n\n    \n    <div class='line'></div>\n    <div class='p change_permission'>\n        <div class='title'>{{LNG.permission}}:</div>\n        <div class='content'>{{mode}}</div>\n        <div style='clear:both'></div>\n    </div>\n    {{if is_root==\"1\"}}\n    <div class='p'>\n        <div class='title'>{{LNG.permission_edit}}:</div>\n        <div class='content'><input type='text' class='info_chmod' value='777'/>\n        <button class='btn btn-default btn-sm edit_chmod' type='button'>{{LNG.button_save}}</button></div>\n        <div style='clear:both'></div>\n    </div>\n    {{/if}}\n</div>"), define("app/tpl/fileinfo/path_info.html", [], "<div class='pathinfo'>\n    <div class='p'>\n        <div class='icon folder_icon'></div>\n        <input type='text' class='info_name' name='filename' value='{{name}}'/>\n        <div style='clear:both'></div>\n    </div>\n    <div class='line'></div>\n    <div class='p'>\n        <div class='title'>{{LNG.address}}:</div>\n        <div class='content'>{{path}}</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='p'>\n        <div class='title'>{{LNG.size}}:</div>\n        <div class='content'>{{size_friendly}}  ({{size}} Byte)</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='p'>\n        <div class='title'>{{LNG.contain}}:</div> \n        <div class='content'>{{file_num}}  {{LNG.file}},{{folder_num}}  {{LNG.folder}}</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='line'></div>\n    <div class='p'>\n        <div class='title'>{{LNG.create_time}}</div>\n        <div class='content'>{{ctime}}</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='p'>\n        <div class='title'>{{LNG.modify_time}}</div>\n        <div class='content'>{{mtime}}</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='p'>\n        <div class='title'>{{LNG.last_time}}</div>\n        <div class='content'>{{atime}}</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='line'></div>\n    <div class='p'>\n        <div class='title'>{{LNG.permission}}:</div>\n        <div class='content'>{{mode}}</div>\n        <div style='clear:both'></div>\n    </div>\n    {{if is_root==\"1\"}}\n    <div class='p'>\n        <div class='title'>{{LNG.permission_edit}}:</div>\n        <div class='content'><input type='text' class='info_chmod' value='777'/>\n        <button class='btn btn-default btn-sm edit_chmod' type='button'>{{LNG.button_save}}</button></div>\n        <div style='clear:both'></div>\n    </div>\n    {{/if}}\n</div>"), define("app/tpl/fileinfo/path_info_more.html", [], "<div class='pathinfo'>\n    <div class='p'>\n        <div class='icon folder_icon'></div>\n        <div class='content' style='line-height:40px;margin-left:40px;'>\n            {{file_num}}  {{LNG.file}},{{folder_num}}  {{LNG.folder}}</div>\n        <div style='clear:both'></div>\n    </div>\n    <div class='line'></div>\n    <div class='p'>\n        <div class='title'>{{LNG.size}}:</div>\n        <div class='content'>{{size_friendly}} ({{size}} Byte)</div>\n        <div style='clear:both'></div>\n    </div>\n    \n    <div class='line'></div>\n    <div class='p'>\n        <div class='title'>{{LNG.permission}}:</div>\n        <div class='content'>{{mode}}</div>\n        <div style='clear:both'></div>\n    </div>\n    {{if is_root==\"1\"}}\n    <div class='p'>\n        <div class='title'>{{LNG.permission_edit}}:</div>\n        <div class='content'><input type='text' class='info_chmod' value='777'/>\n        <button class='btn btn-default btn-sm edit_chmod' type='button'>{{LNG.button_save}}</button></div>\n        <div style='clear:both'></div>\n    </div>\n    {{/if}}\n</div>"), define("app/tpl/app.html", [], "<div class='appbox'>\n    <div class='appline name'>\n        <div class='left'>{{LNG.name}}</div>\n        <div class='right'><input type='text' name='name' value='{{data.name}}'/></div>\n        <div style='clear:both;'></div>\n    </div>\n    <div class='appline desc'>\n        <div class='left'>{{LNG.app_desc}}</div>\n        <div class='right'><input type='text' name='desc' value='{{data.desc}}'/></div>\n        <div style='clear:both;'></div>\n    </div>\n    <div class='appline icon'>\n        <div class='left'>{{LNG.app_icon}}</div>\n        <div class='right'><input type='text' name='icon' value='{{data.icon}}'/>\n        {{LNG.app_icon_show}}<a href='javascript:core.explorer(\"{{iconPath}}\");' class='button open'><img src='./static/images/app/computer.png'/></a></div>\n        <div style='clear:both;'></div>\n    </div>\n    <div class='appline group'>\n        <div class='left'>{{LNG.app_group}}</div>\n        <div class='right'><select name='group'>\n        <option value ='others'>{{LNG.app_group_others}}</option><option value ='game'>{{LNG.app_group_game}}</option>\n        <option value ='tools'>{{LNG.app_group_tools}}</option><option value ='reader'>{{LNG.app_group_reader}}</option>\n        <option value ='movie'>{{LNG.app_group_movie}}</option><option value ='music'>{{LNG.app_group_music}}</option>\n        </option><option value ='life'>{{LNG.app_group_life}}</option>\n        <select></div>\n        <div style='clear:both;'></div>\n    </div>\n    <div class='appline type'>\n        <div class='left'>{{LNG.app_type}}</div>\n        <div class='right'>\n            <input class='w20' type='radio' id='url{{uuid}}' apptype='url' value='url' name='{{uuid}}type' {{if data.type=='url'}}checked='checked'{{/if}}>\n            <label for='url{{uuid}}'>{{LNG.app_type_url}}</label>\n            <input class='w20' type='radio' id='app{{uuid}}' apptype='app' value='app' name='{{uuid}}type' {{if data.type=='app'}}checked='checked'{{/if}}>\n            <label for='app{{uuid}}'>{{LNG.app_type_code}}</label>\n            <input class='w20' type='radio' id='app_link{{uuid}}' apptype='app_link' value='app_link' name='{{uuid}}type' {{if data.type=='app_link'}}checked='checked'{{/if}}>\n            <label for='app_link{{uuid}}'>{{LNG.app_type_link}}</label>\n        </div>\n        <div style='clear:both;'></div>\n    </div>\n    <div class='appline' data-type='url'>\n        <div class='left'>{{LNG.app_display}}</div>\n        <div class='right'>\n            <input class='w20' type='checkbox' id='simple{{uuid}}' name='simple' {{if data.simple}}checked='true'{{/if}}>\n            <label for='simple{{uuid}}'>{{LNG.app_display_border}}</label>\n            <input class='w20' type='checkbox' id='resize{{uuid}}' name='resize' {{if data.resize}}checked='true'{{/if}}>\n            <label for='resize{{uuid}}'>{{LNG.app_display_size}}</label>\n        </div>\n        <div style='clear:both;'></div>\n    </div>\n    <div class='appline' data-type='url'>\n        <div class='left'>{{LNG.app_size}}</div>\n        <div class='right'>\n            {{LNG.width}}:&nbsp;&nbsp;<input class='w30' type='text' name='width'  value='{{data.width}}'/>\n            {{LNG.height}}:&nbsp;&nbsp;<input class='w30' type='text' name='height' value='{{data.height}}'/>\n        </div>\n        <div style='clear:both;'></div>\n    </div>\n    <div class='appline content'>\n        <div class='left hidden' data-type='app'>{{LNG.app_code}}</div>\n        <div class='left hidden' data-type='app_link'>{{LNG.app_code}}</div>\n        <div class='left' data-type='url'>{{LNG.app_url}}</div>\n        <div class='right'><textarea name='content'>{{data.content}}</textarea></div>\n        <div style='clear:both;'></div>\n    </div>\n</div>"), define("app/common/pathOpen", ["./CMPlayer"], function(e) {
	var t = function(e, t) {
			if (void 0 != e) {
				if (void 0 == t && (t = core.pathExt(e)), t = t.toLowerCase(), !core.path_can_read(e)) return core.tips.tips(LNG.no_permission_read_all, !1), void 0;
				if ("folder" == t) return "explorer" == Config.pageApp ? ui.path.list(e + "/") : core.explorer(e), void 0;
				if ("oexe" != t) {
					if ("swf" == t) return $.dialog({
						resize: !0,
						fixed: !0,
						ico: core.ico("swf"),
						title: core.pathThis(e),
						width: "75%",
						height: "65%",
						padding: 0,
						content: core.createFlash(core.path2url(e))
					}), void 0;
					if ("html" == t || "htm" == t) {
						var i = core.path2url(e);
						return o(i, core.ico("html"), core.pathThis(e)), void 0
					}
					if (inArray(core.filetype.image, t)) {
						var i = urlDecode(e);
						return -1 == e.indexOf("http:") && (i = core.path2url(i)), MaskView.image(i), void 0
					}
					if (inArray(core.filetype.music, t) || inArray(core.filetype.movie, t)) {
						var i = core.path2url(e);
						return c(i, t), void 0
					}
					return inArray(core.filetype.doc, t) || "pdf" == t ? (l(e), void 0) : inArray(core.filetype.text, t) || inArray(core.filetype.code, t) ? (s(e), void 0) : ("editor" == Config.pageApp ? core.tips.tips(t + LNG.edit_can_not, !1) : a(e, ""), void 0)
				}
				if ("string" == typeof e) {
					var n = e;
					"string" != typeof e && (n = e.content.split("'")[1]), core.file_get(n, function(e) {
						var t = json_decode(e);
						t.name = core.pathThis(n), core.openApp(t)
					})
				} else core.openApp(e)
			}
		},
		a = function(e, t) {
			var a = '<div class="unknow_file" style="width:260px;word-break: break-all;"><span>' + LNG.unknow_file_tips + "<br/>" + t + "</span><br/>" + '<a class="btn btn-default btn-sm" href="javascript:ui.pathOpen.openEditorForce(\'' + e + "');\"> " + LNG.edit + " </a>&nbsp;" + '<a class="btn btn-success btn-sm ml-15" href="javascript:ui.path.download(\'' + e + "');\"> " + LNG.unknow_file_download + " </a></div>";
			$.dialog({
				id: "open_unknow_dialog",
				fixed: !0,
				icon: "warning",
				title: LNG.unknow_file_title,
				padding: 30,
				content: a,
				cancel: !0
			}), $(".unknow_file a").unbind("click").bind("click", function() {
				artDialog.list.open_unknow_dialog.close()
			})
		},
		i = function(e) {
			if (core.authCheck("explorer:fileDownload", LNG.no_permission_download) && e) {
				if (!core.path_can_read(e)) return core.tips.tips(LNG.no_permission_read_all, !1), void 0;
				var t = "index.php?explorer/fileDownload&path=" + urlEncode2(e);
				G.share_page !== void 0 && (t = "index.php?share/fileDownload&user=" + G.user + "&sid=" + G.sid + "&path=" + urlEncode2(e));
				var a = '<iframe src="' + t + '" style="width:50px;height:50px;border:0;" frameborder=0></iframe>' + LNG.download_ready + "...",
					i = $.dialog({
						icon: "succeed",
						title: !1,
						time: 1,
						content: a
					});
				i.DOM.wrap.find(".aui_loading").remove()
			}
		},
		n = function(e) {
			if (void 0 != e) {
				if (!core.path_can_read(e)) return core.tips.tips(LNG.no_permission_read_all, !1), void 0;
				var t = core.path2url(e);
				window.open(t)
			}
		},
		o = function(e, t, a, i) {
			if (e) {
				void 0 == i && (i = "openWindow" + UUID());
				var n = "<iframe frameborder='0' name='Open" + i + "' src='" + e + "' style='width:100%;height:100%;border:0;'></iframe>";
				art.dialog.through({
					id: i,
					title: a,
					ico: t,
					width: "78%",
					height: "70%",
					padding: 0,
					content: n,
					resize: !0
				})
			}
		},
		s = function(e) {
			if (e) {
				if (!core.path_can_read(e)) return core.tips.tips(LNG.no_permission_read_all, !1), void 0;
				var a = core.pathExt(e),
					i = "Win32" == navigator.platform || "Windows" == navigator.platform;
				if (G.office_have && inArray(core.filetype.doc, a)) {
					if (i) return l(e, !0), void 0;
					core.tips.tips("windows 系统才支持编辑", !1)
				}
				return core.pathThis(e), inArray(core.filetype.bindary, a) || inArray(core.filetype.music, a) || inArray(core.filetype.image, a) || inArray(core.filetype.movie, a) || inArray(core.filetype.doc, a) ? (t(e, a), void 0) : (r(e), void 0)
			}
		},
		r = function(e) {
			var t = core.pathThis(e),
				a = share.system_top();
			if ("editor" == Config.pageApp) return FrameCall.child("OpenopenEditor", "Editor.add", '"' + urlEncode2(e) + '"'), void 0;
			if (a.frames.OpenopenEditor === void 0) {
				var i = "./index.php?editor/edit#filename=" + urlEncode2(e);
				G.share_page !== void 0 && (i = "./index.php?share/edit&user=" + G.user + "&sid=" + G.sid + "#filename=" + urlEncode2(e));
				var n = t + " ——" + LNG.edit;
				o(i, core.ico("edit"), n.substring(n.length - 50), "openEditor")
			} else FrameCall.top("OpenopenEditor", "Editor.add", '"' + urlEncode2(e) + '"');
			var s = a.artDialog.list.openEditor;
			s && s.display(!0).zIndex().focus()
		},
		l = function(e, t) {
			var a = "./index.php?explorer/officeView&path=" + urlEncode(e);
			G.share_page !== void 0 && (a = G.app_host + "index.php?share/officeView&user=" + G.user + "&sid=" + G.sid + "&path=" + urlEncode2(e)), t !== void 0 && (a += "&is_edit=1"), art.dialog.open(a, {
				ico: core.ico("doc"),
				title: core.pathThis(e),
				width: "80%",
				height: "70%",
				resize: !0
			})
		},
		c = function(t, a) {
			t && ("string" == typeof t && (t = [t]), CMPlayer = e("./CMPlayer"), CMPlayer.play(t, a))
		};
	return {
		open: t,
		play: c,
		openEditor: s,
		openEditorForce: r,
		openIE: n,
		download: i
	}
}), define("app/common/CMPlayer", [], function() {
	var e = {
		ting: {
			path: "music/ting",
			width: 410,
			height: 530
		},
		beveled: {
			path: "music/beveled",
			width: 350,
			height: 200
		},
		kuwo: {
			path: "music/kuwo",
			width: 480,
			height: 200
		},
		manila: {
			path: "music/manila",
			width: 320,
			height: 400
		},
		mp3player: {
			path: "music/mp3player",
			width: 320,
			height: 410
		},
		qqmusic: {
			path: "music/qqmusic",
			width: 300,
			height: 400
		},
		somusic: {
			path: "music/somusic",
			width: 420,
			height: 137
		},
		xdj: {
			path: "music/xdj",
			width: 595,
			height: 235
		},
		webplayer: {
			path: "movie/webplayer",
			width: 600,
			height: 400
		},
		qqplayer: {
			path: "movie/qqplayer",
			width: 600,
			height: 400
		},
		tvlive: {
			path: "movie/tvlive",
			width: 600,
			height: 400
		},
		youtube: {
			path: "movie/youtube",
			width: 600,
			height: 400
		},
		vplayer: {
			path: "movie/vplayer",
			width: 600,
			height: 400
		}
	},
		t = function(e) {
			return "music" == e ? "music_player" : (void 0 == e && (e = "mp3"), inArray(core.filetype.music, e) ? "music_player" : "movie_player")
		},
		a = function(t) {
			var a, i, o, s;
			"music_player" == t ? (s = "mp3", a = e[G.musictheme], i = "music player", o = !1) : (s = "flv", a = e[G.movietheme], i = "movie player", o = !0);
			var r = core.createFlash(G.static_path + "js/lib/cmp4/cmp.swf", "context_menu=2&auto_play=1&play_mode=1&skin=skins/" + a.path + ".zip", t),
				l = {
					id: t + "_dialog",
					simple: !0,
					ico: core.ico(s),
					title: i,
					width: a.width + 10,
					height: a.height,
					content: '<div class="wmp_player"></div><div class="flash_player">' + r + "</div>",
					resize: o,
					padding: 0,
					fixed: !0,
					close: function() {
						var e = n(t);
						e && e.sendEvent && e.sendEvent("view_stop")
					}
				},
				c = share.system_top();
			c.CMP ? art.dialog.through(l) : $.dialog(l)
		},
		i = function(e) {
			var t, a = "";
			for (t = e.length - 1; t >= 0; t--) {
				var i, n; - 1 == e[t].search("fileProxy") ? (i = urlEncode(e[t]), n = core.pathThis(e[t])) : (i = e[t], n = core.pathThis(urlDecode(i))), i = i.replace(/%2F/g, "/"), i = i.replace(/%3F/g, "?"), i = i.replace(/%26/g, "&"), i = i.replace(/%3A/g, ":"), i = i.replace(/%3D/g, "="), a += '<list><m type="" stream="true" src="' + i + '" label="' + n + '"/></list>'
			}
			return a
		},
		n = function(e) {
			var t = share.system_top();
			return t && t.CMP ? t.CMP.get(e) : CMP.get(e)
		},
		o = function(e, t) {
			var a = n(t),
				o = i(e);
			try {
				a.config("play_mode", "normal");
				var s = a.list().length;
				a.list_xml(o, !0), a.sendEvent("view_play", s + 1)
			} catch (r) {}
		},
		s = function(e) {
			if ("music_player" != e) {
				var a = n(t("movie"));
				a && (a.addEventListener("control_load", "new_play"), a.addEventListener("control_play", "new_play"))
			}
		};
	return {
		changeTheme: function(t, a) {
			var i, o, s;
			if ("music" == t ? (G.musictheme = a, i = "music_player") : "movie" == t && (G.movietheme = a, i = "movie_player"), s = n(i)) {
				var r = share.system_top();
				o = e[a], r.art.dialog.list[i + "_dialog"].size(o.width, o.height), s.sendEvent("skin_load", "skins/" + o.path + ".zip")
			}
		},
		play: function(e, i) {
			var r = t(i),
				l = n(r);
			if (l) {
				o(e, r), s(r);
				var c = share.system_top();
				c.art.dialog.list[r + "_dialog"].display(!0)
			} else {
				a(r);
				var d = setInterval(function() {
					n(r) && (o(e, r), s(r), new_play(r), clearInterval(d), d = !1)
				}, 1e3)
			}
		}
	}
});
var new_play = function(e) {
		if ("music_player" == e) return $(".music_player_dialog .wmp_player").html("").css({
			width: "0px",
			height: "0px"
		}), $(".music_player_dialog .flash_player").css({
			width: "100%",
			height: "100%"
		}), void 0;
		var t, a = share.system_top();
		t = a.CMP ? a.CMP.get("movie_player") : CMP.get("movie_player");
		var i = function(e) {
				var t = '<object id="the_wmp_player" ',
					a = navigator.userAgent;
				return -1 != a.indexOf("MSIE") ? t += 'classid="clsid:6BF52A52-394A-11d3-B153-00C04F79FAA6" ' : (-1 != a.indexOf("Firefox") || -1 != a.indexOf("Chrome") || -1 != a.indexOf("Opera") || -1 != a.indexOf("Safari")) && (t += 'type="application/x-ms-wmp" '), t += 'width="100%" height="100%">', t += '<param name="URL" value="' + e + '">', t += '<param name="autoStart" value="true">', t += '<param name="autoSize" value="true">', t += '<param name="invokeURLs" value="false">', t += '<param name="playCount" value="100">', t += '<param name="Volume" value="100">', t += '<param name="defaultFrame" value="datawindow">', t += "</object>"
			};
		try {
			var n = t.item("src").toLowerCase();
			if (n.indexOf("wmv") > 1 || n.indexOf("mpg") > 1 || n.indexOf("avi") > 1 || n.indexOf("wvx") > 1 || n.indexOf("3gp") > 1) {
				$("div[id^='DIV_CMP_']").remove();
				var o = i(n);
				$(".movie_player_dialog .wmp_player").html(""), $(".movie_player_dialog .flash_player").css({
					width: "0px",
					height: "0px"
				}), setTimeout(function() {
					$(".movie_player_dialog .wmp_player").html(o).css({
						width: "100%",
						height: "100%"
					})
				}, 300)
			} else $(".movie_player_dialog .wmp_player").html("").css({
				width: "0px",
				height: "0px"
			}), setTimeout(function() {
				$(".movie_player_dialog .flash_player").css({
					width: "100%",
					height: "100%"
				})
			}, 200)
		} catch (s) {}
	};
define("app/src/explorer/path", ["../../common/pathOperate", "../../tpl/share.html", "../../tpl/fileinfo/file_info.html", "../../tpl/fileinfo/path_info.html", "../../tpl/fileinfo/path_info_more.html", "../../tpl/app.html", "../../common/pathOpen", "../../common/CMPlayer"], function(e) {
	var t = e("../../common/pathOperate"),
		a = e("../../common/pathOpen"),
		n = void 0;
	ui.pathOpen = a;
	var o = function(e, t, a) {
			if (void 0 != e) {
				if ("explorer" != Config.pageApp) return core.explorer(e), void 0;
				if (e == G.this_path) return void 0 != t && "" != t && core.tips.tips(LNG.path_is_current, "info"), void 0;
				if (G.this_path = e.replace(/\\/g, "/"), G.this_path = e.replace(/\/+/g, "/"), "/" != G.this_path.substr(G.this_path.length - 1) && (G.this_path += "/"), $(".dialog_file_upload").length > 0) {
					var i = "hidden" == $(".dialog_file_upload").css("visibility");
					core.upload(), i && $(".dialog_file_upload").css("visibility", "hidden")
				}
				ui.f5_callback(function() {
					"function" == typeof a && a()
				}), s.add()
			}
		},
		s = function() {
			var e = [],
				t = 0,
				a = function() {
					return G.this_path == e[e.length - 1] ? (o(), void 0) : (t != e.length - 1 && (e = e.slice(0, t + 1)), e.push(G.this_path), t = e.length - 1, o(), void 0)
				},
				i = function() {
					e.length - 1 >= t + 1 && (t += 1, G.this_path = e[t], ui.f5(!0, !0), o())
				},
				n = function() {
					t - 1 >= 0 && (t -= 1, G.this_path = e[t], ui.f5(!0, !0), o())
				},
				o = function() {
					t == e.length - 1 ? $("#history_next").addClass("active") : $("#history_next").removeClass("active"), 0 == t ? $("#history_back").addClass("active") : $("#history_back").removeClass("active")
				};
			return {
				add: a,
				back: n,
				next: i,
				list: function() {
					return e
				}
			}
		}(),
		r = function(e, t) {
			var a, i = 0,
				n = G.json_data.folderlist,
				o = G.json_data.filelist,
				s = n,
				r = G.list_sort_field,
				l = G.list_sort_order,
				c = {
					name: e,
					size: 0,
					ext: t,
					mtime: date("Y/m/d H:i:s", time())
				};
			for ("desktop" == Config.pageApp && (i += $(".menuDefault").length + 1), "file" == t ? (c.ext = core.pathExt(e), s = o, "up" == l && (i += n.length)) : "down" == l && (i += o.length), a = 0; s.length > a; a++) if ("down" == l) {
				if (s[a][r] < c[r]) break
			} else if (s[a][r] >= c[r]) break;
			return a + i - 1
		},
		l = function(e) {
			void 0 != e && ("string" == typeof e && (e = [e]), fileLight.clear(), $(".fileContiner .file").each(function(t) {
				var a = fileLight.name($(this)); - 1 != $.inArray(a, e) && $(Global.fileListAll).eq(t).addClass(Config.SelectClassName)
			}), fileLight.select(), fileLight.setInView())
		},
		c = function(e) {
			if ("" != e) {
				if (e = e.toLowerCase(), void 0 == n || G.this_path != n.path || e != n.key) {
					var t = [];
					$(".fileContiner .file").each(function() {
						var a = fileLight.name($(this));
						a && e == a.substring(0, e.length).toLowerCase() && t.push(a)
					}), n = {
						key: e,
						path: G.this_path,
						index: 0,
						list: t
					}
				}
				0 != n.list.length && (l(n.list[n.index++]), n.index == n.list.length && (n.index = 0))
			}
		},
		d = function(e) {
			return "" == e ? (fileLight.clear(), void 0) : (fileLight.clear(), $(".fileContiner .file").each(function(t) {
				var a = fileLight.name($(this)); - 1 != a.toLowerCase().indexOf(e) && $(Global.fileListAll).eq(t).addClass(Config.SelectClassName)
			}), fileLight.select(), fileLight.setInView(), void 0)
		},
		p = function(e, t, a) {
			var n = e.length;
			for (i = 0; n > i; i++) if (e[i][t] == a) return e[i]
		},
		u = function(e) {
			var t = "",
				a = 0;
			return null != G.json_data.filelist && (t = p(G.json_data.filelist, "name", e), null != t && (a = 1)), null != G.json_data.folderlist && (t = p(G.json_data.folderlist, "name", e), null != t && (a = 1)), a
		},
		f = function(e, t) {
			var a, i = 0;
			if (void 0 == t) {
				if (!u(e)) return e;
				for (a = e + "(0)"; u(a);) i++, a = e + "(" + i + ")";
				return a
			}
			if (!u(e + "." + t)) return e + "." + t;
			for (a = e + "(0)." + t; u(a);) i++, a = e + "(" + i + ")." + t;
			return a
		},
		h = function(e) {
			fileLight.clear(), void 0 == e && (e = "txt");
			var a = "newfile",
				a = f(a, e),
				i = r(a, "file"),
				n = "<textarea class='newfile fix'>" + a + "</textarea>";
			"list" == G.list_type && (n = "<input class='newfile fix' value='" + a + "'/>");
			var o = '<div class="file select menufile file_icon_edit"  id="makefile">			<div class="' + e + ' ico"></div>			<div class="titleBox">				<span class="title"><div class="textarea">' + n + '</div></span>			</div>			<div style="clear:both;"></div>		</div>',
				s = ".file";
			"list" == G.list_type && (o = '<div class="file_list_cell">' + o + "</div>", s = ".file_list_cell"), -1 == i ? $(Config.FileBoxSelector).html(o + $(Config.FileBoxSelector).html()) : $(o).insertAfter(Config.FileBoxSelector + " " + s + ":eq(" + i + ")"), "desktop" == Config.pageApp && ui.sort_list();
			var c = $(".textarea .newfile"),
				d = c.get(0),
				p = a.length - e.length - 1;
			if ($.browser.msie) {
				var h = d.createTextRange();
				h.moveEnd("character", -d.value.length), h.moveEnd("character", p), h.moveStart("character", 0), h.select()
			} else d.setSelectionRange(0, p);
			c.focus(), c.unbind("keydown").keydown(function(e) {
				if (13 == e.keyCode || 27 == e.keyCode) {
					if (stopPP(e), e.preventDefault(), filename = c.attr("value"), "" == trim(filename)) return $("#makefile").remove(), core.tips.tips(LNG.error, "warning"), void 0;
					u(filename) ? ($("#makefile").remove(), core.tips.tips(LNG.path_exists, "warning")) : t.newFile(G.this_path + filename, function() {
						ui.f5_callback(function() {
							l(filename)
						})
					})
				}
				return !0
			}), c.unbind("blur").blur(function() {
				return filename = c.attr("value"), "" == trim(filename) ? ($("#makefile").remove(), core.tips.tips(LNG.error, "warning"), void 0) : (u(filename) ? ($("#makefile").remove(), core.tips.tips(LNG.path_exists, "warning"), _newFile(e)) : t.newFile(G.this_path + filename, function() {
					ui.f5_callback(function() {
						l(filename)
					})
				}), void 0)
			})
		},
		m = function() {
			fileLight.clear();
			var e = LNG.newfolder,
				e = f(e),
				a = r(e, "folder"),
				i = "<textarea class='newfile fix'>" + e + "</textarea>";
			"list" == G.list_type && (i = "<input class='newfile fix' value='" + e + "'/>");
			var n = '<div class="file select menufolder file_icon_edit" id="makefile">';
			n += '<div class="folder ico" filetype="folder"></div>', n += '<div  class="titleBox">', n += '<span class="title"><div class="textarea">' + i + '</div></span></div><div style="clear:both;"></div></div>';
			var o = ".file";
			"list" == G.list_type && (n = '<div class="file_list_cell">' + n + "</div>", o = ".file_list_cell"), -1 == a ? $(Config.FileBoxSelector).html(n + $(Config.FileBoxSelector).html()) : $(n).insertAfter(Config.FileBoxSelector + " " + o + ":eq(" + a + ")"), "desktop" == Config.pageApp && ui.sort_list(), $(".textarea .newfile").select(), $(".textarea .newfile").focus(), $(".textarea .newfile").unbind("keydown").keydown(function(e) {
				if (13 == e.keyCode || 27 == e.keyCode) {
					stopPP(e), e.preventDefault();
					var a = $(".newfile").attr("value");
					if ("" == trim(a)) return $("#makefile").remove(), core.tips.tips(LNG.error, "warning"), void 0;
					u(a) ? ($("#makefile").remove(), core.tips.tips(LNG.path_exists, "warning")) : t.newFolder(G.this_path + a, function() {
						"explorer" == Config.pageApp && ui.tree.checkIfChange(G.this_path), ui.f5_callback(function() {
							l(a)
						})
					})
				}
			}), $(".textarea .newfile").unbind("blur").blur(function() {
				return filename = $(".textarea .newfile").attr("value"), "" == trim(filename) ? ($("#makefile").remove(), core.tips.tips(LNG.error, "warning"), void 0) : (u(filename) ? ($("#makefile").remove(), core.tips.tips(LNG.path_exists, "warning"), _newFolder()) : t.newFolder(G.this_path + filename, function() {
					"explorer" == Config.pageApp && ui.tree.checkIfChange(G.this_path), ui.f5_callback(function() {
						l(filename)
					})
				}), void 0)
			})
		},
		_ = function() {
			var e = "",
				a = "",
				i = Global.fileListSelect,
				n = fileLight.name(i),
				o = fileLight.type(i);
			if (1 == i.length) {
				if (i.hasClass("menuSharePath")) return ui.path.share_edit(), void 0;
				o = "folder" == o ? "folder" : o;
				var s = $(i).find(".title").text(),
					r = "<textarea class='fix' id='pathRenameTextarea'>" + s + "</textarea>";
				i.addClass("file_icon_edit"), "list" == G.list_type && (r = "<input class='fix' id='pathRenameTextarea' value='" + s + "'/>"), $(i).find(".title").html("<div class='textarea'>" + r + "<div>");
				var c = $("#pathRenameTextarea"),
					d = c.get(0);
				if ("folder" == o) c.select();
				else {
					var p = n.length - o.length - 1;
					if ($.browser.msie) {
						var u = d.createTextRange();
						u.moveEnd("character", -d.value.length), u.moveEnd("character", p), u.moveStart("character", 0), u.select()
					} else d.setSelectionRange(0, p)
				}
				c.unbind("focus").focus(), c.keydown(function(s) {
					if (13 == s.keyCode) {
						s.preventDefault(), stopPP(s), e = c.attr("value"), "oexe" == o && (e += ".oexe");
						var r = e;
						e != n ? (a = urlEncode(G.this_path + n), e = urlEncode(G.this_path + e), t.rname(a, e, function() {
							"explorer" == Config.pageApp && ui.tree.checkIfChange(G.this_path), ui.f5_callback(function() {
								l(r)
							})
						})) : ui.f5(!1, !1)
					}
					27 == s.keyCode && ("oexe" == o && (n = n.replace(".oexe", "")), $(i).find(".title").html(n))
				}), c.unbind("blur").blur(function() {
					e = $("#pathRenameTextarea").attr("value"), "oexe" == o && (e += ".oexe");
					var i = e;
					e != n ? (a = urlEncode(G.this_path + n), e = urlEncode(G.this_path + e), t.rname(a, e, function() {
						"explorer" == Config.pageApp && ui.tree.checkIfChange(G.this_path), ui.f5_callback(function() {
							l(i)
						})
					})) : ui.f5(!1, !1)
				})
			}
		},
		v = function() {
			ui.f5(), "explorer" == Config.pageApp && ui.tree.checkIfChange(G.this_path)
		},
		g = function(e) {
			if (e) {
				var t = [];
				return 0 == Global.fileListSelect.length ? t : (Global.fileListSelect.each(function() {
					var e = fileLight.path($(this)),
						a = "folder" == fileLight.type($(this)) ? "folder" : "file";
					t.push({
						path: e,
						type: a
					})
				}), t)
			}
			if (1 != Global.fileListSelectNum) return {
				path: "",
				type: ""
			};
			var a = Global.fileListSelect,
				i = fileLight.path(a),
				n = fileLight.type(a);
			return {
				path: i,
				type: n
			}
		},
		b = function(e, t) {
			for (var a in G.json_data) if ("filelist" == a || "folderlist" == a) for (var i = 0; G.json_data[a].length > i; i++) if (G.json_data[a][i][e] == t) return G.json_data[a][i]
		};
	return {
		history: s,
		get_jsondata_cell: b,
		appEdit: function(e) {
			if (e) t.appEdit(0, 0, "user_add");
			else {
				var a = Global.fileListSelect.attr("data-app"),
					i = json_decode(base64_decode(a));
				i.path = fileLight.path(Global.fileListSelect), t.appEdit(i)
			}
		},
		appList: function() {
			t.appList(g().path)
		},
		appInstall: function() {
			t.appInstall(g().path)
		},
		openEditor: function() {
			a.openEditor(g().path)
		},
		openIE: function() {
			a.openIE(g().path)
		},
		open: function(e) {
			if ("editor" == Config.pageApp) return a.open(e), void 0;
			if (void 0 != e) return a.open(e), void 0;
			if (0 != Global.fileListSelect.length) {
				var t = g(),
					i = Global.fileListSelect;
				if (inArray(core.filetype.image, t.type)) return ui.picasa.initData(), "icon" == G.list_type || "desktop" == Config.pageApp ? ui.picasa.play($(i).find(".ico")) : ui.picasa.play($(i)), void 0;
				if (0 != $(i).find(".file_not_exists").length) return core.tips.tips(LNG.share_error_path, !1), void 0;
				if ("oexe" == t.type) {
					var n = i.attr("data-app");
					t.path = json_decode(base64_decode(n))
				}
				return G.json_data.info.path_type == G.KOD_USER_SHARE && G.json_data.info.id == G.user_id ? (ui.path.open_the_path(), void 0) : (a.open(t.path, t.type), void 0)
			}
		},
		play: function() {
			if (!(1 > Global.fileListSelectNum)) {
				var e = [];
				Global.fileListSelect.each(function() {
					var t = fileLight.type($(this));
					if (inArray(core.filetype.music, t) || inArray(core.filetype.movie, t)) {
						var a = core.path2url(fileLight.path($(this)));
						e.push(a)
					}
				}), a.play(e, "music")
			}
		},
		pathOperate: t,
		share: function() {
			t.share(g())
		},
		setBackground: function() {
			t.setBackground(g().path)
		},
		createLink: function() {
			t.createLink(g().path, g().type, function(e) {
				ui.f5_callback(function() {
					l(e.info)
				})
			})
		},
		createProject: function() {
			t.createProject(g().path, function(e) {
				ui.f5_callback(function() {
					l(e.info)
				})
			})
		},
		download: function() {
			var e = g(!0);
			1 == e.length && "file" == e[0].type ? a.download(g().path) : t.zipDownload(e)
		},
		share_edit: function() {
			var e = b("path", g().path),
				a = G.json_data.share_list[e.sid];
			t.share_box(a)
		},
		share_open_window: function() {
			var e = b("path", g().path),
				t = e.type;
			"folder" == e.type && (t = 1 == e.code_read ? "code_read" : "folder");
			var a = "./index.php?share/" + t + "&user=" + G.json_data.info.id + "&sid=" + e.sid;
			window.open(a)
		},
		open_the_path: function() {
			var e = b("path", g().path),
				t = G.json_data.share_list[e.sid],
				a = core.pathFather(t.path),
				i = core.pathThis(t.path);
			"folder" == t.type ? ui.path.list(t.path, "") : ui.path.list(a, "", function() {
				l(i)
			})
		},
		recycle_clear: function() {
			$.dialog({
				id: "dialog_path_remove",
				fixed: !0,
				icon: "question",
				title: LNG.remove_title,
				padding: 40,
				lock: !0,
				background: "#000",
				opacity: .2,
				content: LNG.recycle_clear_info,
				ok: function() {
					$.ajax({
						url: "index.php?explorer/pathDeleteRecycle",
						beforeSend: function() {
							core.tips.loading()
						},
						error: core.ajaxError,
						success: function(e) {
							core.tips.close(e), ui.f5(), FrameCall.father("ui.f5", ""), "function" == typeof callback && callback(e)
						}
					})
				},
				cancel: !0
			})
		},
		explorer: function() {
			core.explorer(g().path)
		},
		explorerNew: function() {
			window.open("index.php?/explorer&path=" + g().path)
		},
		openProject: function() {
			core.explorerCode(g().path)
		},
		search: function() {
			core.search("", g().path)
		},
		fav: function() {
			var e = g();
			e.name = core.pathThis(e.path), t.fav(e)
		},
		remove: function() {
			var e = g(!0);
			G.json_data.info.path_type == G.KOD_USER_SHARE && G.json_data.info.id == G.user_id && $.each(e, function(t) {
				e[t].type = "share";
				var a = b("path", e[t].path);
				e[t].path = a.sid
			}), t.remove(e, v), fileLight.clear()
		},
		copy: function() {
			t.copy(g(!0))
		},
		cute: function() {
			t.cute(g(!0), ui.f5)
		},
		zip: function() {
			t.zip(g(!0), function(e) {
				ui.f5_callback(function() {
					l(e.info)
				})
			})
		},
		unZip: function(e) {
			t.unZip(g().path, ui.f5, e)
		},
		cuteDrag: function(e) {
			t.cuteDrag(g(!0), e, v)
		},
		copyDrag: function(e, a) {
			t.copyDrag(g(!0), e, function(e) {
				fileLight.clear(), "explorer" == Config.pageApp && ui.tree.checkIfChange(G.this_path), ui.f5_callback(function() {
					a && e.data && l(e.data)
				})
			}, a)
		},
		copyTo: function() {
			core.path_select("folder", LNG.copy_to, function(e) {
				t.copyDrag(g(!0), e, function() {
					fileLight.clear()
				}, !1)
			})
		},
		cuteTo: function() {
			core.path_select("folder", LNG.cute_to, function(e) {
				t.cuteDrag(g(!0), e, v)
			})
		},
		info: function() {
			t.info(g(!0))
		},
		past: function() {
			fileLight.clear(), t.past(G.this_path, function(e) {
				"explorer" == Config.pageApp && ui.tree.checkIfChange(G.this_path), ui.f5_callback(function() {
					l(e)
				})
			})
		},
		list: o,
		newFile: h,
		newFolder: m,
		rname: _,
		setSearchByStr: d,
		setSelectByChar: c,
		setSelectByFilename: l,
		clipboard: t.clipboard
	}
}), define("app/src/explorer/list_header_resize", [], function() {
	var e = {
		filename: 250,
		filetype: 80,
		filesize: 80,
		filetime: 215,
		left_tree_width: 300
	},
		t = {
			filename: 150,
			filetype: 70,
			filesize: 70,
			filetime: 120,
			left_tree_width: 1
		},
		a = e,
		i = function() {
			if (Cookie.get("resize_config")) a = json_decode(Cookie.get("resize_config"));
			else {
				G.resize_config !== void 0 && (a = json_decode(html_decode(G.resize_config)));
				var e = json_encode(a);
				Cookie.set("resize_config", e)
			}
		},
		n = function() {
			var e = json_encode(a);
			Cookie.set("resize_config", e), $.get("index.php?setting/set&k=resize_config&v=" + e)
		},
		o = function(e) {
			if ("icon" != G.list_type) {
				e || (e = a), $(".frame-right-main #main_title");
				var i = ".frame-right-main #main_title",
					n = ".frame-right-main .fileList_list .file";
				$.each(e, function(e, a) {
					t[e] >= a && (a = t[e]), $(i + " ." + e).css("width", a), "filename" == e ? $(n + " .titleBox").css("width", a - 25) : $(n + " ." + e).css("width", a)
				})
			}
		},
		s = function(e, i, o) {
			if ("file_list" != $.getUrlParam("type") && "explorer" != $.getUrlParam("type")) {
				var s = "left_tree_width",
					r = $.extend(!0, {}, a);
				r[s] += e, r[s] <= t[s] && (r[s] = t[s]);
				var l = r[s],
					c = $(".frame-left"),
					d = $(".frame-left .bottom_box"),
					p = $(".frame-resize"),
					u = $(".frame-right");
				if (o) {
					var f = 400;
					c.animate({
						width: l
					}, f), d.animate({
						width: l
					}, f), p.animate({
						left: l - 5
					}, f), u.animate({
						left: l + 1
					}, f)
				} else c.css("width", l), d.css("width", l), p.css("left", l - 5), u.css("left", l + 1);
				ui.setStyle !== void 0 && ui.setStyle(), i && (a = r, n())
			}
		},
		r = function(e, i, s) {
			var r = $.extend(!0, {}, a);
			r[e] += i, o(r), s && (a = r, $.each(a, function(e, i) {
				t[e] >= i && (a[e] = t[e])
			}), n())
		},
		l = function() {
			$.each(e, function(e) {
				$("#main_title ." + e + "_resize").drag({
					start: function() {},
					move: function(t) {
						r(e, t, !1)
					},
					end: function(t) {
						r(e, t, !0)
					}
				})
			})
		},
		c = function() {
			var e = $(".frame-resize");
			e.drag({
				start: function() {
					e.addClass("active"), $(".resizeMask").css("display", "block")
				},
				move: function(e) {
					s(e, !1, !1)
				},
				end: function(t) {
					s(t, !0, !1), e.removeClass("active"), $(".resizeMask").css("display", "none")
				}
			})
		};
	return {
		init: function() {
			i(), o(a), s(0, !1, !0), c()
		},
		bind_list_resize: l,
		set_tree_width: function(e) {
			s(e, !1, !0)
		},
		resize: o
	}
});

function setCookie(name,value)
{
	var Days = 1;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days*24*60*60*1000);
	document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}

function getCookie(name)
{
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
	return unescape(arr[2]);
	else
	return null;
}