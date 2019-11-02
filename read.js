const nodemailer  = require("nodemailer");
const fs = require('fs');
const https = require('https');
const tls = require('tls');
//设置TLS默认最低版本为1。
tls.DEFAULT_MIN_VERSION = 'TLSv1';

const readFile = (file) => {
	return new Promise(function (resolve,reject) {
		fs.readFile(file, function(error,data){
			if(error)	return reject(error);
			else{
				//将读取的数据从字符串转换为字符串数组，通过换行符识别。
				resolve(data.toString().split('\n'));
			}
		});
	});
};

const getDay = host =>{
	return new Promise ((resolve,reject) => {
		global.domains ={
			host,
			port:443,
			method:'GET',
			requestCert: true,
			rejectUnauthorized: false
		};
		let req = https.request(domains,(res)=>{
			let Certificate =  res.connection.getPeerCertificate();
			let domainsName = Certificate.subject;

			//获取当前时间戳后计算证书到期日期与当前时间戳之差，之后转换为天数输出。
			let endTime = Certificate.valid_to;
			let nowTime = new Date()
			let timeDifference = Date.parse(endTime)-Date.parse(nowTime);
			global.restDay = Math.floor(timeDifference/(1000 * 60 * 60 * 24));
			//console.log(`距${domains.host}的域名为的证书过期还剩余${restDay}天`);
			resolve(
				//console.log(`距${domains.host}的证书过期还剩余${restDay}天`),
			);
			//console.table(structDatas)
		});
		req.end();
	});
}
(async() => {
    var hosts = await readFile('ssl.txt');
    var arr1 = [];
    var arr2 = [];
	var certificateINFO =[];
	var count=0;
	for(let i=0,len=hosts.length;i<len;i++){
		//在循环中判断字符串数组中是否含带有'#'的字符串，若有，则i++跳过。
		if(hosts[i].includes('#')){
			i++;
		}
		global.host = hosts[i];
        await getDay(host);
        arr1[i] = host;
        arr2[i] = '剩余'+restDay+'天';
        if(restDay>61){arr2[i]=arr2[i]+'☑️';}
        else if(30<restDay<60){arr2[i]=arr2[i]+'⚠️'};
        if(restDay<30){
			arr2[i]=arr2[i]+'❌';
			count++;
            //console.log(`检测不通过！距${domains.host}证书过期只剩${restDay}天！`);
        };
        certificateINFO[i] = [
            arr1[i],
            arr2[i]
        ];
    }
	console.table(certificateINFO);
	const smtpTransport = nodemailer.createTransport({
		service: 'qq',
		auth: {
			user: '958089586@qq.com',
			pass: 'rtxpzjtcorlgbcjj'//注：此处为授权码，并非邮箱密码
		}
	});
	smtpTransport.sendMail({
		from    : '958089586@qq.com',//发件人邮箱
		to      : '958089586@qq.com',//收件人邮箱，多个邮箱地址间用','隔开
		subject : '域名检测结果更新',//邮件主题
		text: `下面是被检测域名：${certificateINFO}，共${count}个域名不通过检测`,//text和html两者只支持一种
	}, function(err, res) {
		console.log(err, res);
	});
})()
