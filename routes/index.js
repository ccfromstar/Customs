var settings = require('../settings');
var mysql = require('../models/db');
var async = require('async');
var debug = require('debug')('myapp:index');
var ejsExcel = require("./ejsExcel");
var fs = require("fs");
var formidable = require('formidable');
var request = require("request");
var crypto = require("crypto");
var Iconv = require('iconv-lite');
var xlsx = require('node-xlsx');

exports.getopenid = function(req, res) {
	
}

function sign(jsapi_ticket, nonceStr, timestamp, url) {
	var ret = {
		jsapi_ticket: jsapi_ticket,
		nonceStr: nonceStr,
		timestamp: timestamp,
		url: url
	};
	var string = raw(ret);
	jsSHA = require('jssha');
	shaObj = new jsSHA(string, 'TEXT');
	ret.signature = shaObj.getHash('SHA-1', 'HEX');

	return ret;
};

function raw(args) {
	var keys = Object.keys(args);
	keys = keys.sort()
	var newArgs = {};
	keys.forEach(function(key) {
		newArgs[key.toLowerCase()] = args[key];
	});

	var string = '';
	for(var k in newArgs) {
		string += '&' + k + '=' + newArgs[k];
	}
	string = string.substr(1);
	return string;
};

exports.scan_js = function(req, res) {
		var timestamp = parseInt(new Date().getTime() / 1000) + '';
		var nonceStr = Math.random().toString(36).substr(2, 15);
		var appId = "wx630bfbf8158108ec";
		var appSecret = "5bd836ff035b8eee93609ed92c4db8ff";
		var wx_url = "http://wsk.youlunshidai.com/scan";
		console.log("wx_url:" + wx_url);
		//判断access_token和jsapi_ticket是否已经获得，并且时效在2小时(7200s)以内
		var strat_time = new Date("2018-01-01");
		var end_time = new Date();
		var timediff = end_time.getTime() - strat_time.getTime() //时间差的毫秒数
			//console.log(end_time + "-->" + strat_time);
		timediff = timediff / 1000;
		//if(access_token == "" || jsapi_ticket == "" || Number(timediff) > 7200){
		if(1 == 1) {
			console.log("first access_token");
			//1.获取access_token
			var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + appSecret;
			request(url, function(err, response, body) {
				if(!err && response.statusCode == 200) {
					console.log("body:" + body);
					var o = JSON.parse(body);
					access_token = o.access_token;
					console.log("access_token:" + access_token);
					//2.获取jsapi_ticket
					var url_jsapi = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi';
					request(url_jsapi, function(err_jsapi, response_jsapi, body_jsapi) {
						if(!err_jsapi && response_jsapi.statusCode == 200) {
							console.log("body_jsapi:" + body_jsapi);
							jsapi_ticket = (JSON.parse(body_jsapi)).ticket;
							console.log("jsapi_ticket:" + jsapi_ticket);
							strat_time = new Date();
							var signature = sign(jsapi_ticket, nonceStr, timestamp, wx_url);
							//var url_info = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid=oEDF2xBoerpEFGh3brZPkWfVRZZg&lang=zh_CN';
							var url_info = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=' + access_token + '&next_openid=';
							request(url_info, function(err_info, response_info, body_info) {
								if(!err_info && response_info.statusCode == 200) {

									res.render('scan', {
										signature: signature,
										jsapi_ticket: jsapi_ticket,
										body_info: body_info
									});
								}
							});
						}
					});
				}
			});
		} else {
			console.log("not first access_token");
			var signature = sign(jsapi_ticket, nonceStr, timestamp, wx_url);
			//var url_info = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid=oEDF2xBoerpEFGh3brZPkWfVRZZg&lang=zh_CN';
			var url_info = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=' + access_token + '&next_openid=';
			request(url_info, function(err_info, response_info, body_info) {
				if(!err_info && response_info.statusCode == 200) {
					res.render('scan', {
						signature: signature,
						jsapi_ticket: jsapi_ticket,
						body_info: body_info
					});
				}
			});
		}
}

