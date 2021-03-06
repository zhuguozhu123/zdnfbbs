function checkPlateCookie() //检查板块信息
{
	var url = window.location.search;
	if (url.indexOf("?") != -1) {
		var tempStr = url.substr(1);
		var idStrs = tempStr.split('=');
		$.get("/api/plate/namebyid", "id=" + idStrs[1], function(f_plateName) {
			$("#plateTitle").html(f_plateName);
		})
		return idStrs[1];
	} else {
		window.close();
	}
}

function checkUserStatus() { //检查登录人
	var name = checkLoginStatus();
	if (name) {
		var IdStr = name;
		$("#userId").html(IdStr);
		$("#userId").attr("href", "./mypage?name=" + escape(IdStr));
	} else {
		return;
	}
}

function checkAnchor() {
	var url = location.hash; 
	var num = 'x';
	if(url.indexOf('floorContent_')!=-1){
		var strs= new Array(); //定义一数组 
		strs = url.split('_');
		num = strs[1];
	}
	if (isNull(url)||isNull(num)||parseInt(num)==NaN) {
		postReplay(1, false);
		return;
	} else {
		var strsAnchor = parseInt(num);
		var strsId = checkPostCookie();
		var i = 1;
		var flag = true;
		while (flag) {
			$.ajax({
				url: "/api/replay/select",
				data: "id=" + strsId + "&page=" + i,
				async: false,
				success: function(postContent) {
					if (isNull(postContent)) {
						alert("回复已被删除");
						flag = false;
					} else {
						for (var j = 0; j < postContent.length; j++) {
							if (postContent[j].id == strsAnchor) {
								flag = false;
								break;
							}
						}
						postReplay(i, !flag);
						i++;
					}
				}
			})
		}

	}
}

function checkPostCookie() //检查帖子信息
{
	var url = window.location.search;
	if (url.indexOf("?") != -1) {
		var tempStr = url.substr(1);
		var strsId = tempStr.split('=');
		if (url.indexOf("#") != -1) {
			strsId = strsId[1].split('#');
			return strsId[0];
		} else {
			return strsId[1];
		}
	} else {
		window.close();
	}

}

function pagination() { //板块帖子分页
	var plateId = checkPlateCookie();
	var plateName = $("#plateTitle").html();
	postInit(1);
	$.post("/api/post/max", "id=" + plateId, function(pageSum) {
		if (pageSum) {
			var paginationNum = pageSum / 10;
			for (var i = 1; i < paginationNum + 1; i++) {
				var pagination = "<span id='page_" + i + "' class='paging' >" + i + "</span>";
				$("#newReply").before(pagination);
			}
			var paginationSum = [];
			for (var i = 0; i < paginationNum + 1; i++) {
				paginationSum[i] = $("#page_" + i);
			}
			$.each(paginationSum, function(i) {
				$(this).click(function() {
					if (i == 1) {
						location.reload(true);
					} else postInit(i);
				})
			})
		}

	})

}

function postNew() {
	var author = checkLoginStatus();
	if (!author) {
		alert("请登录");
		window.location.href = "/m/login";
	} else {
		var plateId = checkPlateCookie();
		var plateName;
		$.get("/api/plate/namebyid", "id=" + plateId, function(f_plateName) {
			$("#plateTitle").html(f_plateName);
		})
		$(".back").attr("href", "/platepost?id=" + plateId);
		$(".sand").off('click').on('click', function() { //发帖功能
			$(this).off('click');
			var sandTitle = $("#replyTitle").val();
			var sandContent = $("#replyContent").val();
			if (!isNull(sandContent) && !isNull(sandTitle)) {
				var nowTime = new Date();
				var postTime = nowTime.getFullYear() + "-" + nowTime.getMonth() + "-" + nowTime.getDate() + " " + nowTime.getHours() + ":" + nowTime.getMinutes() + ":" + nowTime.getSeconds();
				var author = checkLoginStatus();
				$.post("/api/post/add", "BelongTo=" + plateId + "&title=" + sandTitle + "&author=" + author + "&LastOne=" + author + "&LastTime=" + postTime, function(dataId) {
					if (dataId) {
						$(".sand").html("发送中");
						setTimeout(function() {
							var nowTime = new Date();
							var month = nowTime.getMonth() + 1;
							var postTime = nowTime.getFullYear() + "-" + month + "-" + nowTime.getDate() + " " + nowTime.getHours() + ":" + nowTime.getMinutes() + ":" + nowTime.getSeconds();
							$.post("/api/replay/add", "father=" + dataId + "&author=" + author + "&content=" + sandContent + "&times=" + postTime + "&isfirst=1", function(data) {
								if (data) {

									setTimeout(function() {
										window.location.href = "/platepost?id=" + plateId;
									}, 500)
								} else {
									alert("校园网波动，请稍后重试");
								}
							})

						}, 500)
					} else {
						alert("校园网波动，请稍后重试");
					}
				})
			} else {
				alert("标题或内容不得为空");
			}
		})
	}


}

