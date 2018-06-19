$(function(){
	if(sessionStorage.authorize != 1){
		window.location = 'login.html';
	}
	$("#cname").html(sessionStorage.company+"-"+sessionStorage.username);
	var _html = '';
	if(sessionStorage.company == "代理"){
		if(sessionStorage.state == "待审核" || sessionStorage.state == "审核不通过"){
			
		}else{
			_html += '<li><a href="ylg_import.html"><span class="am-icon-pencil-square-o"></span> 有报关单录入</a></li>';
			_html += '<li><a href="ylg_import1.html"><span class="am-icon-pencil-square-o"></span> 无报关单录入</a></li>';
			_html += '<li><a href="ylg_import2.html"><span class="am-icon-pencil-square-o"></span> 特种车辆申报</a></li>';
			_html +='<li><a href="queryxls.html"><span class="am-icon-pencil-square-o"></span> 报关记录查询</a></li>';
		}
		_html += '<li><a href="dl_form.html"><span class="am-icon-pencil-square-o"></span> 信息管理</a></li>';
		
	}else if(sessionStorage.company == "邮轮港"){
		_html +='<li><a href="queryylg.html"><span class="am-icon-pencil-square-o"></span> 作业审核</a></li>';
		_html +='<li><a href="gys.html"><span class="am-icon-pencil-square-o"></span> 供应商管理</a></li>';
		_html +='<li><a href="statistical.html"><span class="am-icon-pencil-square-o"></span> 统计管理</a></li>';
	}else if(sessionStorage.company == "海关"){
		_html +='<li><a href="queryhg.html"><span class="am-icon-pencil-square-o"></span> 报关审核</a></li>';
		_html +='<li><a href="querycar.html"><span class="am-icon-pencil-square-o"></span> 车辆进出港管理</a></li>';
		_html +='<li><a href="statistical.html"><span class="am-icon-pencil-square-o"></span> 统计管理</a></li>';
		_html +='<li><a href="dl.html"><span class="am-icon-pencil-square-o"></span> 代理管理</a></li>';
		_html +='<li><a href="gyshg.html"><span class="am-icon-pencil-square-o"></span> 供应商管理</a></li>';
		_html +='<li><a href="xieqin.html"><span class="am-icon-pencil-square-o"></span> 协勤管理</a></li>';
		_html +='<li><a href="return.html"><span class="am-icon-pencil-square-o"></span> 退货管理</a></li>';
	}else if(sessionStorage.company == "供应商"){
		_html +='<li><a href="gys_form.html"><span class="am-icon-pencil-square-o"></span> 信息管理</a></li>';
	}
	$('.admin-sidebar-list').html(_html);
});

function exitUser(){
	sessionStorage.authorize = 0;
	window.location = 'login.html';
}