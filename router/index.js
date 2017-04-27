var controller = require('../controller/index');
module.exports = function(app){
    //首页
    app.get('/',controller.index);
    app.post('/getParams',controller.getParams);
    app.get('/getHistories', controller.getHistories);
    app.post('/sendFromHistory',controller.sendFromHistory);
    app.post('/getToken',controller.getToken);
    app.post('/delHistory',controller.delHistory);
    app.post('/updateHistory',controller.updateHistory);
};