exports.servicedo = function(req,res){
	var sql = req.params.sql;
    if (sql == "setTurnplate") {
		var ip = req.param("ip");
		var reward_id = req.param("reward_id");
		var sql = "insert into turnplate(ip,reward_id) values('"+ip+"',"+reward_id+")";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
		});
	}else if(sql == "insert_input_form") {
		var startDate = req.param("startDate");
		var tools = req.param("tools");
		var number = req.param("number");
		var ctype = req.param("ctype");
		var hasBGD = req.param("hasBGD");
		var isEdit = req.param("isEdit");
		var dlname = req.param("dlname");
		var bgd_number = req.param("bgd_number");
		var sbtype = req.param("sbtype");

		if(isEdit == 0){
			/*计算总数量和总金额*/
			var sql0 = "select sum(unit) as sum1,sum(price) as sum2 from input_customs where input_number = '"+number+"'";
			mysql.query(sql0, function(err0, result0) {
				if(err0) return console.error(err0.stack);
				var sql1 = "insert into input_form(startDate,tools,number,ctype,numTotal,priceTotal,state,hasBGD,dlname,bgd_number,sbtype) values('"+startDate+"','"+tools+"','"+number+"','"+ctype+"','"+result0[0].sum1+"','"+result0[0].sum2+"','待审核','"+hasBGD+"','"+dlname+"','"+bgd_number+"','"+sbtype+"')";
				mysql.query(sql1, function(err1, result1) {
					if(err1) return console.error(err1.stack);
					res.send("200");
				});
			});
		}else{
			/*计算总数量和总金额*/
			var sql0 = "select sum(unit) as sum1,sum(price) as sum2 from input_customs where input_number = '"+number+"'";
			mysql.query(sql0, function(err0, result0) {
				if(err0) return console.error(err0.stack);
				var sql1 = "update input_form set ";
				sql1 += " startDate = '" + startDate + "',";
				sql1 += " tools = '" + tools + "',";
				sql1 += " number = '" + number + "',";
				sql1 += " ctype = '" + ctype + "',";
				sql1 += " numTotal = '" + result0[0].sum1 + "',";
				sql1 += " priceTotal = '" + result0[0].sum2 + "',";
				sql1 += " bgd_number = '" + bgd_number + "',";
				sql1 += " sbtype = '" + sbtype + "',";
				sql1 += " state = '待审核'";
				sql1 += " where id = " + isEdit;
				console.log(sql1);
				mysql.query(sql1, function(err1, result1) {
					if(err1) return console.error(err1.stack);
					res.send("200");
				});
			});
		}
	}else if(sql == "getApplyById") {
		var id = req.param("id");
		var sql = "select * from apply where name = '"+id+"'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
	}else if(sql == "getShip") {
		var sql = "select DISTINCT(name) from ship where name != ''";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
	}else if(sql == "setNoPass") {
		var id = req.param("id");
		var remark = req.param("remark");
		var sql = "update apply set state = '审核不通过',remark = '"+remark+"' where id = " + id;
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send("200");
		});
	}else if(sql == "HGNoPass") {
		var id = req.param("id");
		var remark = req.param("remark");
		var sql = "update input_form set state = '驳回',remark = '"+remark+"' where id = " + id;
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send("200");
		});
	}else if(sql == "setIsPrint") {
		var id = req.param("id");
		var sql = "update passenger_info set isPrint = 1,createAt = now() where id="+id;
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
		});
	}else if(sql == "sendMail"){
		var mailaddress = req.param("mailaddress");
		var mailtitle = req.param("mailtitle");
		var timestamp = req.param("timestamp");
		var companyId = req.param("companyId");
		var line = req.param("line");
		
		var mailurl = '';
		if(companyId == 14){
			//sendSystemMail(mailaddress, mailtitle,"<a href='http://47.75.68.234/static/zip/"+timestamp+".zip'>船票下载地址</a>");
			mailurl = "<a href='http://47.75.68.234/static/zip/"+timestamp+".zip'>船票下载地址</a>";
		}else if(companyId == 2){
			//sendSystemMail(mailaddress, mailtitle,"<a href='http://47.98.123.67/static/zip/"+timestamp+".zip'>船票下载地址</a>");
			mailurl = "<a href='http://47.98.123.67/static/zip/"+timestamp+".zip'>船票下载地址</a>";
		}
		request({
			url: 'http://www.cruisesh.com/service/sendMail',
			method: 'POST',
			form:{
				mailaddress:mailaddress,
				mailtitle:mailtitle,
				timestamp:timestamp,
				companyId:companyId,
				line:line
			}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send("200");
			}else{
				console.log(err);
			}
		});
		
	}else if (sql == "applyleader") {
		var no = req.param("no");
		var sql0  = "select count(id) as count from applyleader where line = '2017-04-27 歌诗达大西洋'";
		mysql.query(sql0, function(err, result0) {
			if(err) return console.error(err.stack);
			console.log(result0);
			if(result0[0].count > 6){
				res.send("300");
				return false;
			}
			var sql1 = "select * from leader where no = '"+no+"'";
			mysql.query(sql1, function(err, result1) {
				if(err) return console.error(err.stack);
				if(!result1[0]){
					res.send("400");
					return false;
				}
				var sql3 = "select * from applyleader where no ='"+no+"' and line = '2017-04-27 歌诗达大西洋'";
				mysql.query(sql3, function(err, result3) {
					if(err) return console.error(err.stack);
					if(result3[0]){
						res.send("500");
						return false;
					}
					var sql2 = "insert into applyleader(no,createAt) value('"+no+"',now())";
					mysql.query(sql2, function(err, result2) {
						if(err) return console.error(err.stack);
						res.send("200");
					});
				});
			});
		});
	}else if(sql == "getUserInfo"){
		var passNo = req.param("passNo");
		console.log(passNo);
		request({
			url: 'http://www.cruisesh.com:7778/getUserinfo?cardNo='+passNo,
			method: 'GET'
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "gettotal2"){
		var d = req.param("d");
		var sql2 = "SELECT count(distinct no) as count FROM checkin_log where time >= '2018-01-01' and time < '"+d+"';";
					mysql.query(sql2, function(err, result2) {
						if(err) return console.error(err.stack);
						res.send(result2[0].count+"");
					});
	}else if(sql == "gettotal3"){
		var d = req.param("d");
		request({
			url: 'http://www.cruisesh.com:7778/gettotal3?d='+d,
			method: 'GET'
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "gettotal4"){
		var d = req.param("d");
		request({
			url: 'http://www.cruisesh.com:7778/gettotal4?d='+d,
			method: 'GET'
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "getUserInfoID"){
		var idNo = req.param("idNo");
		console.log(idNo);
		request({
			url: 'http://www.cruisesh.com:7778/getUserinfoID?cardNo='+idNo,
			method: 'GET'
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "importXls"){
		//读取文件内容
		var obj = xlsx.parse('public/cruise_ticket/framework/导入模板.xlsx');
		var excelObj=obj[0].data;
		console.log(excelObj);

		var data = [];
		for(var i in excelObj){
		    var arr=[];
		    var value=excelObj[i];
		    for(var j in value){
		        arr.push(value[j]);
		        console.log(value[j]);
		    }
		    data.push(arr);
		}
	}else if(sql == "activeServer"){
		//ncl
		url = 'http://47.75.68.234/activeServer';

		request({
			url: url,
			method: 'GET',
			headers:{
				"content-type": "charset=utf-8"
			}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "activeServer1"){
		//costa
		url = 'http://47.98.123.67/activeServer';

		request({
			url: url,
			method: 'GET',
			headers:{
				"content-type": "charset=utf-8"
			}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "createZip"){
		var timestamp = req.param("timestamp");
		var companyId = req.param("companyId");

		var url = '';

		if(companyId == 14){
			url = 'http://47.75.68.234/createZip?timestamp='+timestamp;
		}else if(companyId == 2){
			url = 'http://47.98.123.67/createZip?timestamp='+timestamp;
		}

		request({
			url: url,
			method: 'GET',
			headers:{
				"content-type": "charset=utf-8"
			}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "createTicket"){
		var idlist = req.param("idlist");
		var namelist = req.param("namelist");
		var timestamp = req.param("timestamp");
		var companyId = req.param("companyId");

		var url = '';

		if(companyId == 14){
			url = 'http://47.75.68.234/createTicket?idlist='+idlist+'&namelist='+namelist+'&timestamp='+timestamp;
		}else if(companyId == 2){
			url = 'http://47.98.123.67/createTicket?idlist='+idlist+'&namelist='+namelist+'&timestamp='+timestamp;
		}
		console.log(url);
		request({
			url: url,
			method: 'GET',
			headers:{
				"content-type": "charset=utf-8"
			}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "createTicketXls"){
		var idlist = req.param("idlist");
		var namelist = req.param("namelist");
		var timestamp = req.param("timestamp");
		var companyId = req.param("companyId");

		var url = '';

		if(companyId == 14){
			url = 'http://47.75.68.234/createTicketXls?idlist='+idlist+'&namelist='+namelist+'&timestamp='+timestamp;
		}else if(companyId == 2){
			url = 'http://47.98.123.67/createTicketXls?idlist='+idlist+'&namelist='+namelist+'&timestamp='+timestamp;
		}

		request({
			url: url,
			method: 'GET',
			headers:{
				"content-type": "charset=utf-8"
			}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				var id = idlist;
				var sql = "update passenger_info set isPrint = 1,createAt = now() where id="+id;
				console.log(sql);
				mysql.query(sql, function(err2, result2) {
					if(err2) return console.error(err2.stack);
				});
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "doPrint1"){
		var printId = req.param("printId");
		var lineId = req.param("lineId");
		console.log("run");
		request({
			url: 'http://www.cruisesh.com:7778/doPrint1?printId='+printId+'&lineId='+lineId,
			method: 'GET'
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "py_getShip"){
		var date = req.param("date");
		request({
			url: 'http://www.cruisesh.com:7778/getShip?startDate='+date,
			method: 'GET'
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
			}
		});
	}else if(sql == "getLine"){
		var companyId = req.param("companyId");
		var startDate = req.param("startDate");
		request({
			url: 'http://www.cruisesh.com:7778/getLine?startDate='+startDate+'&companyId='+companyId,
			method: 'GET'
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
				res.send("400");
			}
		});
	}else if(sql == "getVistor"){
		var companyId = req.param("companyId");
		var startDate = req.param("startDate");
		var teamNo = req.param("teamNo");
		var teamNo1 = req.param("teamNo1");
		var uname = req.param("uname");
		request({
			url: 'http://www.cruisesh.com:7778/getVistor?startDate='+startDate+'&companyId='+companyId+'&teamNo='+teamNo+'&uname='+uname+'&teamNo1='+teamNo1,
			method: 'GET'
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
				res.send("400");
			}
		});
	}else if(sql == "getLog"){
		var date = req.param("date");
		var ship_no = req.param("ship_no");
		var sql = "select * from checkin_log where time like '%"+date+"%' and ship_no='"+ship_no+"' order by time desc LIMIT 5";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			for(var i in result2) {
				result2[i].time = (result2[i].time).Format("yyyy-MM-dd hh:mm:ss");
			}
			res.send(result2);
		});
		
	}else if(sql == "createReturn"){
		var remark = req.param("remark");
		var name = req.param("name");
		var sql = "insert into hg_return(name,time,remark,state) values('"+name+"',now(),'"+remark+"','待审核')";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			res.send("200");
		});
		
	}else if(sql == "getXVistor"){
		var startDate = req.param("startDate");
		var teamNo = req.param("teamNo");
		var roomNo = req.param("roomNo");
		var sType = req.param("sType");
		var s_state = req.param("s_state");
		var dl = req.param("dl");

		if(!dl){
			dl = '';
		}

		if(sType == "*"){
			sType = "";
		}
		if(s_state == "*"){
			s_state = "";
		}
		var sql = "select * from input_form where dlname like '%"+dl+"%' and hasBGD like '%"+sType+"%' and state like '%"+s_state+"%' and tools like '%"+teamNo+"%' and number like '%"+roomNo+"%'  and startDate like '%"+startDate+"%'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
		
	}else if(sql == "getCar"){
		var startDate = req.param("startDate");
		var carNo = req.param("carNo");
		var ctype = req.param("ctype");
		var change = '';
		if(Number(ctype) == 1){
			change = ' and timein = "" ';
		}else if(Number(ctype) == 2){
			change = ' and timeout = "" ';
		}
		var sql = "select * from carlist where startDate like '%"+startDate+"%' "+change+" and carNo like '%"+carNo+"%'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			for(var i in result2) {
				//result2[i].time = (result2[i].time).Format("yyyy-MM-dd hh:mm:ss");
			}
			res.send(result2);
		});
		
	}else if(sql == "getXVistor3"){
		console.log("Run");
		var no = req.param("no");
		var sql = "select * from input_customs where input_number like '%"+no+"%'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
		
	}else if(sql == "getXQ"){
		var txtName = req.param("txtName");
		var sql = "select * from xieqin where name like '%"+txtName+"%'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
		
	}else if(sql == "getReturn"){
		var txtName = req.param("txtName");
		var sql = "select * from hg_return where remark like '%"+txtName+"%'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
		
	}else if(sql == "getXVistorAll"){
		console.log("Run");
		var startDate = req.param("startDate");
		var teamNo = req.param("teamNo");
		var ctype = req.param("ctype");
		var sbtype = req.param("sbtype");
		var sql = "select * from input_customs where startDate like'%"+startDate+"%' and ctype like'%"+ctype+"%'  and sbtype like'%"+sbtype+"%' and (name like '%"+teamNo+"%' or empolyeeName like '%"+teamNo+"%' or curiseName like '%"+teamNo+"%'  or dlname like '%"+teamNo+"%')";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
		
	}else if(sql == "getFJ"){
		var roomNo = req.param("roomNo");
		var sql = "select * from input_files where input_number like '%"+roomNo+"%'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
		
	}else if(sql == "getNumber"){
		var sql = "select DISTINCT(input_number) from input_customs where state ='待审核'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
		
	}else if(sql == "getXVistor1"){
		var roomNo = req.param("roomNo");
		var sql = "select * from input_files where input_number like '%"+roomNo+"%'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
		
	}else if(sql == "getXVistor2"){
		var roomNo = req.param("roomNo");
		var sql = "select * from apply where name like '%"+roomNo+"%' and type='供应商'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
		
	}else if(sql == "getXVistor2dl"){
		var roomNo = req.param("roomNo");
		var sql = "select * from apply where name like '%"+roomNo+"%' and type='代理'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});
		
	}else if(sql == "delTicketDoc"){
		var idlist = req.param("idlist");
		var arr1 = idlist.split("*");
		for(var i=0;i<arr1.length;i++){
			var sql = "delete from input_customs where id = "+arr1[i];
			mysql.query(sql, function(err2, result2) {
				if(err2) return console.error(err2.stack);
			});
		}
		res.send("200");
		
	}else if(sql == "delTicketDoc1"){
		var idlist = req.param("idlist");
		var arr1 = idlist.split("*");
		for(var i=0;i<arr1.length;i++){
			var sql = "delete from input_files where id = "+arr1[i];
			mysql.query(sql, function(err2, result2) {
				if(err2) return console.error(err2.stack);
			});
		}
		res.send("200");
		
	}else if(sql == "delTicketDoc2"){
		var idlist = req.param("idlist");
		var sql = "update apply set state = '审核通过',remark = '' where id = "+idlist;
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
		});
		res.send("200");
		
	}else if(sql == "delTicketDoc3"){
		var idlist = req.param("idlist");
		var type = req.param("type");
		var arr1 = idlist.split("*");
		for(var i=0;i<arr1.length;i++){
			var sql = "update apply set state"+type+" = '审核通过',remark = '' where id = "+arr1[i];
			mysql.query(sql, function(err2, result2) {
				if(err2) return console.error(err2.stack);
			});
		}
		res.send("200");
		
	}else if(sql == "ApproveDoc"){
		var idlist = req.param("idlist");
		var arr1 = idlist.split("*");
		for(var i=0;i<arr1.length;i++){
			var sql = "update input_customs set state='海关已审核' where id = "+arr1[i];
			mysql.query(sql, function(err2, result2) {
				if(err2) return console.error(err2.stack);
			});
		}
		res.send("200");
		
	}else if(sql == "changecar"){
		var inputnumber = req.param("inputnumber");
		var oldcarno = req.param("oldcarno");
		var newcarno = req.param("newcarno");

		var sql = "update input_customs set carNo='"+newcarno+"' where carNo = '"+oldcarno+"'";
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			//插入变更记录
			var sql1 = "insert into car_changelist(oldcarno,newcarno,inputnumber,time) values('"+oldcarno+"','"+newcarno+"','"+inputnumber+"',now())";
			mysql.query(sql1, function(err1, result1) {
				if(err1) return console.error(err1.stack);
				//变更文档状态
				var sql3 = "update input_form set state = '待审核' where number = '"+inputnumber+"'";
				mysql.query(sql3, function(err3, result3) {
					if(err3) return console.error(err3.stack);
					
					res.send("200");
				});
			});
		});
		
		
	}else if(sql == "ApproveDoc1"){
		var idlist = req.param("idlist");
		var arr1 = idlist.split("*");
		for(var i=0;i<arr1.length;i++){
			var sql = "update input_customs set state='邮轮港已审核' where id = "+arr1[i];
			mysql.query(sql, function(err2, result2) {
				if(err2) return console.error(err2.stack);
			});
		}
		res.send("200");
		
	}else if(sql == "getCode"){
		var carNo = req.param("carNo");
		var sql = "select DISTINCT(input_number) from v_input_customs where state != '出港已核销' and docstate = '邮轮港已审核' and carNo = '"+carNo+"'";
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});	
	}else if(sql == "getMaterial"){
		var bookingno = req.param("bookingno");
		var arr1 = bookingno.split("@");

		var sql = "select * from input_customs where input_number = '"+arr1[0]+"' and carNo = '"+arr1[1]+"'";
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});	
	}else if(sql == "cancelMaterial1"){
		var code = req.param("code");
		var cname = req.param("cname");
		var startDate = req.param("startDate");
		var arr1 = code.split("@");
		/*状态已核销*/
		/*记录车辆进港数据*/
		var sql1 = "update input_customs set state = '进港已核销' where input_number = '"+arr1[0]+"' and carNo = '"+arr1[1]+"'";
		mysql.query(sql1, function(err1, result1) {
			if(err1) return console.error(err2.stack);
			var sql2 = "update carlist set timein = now(),no_in = '"+cname+"' where startDate = '"+startDate+"' and carNo = '"+arr1[1]+"'";
			mysql.query(sql2, function(err2, result2) {
				if(err2) return console.error(err2.stack);
				res.send("200");
			});
		});	
	}else if(sql == "cancelMaterial2"){
		var code = req.param("code");
		var cname = req.param("cname");
		var startDate = req.param("startDate");
		var arr1 = code.split("@");
		/*状态已核销*/
		/*记录车辆进港数据*/
		var sql1 = "update input_customs set state = '出港已核销' where input_number = '"+arr1[0]+"' and carNo = '"+arr1[1]+"'";
		mysql.query(sql1, function(err1, result1) {
			if(err1) return console.error(err2.stack);
			var sql2 = "update carlist set timeout = now(),no_out = '"+cname+"' where startDate = '"+startDate+"' and carNo = '"+arr1[1]+"'";
			mysql.query(sql2, function(err2, result2) {
				if(err2) return console.error(err2.stack);
				res.send("200");
			});
		});	
	}else if(sql == "getDocByKey"){
		var id = req.param("id");
		var sql = "select * from input_form where id="+id;
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});	
	}else if(sql == "delPass"){
		var id = req.param("id");
		var sql = "update input_form set state = '已删除' where id ="+id;
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send("200");
		});	
	}else if(sql == "delXQ"){
		var id = req.param("id");
		var sql = "delete from xieqin where id ="+id;
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send("200");
		});	
	}else if(sql == "HGPass"){
		var id = req.param("id");
		var sql = "update input_form set state = '海关已审核' where id ="+id;
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send("200");
		});	
	}else if(sql == "ReturnPass"){
		var id = req.param("id");
		var sql = "update hg_return set state = '已审核' where id ="+id;
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send("200");
		});	
	}else if(sql == "checkXQ"){
		var no = req.param("no");
		var tel = req.param("tel");
		var sql = "select * from xieqin where no = '"+no+"' and tel = '"+tel+"'";
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});	
	}else if(sql == "getChange"){
		var no = req.param("no");
		var sql = "select * from car_changelist where inputnumber = '"+no+"'";
		console.log(sql);
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send(result2);
		});	
	}else if(sql == "YLGPass"){
		var id = req.param("id");
		var sql = "update input_form set state = '邮轮港已审核' where id ="+id;
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send("200");
		});	
	}else if(sql == "addXQ"){
		var no = req.param("no");
		var name = req.param("name");
		var tel = req.param("tel");
		var sql = "insert into xieqin(no,name,tel) values('"+no+"','"+name+"','"+tel+"');";
		mysql.query(sql, function(err2, result2) {
			if(err2) return console.error(err2.stack);
			res.send("200");
		});	
	}else if(sql == "updateLine"){
		var descr = req.param("descr");
		var lineId = req.param("lineId");
		request({
			url: 'http://www.cruisesh.com:7778/updateLine?descr='+descr+'&lineId='+lineId,
			method: 'GET'
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.send(body);
			}else{
				console.log(err);
				res.send("400");
			}
		});
	}else if(sql == "checkTUser"){
		var username = req.param("username");
		var password = req.param("password");
		var company = req.param("company");
		if(company == '供应商' || company == '代理'){
			var Sql = "select * from apply where name = '"+username+"' and type = '"+company+"'";
		    mysql.query(Sql ,function(error,obj){
		          if(error){console.log(error);res.send("400");return false;}
		          if(obj[0]){
		          	  if(obj[0].ftel == password){
		                  res.send({
		                  	username:username,
		                  	company:company,
		                  	state:obj[0].state
		                  });
			          }else{
			              res.send("400");
			          }
		          }else{
		          	  res.send("400");
		          }
		          
		    });
		}else{
			var Sql = "select * from customs_user where username = '"+username+"' and company = '"+company+"'";
		    mysql.query(Sql ,function(error,obj){
		          if(error){console.log(error);res.send("400");return false;}
		          if(obj[0]){
		          	  if(obj[0].pwd == password){
		                  res.send({
		                  	username:username,
		                  	company:obj[0].company
		                  });
			          }else{
			              res.send("400");
			          }
		          }else{
		          	  res.send("400");
		          }
		          
		    });
		}
	}else if(sql == "py_getTotal"){
		var date = req.param("date");
		var ship_id = req.param("ship_id");
		request({
			url: 'http://www.cruisesh.com:7778/getTotal?startDate='+date+'&shortEn='+ship_id,
			method: 'GET'
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
					var sql2 = "select count(DISTINCT no) as count,min(time) as min,max(time) as max from checkin_log where time like '"+date+"%' and ship_no='"+ship_id+"'" ;
					mysql.query(sql2, function(err, result2) {
						if(err) return console.error(err.stack);
						request({
							url: 'http://www.cruisesh.com:7778/getShipName?shortEn='+ship_id,
							method: 'GET'
						}, function(err, response, body2) {
							if (!err && response.statusCode == 200) {
								var sql3 = "select a.time from checkin_log a right join (select max(id) id from checkin_log  where time like '"+date+"%' group by no) b on b.id = a.id where a.id is not null and a.ship_no = '"+ship_id+"' order by a.time";
								mysql.query(sql3, function(err, result3) {
									if(err) return console.error(err.stack);
									var dif = 0;
									range = '';
									var arr1 = [];
									var arr2 = [];
									if(result2[0].count != 0){
										dif = GetDateDiff(result2[0].min+"",result2[0].max+"");
										range = (result2[0].min).Format("hh:mm:ss")+"~"+(result2[0].max).Format("hh:mm:ss");
										/*根据result3计算chart的值*/
										var node_min = (result2[0].min).Format("yyyy-MM-dd hh:mm:ss");
										var node_max = (result2[0].max).Format("yyyy-MM-dd hh:mm:ss");
										var tmp1 = node_min.split(":");
										node_min = tmp1[0]+":"+tmp1[1];
										var tmp2 = node_max.split(":");
										node_max = tmp2[0]+":"+tmp2[1];
										var j = 0;
										for(var i=0;i<parseInt(dif)+2;i++){
											var m = new Date(node_min);
											var n = new Date(m.getTime() + 1000 * 60 * i);
											var mn = n.Format("yyyy-MM-dd hh:mm");
											var s_mn =  n.Format("hh:mm");
											arr1.push(s_mn);
										    /*计算这1分钟的人数*/
										    var np = 0;
										    
										    while(j<result3.length){
										    	var t = (result3[j].time).Format("yyyy-MM-dd hh:mm:ss") +"";
										 
										    	if(t.indexOf(mn) != -1){
										    		np++;
										    		j++;
										    	}else{
										    		break;
										    	}
										    }
										    arr2.push(np);
										}
										/*
										for(var j=0;j<result3.length;j++){
											console.log(result3[j]);
										}*/	
									}
									
									var o = {
										scan_num:result2[0].count,
										total_num:body,
										ship_id:body2,
										range:range,
										dif:dif,
										x:arr1,
										y:arr2
									};
									res.json(o);
								});
							}else{
								console.log(err);
							}
						});
					});
			}else{
				console.log(err);
			}
		});
	}
}

