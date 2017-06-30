var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Hello,Express' });
//});

// 主页
router.get('/', function(req, res){
    Post.get(null, function(err, posts){
        if (err) {
            posts = [];
        }

        res.render('index', {title: '首页', posts: posts});
    });
    //res.render('index', {title:'首页!'});
});

// 用户主页
router.get('/user/:user', function(req, res){
    User.get(req.params.user, function(err, user){
        if (err) {
            req.flash('error', '亲，你要访问的用户不存在哟');
            return res.redirect('/');
        }

        Post.get(user.name, function(err, posts){
            if (err) {
                req.flash('error', err);
               return res.redirect('/');
            }

            res.render('user', {title: user.name, posts:posts});
        });
    });
    //res.render('user',{title:'用户主页', userName: 'hezhang'});
});

// 注册页
router.get('/reg', function(req, res){
    res.render('reg', {title:'注册页'});
});

// 登录页
router.get('/login', function(req, res){
    res.render('login', {title:'登录页'});
});

// 注册
router.post('/reg', function(req, res){
    // TODO
    // res.send(req.body.username);
    
    // 参数检查
    if (req.body.username == "" || req.body.userpwd == "" || req.body.pwdrepeat == "") {
        //使用req.body.username获取提交请求的用户名，username为input的name
        req.flash('error', "用户名或密码不能为空哟！");   //保存信息到error中，然后通过视图交互传递提示信息，调用alert.ejs模块进行显示
        return res.redirect('/reg');                     //返回reg页面
    }    

    // 两次密码是否一致
    if( req.body.userpwd !== req.body.pwdrepeat ) {
        req.flash('error', '亲，两次输入的密码要一样才可以哟');
        return res.redirect('/reg');     // 重定向至注册页面
    }

    // 把密码转换为md5值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.userpwd).digest('base64');

    var newUser = new User({
        name: req.body.username,
        password: password    
    });

    // 用户是否重复
    User.get(newUser.name, function(err, user){
        if (user) {//用户名存在
            err = 'Username already exists.';
        }
        if (err) {
            req.flash('error', err);//保存错误信息，用于界面显示提示
            return res.redirect('/reg');
        }
 
        newUser.save(function (err) {//用户名不存在时，保存记录到数据库
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = newUser;//保存用户名，用于判断用户是否已登录
            req.flash('success', req.session.user.name + '注册成功');
            res.redirect('/login');
        });
    });

});

// 登录
router.post('/login', function(req, res){
    // TODO
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.userpwd).digest('base64');
    
    User.get(req.body.username, function(err, user){
        if(!user) {
            req.flash('error', '亲，你还木有注册哟');
            return res.redirect('/login');
        }

        if(user.password !== password) {
            req.flash('error', '亲，你输入的密码不正确哟');
            return res.redirect('/login');
        }

        req.session.user = user;
        req.flash('success', '登录成功');
        return res.redirect('/');
    });
});

// 登出
router.get('/logout', function(req, res){
    req.session.user = null;
    req.flash('success', '退出成功');
    res.redirect('/');
});

// 文章发表页

// 文章发表
router.post('/post', function(req, res){
    // TODO
    var user = req.session.user;
    if(req.body.post == '') {
        req.flash('error', '内容不能为空');
        return res.redirect('/user/' + user.username);
    }   

    var post = new Post(user.name, req.body.post);
    post.save(function(err){
        if (err) {
            req.flash('error', '亲，出现了一些错误，请稍后重试');
            return res.redirect('/');
        }
        
        req.flash('success', '发表成功');
        return res.redirect('/user/' + user.name);
    });
});


function checkNotLogin(req, res, next) {
   if (req.session.user) {
       req.flash('error', '已登录');
       return res.redirect('/');
   }
   next();
}

function checkLogin(req, res, next){
    if(!res.session.user) {
        req.flash('error', '未登录');
        return res.redirct('/login');
    }

    next();
}

module.exports = router;
