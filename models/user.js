var mongodb = require('./db');


//User构造函数，用于创建对象
function User(user) {
    this.name = user.name;
    this.password = user.password;
}

// 导出User module
module.exports = User;

//User对象方法：把用户信息存入Mongodb

User.prototype.save = function save(callback){
    // 用户信息
    var user = {
        name: this.name,
        password: this.password
    };

    mongodb.open(function(err, db){
        if (err) { 
            mongodb.close();
            return callback(err);
        }
    
        //读取users集合，users相当于数据库中的表
        db.collection('users', function(err, collection){
            if (err) {
                mongodb.close();
                return callback(err);
            }
            
            // 为name属性添加索引
            // collection.ensureIndex('name', {unique: true});
            
            //把user对象中的数据，即用户注册信息写入users集合
	    collection.insert(user, {safe:true}, function(err, user){
                mongodb.close();
                callback(err, user);
	    });
        });

    });
};

//Usr对象方法：从数据库中查找指定用户的信息
User.get = function get(username, callback){
    mongodb.open(function(err, db){
        if (err) { 
            mongodb.close();
            return callback(err);
        }   
       
        //读取users集合，users相当于数据库中的表
        db.collection('users', function(err, collection){
            if (err) {
                mongodb.close();
                return callback(err);
            }   
             
            //从users集合中查找name属性为username的记录              
            collection.findOne({name: username}, function(err, user){
                mongodb.close();
                if (user) {
		    //封装查询结果为User对象
		    var u = new User(user);
 		    callback(err, u);
	        }else{
		    callback(err, null);
	        }
            }); 
        }); 
       
    });
};
