#!/usr/bin/env node

var program = require('commander');
var pkg = require('./package.json');
var proc = require('process');
var chp = require('child_process');
var colors = require('colors');
var fs = require('fs');
var exec  = chp.exec;
var spawn = chp.spawn;
var data;

/*module exports*/
var utils = require("./lib/utils");
var create = require("./lib/create");
var update = require("./lib/update");
var list = require("./lib/list");
var scale = require("./lib/scale");
var ps = require("./lib/ps");
var rm = require("./lib/rm");
var inspect = require("./lib/inspect");

program
.arguments('<file-config.yml>')
.version("orcinus version "+pkg.version)
.option('create', 'Create service')
.option('rm','remove', 'Remove all service')
.option('ls [all|orcinus_file|service_name]', 'List service')
.option('ps', 'List all process')
.option('scale [service_name=num_scale]', 'scale service')
.option('inspect', 'Inspect all service')
.option('update', 'Update service')
.action(function(file) {
  if(file){
    /*parsing file*/
    data = utils.parser(file);
    cliValidation();
  }
}).parse(process.argv);

if(utils.obj(program).length < 14){
  err();
}

if(!data){
  var defaultManifest = "orcinus.yml";
  if(fs.existsSync(defaultManifest)) data = utils.parser(defaultManifest);
  cliValidation();
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

if(program.ls){
  if(typeof(program.ls) == "boolean"){
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
    if(program.ls == "all"){
      list.all();
    }
    else if(fs.existsSync(program.ls)){
      data = utils.parser(program.ls);
      list.init(data);
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

function make_red(txt) {
  return colors.red(txt);
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
  if(cli.length > 1){
    console.log("More options.");
    program.outputHelp(make_red);
    process.exit(0);
  }
}
