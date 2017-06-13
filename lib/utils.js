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
      obj.opt.services[stack+"-"+v] = manifest.opt.services[v];
    });
    callback(req,res,obj);
  }
  debug : (data) => {
    if(process.env.ORCINUS == "dev"){
      console.log(colors.yellow(data));
    }
  }
}