exports._upload = function(req, res) {
	res.render('_upload',{layout:false});
};

exports._uploadsuccess = function(req, res) {
	var p = req.query.p;
	res.render('_uploadsuccess', {
		layout:false,
		url: getUrl(req),
		p: p
	});
};

exports.upload = function(req, res) {
	res.render('upload',{layout:false});
};

function getUrl(req) {
	return req.url;
}

exports.uploadsuccess = function(req, res) {
	var p = req.query.p;
	res.render('uploadsuccess', {
		layout:false,
		url: getUrl(req),
		p: p
	});
};

exports.uploadfail = function(req, res) {
	var p = req.query.p;
	res.render('uploadfail', {
		layout:false,
		url: getUrl(req),
		p: p
	});
};

exports._uploaddo = function(req, res) {
	console.log(req.files);
	var img_url = req.files.img_url;
	var namelist = "";
	if(img_url.path){
		namelist = img_url.path.replace("public\\upload\\", "").replace("public/upload/", "");
	}else{
		for(var i in img_url){
			var x = img_url[i].path.replace("public\\upload\\", "").replace("public/upload/", "");
			namelist = (namelist == ""?(x):(namelist+";"+x));
		}
	}
	
	var input_number = req.body.input_number;
	var arr1 = namelist.split(";");

	for(var i=0;i<arr1.length;i++){
		var sql = "insert into input_files(name,input_number) values('"+arr1[i]+"','"+input_number+"')";
		console.log(sql);
		mysql.query(sql, function(err, result) {
			if(err) return console.error(err.stack);
		});
	}
	
	res.redirect("_uploadsuccess?p=" + namelist);
};

