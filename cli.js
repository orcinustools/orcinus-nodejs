var program = require('commander');

program
.arguments('<url>')
.option('-f, --file <file>', 'file list')
.action(function(cli) {

}).parse(process.argv);