function postInit(pageNum, postNum) { //板块帖子初始化
	var plateId = checkPlateCookie();
	$("#replySkip").attr("href", "/plateReplyPage?id=" + plateId);
	var plateName = $("#plateTitle").html();
	var allPostId = [];
	var allPostTitle = [];
	$.post("/api/post/get", "id=" + plateId + "&page=" + pageNum, function(postData) {
		if (!isNull(postData)) {
			var tempId = 0,
				tempTitle;
			if (pageNum != 1) {
				$("#allPost").empty();
			}
			for (var i = 0; i < postData.length; i++) {
				var platePostObj = "<div  class='thread-item' ><div id='postTitle_" + postData[i].id + "' class='row head'><div class='item title'>" + postData[i].title + "</div></div><div class='row info'><div class='item'><span class='txt admi'><a href='./mypage?name=" + escape(postData[i].author) + "'>" + postData[i].author + "</a></span></div><div class='item time'><span class='txt'>最后发表：</span><span class='num'>" + dateFormat(postData[i].lastTime) + "</span></div><div class='item reply r'><span class='num'>" + postData[i].num + "</span></div></div></div>";
				$("#morePost").before(platePostObj);


			}
			var postObj = [];
			for (var i = postNum; i < postData.length + parseInt(postNum); i++) {
				allPostId[i] = postData[i].id;
				allPostTitle[i] = postData[i].title;
				postObj[i] = $("#postTitle_" + allPostId[i]);

			}
			$.each(postObj, function(i) {
				$(this).click(function() {
					window.location.href = "./post?id=" + allPostId[i];
				})
			})
		} else {
			$("#morePost").remove();
			console.log("已经没有更多帖子了_(xз」∠)_");
		}
	})
	$("#morePost").off('click').on('click', function() {
		postInit(parseInt(pageNum) + 1, parseInt(postNum) + 10);
	})
	$(window).scroll(function() {
					var keyword = $('input').val();
					var scrollTop = $(this).scrollTop();　　
					var scrollHeight = $(document).height();　　
					var windowHeight = $(this).height();　　
					if (scrollHeight - scrollTop - windowHeight <= 1 ) {
						$("#morePost").click();
					}
				})



}

function topPostInit() { //置顶帖子初始化
	var plateId = checkPlateCookie();
	var plateName = $("#plateTitle").html();
	var allPostId = [];
	var allPostTitle = [];
	$.post("/api/post/top", "id=" + plateId, function(postTop) {
		if (!isNull(postTop)) {
			var tempId = 0,
				tempTitle;
			for (var i = 0; i < postTop.length; i++) {
				var plateTopObj = "<div class='thread-item top'><div id='postTop_" + i + "' class='row head'><div class='tag top'>置顶</div><div  class='item title highlight'>" + postTop[i].title + "</div></div><div class='row info'><div class='item'><span class='txt admi'><a href='./mypage?name=" + escape(postTop[i].author) + "'>" + postTop[i].author + "</a></span></div><div class='item time'><span class='num'>" + dateFormat(postTop[i].lastTime) + "</span></div></div></div>";
				allPostId[i] = postTop[i].id;
				allPostTitle[i] = postTop[i].title;
				$("#morePost").before(plateTopObj);
			}

			var postObj = [];
			for (var i = 0; i < postTop.length; i++) {
				postObj[i] = $("#postTop_" + i);

			}
			$.each(postObj, function(i) {

				$(this).click(function() {

					window.location.href = "./post?id=" + allPostId[i];
				})
			})
		}

	})

}

function postPagination() { //帖子回复的分页
	var url = window.location.search;
	postReplay(1,false);
	if (url.indexOf("?") != -1) {
		var tempStr = url.substr(1);
		var strsId = tempStr.split('=');
		$.post("/api/replay/max", "id=" + strsId[1], function(pageSum) {
			if (!isNull(pageSum)) {
				var paginationNum = pageSum / 10;
				for (var i = 1; i < paginationNum + 1; i++) {
					var pagination = "<span class='paging' id='page_" + i + "'>" + i + "</span>";
					$("#newReply").before(pagination);
				}
				var paginationSum = [];
				for (var i = 0; i < paginationNum + 1; i++) {
					paginationSum[i] = $("#page_" + i);
				}

				$.each(paginationSum, function(i) {
					$(this).click(function() {
						if (i == 1) {
							location.reload(true);
						} else postReplay(i, false);
					})
				})
			}

		})


	}
}

