var path 	= require('path');
var express = require('express');
var app 	= express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var url = require("url");
var orcinusd = require('orcinusd');
var db = require("./db");
var oauthServer = require('express-oauth-server');

module.exports = function(){
  /*
    Environment :
    ORCINUS_HOST=<hostname>
    ORCINUS_PORT=<port>
    ORCINUS_HTTP_CORS= example : http://domain1.com, http://domain2.com or *
  */
  var PORT 	= process.env.ORCINUS_PORT || 4000;
  var CORS = process.env.ORCINUS_HTTP_CORS || false;
  var SOCK = process.env.ORCINUS_DOCKER_SOCKET || "/var/run/docker.sock";
  var DBHOST = process.env.ORCINUS_DB || "orcinusdb/orcinus";

  var ping = require("./apis/ping");
  var info = require("./apis/info");
  var cluster = require("./apis/cluster");
  var service = require("./apis/service");
  var stack = require("./apis/stack");
  var task = require("./apis/task");
  var volume = require("./apis/volume");
  var container = require("./apis/container");

  /*
  * Database connection
  */

  var orcinusdb = db(DBHOST);

  /*
  * Oauth 2 init
  */

  app.oauth = new oauthServer({
    debug: true,
    useErrorHandler: false, 
    continueMiddleware: false,
    model: db.oauth2
  });

  if(CORS){
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", CORS);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
  }

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

  app.use(express.static(path.join(__dirname, './www')));

  app.get('/',function(req,res){
      res.sendFile(path.join(__dirname, './www', 'index.html'));
  });

  /*
  * Oauth2 router
  */
  app.get("/oauth/authorize", function(req, res) {
    res.send({ error : "need authorize!!!" });
  });
  app.post("/oauth/authorize", app.oauth.authorize());
  app.post("/oauth/token", app.oauth.token());

  /*
  * Apis router
  */

  app.use('/apis',app.oauth.authorize())
  app.use('/apis/ping', ping);
  app.use('/apis/info', info);
  app.use('/apis/cluster', cluster);
  app.use('/apis/service', service);
  app.use('/apis/stack', stack);
  app.use('/apis/task', task);
  app.use('/apis/volume', volume);
  app.use('/apis/container', container);
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.sendFile(path.join(__dirname, './www', 'index.html'));
  });

  app.listen(PORT, function(error) {
    if (error) {
      console.error(error);
    } else {
      console.info("==> 🌎 Listening on port %s. Visit http://%s:%s/ in your browser.", PORT,process.env.ORCINUS_HOST, PORT);
    }
  });
  return app;
}