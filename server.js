var path 	= require('path');
var express = require('express');
var app 	= express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var orcinusd = require('./orcinusd/orcinusd');

module.exports = function(){
  
  var PORT 	= process.env.ORCINUS_PORT || 4000;
  var ping = require("./apis/ping");
  var info = require("./apis/info");
  var cluster = require("./apis/cluster");
  var service = require("./apis/service");

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.locals.orcinus = new orcinusd({socketPath: '/var/run/docker.sock'});

  app.use(express.static(path.join(__dirname, './www')));

  app.get('/',function(req,res){
      res.sendFile(path.resolve(__dirname, './www', 'index.html'));
  });

  app.use('/apis/ping', ping);
  app.use('/apis/info', info);
  app.use('/apis/cluster', cluster);
  app.use('/apis/service', service);
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.sendFile(path.resolve(__dirname, './www', 'index.html'));
  });

  app.listen(PORT, function(error) {
    if (error) {
      console.error(error);
    } else {
      console.info("==> 🌎  Listening on port %s. Visit http://%s:%s/ in your browser.", PORT,process.env.ORCINUS_HOST, PORT);
    }
  });
  return app;
}