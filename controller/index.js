let mg = require('../middleware/mg');
let app = require('../app');
let rp = require('request-promise');
let qs = require('querystring');

let Schema = mg.Schema;

let optionsSchema = new Schema({
    optName: String,
    option: Schema.Types.Mixed
});

let OptionCollections = mg.model("Options", optionsSchema);

let token = '';

module.exports = {
    index: function*(){
        yield this.render('index',{'title': "fake"});
    },
    getParams: function*(next){

        let resData = '';
        let reqBody = this.request.body;

        //process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        let paramsBodyStr = reqBody['bodyParams']; // 获取入參格式化的字符串
        let paramsBodyObj = qs.parse(paramsBodyStr); // 将格式化的参数字符串转为参数对象
        let params = paramsBodyStr.split('&'); // 将前端传入的入參格式化的字符串，分割为数组方便排序加密

        // 入参排序后，md5加密
        params.sort(); // 排序
        params.push("key=jwoxoWHeauio");// 与服务器约定的字段
        // 拼回格式化字符串
        let sortedParamsStr = '';
        for (var i =0 ; i < params.length; i++) {
            if (i !== params.length - 1) {
                sortedParamsStr += params[i] + '&';
            } else {
                sortedParamsStr += params[i];
            }
        }
        let md5 = require('md5');
        let sign = md5(sortedParamsStr);// 加密


        if(reqBody['method'] === 'POST'){
            var options = {
                url    : reqBody['url'],
                method : 'POST',
                gzip   : true,
                resolveWithFullResponse : true,
                json : true,
                headers : {
                    'netWorkStandard' : 'WIFI',
                    'User-Agent'      : 'miaoqian/2.5.1 (iPhone; iOS 10.2.1; Scale/3.00)',
                    'appVersion'      : '2.5.1',
                    'channelCode'     : 'App Store',
                    'latitude'        : '0.000000',
                    'Content-Length'  : '66',
                    'deviceId'        : '85fa9624f69f950e1ef3fc1b7f18f1e506430c39',
                    'appName'         : 'miaoqiannew',
                    'Connection'      : 'keep-alive',
                    'deviceModel'     : 'iPhone 7 Plus',
                    'longitude'       : '0.000000',
                    'Accept-Language' : 'zh-Hans-CN',
                    'sign'            : sign,
                    'token'           : token,
                    'osVersion'       : '10.2',
                    'Accept'          : '*/*',
                    'Content-Type'    : 'application/x-www-form-urlencoded;charset=UTF-8',
                    'Accept-Encoding' : 'gzip, deflate',
                    'cType'           : 'iOS'
                },
                qs : paramsBodyObj
            };
            resData = yield rp(options).then((res) => {
                console.log("=============Response Body==============")
                console.log("Response Body: " + JSON.stringify(res.body));
                return JSON.stringify(res.body);
            }).catch((error) => {
                console.log("Error:" + error.message);
            });
        }else{

        }

        let mgOptions = options;

        let items = yield OptionCollections.find({optName: reqBody['interfaceName']}).exec();
        if(items.length === 0){
            newModels = new OptionCollections({
                optName: reqBody['interfaceName'],
                option: mgOptions
            });
            yield newModels.save().then((res) => {
                if (res){
                    console.log('data: ' + res);
                }
            });
        }

        yield this.render('index',{'reqData': resData});
    },
    getHistories: function *(next) {

        this.response.body = yield OptionCollections.find({}).exec();

    },
    sendFromHistory: function *(next) {
        let targetOptName = this.request.body['optName'];
        let item = yield OptionCollections.find({optName: targetOptName}).exec();
        let reqOption = item[0].option;
        let qs = reqOption['qs'];
        console.log("1111: " + typeof qs);
        this.response.body = yield rp(reqOption).then((res) => {
            console.log("=============Response Body==============")
            console.log("Response Body: " + JSON.stringify(res.body));
            return JSON.stringify(res.body);
        }).catch((error) => {
            console.log("Error:" + error.message);
        });
        // yield this.render('index',{'reqData': "aaa"}); // TODO: figure out why this line code dose not work anymore.
    },
    getToken: function *(next){
        let items  = yield OptionCollections.find({optName: 'Get_Token'}).exec();
        let reqOption = items[0].option;
        reqOption.qs['mobilePhone'] = this.request.body['user'];
        reqOption.qs['password'] = this.request.body['password'];
        let resBody = yield rp(reqOption).then((res) => {
            return res.body;
        }).catch((error) => {
            console.log("Error:" + error.message);
        });
        if(resBody.code === "000000"){
            token = resBody.data['token'];
            let custId = resBody.data['custId'];
            yield this.render('index',{'custId': custId});
        }else{
            yield this.render('index',{'reqData': "账号密码错误，请确认后重新输入。"});
        }
    },delHistory: function *(next) {
        let targetName = this.request.body['optName'];
        if(targetName != "Get_Token"){
            this.response.body = yield OptionCollections.remove({optName: targetName}).exec();
        }else{
            this.response.body = yield {"message": "此项不可删除！"};

        }

    },updateHistory: function *(next) {
        let incomingData = this.request.body;
        let targetName = incomingData['target'];
        let items = yield OptionCollections.find({optName: targetName}).exec();
        let reqOption = items[0].option;
        let newUrl = incomingData['newUrl'];
        let newQs = incomingData['newQs'];
        let newInterfaceName = incomingData['newInterfaceName'];
        newOption = reqOption;
        if(newInterfaceName !== null){
            newOption['url'] = newUrl;
            newOption['qs'] = JSON.parse(newQs);
            this.response.body = yield OptionCollections.findOneAndUpdate(
                {optName: targetName},
                {$set: { option: newOption, optName: newInterfaceName}},
                {upsert: true}
            ).exec();
        }
        if(this.response.body != null){
            yield this.render('index',{'reqData': "修改成功！"});
        }else{
            yield this.render('index',{'reqData': "修改失败！"});
        }

    }
};