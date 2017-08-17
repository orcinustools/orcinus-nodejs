var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GithubStrategy = require('passport-github').Strategy;
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
  if (
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_CALLBACK_URL
  ) {
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
  if (
    process.env.GITHUB_OAUTH_CLIENT_ID &&
    process.env.GITHUB_OAUTH_CLIENT_SECRET &&
    process.env.GITHUB_OAUTH_CALLBACK_URL
  ) {
    passport.use(new GithubStrategy({
       clientID : process.env.GITHUB_OAUTH_CLIENT_ID,
       clientSecret : process.env.GITHUB_OAUTH_CLIENT_SECRET,
       callbackURL : process.env.GITHUB_OAUTH_CALLBACK_URL,
    }, function(token, refreshToken, profile, done){
      process.nextTick(function(){
        userModel.findOne({ $or : [{'githubId' : profile.id }, { username : profile.username } ] }, (err, user) => {
          if (err) return done(err);
          if (user) {
            return done(null, user);
          }
          var user = new userModel();
          user.githubId = profile.id;
          user.githubToken = token;
          user.username = profile.username;
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
}
