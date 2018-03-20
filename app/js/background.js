var http = require("http");
var fs = require("fs");
var path = require('path');

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    htmlDownload[request.greeting](sendResponse, request.data);
    return true;
});

var htmlDownload = {
    getUrlList: function (sendResponse, requestData) {
        var me = this;
        $.ajax({
            type: 'GET',
            url: requestData.url,
            timeout: 5000,
            success: function (res) {
                var data = $(res);
                data.each(function () {
                    if ($(this).find(requestData.domObj.dom).length) {
                        me.toImgt($(this).find(requestData.domObj.dom), requestData, sendResponse)
                        return;
                    }
                });
                sendResponse({ type: true, Message: '抓取失败,条数为0,抓取结束或被屏蔽', isStop: true })
            },
            error: function (res) {
                sendResponse({ type: true, Message: '获取失败，请检查网络连接或翻墙后请求', isStop: true })
            }
        });
    },
    toImgt: function ($img, requestData, sendResponse) {
        var urlList = [], alt = [];
        $img.each(function () {
            var url
            for (var i = 0; i < requestData.domObj.attr.length; i++) {
                url = $(this).attr(requestData.domObj.attr[i]);
                if (url) {
                    break;
                }
            }
            //如果找不到元素
            if (!url) {
                sendResponse({ type: false, Message: 'attr元素有错误,可能是懒加载元素造成,请检查有重新查找!', isStop: true })
            }
            if (!domainURI(url)) {
                url = "http://" + domainURI(requestData.url) + url;
            }
            url=url.replace("https","http");
            urlList.push(url);
            alt.push($(this).attr('title') || 'none');
        })
        sendResponse({ type: true, data: urlList, alt: alt })
    },
    downImg: function (sendResponse, requestData) {
        console.log('开始下载图片:',requestData.url);
        http.get(requestData.url, function (res) {
            var imgData = "";
            res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
            res.on("data", function (chunk) {
                imgData += chunk;
            });
            res.on("end", function () {
                //文件夹地址判断
                returnDownUrl(requestData.dowmUlr, function (url) {
                    if (!url) {
                        sendResponse({ type: false, isStop: true, Message: '下载文件夹地址有误' })
                        return;
                    }
                    fs.writeFile(url + "/" + requestData.name + "." + requestData.type, imgData, "binary", function (err) {
                        if (err) {
                            if (requestData.index >= 3) {
                                sendResponse({ type: false, isStop: true, Message: '网络请求失败！' })
                            }
                            else {
                                sendResponse({ type: false, Message: '图片保存失败' })
                            }
                            return;
                        }
                        sendResponse({ type: true })
                    });

                });
            });
        })
        .on("error", function () {
            //图片为破图时候 触发
            sendResponse({ type: false, Message: '图片下载失败' })
        });
    },
};
//请求监听

//判断是否包含域名
function domainURI(str) {
    var durl = /http:\/\/([^\/]+)\//i;
    var durl2 = /https:\/\/([^\/]+)\//i;
    var domain = str.match(durl),domain2 = str.match(durl2);
    if (domain) {
        return domain[1];
    }
    if (domain2) {
        return domain2[1].replace("https","http");
    }
    return false;

};
//返回相对路径
function returnDownUrl(url, cd) {
    var returnUrl = path.relative('./', url);
    fs.exists(returnUrl, function (exists) {
        if (!exists) {
            console.log("创建失败", url, returnUrl);
            cd(false);
        }
        cd(url)
    });

};

chrome.webRequest.onBeforeSendHeaders.addListener(function (detail) {
    if (detail.url.split("huaban.com/search").length > 1) {
        console.log("求改请求头", detail)
        var falg = false;
        for (var i = 0; i < detail.requestHeaders.length; i++) {
            if (detail.requestHeaders[i].name == "Referer") {
                detail.requestHeaders[i].value = 'http://huaban.com/search';
                falg = true;
            };
            if (detail.requestHeaders[i].name == "Accept")//
            {
                detail.requestHeaders[i].value = 'application/json'
            }
        }
        if (!falg) {
            detail.requestHeaders.push({ name: 'Referer', value: 'http://huaban.com/search/?q=wc' });
            detail.requestHeaders.push({ name: 'X-Request', value: 'JSON' });
            detail.requestHeaders.push({ name: 'X-Requested-With', value: 'XMLHttpRequest' })
        };
    };
    if (detail.url.split("www.behance.net").length > 1) {
        for (var i = 0; i < detail.requestHeaders.length; i++) {
            if (detail.requestHeaders[i].name == "Cookie") {
                detail.requestHeaders[i].value = detail.requestHeaders[i].value + '; ilo0=true';
            };
            if (detail.requestHeaders[i].name == "Accept")//
            {
                detail.requestHeaders[i].value = 'application/json'
            }
        }
        detail.requestHeaders.push({ name: 'Referer', value: 'https://www.behance.net/' })
        detail.type = 'xmlhttprequest';
        detail.parentFrameId = 0;
    };

    return { requestHeaders: detail.requestHeaders };
}, { "urls": ["<all_urls>"] }, ["blocking", "requestHeaders"]);

//fs.readFile('./Img/1_0.jpg', function (err, originBuffer) {
//    console.log()
//    console.log(Buffer.isBuffer(originBuffer));
//});

