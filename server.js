var path 	= require('path');
var express = require('express');
var cors = require('cors');
var app 	= express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var url = require("url");
var colors = require('colors');
var orcinusd = require('orcinusd');
var db = require("./db");
var jwt = require('jsonwebtoken');
var authMW = express.Router();

module.exports = function(){
  /*
    Environment :
    ORCINUS_HOST=<hostname>
    ORCINUS_PORT=<port>
    ORCINUS_HTTP_CORS= example : http://domain1.com, http://domain2.com or *
  */
  var PORT 	= process.env.ORCINUS_PORT || 4000;
  var HOST  = process.env.ORCINUS_HOST || "0.0.0.0";
  var CORS = process.env.ORCINUS_HTTP_CORS || false;
  var SOCK = process.env.ORCINUS_DOCKER_SOCKET || "/var/run/docker.sock";
  var DBHOST = process.env.ORCINUS_DB || "orcinus-db/orcinus";
  var SECRET = process.env.ORCINUS_SECRET || "orcinus";

  var ping = require("./apis/ping");
  var info = require("./apis/info");
  var cluster = require("./apis/cluster");
  var service = require("./apis/service");
  var stack = require("./apis/stack");
  var task = require("./apis/task");
  var volume = require("./apis/volume");
  var container = require("./apis/container");
  var auth = require("./apis/auth");

  /*
  * Database connection
  */

  app.locals.orcinusdb = db(DBHOST);
  db.users();

  var corsOpt = {
      "origin": false,
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      "optionsSuccessStatus": 204,
      "allowedHeaders": ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "x-access-token"]
    }

  if(CORS){
    console.log(colors.yellow("==> HTTP CORS Active!"));
    corsOpt = {
      "origin": CORS,
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      "optionsSuccessStatus": 204,
      "allowedHeaders": ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "x-access-token"]
    }
  }

  app.options('*', cors(corsOpt))

  if(SOCK.indexOf("http") >= 0 || SOCK.indexOf("https") >= 0){
    var sockParse = url.parse(SOCK);
    var proto = sockParse.protocol.replace(":","");
    var host = sockParse.hostname;
    var port = sockParse.port;
    SOCK = {protocol: proto, host: host, port: port};
  }
  else{
    SOCK = { socketPath: SOCK };
  }

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.locals.orcinus = new orcinusd(SOCK);
  app.locals.secret = SECRET;

  app.use(express.static(path.join(__dirname, './www')));

  app.get('/',function(req,res){
      res.sendFile(path.join(__dirname, './www', 'index.html'));
  });

  /*
  * Authentication
  */

  // midleware

  authMW.use(cors(corsOpt),function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, SECRET, function(err, decoded) {      
        if (err) {
          return res.status(403).json({ success: false, message: 'Failed to authenticate token.' });    
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next();
        }
      });

    } else {

      // if there is no token
      // return an error
      return res.status(403).send({ 
          success: false, 
          message: 'No token provided.' 
      });

    }
  });

  app.use('/auth', cors(corsOpt), auth);

  /*
  * Apis router
  */

  app.use('/apis/ping', authMW, ping);
  app.use('/apis/info', authMW, info);
  app.use('/apis/cluster', authMW, cluster);
  app.use('/apis/service', authMW, service);
  app.use('/apis/stack', authMW, stack);
  app.use('/apis/task', authMW, task);
  app.use('/apis/volume', authMW, volume);
  app.use('/apis/container', authMW, container);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    console.log(colors.red("Page Not Found!"));
    res.sendFile(path.join(__dirname, './www', 'index.html'));
  });

  app.listen(parseInt(PORT), HOST, function(error) {
    if (error) {
      console.error(error);
    } else {
      console.info(colors.green("==> Listening on port %s. Visit http://%s:%s/ in your browser."), PORT,HOST, PORT);
    }
  });
  return app;
}