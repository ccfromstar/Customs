$(function(){
	if(sessionStorage.authorize != 1){
		window.location = 'login.html';
	}
	$("#cname").html(sessionStorage.company+"-"+sessionStorage.username);
	var _html = '';
	if(sessionStorage.company == "邮轮港公司"){
		_html = '<li><a href="ylg_import.html"><span class="am-icon-pencil-square-o"></span> 报关数据录入</a></li>';
		_html +='<li><a href="queryxls.html"><span class="am-icon-pencil-square-o"></span> 报关数据查询</a></li>';
		_html +='<li><a href="queryfj.html"><span class="am-icon-pencil-square-o"></span> 报关附件查询</a></li>';
		_html +='<li><a href="gys.html"><span class="am-icon-pencil-square-o"></span> 供应商管理</a></li>';
	}
	$('.admin-sidebar-list').html(_html);
});

function exitUser(){
	sessionStorage.authorize = 0;
	window.location = 'login.html';
}