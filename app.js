var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var express=require("express");
var app=express();
var fs=require("fs");
var schedule = require('node-schedule');

/**
 * [cnodeUrl description]
 * @type {String}
 * 指定爬虫所爬网址入口
 */
var cnodeUrl = 'http://bj.ganji.com/zhaopin/';

/**
 * 指定静态文件
 */
app.use(express.static('app'));

/**
 * 访问主页
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
app.get("/",function(req,res){
	res.sendfile("app/index.html");
})

/**
 * 接口：返回爬取到的赶集网招聘分类及网址
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
app.get("/shuju",function(req,res){
	superagent.get(cnodeUrl).end(function (err, sres) {
		if (err) {
			return console.error(err);
		}
		var $=cheerio.load(sres.text);
		var topUrls=[];
		$('.f-all-news dl dt a').each(function(index,element){
             var $element=$(element);
             var href = url.resolve(cnodeUrl, $element.attr('href'));
             var txt = $element.html();
			topUrls.push({"href":href,"name":txt});
		});
		res.send(topUrls);

		resultBuffer = JSON.stringify({
                topUrls: topUrls
              });
		
		fs.writeFile("data/post.json",resultBuffer,function(err){
			if(err){
               console.error(err);
			}else{
				console.log("成功");
			}
		})


		});
	});

app.get("/readfile",function(req,res){
    fs.readFile('data/post.json', function(err, data){
         if(err){
         	console.error(err);
         }else{
         	console.log("成功");
         	var JsonObject=JSON.parse(data);
         	var topUrls=JsonObject.topUrls;
         	if(topUrls!="undefined"){
                   res.send(topUrls);
         	}else{
         		console.log("空数据");
         		res.send({});
         	}
         }

    })
})

app.get("/company",function(req,res){
	fs.readFile('data/company.json', function(err, data){
         if(err){
         	console.error(err);
         }else{
         	// console.log("成功");
         	var JsonObject=JSON.parse(data);
            res.send(JsonObject);
         }

    })
})


var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 5;
rule.minute = 14;　
var j = schedule.scheduleJob(rule,ganjiTask);

function ganjiTask(){
	var topUrls;
    var allCompany={};
    allCompany.content=[];
    getganjipost(taskStart);

function getganjipost(cb){
		var cnodeUrl = 'http://bj.ganji.com/zhaopin/';
		superagent.get(cnodeUrl).end(function (err, sres) {
			if (err) {
				console.log(err+"大类获取失败");
				j.cancel();
                rule.minute+=10;
                j = schedule.scheduleJob(rule,ganjiTask);
			}else{
				console.log("开始获取大类");
		        var $=cheerio.load(sres.text);
				var urls=[];
				$('.f-all-news dl dt a').each(function(index,element){
					 var $element=$(element);
					 var href = url.resolve(cnodeUrl, $element.attr('href'));
					 var txt = $element.html();
					urls.push({"href":href,"name":txt});
				});	
			    topUrls=urls;
			    cb();
			}
		});
}

function taskStart(){
    	var companys=[];
       	var i=0;
       	var idxUrl=topUrls[0].href;

       	if(topUrls instanceof Array && topUrls.length>0){
			console.log("开始获取第1大类");
			findNoBang(idxUrl);
       	}

        function nextPost(){
        	var idxName=topUrls[i].name;
		    allCompany.content.push({"post":idxName,"company":companys})
		    resultBuffer = JSON.stringify({
			    allCompany: allCompany
		    });
		    fs.writeFile("data/company.json",resultBuffer,function(err){
				if(err){
		           console.log(err);
				}else{
					console.log("成功");
				}
			})
            companys=[];
			if(i<topUrls.length-1){
				i++;
				var delay = parseInt(Math.random() * 10000);
				setTimeout(function() {
					findNoBang(topUrls[i].href);
				}, delay);
			}
		}

		function findNoBang(href){
			console.log(href);
			superagent.get(href).end(function (err, sres) {
			if (err) {
				console.log(err+"获取失败"+href);
				nextPost();
			}else if(sres.ok){
	            	var $=cheerio.load(sres.text);
					$(".job-list").each(function(index,element){
						$element=$(element);
						if($element.find(".ico-bang-new").length > 0){
						}else{
							var thisName=$element.find('.company a').attr("title");
							var thisUrl=$element.find('.company a').attr("href");
						    companys.push({name:thisName,url:thisUrl});
						}
					}); 
					console.log(companys);
					if($(".pageBox .next").length > 0){
					   	var nextUrl=url.resolve("http://bj.ganji.com/", $(".pageBox .next").attr("href"));
						var delay = parseInt(Math.random() * 10000);
						setTimeout(function() {
							findNoBang(nextUrl);
						}, delay);
					}else{
					    nextPost();
					}
				};
			});
		};
}      	

}	
    
		
	






/**
 * 启动服务器
 */
app.listen(80,'127.0.0.1',function(){
     console.log('127.0.0.1');
});