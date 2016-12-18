var program = require('commander');
var yml = require('yamljs');
var pkg = require('./package.json')

var parser = function(file){
  return yml.load(file);
}

var obj = function(val){
  return Object.keys(val);
}

program
.arguments('<manifest>')
.version(pkg.version)
.option('-c, --create', 'file list')
.action(function(file) {
  if(file){
    var data = parser(file);
    console.log(obj(data));
    console.log(program.create)
  }
}).parse(process.argv);
