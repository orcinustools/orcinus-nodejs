var yml = require('yamljs');
var fs = require('fs');
module.exports = {
  parser : (file)=>{
    return yml.load(file);
  },
  obj : (val)=>{
    return Object.keys(val);
  },
  getUserHome : ()=>{
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }
}
