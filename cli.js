var program = require('commander');
var yml = require('yamljs');

program
.arguments('<url>')
.option('-f, --file <file>', 'file list')
.action(function(cli) {

}).parse(process.argv);
