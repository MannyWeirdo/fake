var controller = require('../controller/index');
module.exports = function(app){
    //首页
    app.get('/',controller.index);
    app.post('/getParams',controller.getParams);
    app.get('/getHistories', controller.getHistories)
};