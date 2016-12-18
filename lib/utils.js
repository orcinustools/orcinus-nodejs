var yml = require('yamljs');
module.exports = {
  parser : function(file){
    return yml.load(file);
  },
  obj : function(val){
    return Object.keys(val);
  }
}
