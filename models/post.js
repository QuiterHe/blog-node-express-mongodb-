var mongodb = require('./db');


//Post构造函数，用于创建对象
function Post(username, post, time) {
    this.user = username;
    this.post = post;
    if (time) {
        this.time = time;
    } else {
        var now=new Date();
        this.time =now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+" "+now.getHours()+":"+now.getSeconds();
    }
}

// 导出Post module
module.exports = Post;

//Post对象方法：把文章存入Mongodb

Post.prototype.save = function save(callback){
    // 用户信息
    var post = {
        user: this.user,
        post: this.post,
        time: this.time
    };

    mongodb.open(function(err, db){
        if (err) { 
            mongodb.close();
            return callback(err);
        }
    
        //读取posts集合，posts集合相当于数据库中的表
        db.collection('posts', function(err, collection){
            if (err) {
                mongodb.close();
                return callback(err);
            }
            
            // 为user属性添加索引
            collection.ensureIndex('user');
            
            //把user对象中的数据，即用户注册信息写入users集合
	    collection.insert(post, {safe:true}, function(err, post){
                mongodb.close();
                callback(err, post);
	    });
        });

    });
};

//获取全部或指定用户的微博记录
Post.get = function get(username, callback){
    mongodb.open(function(err, db){
        if (err) { 
            mongodb.close();
            return callback(err);
        }   
       
        //读取posts集合，posts相当于数据库中的表
        db.collection('posts', function(err, collection){
            if (err) {
                mongodb.close();
                return callback(err);
            }   
            
            var query = {};

            if(username) {
 	        query.user = username;
	    } 
            collection.find(query).sort({time: -1}).toArray(function(err, docs){
                mongodb.close();
                if (err) {
		    callback(err, null);
                }
                 
                var posts = [];
                docs.forEach(function(doc, index){
                    var post = new Post(doc.user, doc.post, doc.time);
                    posts.push(post);
                });
                callback(null, posts);
            }); 
        }); 
       
    });
};
