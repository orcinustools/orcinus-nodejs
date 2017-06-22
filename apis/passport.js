var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var userModel = mongoose.model('Users');
var urandom = require('urandom');
var md5 = require('md5');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    userModel.findById(idd, function(err, user) {
      done(err, user);
    });
  });
  passport.use(new GoogleStrategy({
    clientID : process.env.GOOGLE_OAUTH_CLIENT_ID, 
    clientSecret : process.env.GOOGLE_OAUTH_CLIENT_SECRET, 
    callbackURL : process.env.GOOGLE_OAUTH_CALLBACK_URL, 
  },
  function(token, refreshToken, profile, done){
    process.nextTick(function(){
      userModel.findOne({ $or : [{'googleId' : profile.id }, { email : profile.emails[0].value }, { username : profile.emails[0].value } ] }, (err, user) => {
        if (err) return done(err);
        if (user) {
          return done(null, user);
        }
        var user = new userModel();
        user.googleId = profile.id;
        user.googleToken = token;
        user.email = profile.emails[0].value;
        user.username = profile.emails[0].value;
        user.password = md5(urandom.randomIt());
        user.verify = true;
        user.admin = false;
        user.save((err) => {
          if (err) return done(err);
          return done(null, user);
        }); 
      });
    });
  }));
}
