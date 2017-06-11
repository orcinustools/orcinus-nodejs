var mongoose	= require('mongoose');

var db = function(host){
	mongoose.connect(host, function (err, res) {
	  if (err) {
	    console.log ('ERROR connecting to: ' + host + '. ' + err);
	  } else {
	    console.log ('Succeeded connected to: ' + host);
	  }
	});
}

db.users	= require('./model/users');

module.exports = db;