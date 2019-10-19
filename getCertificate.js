const fs = require('fs');
const https = require('https');
var tls = require('tls');
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
		const domains ={
			host,
			port:443,
			method:'GET',
			requestCert: true,
			rejectUnauthorized: false
		};
		const req = https.request(domains,(res)=>{
			const Certificate =  res.connection.getPeerCertificate();
			const domainsName = Certificate.subject.CN;

			//获取当前时间戳后计算证书到期日期与当前时间戳之差，之后转换为天数输出。
			const endTime = Certificate.valid_to;
			const nowTime = new Date()
			const timeDifference = Date.parse(endTime)-Date.parse(nowTime);
			const restDay = Math.floor(timeDifference/(1000 * 60 * 60 * 24));
			console.log(`距${domains.host}的域名为${domainsName}的证书过期还剩余${restDay}天`);
			resolve({
				
				});
		});
		req.end();
	});
}

(async() => {
	const hosts = await readFile('ssl.txt');
	for(var i=0;i<hosts.length;i++){
		//在循环中判断字符串数组中是否含带有'#'的字符串，若有则i++跳过。
		if(hosts[i].includes('#')){
			i++;
		}
		var host = hosts[i].toString();
		await getDay(host);
	}
})()