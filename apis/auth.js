var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');

var userModel = mongoose.model('Users');

/* GET home page. */
router.route("/signup")
.get(function(req, res, next) {
	res.send({});
})
.post(function(req, res, next) {
	var userData = {
		email: req.body.email,
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		password: req.body.password,
		username: req.body.username,
		admin: false
	}
	var user = new userModel(userData);
	user.save(function(error, data){
      if(error){
          res.json(error);
      }
      else{
          res.json(data);
      }
  });
});

router.route("/signin")
.post(function(req, res, next) {
	userModel.findOne({
    username: req.body.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.status(403).json({ success: false, message: 'Authentication failed. User not found.' });
    } 
    else if (user) {
	  	user.comparePass(req.body.password, function(err, isMatch) {
	      if (err) throw err;
	      if(isMatch){
	      	userJWT = {
	      		username : user.username,
	      		email : user.email,
	      		id : user.__v
	      	};
		      var token = jwt.sign(userJWT, req.app.locals.secret, {
		        expiresIn: 60*60*24 // expires in 24 hours
		      });
		      // return the information including token as JSON
		      res.json({
		        success: true,
		        message: 'success!',
		        token: token
		      });
		    }
		    else{
		    	res.status(403).json({ success: false, message: 'Authentication failed. Wrong password.' });
		    }
	    });
	  }
  });
})

module.exports = router;