var program = require('commander');
var yml = require('yamljs');
var pkg = require('./package.json')

program
.arguments('<manifest>')
.version(pkg.version)
.option('-c, --create', 'file list')
.action(function(cli) {
  if(file){
    var data = parse(file);
    console.log(data);
  }
}).parse(process.argv);

var parse = function(file){
  return yml.load(file);
}
