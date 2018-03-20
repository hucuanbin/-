/*------------------------------HTTP-------------------------------*/
var htmlQuickSelectionData = [
    {
        name: '千库',
        url: 'http://588ku.com/',
        shiliUrk: 'http://588ku.com/sucai/0-default-0-0-qingmingjie-0-??/',
        domeData: {
            liebiao: [{ dome: ".picture-list .lazy", attr: 'data-original' }],
            xiangqing: [{ dome: ".picture-list .img-show>a", attr: 'href' }, { dome: ".img-l-box img", attr: 'src' }]
        }
    },
    {
        name: '千图',
        url: "http://www.58pic.com/",
        shiliUrk: 'http://www.58pic.com/tupian/huaban-0-0-??.html',
        domeData: {
            liebiao: [{ dome: ".card-img img", attr: 'data-original,data-url,src' }],
            xiangqing: [{ dome: ".card-img>a", attr: 'href' }, { dome: ".detail-img.type-tag img", attr: 'src' }]
        }
    },
    {
        name: '站酷',
        url: 'http://www.zcool.com.cn',
        shiliUrk: 'http://www.zcool.com.cn/discover/33!0!0!0!0!!!!-1!0!??',
        domeData: {
            liebiao: [{ dome: ".card-img img", attr: 'src,srcset' }],
            xiangqing: [{ dome: ".card-img>a", attr: 'href' }, { dome: ".reveal-work-wrap img", attr: 'src' }]
        }
    },
    {
        name: '摄图网',
        url: 'http://699pic.com/',
        shiliUrk: 'http://699pic.com/sousuo-62926-0-??-0-0-0.html',
        domeData: {
            liebiao: [{ dome: ".swipeboxEx>.list img", attr: 'data-original' }],
            xiangqing: [{ dome: ".swipeboxEx>.list>a", attr: 'href' }, { dome: "#photo", attr: 'src' }]
        }
    }
]
var htmlImage = {
    init: function () {
        $("#html_Url").val('');
        $("#html_dom1").val('');
        $("#html_dom1_attr").val('');
        $("#html_dom2").val('');
        $("#html_dom2_attr").val('');
        $("#html_dom2_attr").val('');
        $("#html_beforNum").val(1);
        $("#html_aftrNum").val(-1);
        $("#thesaurusExport").val()
        $("#html_dowmUlr").val("./Img")
    },
    getAjaxData: function () {
        var url = $("#html_Url").val();
        var dom1 = $("#html_dom1").val();
        var dom1_attr = $("#html_dom1_attr").val().split(',');
        var dom2 = $("#html_dom2").val();
        var dom2_attr = $("#html_dom2_attr").val().split(',');
        var beforNum = $("#html_beforNum").val();
        var aftrNum = $("#html_aftrNum").val();
        var dowmUlr = $("#html_dowmUlr").val();

        if (!url || !dowmUlr || !dom1_attr || (dom2 && !dom2_attr) || !beforNum || !dowmUlr) {
            alert('必填数据未天！');
            isDisabled(true);
            return;
        }
        this.DownloadData = {
            url: url,
            domObj: [{ dom: dom1, attr: dom1_attr }, { dom: dom2, attr: dom2_attr }],
            beforNum: beforNum,
            aftrNum: aftrNum,
            dowmUlr: dowmUlr
        };
    },
    setTimeoutNum: 300,
    imtType: 'jpg',
    page: 0,
    maxPage: -1,
    // 程序开头
    Download: function () {
        this.getAjaxData();  // 数据格式判断
        var data = this.DownloadData;
        this.page = data.beforNum - 1;
        this.maxPage = data.aftrNum;
        this.DownloadOneBefore(); //开始请求前的页码判断
    },
    setUrl: function () {
        var data = this.DownloadData;
        var urlSplit = data.url.split("??");
        if (urlSplit.length > 1) {
            this.getUrl = urlSplit[0] + this.page + urlSplit[1]
        }
        else {
            this.getUrl = data.url;
            this.maxPage = 1;
        };
    },
    //请求的逻辑处理 请求列表页
    DownloadOneBefore: function () {
        this.page++;
        this.setUrl();
        //所有页码抓完则停止 否则继续抓取
        if (this.maxPage == -1 || (this.maxPage != -1 && this.page <= this.maxPage)) {
            this.getUrlListOneAftrt(); //开始 请求列表页 信息
        }
        else {
            this.isStop = true; 
            isDisabled(me.isStop)
            $("#html_success_message").html("图片抓取结束！");
        }
    },
    //开始 请求列表页 信息
    getUrlListOneAftrt: function () {
        var me = this;
        chrome.extension.sendMessage({ greeting: 'getUrlList', data: { domObj: this.DownloadData.domObj[0], url: this.getUrl } }, function (res) {
            console.log("获取地址成功", res);
            //404等意外失败
            if (!res) {
                $("#html_error_message").html("获取出错！未知错误");
                isDisabled(true);
                return;
            }
            //下载成功
            if (res.type && !res.isStop) {
                me.DownloadData.domObj[0].dataList = res.data;
                me.pageIndex = 0;
                $("#html_success_message").html("准备下载第<b>" + me.page + "</b>页图片！");
                me.getUrlListTwoBefore();
            }
            //下载屏蔽 或 手动暂停
            else if (res.isStop) {
                $("#html_success_message").text(res.Message);
                isDisabled(true)
                me.isStop = true;
            }
            //出错
            else {
                //抓取失败
                $("#html_error_message").html($("#html_error_message").html + this.page + ",");
            }
            return;
            vm.isAjax = false; //判断是否在请求状态
        });
    },
    //请求详情页面后  下载图片
    getUrlListTwoBefore: function () {
        console.log('开始获取详情页')
        //直接下载图片
        var me = this;
        // 当之前列表的 所有都下载好了！ 继续请求列表页面
        if (me.pageIndex >= this.DownloadData.domObj[0].dataList.length) {
            me.DownloadOneBefore(); //开始请求前的页码判断
            return;
        }

        //判断是详情页 还是列表页
        if (!this.DownloadData.domObj[1].dom) { 
            this.DownloadlList = this.DownloadData.domObj[0].dataList;  //列表页
            me.getUrlListThere();//下载图片
        }
        else {
            me.getUrlListTwoAfter(); //请求请求图地址
        }
    },
    //请求请求图地址
    getUrlListTwoAfter: function () {
        var me = this;
        //防止太快呗屏蔽  设置了setTimeout
        setTimeout(function () {
            if (me.isStop) {
                isDisabled(me.isStop)
                return;
            }
            chrome.extension.sendMessage({
                greeting: 'getUrlList',
                data: { domObj: me.DownloadData.domObj[1], url: me.DownloadData.domObj[0].dataList[me.pageIndex] }
            }, function (res) {
                console.log('请求列表:', res);
                if (!res.type || res.isStop) {
                    me.getUrlListTwoBefore(); // 失败了 继续开始判断 是继续下载 还是去请求列表
                    $("#html_error_message").html(res.Message);
                    me.isStop = true;
                    return;
                }
                console.log('res', res)
                res.data[0] = logongDown(res);// 下载地址要处理  想摄图网 可以通过手机站下载
                console.log('res.data[0]:',res.data[0]);
                var dowImg = {
                    url: res.data[0],
                    name: "http" + me.page + "_" + me.pageIndex,
                    text: "下载第<b>" + me.page + "</b> 页 <b>" + me.pageIndex + "<b> 张图片成功！"
                }
                $("#html_success_message").html("准备下载:" + dowImg.name + "图片~");
                me.dowmImg(dowImg, function () {
                    me.pageIndex++;
                    me.getUrlListTwoBefore();
                })
            });
        }, me.setTimeoutNum);
        //登陆特别处理
        function logongDown(res) {
            console.log('res:',res);
            if ($(".QuickSelection[data-tpye=wangye]").val() == '千图') {
                return res.data[0].split(".jpg")[0] + '.jpg';
            }
            if (!$("#logngFlag").prop("checked")) {
                if (res.data[0].split('.webp').length > 1) {
                    console.log('进入')
                    return res.data[0].split('.webp')[0]+'.jpg'
                }
                return res.data[0];
            }
            else {
                //摄图网-攀登山顶的探险旅行者人
                if (res.data[0].split('699pic.com/').length > 1) {
                    try {
                        var url = (res.data[0].split('.jpg')[0]).split('/photo/')[1].replace('/', '');
                        url = 'http://m.699pic.com/photo/download?photoId=' + url;
                        console.log(url)
                        return url;
                    }
                    catch (err) {
                        return res.data[0]
                    }

                }
               
            }
        }
    },
    //直接下载图片
    getUrlListThere: function () {
        var me = this;
        setTimeout(function () {
            if (me.isStop) {
                isDisabled(me.isStop)
                return;
            }
            var dowImg = {
                url: me.DownloadlList[me.pageIndex],
                name: me.page + "_" + me.pageIndex,
                text: "下载第<b>" + me.page + "</b> 页 <b>" + me.pageIndex + "<b> 张图片成功！"
            }
            // console.log("图片下载", dowImg);
            $("#html_success_message").html("准备下载:" + dowImg.name + "图片~");
            me.dowmImg(dowImg, function () {
                me.pageIndex++;
                me.getUrlListTwoBefore();
            })
        }, me.setTimeoutNum)

    },
    dowmImg: function (data, cd) {
        var me = this;
        chrome.extension.sendMessage({
            greeting: 'downImg',
            data: {
                url: data.url,
                name: data.name,
                type: me.imtType,
                dowmUlr: me.DownloadData.dowmUlr
            }
        },
            function (res) {
                console.log("下载图片返回", res)
                if (res.isStop) {
                    $("#html_error_message").html($("#html_error_message").html() + res.Message + ",获取失败!");
                    cd();
                }
                else if (res.type) {
                    $("#html_success_message").html(data.text);
                    cd();
                }
                else {
                    $("#html_error_message").html($("#html_error_message").html() + data.name + "获取失败!");
                    cd();
                }
            });
    }
}
htmlImage.init();
//选择地址
$("#thesaurusExport").change(function () {
    var url = $(this).val().split("\\选择目录")[0];
    console.log(url);
    if (!url) {
        url = "./Img"
    }
    $("#html_dowmUlr").val(url);
});
//开始暂停
$("#html_subuit").click(function () {
    htmlImage.isStop = false
    isDisabled(htmlImage.isStop);
    htmlImage.Download();
});
$("#html_stop").click(function () {
    htmlImage.isStop = true;
    $(this).prop("disabled", true);
});
isDisabled(true);
function isDisabled(isStop) {
    if (isStop) {
        $("#html_subuit").prop("disabled", false);
        $("#html_stop").prop("disabled", true);
    }
    else {
        $("#html_subuit").prop("disabled", true);
        $("#html_stop").prop("disabled", false);
    }
};
//快捷方式选择
var html_domeId = [{ dome: "html_dom1", attr: "html_dom1_attr" }, { dome: "html_dom2", attr: "html_dom2_attr" }];
$(".QuickSelection").change(function () {
    var imgName = $(".QuickSelection[data-tpye=wangye]").val();
    var yemianName = $(".QuickSelection[data-tpye=neirong]").val();
    var thisData, iData;
    for (var i = 0; i < htmlQuickSelectionData.length; i++) {
        iData = htmlQuickSelectionData[i];
        if (iData.name == imgName) {
            console.log(iData, yemianName)
            thisData = iData.domeData[yemianName];
            break;
        }
    };
    cleanDom();
    console.log('thisData:', thisData, iData);
    $("#html_Url").val(iData.shiliUrk)
    console.log('thisData:', $("#html_Url").val());
    for (var i = 0; i < thisData.length; i++) {
        $("#" + html_domeId[i].dome).val(thisData[i].dome);
        $("#" + html_domeId[i].attr).val(thisData[i].attr);
    }
});
//清空dome输入框
function cleanDom() {
    for (var i = 0; i < html_domeId.length; i++) {
        $("#" + html_domeId[i].dome).val('');
        $("#" + html_domeId[i].attr).val('');
    };
    $("#logngFlag").prop("checked", false);
}
//设置 快捷方式 网站名称
function setSelect(dataList) {
    var html = '<option value="none" selected>无</option>', iData;
    for (var i = 0; i < dataList.length; i++) {
        iData = dataList[i];
        html += ' <option value="' + iData.name + '" data-url="' + iData.url + '">' + iData.name + '</option>'
    }
    $(".QuickSelection[data-tpye=wangye]").html(html);

}
setSelect(htmlQuickSelectionData);
//登陆
$("#login").click(function () {
    var url = $(".QuickSelection[data-tpye=wangye] option:selected").data('url');
    if (!url) {
        alert('请选择快捷选择——第一行');
        return;
    }
    // $("#iframe").attr("src", url);
    window.open(url);
    $("#myModal").modal('show');
})
/*------------------------------POST-------------------------------*/
var postQuickSelectionData = [
    {
        name: '花瓣',
        url: 'http://huaban.com/search/',
        openUrl: 'http://huaban.com',
        type: 'GET',
        postData: 'url',
        domeData: {
            serch: { postData: "q=?keyword?&j4p5klpx&page=?page?&per_page=20&wfl=1", imgUrl: { people: 'http://img.hb.aicdn.com/', objText: { array: ['pins'], data: ['file', 'key'] } } },
            xiangqing: [{ dome: ".picture-list .img-show>a", attr: 'href' }, { dome: ".img-center.sucai-image-center img", attr: 'src' }]
        }
    },
    //{
    //    name: 'https://www.behance.net',
    //    url: 'http://huaban.com/search/',
    //    openUrl: 'http://www.behance.net',
    //    type: 'GET',
    //    postData: 'url',
    //    domeData: {
    //        serch: { postData: "q=?keyword?&j4p5klpx&page=?page?&per_page=20&wfl=1", imgUrl: { people: 'http://img.hb.aicdn.com/', objText: { array: ['pins'], data: ['file', 'key'] } } },
    //        xiangqing: [{ dome: ".picture-list .img-show>a", attr: 'href' }, { dome: ".img-center.sucai-image-center img", attr: 'src' }]
    //    }
    //},
]
var postImage = {
    init: function () {
        $("#post_modeUrl").val('');
        $("#post_beforNum").val(1);
        $("#post_aftrNum").val(-1);
        $("#post_thesaurusExport").val()
        $("#post_dowmUlr").val("./Img")
    },
    getAjaxData: function () {
        var dataType = $(".post_QuickSelection[data-tpye=wangye]").val();
        var downType = $(".post_QuickSelection[data-tpye=neirong]").val();
        var dowmUlr = $("#post_dowmUlr").val()
        var beforNum = $("#post_beforNum").val();
        var aftrNum = $("#post_aftrNum").val();
        var post_mode = $("#post_mode").val();
        var post_modeUrl = $("#post_modeUrl").val();
        var post_mode = $("#post_mode").val();
        if (!beforNum || !aftrNum || !dowmUlr || !post_modeUrl) {
            alert('必填数据未天！');
            post_isDisabled(true);
            return;
        }
        this.DownloadData = {
            dataType: dataType,
            beforNum: beforNum,
            aftrNum: aftrNum,
            dowmUlr: dowmUlr,
            post_mode: post_mode,
            downType: downType
        };
        this.DownloadData[post_mode] = post_modeUrl;
        this.DownloadData.selectData = returnData(dataType);
        this.getUrlText = this.DownloadData.selectData.url;
        this.getUrlType = this.DownloadData.selectData.type;
    },
    setTimeoutNum: 300,
    imtType: 'png',
    page: 0,
    maxPage: -1,
    Download: function () {
        this.getAjaxData();
        var data = this.DownloadData;
        this.page = data.beforNum - 1;
        this.maxPage = data.aftrNum;
        this.DownloadOneBefore();
    },
    setUrl: function () {
        var urlSplit, url;
        if (this.DownloadData.post_mode == 'search') {
            urlSplit = this.DownloadData.selectData.domeData.serch.postData.replace("?keyword?", this.DownloadData.search).replace("?page?", this.page)
        }

        this.getUrlData = urlSplit;
        if (this.DownloadData.selectData.postData == 'url') {
            this.getUrlText = this.DownloadData.selectData.url + "?" + urlSplit;
            this.getUrlData = '';
        }
    },
    //请求的逻辑处理 请求列表页
    DownloadOneBefore: function () {
        this.page++;
        this.setUrl();
        if (this.maxPage == -1 || (this.maxPage != -1 && this.page <= this.maxPage)) {
            this.getUrlListOneAftrt();
        }
        else {
            this.isStop = true
            post_isDisabled(me.isStop)
            $("#post_success_message").html("图片抓取结束！");
        };
    },
    getUrlListOneAftrt: function () {
        var me = this;
        $.ajax({
            url: this.getUrlText,
            type: me.getUrlType,
            data: me.getUrlData,
            timeout: 5000,
            success: function (res) {
                me.DownloadData.dataList = setUrlKey(res, me.DownloadData.selectData.domeData.serch.imgUrl);
                if (!me.DownloadData.dataList.length) {
                    me.isStop = true;
                    $("#post_success_message").html("图片抓取结束！");
                    post_isDisabled(true);
                }
                else {
                    $("#post_success_message").html("准备下载第<b>" + me.page + "</b>页图片！");
                    me.pageIndex = 0;
                    me.getUrlListTwoBefore();
                }
            },
            error: function (res) {
                me.isStop = true;
                post_isDisabled(true)
            }
        });
        function setUrlKey(dataList, item) {
            var array = item.objText.array,
                data = item.objText.data,
                resData,
                returnData = [],
                iData;
            resData = setObjName(dataList, array)
            for (var i = 0; i < resData.length; i++) {
                iData = resData[i];
                iData = item.people + setObjName(iData, data)
                returnData.push(iData);
            }
            return returnData
            console.log(returnData)
        };
        function setObjName(data, name) {
            for (var i = 0; i < name.length; i++) {
                data = data[name[i]];
            }
            return data;
        }
    },
    //请求详情页面后  下载图片
    getUrlListTwoBefore: function () {
        //直接下载图片
        var me = this;

        // 请求列表页
        if (me.pageIndex >= this.DownloadData.dataList.length) {
            me.DownloadOneBefore();
            return;
        }

        if (!this.DownloadData.downType == 'liebiao' || this.DownloadData.selectData.name == '花瓣') {
            this.DownloadlList = this.DownloadData.dataList;
            console.log("列表查找:", this.DownloadlList);
            me.getUrlListThere();
        }
        //详情页请求图片地址
        else {
            me.getUrlListTwoAfter();
        }
    },
    getUrlListTwoAfter: function () {
        var me = this;
        setTimeout(function () {
            if (me.isStop) {
                post_isDisabled(me.isStop)
                return;
            }
            chrome.extension.sendMessage({
                greeting: 'getUrlList',
                data: { domObj: me.DownloadData.domObj[1], url: me.DownloadData.domObj[0].dataList[me.pageIndex] }
            }, function (res) {
                //下载失败跳过
                if (!res.type || res.isStop) {
                    me.getUrlListTwoBefore();
                    return;
                }
                console.log('res')
                res.data[0] = logongDown(res)
                console.log("logongDown:", res.data[0]);
                var dowImg = {
                    url: res.data[0],
                    name: "http" + me.page + "_" + me.pageIndex,
                    text: "下载第<b>" + me.page + "</b> 页 <b>" + me.pageIndex + "<b> 张图片成功！"
                }
                $("#post__success_message").html("准备下载:" + dowImg.name + "图片~");
                me.dowmImg(dowImg, function () {
                    me.pageIndex++;
                    me.getUrlListTwoBefore();
                })
            });
        }, me.setTimeoutNum);
        //登陆特别处理
        function logongDown(res) {
            if (!$("#logngFlag").prop("checked")) {
                return res.data[0];
            }
            else {
                //摄图网-攀登山顶的探险旅行者人
                if (res.data[0].split('699pic.com/').length > 1) {
                    try {
                        var url = (res.data[0].split('.jpg')[0]).split('/photo/')[1].replace('/', '');
                        url = 'http://m.699pic.com/photo/download?photoId=' + url;
                        console.log(url)
                        return url;
                    }
                    catch (err) {
                        return res.data[0]
                    }

                }
            }
        }
    },
    //直接下载图片
    getUrlListThere: function () {
        var me = this;
        setTimeout(function () {
            if (me.isStop) {
                post_isDisabled(me.isStop)
                return;
            }
            var dowImg = {
                url: me.DownloadlList[me.pageIndex],
                name: "post——" + me.page + "_" + me.pageIndex,
                text: "下载第<b>" + me.page + "</b> 页 <b>" + me.pageIndex + "<b> 张图片成功！"
            }
            // console.log("图片下载", dowImg);
            $("#post_success_message").html("准备下载:" + dowImg.name + "图片~");
            console.log('dowImg:', dowImg);
            me.dowmImg(dowImg, function () {
                me.pageIndex++;
                me.getUrlListTwoBefore();
            })
        }, me.setTimeoutNum)

    },
    dowmImg: function (data, cd) {
        var me = this;
        console.log("----downImg", {
            url: data.url,
            name: data.name,
            type: me.imtType,
            dowmUlr: me.DownloadData.dowmUlr
        });
        chrome.extension.sendMessage({
            greeting: 'downImg',
            data: {
                url: data.url,
                name: data.name,
                type: me.imtType,
                dowmUlr: me.DownloadData.dowmUlr
            }
        }, function (res) {
            console.log("下载图片返回", res)
            if (res.isStop) {
                $("#post_error_message").html(res.Message + ",获取失败!");
                post_isDisabled(true);
                return;
            }
            else if (res.type) {
                $("#post_success_message").html(data.text);
                cd();
            }
            else {
                $("#post_error_message").html($("#post_error_message").html() + data.name + "获取失败!");
                cd();
            }
        });
    }
}
postImage.init();

