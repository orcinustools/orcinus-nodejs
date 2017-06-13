var process = require('process');
var yml = require('yamljs');
var fileExt = require('file-extension');
var fs = require('fs');
var jwtDecode = require('jwt-decode');
var colors = require('colors');

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
  serviceManifest : (userID,req,res,callback) => {
    var manifest = req.body;
    var obj = JSON.parse(JSON.stringify(manifest))
    delete obj.opt.services
    obj.opt.services = {};

    var stack = userID+"-"+manifest.opt.stack;
    obj.opt.stack = stack

    Object.keys(manifest.opt.services).forEach(function(v){
      if(process.env.ORCINUS == "prod"){
        manifest.opt.services[v].constraint = "node.role==worker";
      }

      if(manifest.opt.services[v].endpoint != ""){
        var NETWORK = process.env.ORCINUS_NETWORK || "orcinus";
        manifest.opt.services[v].labels = { "traefik.port" : manifest.opt.services[v].endpoint };
        delete manifest.opt.services[v].endpoint;
        manifest.opt.services[v].networks = [NETWORK];
      }

      var modifySVC = JSON.parse(JSON.stringify(manifest.opt.services[v]).replace(/{orcinus.userid}/g,userID).replace(/{orcinus.stack}/g,manifest.opt.stack));

      obj.opt.services[stack+"-"+v] = modifySVC;
    });
    callback(req,res,obj);
  },
  debug : (data) => {
    if(process.env.ORCINUS == "dev"){
      console.log(colors.yellow(data));
    }
  }
}
