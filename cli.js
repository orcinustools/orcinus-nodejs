#!/usr/bin/env node

var program = require('commander');
var pkg = require('./package.json');
var process = require('process');
var chp = require('child_process');
var colors = require('colors');
var fs = require('fs');
var exec  = chp.exec;
var spawn = chp.spawn;
var data,port;

/*module exports*/
var utils = require("./lib/utils");
var create = require("./lib/create");
var update = require("./lib/update");
var list = require("./lib/list");
var scale = require("./lib/scale");
var ps = require("./lib/ps");
var rm = require("./lib/rm");
var inspect = require("./lib/inspect");
var rollback = require("./lib/rollback");
var cluster = require("./lib/cluster");
var logs = require("./lib/logs");

/*module dashboard*/
var web = require("./server");

program
.version("orcinus version "+pkg.version)
.option('-f,--file <orcinus_file.yml>','Orcinus file')
.option('create', 'Create service')
.option('rm','Remove all service')
.option('ls [all|orcinus file|service name]', 'List service')
.option('ps', 'List all process')
.option('scale [service_name=num_scale]', 'Scale service')
.option('inspect', 'Inspect all service')
.option('update', 'Update service')
.option('rollback', 'Rollback service')
.option('dashboard', 'Start dashboard <hostname:port>')
.option('logs [follow|help|tail]', 'Get service logs')
.option('cluster [option|help]', 'Manage Cluster',/^(init|join|leave|leave-manager|ls|token|promote|inspect|option|--help|-h)$/i)
.parse(process.argv);

if(utils.obj(program).length < 14){
  err();
}

if(program.file){
  /*parsing file*/
  if (program.file[0] != '/' && program.file[0] != '~') { // If not an absolute path
    program.file = process.cwd() + ((process.platform == 'win32')?'\\':'/') + program.file;
  }
  if (!fs.existsSync(program.file)) {
    console.log('File doesn\'t exist');
    return err();
  }

  data = utils.parser(program.file);
  //cliValidation();
}

if(!program.dashboard && !program.cluster && !program.ls && !program.scale){
  if(!data){
    var defaultManifest = "orcinus";
    // Favor yaml over json
    if (fs.existsSync(defaultManifest + '.yml')) {
      defaultManifest += '.yml';
    } else if (fs.existsSync(defaultManifest + '.json')) {
      defaultManifest += '.json';
    } else {
      console.log('Default manifest file doesn\'t exist. Expected a *.yml or *.json file.');
      return err();
    }
    data = utils.parser(process.cwd() + ((process.platform == 'win32')?'\\':'/') + defaultManifest);
    //cliValidation();
  }
}

if(program.create){
  if(!data){
    err()
  }
  create.init(data);
}

if(program.update){
  if(!data){
    err()
  }
  update.init(data);
}

if(program.rollback){
  if(!data){
    err()
  }
  rollback.init(data);
}

if(program.ls){
  if(typeof(program.ls) == "boolean"){
    if(!program.file){
        var defaultManifest = "orcinus.yml";
        if(fs.existsSync(defaultManifest)){
          var data = utils.parser(defaultManifest);
          list.init(data);
        }
        else{
          err();
        }
    }
    else{
      list.init(data);
    }
  }
  else{
    if(program.ls == "all"){
      list.all();
    }
    else{
      ps.prs(program.ls);
    }
  }
}

if(program.ps){
  if(!data){
    err()
  }
  ps.init(data);
}

if(program.rm){
  if(!data){
    err()
  }
  rm.init(data);
}

if(program.inspect){
  if(!data){
    err()
  }
  inspect.init(data);
}

if(program.scale){
  if(typeof(program.scale) == 'string'){
    var scaleData = program.scale.split("=");
    if(scaleData.length == 2){
      scale(scaleData[0],scaleData[1]);
    }
    else{
      err();
    }
  }
  else{
    err();
  }
}

if(program.cluster){
  var args = program.args;
  var cli = program.cluster;
  cluster.start(cli,args);
}

if(program.logs){
  var args = program.args;
  var cli = program.logs;
  cluster.start(cli,args);
}

if(program.dashboard){
  if(program.args.length > 0){
    var environtment = program.args[0].split(":");
    process.env['ORCINUS_HOST'] = environtment[0];
    process.env['ORCINUS_PORT'] = environtment[1];
  }
  else{
    process.env['ORCINUS_HOST'] = "0.0.0.0";
    process.env['ORCINUS_PORT'] = "4000";
  }
  web();
}

function make_red(txt) {
  return colors.red(txt);
}

function make_yellow(txt) {
  return colors.yellow(txt);
}

function err(){
  program.outputHelp();
  console.log('  Examples:');
  console.log('');
  console.log('    $ orcinus scale app=2');
  console.log('    $ orcinus [options] docker-compose-file.yml');
  console.log('');
  process.exit(0);
}

function cliValidation(){
  cli = [];
  prog = utils.obj(program);
  program.options.forEach((v)=>{
    if(prog.indexOf(v.flags) >= 0) cli.push(v.flags);
  })
  if(cli.length > 2){
    console.log("More options.");
    program.outputHelp(make_red);
    process.exit(0);
  }
}
