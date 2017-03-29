var process = require('process');
var yml = require('yamljs');
var fileExt = require('file-extension');
var fs = require('fs');

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
  }
}
