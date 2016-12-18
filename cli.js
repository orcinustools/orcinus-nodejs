var program = require('commander');
var yml = require('yamljs');
var pkg = require('./package.json');
var proc = require('process');
var chp = require('child_process');
var exec  = chp.exec;
var spawn = chp.spawn;
var svc,app;

var parser = function(file){
  return yml.load(file);
}

var obj = function(val){
  return Object.keys(val);
}

var create = function(val){
  if(svc.indexOf('services') <= 0) {
    console.log("Service can't defined.");
    proc.exit(1);
  }
  app.forEach(function(v){
    console.log(v);
    createService(v);
  })
}

var createService = function(val){
  exec("docker service ls -f 'name="+val+"' -q",(e, stdout, stderr)=> {
    if (e instanceof Error) {
        console.error(e);
        throw e;
    }
    if(stdout){
      console.log(stdout);
    }
    else{
      console.log("no exist")
    }
  })
}

program
.arguments('<manifest>')
.version(pkg.version)
.option('-c, --create', 'file list')
.action(function(file) {
  if(file){
    var data = parser(file);
    svc = obj(data);
    app = obj(data.services);
    if(program.create){
      create(data);
    }
  }
}).parse(process.argv);