exports.uploaddo2 = function(req, res) {
	var username = req.body.username;
	var fname1 = req.body.fname;
	var ftel = req.body.ftel;
	var fadd = req.body.fadd;
	var type = req.body.type;
	var fname = req.files.img_url.path.replace("public\\upload\\", "").replace("public/upload/", "");
	var sql = "insert into apply(name,image,state,fname,ftel,fadd,type) values('"+username+"','"+fname+"','待审核','"+fname1+"','"+ftel+"','"+fadd+"','"+type+"')";
	mysql.query(sql, function(err, result) {
		if(err) return console.error(err.stack);
		res.redirect("/customs/page/regsuccess.html");
	});	
};

exports.uploaddo3 = function(req, res) {
	var username = req.body.username;
	var fname1 = req.body.fname;
	var ftel = req.body.ftel;
	var fadd = req.body.fadd;
	var image_name = req.body.image_name;
	var editid = req.body.editid;
	var fname = image_name;
	if(image_name == "-"){
		fname = req.files.img_url.path.replace("public\\upload\\", "").replace("public/upload/", "");
	}
	var sql = "update apply set ";
			sql += " image = '" + fname + "',";
			sql += " fname = '" + fname1 + "',";
			sql += " ftel = '" + ftel + "',";
			sql += " fadd = '" + fadd + "',";
			sql += " state = '待审核'";
			sql += " where id = " + editid;
	mysql.query(sql, function(err, result) {
		if(err) return console.error(err.stack);
		res.redirect("/customs/page/gys_form.html?c#=0");
	});
};

