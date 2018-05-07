#!/usr/bin/env node


var mongoose = require('mongoose');
var config = require('./config.json');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var cors = require('cors');
var util = require('./serverlib/util.js');
var user = require('./serverlib/user.js');
var post = require('./serverlib/post.js');
var tutor = require('./serverlib/tutor.js');

var express = require('express');
var cookieparser = require('cookie-parser');

var ObjectId = mongoose.Schema.Types.ObjectId;
var redis = require('redis');
var redisclient = redis.createClient(6379, config.redis_server); //creates a new client
GLOBAL.redisclient = redisclient;

redisclient.on('connect', function() {
    console.log('redis connected');
});

mongoose.connect('mongodb://'+config.db_name);//localhost/itooii');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('mongoose opened');
});

var app = express();
app.use(cors());

var router = express.Router();
app.use(cookieparser());

app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function(req,resp){});

app.get('/user-count', user.getCount );
app.get('/user',  user.get );
app.post('/user/suspend',  user.post_suspend );
app.post('/user/unsuspend',  user.post_unsuspend );
app.post('/test_adduser', user.post_test_adduser );
app.post('/access_token', user.post_login );
app.del('/access_token', user.del_access_token );
app.get('/access_token', user.get_access_token );

app.get('/post', post.get );
app.delete('/post/:postid', post.delete_post );
app.delete('/comment/:commentid', post.delete_comment );


app.get('/tutor-count', tutor.getCount );
app.get('/tutor',  tutor.get );
app.post('/tutor', tutor.updateStatus)

app.listen(config.listen_port, function () {
    console.log('ready on port ' + config.listen_port);
});