function replyNew() { //回复功能
	var author = checkLoginStatus();
	var postId = checkPostCookie();
	if (!author) {
		alert("请登录");
		window.location.href = "/m/login";
	} else {
		$(".back").attr("href", "/post?id=" + postId);
		$(".sand").off('click').on('click', function() {
			$(this).off('click');
			var sandContent = $("#editor").html();
			if (!isNull(sandContent)) {
				if ($(this).text() != "等待") {
					if (sandContent.length <= 3000) {
						var nowTime = new Date();
						var month = nowTime.getMonth() + 1;
						var postTime = nowTime.getFullYear() + "-" + month + "-" + nowTime.getDate() + " " + nowTime.getHours() + ":" + nowTime.getMinutes() + ":" + nowTime.getSeconds();
						$.post("/api/replay/add", {
							"father": postId,
							"author": author,
							"content": sandContent,
							"times": postTime,
						}, function(data) {
							if (!isNull(data) && data != 'datatoolong') {
								$(".sand").html("发送中");
								setTimeout(function() {
									window.location.href = "/post?id=" + postId;
								}, 500)
							} else {
								alert("校园网波动，请稍后重试");
							}
						})
					} else alert("回复篇幅过长，请稍作修改分批发送。");
				} else alert("图片上传中，不可发送");
			} else alert("输入内容不能为空");

		})
	}
}

function postReplay(postpage, anchorFlag) { //帖子内容及回复初始化
	var url = window.location.search;
	if (url.indexOf("?") != -1) {
		var tempStr = url.substr(1);
		var strsId = tempStr.split('=');
		$("#replySkip").attr('href', "/postReplyPage?id=" + strsId[1]);
		$.post("/api/post/getallbyid", "id=" + strsId[1], function(allData) {
			$("#title").html(allData[0].title);
			setTimeout(function() {
				if (!isNull(allData[0])) {
					$(".home").attr("href", "/platepost?id=" + allData[0].BelongTo);
					$.post("/api/plate/namebyid", "id=" + allData[0].BelongTo, function(f_plateName) {
						$("#ownerPlate").html(f_plateName);
					})
				} else {
					alert("ID错误");
				}
			}, 500)

		})
		$.post("/api/replay/select", "id=" + strsId[1] + "&page=" + postpage, function(postContent) {
			if (!isNull(postContent)) {
				if (postpage == 1) {
					$("#content").html(xssFormat(postContent[0].content));
					$("#author").html(postContent[0].author);
					$("#ownerTime").html(dateFormat(postContent[0].times));
					$("#ownerphoto").attr('src', "/api/user/img?id=" + postContent[0].author)
				}
				for (var i = 0; i < postContent.length; i++) {
					if (i != 0 || postpage != 1) {
						if (postContent[i].isdeleted == 1 || postContent[i].content == 'undefined') {
							continue;
						}
						var floorNum = (postpage - 1) * 10 + i + 1;
						var floorObj = "<div id='floor_" + postContent[i].id + "'><div class='me'>" + "<a href=\"/mypage?name=" + escape(postContent[i].author) + "\"><img class='headshot' src='/api/user/img?id=" + postContent[i].author + "' width=80px height=80px ></a><div id='floorName_" + postContent[i].id + "'class='name'>名字</div></div><div id='floorContent_" + postContent[i].id + "' class='message' >" + xssFormat(postContent[i].content) + "</div><div class='tail'><span id='floorTime_" + postContent[i].id + "' class='tailtime'>time</span><span class='tailfloor'>第" + floorNum + "楼</span></div><div class='clear'></div> <hr/></div>"
						$("#page-content").before(floorObj);
						$("#floorName_" + postContent[i].id).html(postContent[i].author);
						$("#floorTime_" + postContent[i].id).html(dateFormat(postContent[i].times));
					}
				}
				$("#morePost").off('click').on('click', function() {
					postReplay(parseInt(postpage) + 1, false);
				})
				$(window).scroll(function() {
					var scrollTop = $(document).scrollTop();　　
					var scrollHeight = $(document).height();　　
					var windowHeight = $(this).height();　
					if (scrollTop + windowHeight == parseInt(scrollHeight)-10&&!isNull($("#morePost").text())) {
						console.log('底部翻页');
						$("#morePost").click();
					}
				})
				if (anchorFlag) {
					var url = location.hash;
					var strsAnchor = url.substr(1);
					window.location.href = "#floorContent_" + strsAnchor;
				}
			} else {
				$("#morePost").remove();
			}

		})

	}
}