exports.uploaddo = function(req, res) {
	var fname = req.files.img_url.path.replace("public\\upload\\", "").replace("public/upload/", "");
	var startDate = req.body.startDate;
	var curiseName = req.body.curiseName;
	var input_number = req.body.input_number;
	var ctype = req.body.ctype;
    var dlname = req.body.dlname;
    var sbtype = req.body.sbtype;
	/*解析数据生成记录*/
	var sql1 = "select name from apply where state ='审核通过' and state1 ='审核通过'";
	mysql.query(sql1, function(err, result1) {
		if(err) return console.error(err.stack);
		var gyslist = '';
		for(var i in result1){
			var x = result1[i].name;
			gyslist = (gyslist == ""?(x):(gyslist+";"+x));
		}
		//读取文件内容
		var obj = xlsx.parse('public/upload/'+fname);
		var excelObj=obj[0].data;
		//console.log(excelObj);
		/*检查供应商是否在系统里*/
		for(var i in excelObj){
			    var arr=[];
			    var value=excelObj[i];
			    if(i>0 && value[0]){
			    	for(var j in value){
				        arr.push(value[j]);
				    }
				    //console.log(gyslist.indexOf(arr[5]));
				   	if(gyslist.indexOf(arr[5])==-1){
				   		res.redirect("uploadfail?p=" + arr[5]);
				   		return false;
				   	}
			    }
			    
			    //data.push(arr);
		}

		//var data = [];
		//删除所有以前的材料
		var sqlB = "delete from input_customs where input_number = '"+input_number+"'";
		mysql.query(sqlB, function(err, resultB) {
			if(err) return console.error(err.stack);
			var carlist = '';
			for(var i in excelObj){
				    var arr=[];
				    var value=excelObj[i];
				    if(i>0 && value[0]){
				    	for(var j in value){
					        arr.push(value[j]);
					    }
					    var sql = "insert into input_customs(no,name,nameEn,unit,price,empolyeeName,carNo,input_number,startDate,curiseName,ctype,dlname,sbtype) values ('"+arr[0]+"','"+arr[1]+"','"+arr[2]+"','"+arr[3]+"','"+arr[4]+"','"+arr[5]+"','"+arr[6]+"','"+input_number+"','"+startDate+"','"+curiseName+"','"+ctype+"','"+dlname+"','"+sbtype+"')";
						console.log(sql);
						mysql.query(sql, function(err, result) {
							if(err) return console.error(err.stack);
						});
						if(carlist.indexOf(arr[6]) == -1){
							carlist = carlist + ";" + arr[6];
							//插入车牌记录
							var sqlA = "insert into carlist(carNo,startDate,timedl) values('"+arr[6]+"','"+startDate+"',now());";
							console.log(sqlA);
							mysql.query(sqlA, function(err, resultA) {
								if(err) return console.error(err.stack);
							});
						}
						
				    }
				    
				    //data.push(arr);
			}
		});

		
		res.redirect("uploadsuccess?p=" + fname);

	});
};

Date.prototype.Format = function(fmt) {
	var d = this;
	var o = {
		"M+": d.getMonth() + 1, //月份
		"d+": d.getDate(), //日
		"h+": d.getHours(), //小时
		"m+": d.getMinutes(), //分
		"s+": d.getSeconds(), //秒
		"q+": Math.floor((d.getMonth() + 3) / 3), //季度
		"S": d.getMilliseconds() //毫秒
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