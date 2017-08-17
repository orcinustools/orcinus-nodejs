var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');
var utils = require('../lib/utils.js');
var userModel = mongoose.model('Users');
var passport;

/* Google OAuth */
if (
  process.env.GOOGLE_OAUTH_CLIENT_ID &&
  process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
  process.env.GOOGLE_OAUTH_CALLBACK_URL
) {
  passport = require('passport');
  require(__dirname + '/passport.js')(passport);

  router.route("/google")
  .get(passport.authenticate('google', { scope : ['profile', 'email'] } ));
  
  router.route("/google-callback")
  .get(passport.authenticate('google'), (req, res) => {
    if (!req.user || (req.user &&  !req.user.username)) {
      return res.redirect('/');
    }
    var userJWT = {
      username : req.user.username,
      email : req.user.email,
      id : req.user._id
    };
    var token = jwt.sign(userJWT, req.app.locals.secret, {
      expiresIn: 60*60 // expires in 1 hours
    });
    res.send(`<script type="text/javascript">sessionStorage.setItem("orcinus","${token}"); window.location = "/";</script>`);
  });
}

/* Github OAuth */
if (
  process.env.GITHUB_OAUTH_CLIENT_ID &&
  process.env.GITHUB_OAUTH_CLIENT_SECRET &&
  process.env.GITHUB_OAUTH_CALLBACK_URL
) {
  if (!passport) {
    passport = require('passport');
    require(__dirname + '/passport.js')(passport);
  }

  router.route("/github")
  .get(passport.authenticate('github', { scope : ['profile', 'email'] } ));
  
  router.route("/github-callback")
  .get(passport.authenticate('github'), (req, res) => {
    if (!req.user || (req.user &&  !req.user.username)) {
      return res.redirect('/');
    }
    var userJWT = {
      username : req.user.username,
      email : req.user.email,
      id : req.user._id
    };
    var token = jwt.sign(userJWT, req.app.locals.secret, {
      expiresIn: 60*60 // expires in 1 hours
    });
    res.send(`<script type="text/javascript">sessionStorage.setItem("orcinus","${token}"); window.location = "/";</script>`);
  });
}

/* GET home page. */
router.route("/signup")
.get(function(req, res, next) {
	res.send({});
})
.post(function(req, res, next) {
  userModel.find({ $or : [ { email : req.body.email}, { username : req.body.username } ] }, (err, result) => {
    if (err) return res.status(500).json(err);
    if (result && result.length > 0) return res.status(409).json(new Error('Username or email already exists'));
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
      if(error) return res.status(403).json(error);
      res.json(data);
    });
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
	      		id : user._id
	      	};
		      var token = jwt.sign(userJWT, req.app.locals.secret, {
		        expiresIn: 60*60 // expires in 1 hours
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
});

router.route("/me")
.all(function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if(token){
		var decoded = jwtDecode(token);
		res.json(decoded);
	}
	else{
		res.json({});
	}
})

module.exports = router;
