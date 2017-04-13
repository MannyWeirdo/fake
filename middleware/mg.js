var mg = require("mongoose");


/**
 * 连接
 */
mg.connect('mongodb://localhost:27017/fakedb');

/**
 * 连接成功
 */
mg.connection.on('connected', function () {
    console.log('Mongoose connection open to ' + 'mongodb://localhost:27017/fakedb');
});

/**
 * 连接异常
 */
mg.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});

/**
 * 连接断开
 */
mg.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
});


module.exports = mg;
