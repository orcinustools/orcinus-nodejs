var utils = require("./utils");
var proc = require('process');
var chp = require('child_process');
var val;
module.exports = (app,num)=>{
  var cmd = "docker service scale "+app+"="+num;
  chp.exec(cmd,(e, stdout, stderr)=> {
    if(stdout){
      console.log(stdout);
    }
    if(stderr){
      console.log(stderr)
    }
  })
}
