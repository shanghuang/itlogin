var express = require('express');
var mongoose = require('mongoose');
var config = require('../config.json');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var util = require('./util.js');

var ObjectId = mongoose.Schema.Types.ObjectId;
//var redis = require('redis');


var UserSchema = new mongoose.Schema({

    name : String,
    birthday : String,
    gender : Number,
    nationality : String,
    privilege : Number,
    activity : Date,
    created : Date,
    email : String,
    password : String,
    tos : Number,
    native_language : [ 
        Number
    ],
    practice_language : [ 
        {
            id : Number,
            level : Number
        }
    ],
    email_verified : Boolean,
    tokens : [ 
        {
            token : String,
            created : Date
        }
    ],
    metadata : {
        suspend:Boolean,
    },
    country : String,
    city : String,
}, {collection:'user'} );

var User = mongoose.model('user', UserSchema);


function getCount(req,resp){
    var queryString={};
    if(req.query.dbquery){
        queryString = JSON.parse(req.query.dbquery);
    }
    User.count(queryString, function(err, result){
        if(err){
            console.log("exec query "+ req.query.dbquery + "failed!");
        }
        else{
            resp.json({
                count:result,
            }).end();
        }
    });
};


function get(req,resp){
    //var queryString = req.query.dbquery || {};
    var queryString={};
    if(req.query.dbquery){
        queryString = JSON.parse(req.query.dbquery);
    }

    var date = new Date(req.query.createTimeLastItem);

    var query2exec = User.find(queryString);
    if(req.query.createTimeLastItem)
        query2exec.where('created').lt(new Date(req.query.createTimeLastItem));
    if(req.query.limit)
        query2exec.limit(parseInt(req.query.limit));

    query2exec.sort({'created': -1});
    query2exec.exec(function(err, result){
        if(err){
            console.log("exec query "+ req.query.dbquery + "failed!");
        }
        else{
            var num_item =  result.length;
            var last_item;
            if(result.length)
                last_item = result[ num_item - 1 ];
            resp.json({
                users:result,
                nextQuery: last_item? last_item.created : 0
            }).end();
        }
    });
};

function post_suspend(req,resp){

    User.findOne({_id:req.query.userid }, function(err, result){
        result.privilege = 10;
        result.metadata.suspend = true;
        result.save(function(e){ 
            console.log( e ? 'error' : "");
            var key = "user:"+req.query.userid;
            redisclient.del(key, function(err, reply) {
                console.log(err ? "redis del key error:" + key : "");
            });
            resp.end();
        });
    });
};

function post_unsuspend(req,resp){

    User.findOne({_id:req.query.userid }, function(err, result){
        result.privilege = 20;
        result.metadata.suspend = false;
        result.save(function(e){ 
            console.log( e ? 'error' : "");
            var key = "user:"+req.query.userid;
            redisclient.del(key, function(err, reply) {
                console.log(err ? "redis del key error:" + key : "");
            });
            resp.end();
        });
    });
};

function post_test_adduser(req,resp){
    var num_user = 0;
    var error=null;

    try{
        num_user = parseInt(req.body.numberUser);
    }
    catch(e){

    }
    finally{
        
        for(var i=0;i<num_user;i++){
            var create_date = new Date("October 13, 2014 11:13:00");
            //create_date.setMinutes(create_date.getMinutes() + 100000*Math.random() );
            create_date.setMinutes(create_date.getMinutes() + 100*i );

            var testuser = new User({
                name:req.body.namePrefix+i,
                birthday : '2000-01-01',
                gender : 1,
                nationality : 'tw',
                privilege : 20,
                activity : new Date("October 13, 2014 11:13:00"),

                created : create_date,
                email : req.body.namePrefix+i+'@test.com',
                password : util.encode_password('12345678'),

                tos : 1,
                native_language : [ 1],
                practice_language : [ 
                    {
                        id : 999,
                        level : 3
                    }
                ],
                email_verified : true,
                tokens : [ 
                    {
                        token : uuid.v4(),
                        created : new Date("October 13, 2014 11:13:00")
                    }
                ],
                metadata : {},
                country : 'tw',
                city : 'Taichung',
            });
            testuser.save(function (err, userObj) {
              if (err) {
                console.log(err);
              } else {
                console.log('saved successfully:', userObj);
              }
            });
        }
        //resp.write("Hello World");
        resp.end();
    }
};

function post_login(req,resp){
    var email = req.body.name;
    var password = req.body.password;

    User.findOne({email:req.body.name }, function(err, result){
        if(err){

        }
        else{
            var encoded_passwd = util.encode_password(req.body.password);
            if(result.password != encoded_passwd){

            }
            else{
                var token = uuid.v4();
                GLOBAL.redisclient.set("token:" + token, result.id);     //callback?
                resp.json({
                    access_token:token,
                }).end();
            }
        }
    });
};

module.exports = {
    getCount : getCount,
    get : get,
    post_suspend : post_suspend,
    post_unsuspend : post_unsuspend,
    post_test_adduser : post_test_adduser,
    post_login : post_login,
}

