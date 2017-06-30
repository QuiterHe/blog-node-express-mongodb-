// 加载依赖库
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 导入路由
var index = require('./routes/index');
var users = require('./routes/users');

// 实例化项目
var app = express();

// view engine setup
// 设置模版位置和模版引擎格式
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// 日志及级别
app.use(logger('dev'));
// 数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// 静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 路由
//app.use('/', index);
//app.use('/users', users);

// session
var settings = require('./settings');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: settings.cookieSecret,//secret 用来防止篡改 cookie
    //设置它的 store 参数为 MongoStore 实例，把会话信息存储到数据库中，以避免丢失。
    store: new MongoStore({
        //db: settings.db,
        url: 'mongodb://localhost/'+settings.db
    })
}));

//引入 flash 模块来实现页面通知
var flash = require('connect-flash');//req.flash()使用
 
app.use(flash());//定义使用 flash 功能

// 视图交互：实现用户不同登陆状态下显示不同的页面及显示登陆注册等时的成功和错误等提示信息
app.use(function(req, res, next){
   console.log('app.user local');
   //res.locals.xxx实现xxx变量全局化，在其他页面直接访问变量名即可
   //访问session数据：用户信息
   res.locals.user = req.session.user;
   
   // 提示信息
   var error = req.flash('error');
   res.locals.error = error.length ? error : null;

   var success = req.flash('success');
   res.locals.success = success.length ? success : null;
    
   next();
});



// 路由
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
