var process = require('process');
var yml = require('yamljs');
var fileExt = require('file-extension');
var fs = require('fs');
var jwtDecode = require('jwt-decode');
var colors = require('colors');
var parseImg = require('docker-parse-image');

module.exports = {
  parser : (file)=>{
    // Favor yaml over json
    if (fileExt(file) === 'yml') {
      return yml.load(file);
    }
    return require(file);
  },
  obj : (val)=>{
    return Object.keys(val);
  },
  checkObj : (obj,key)=>{
    return obj.hasOwnProperty(key)
  },
  getUserHome : ()=>{
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  },
  exit : (code) => {
    code = code || 0;
    if (global.test) { // Prevent actual exit on unit testing
      throw new Error();
    }
    process.exit(code)
  },
  decode : (req,res) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        var decoded = jwtDecode(token);
        return decoded;
    }
    else{
        res.json({error:"Token invalid!"});
    }
  },
  authParser : (manifestAuth,image)=>{
    var Auth;
    if(typeof(manifestAuth) === 'boolean'){
      var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
      var dockerAuth = require(home+"/.docker/config.json");
      var registryURL = parseImg(image).registry;
      var regData = dockerAuth.auths[registryURL];
      if(regData){
        var regUser = new Buffer(regData.auth, 'base64');
        regUser = regUser.toString().split(":");
        var tmplAuth = auth = {
          username: regUser[0],
          password: regUser[1],
          serveraddress: registryURL
        }
        Auth = tmplAuth
      }
    }
    if(typeof(manifestAuth) === 'object'){
      Auth = manifestAuth;
    }
    module.exports.debug("Auth check:")
    module.exports.debug(Auth);
    return Auth;
  },
  serviceManifest : (userID,req,res,callback) => {
    var manifest = req.body;
    var obj = JSON.parse(JSON.stringify(manifest))
    delete obj.opt.services
    obj.opt.services = {};
    var Auth = {};

    var stack = userID+"-"+manifest.opt.stack;
    obj.opt.stack = stack

    Object.keys(manifest.opt.services).forEach(function(v){
      // init
      var serviceName = stack+"-"+v;
      // Authentication
      var manifestAuth = manifest.opt.services[v].auth;
      if(manifestAuth){
          Auth[serviceName] = module.exports.authParser(manifestAuth,manifest.opt.services[v].image)
      }

      if(process.env.ORCINUS == "prod"){
        manifest.opt.services[v].constraint = "node.role==worker";
      }
      // if endpoint key set (production)
      if(manifest.opt.services[v].endpoint){
        console.log("endpoint........")
        var NETWORK = process.env.ORCINUS_NETWORK;
        var DOMAIN = process.env.ORCINUS_DOMAIN;

        manifest.opt.services[v].labels = { "traefik.port" : manifest.opt.services[v].endpoint };
        delete manifest.opt.services[v].endpoint;

        if(!manifest.opt.services[v].networks){
          manifest.opt.services[v].networks = [NETWORK];
          module.exports.debug("Network manifest not existing set : "+manifest.opt.services[v].networks);
        }
        else{
          manifest.opt.services[v].networks.push(NETWORK);
          module.exports.debug("Network manifest existing set : "+manifest.opt.services[v].networks);
        }
        // setup custom domain
        var domainSVC = serviceName+"."+DOMAIN;

        if(manifest.opt.domain){
          manifest.opt.services[v].labels["traefik.frontend.rule"] = "Host:"+manifest.opt.domain;
          domainSVC = manifest.opt.domain;
        }

        module.exports.debug("Set Domain to : "+domainSVC);
        manifest.opt.services[v].labels["orcinus.domain"] = domainSVC;
        manifest.opt.services[v].labels["traefik.docker.network"] = NETWORK;
      }

      var modifySVC = JSON.parse(JSON.stringify(manifest.opt.services[v]).replace(/{orcinus.userid}/g,userID).replace(/{orcinus.stack}/g,manifest.opt.stack));
      module.exports.debug("manifest file : "+JSON.stringify(modifySVC));
      obj.opt.services[serviceName] = modifySVC;
    });

    module.exports.debug("Auth all check:")
    module.exports.debug(Auth);
    callback(req,res,obj,Auth);
  },
  debug : (data) => {
    if(process.env.ORCINUS == "dev"){
      if(typeof(data) === 'object'){
        var jsonData = JSON.stringify(data);
        console.log(colors.yellow(jsonData));
      }
      else{
        console.log(colors.yellow(data));
      }
    }
  }
}
