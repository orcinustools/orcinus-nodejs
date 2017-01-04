var yml = require('yamljs');
var fs = require('fs');
module.exports = {
  parser : function(file){
    return yml.load(file);
  },
  obj : function(val){
    return Object.keys(val);
  }
}