//开始暂停
$("#post_subuit").click(function () {
    postImage.isStop = false
    post_isDisabled(postImage.isStop);
    postImage.Download();
});
$("#post_stop").click(function () {
    postImage.isStop = true;
    $(this).prop("disabled", true);
});
//选择地址
$("#post_thesaurusExport").change(function () {
    var url = $(this).val().split("\\选择目录")[0];
    console.log(url);
    if (!url) {
        url = "./Img"
    }
    $("#post_dowmUlr").val(url);
});
$(".post_QuickSelection[data-tpye=wangye]").change(function () {
    var data = returnData($(this).val()).openUrl;
    console.log(data);
    $("#myModal .modal-body").html(' <iframe src="' + data + '"></iframe>')//attr('src', );
})
post_isDisabled(true);
function post_isDisabled(isStop) {
    if (isStop) {
        $("#post_subuit").prop("disabled", false);
        $("#post_stop").prop("disabled", true);
    }
    else {
        $("#post_subuit").prop("disabled", true);
        $("#post_stop").prop("disabled", false);
    }
};
//设置下拉
function post_setSelect(dataList) {
    var html = '<option value="none" style="display:none" selected>自定义</option>', iData;
    for (var i = 0; i < dataList.length; i++) {
        iData = dataList[i];
        html += ' <option value="' + iData.name + '" data-url="' + iData.url + '">' + iData.name + '</option>'
    }
    $(".post_QuickSelection[data-tpye=wangye]").html(html);
    $(".post_QuickSelection[data-tpye=wangye]").val(dataList[0].name)
    //$(".post_QuickSelection[data-tpye=wangye]").change()
};
post_setSelect(postQuickSelectionData);
//返回选中的数据
function returnData(name) {
    for (var i = 0; i < postQuickSelectionData.length; i++) {
        iData = postQuickSelectionData[i];
        if (name == iData.name) {
            return iData;
        }
    }
    return false;
}


//自动填充 请求url和请求参数
//$(".post_QuickSelection[data-tpye=wangye]").change(function () {
//    alert();
//    var data = $(this).val(), iData;
//    var type = $("#post_mode").val();
//    for (var i = 0; i < postQuickSelectionData.length; i++) {
//        iData = postQuickSelectionData[i];
//        if (data == iData.name && type == 'search') {
//            $("#post_Url").val(iData.url).attr('data-searchText', iData.url);
//            $("#post_urlData").val(iData.domeData.serch.postData).attr('data-searchData', iData.domeData.serch.postData);
//        }
//    }
//});
////输入框后 替换字符串
//$("#post_modeUrl").blur(function () {
//    if (!$(this).val()) {
//        return;
//    }
//})