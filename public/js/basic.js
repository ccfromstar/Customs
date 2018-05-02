Date.prototype.Format = function(fmt) {
		var d = this;
		var o = {
			"M+": d.getMonth() + 1, //月份
			"d+": d.getDate(), //日
			"h+": d.getHours(), //小时
			"m+": d.getMinutes(), //分
			"s+": d.getSeconds(), //秒
			"q+": Math.floor((d.getMonth() + 3) / 3), //季度
			"S" : d.getMilliseconds() //毫秒
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
		return fmt;
}

_checkIE();

function _checkIE() {
	var browser = navigator.appName;
	var b_version = navigator.appVersion;
	if (b_version.indexOf(';') == -1) {
		return false;
	}
	var version = b_version.split(";");
	var trim_Version = version[1].replace(/[ ]/g, "");
	if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE6.0") {
		//alert("IE 6.0"); 
		_showNotAllow();
	} else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE7.0") {
		//alert("IE 7.0"); window.location.href="http://xxxx.com";
		_showNotAllow();
	} else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
		//alert("IE 8.0"); 
		_showNotAllow();
	} else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0") {
		//alert("IE 9.0"); 
		_showNotAllow();
	} else {
		//your code goes here
	}
}

function _showNotAllow() {
	alert("对不起，您的浏览器版本过低，请升级IE或改用其他浏览器访问！");
	window.location = "/ieupdate.html";
}