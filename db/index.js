var mongoose	= require('mongoose');
var colors = require('colors');

var db = function(host){
	mongoose.connect(host, function (err, res) {
	  if (err) {
	    console.log (colors.red('ERROR connecting to: ' + host + '. ' + err));
	  } else {
	    console.log (colors.green('Succeeded connected to database......'));
	  }
	});
}

db.users	= require('./model/users');

module.exports = db;