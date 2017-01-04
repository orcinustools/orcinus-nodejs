var utils = require("./utils");
var proc = require('process');
var chp = require('child_process');
var val;
module.exports = {
  init : (value)=>{
    val = value;
    var svc = utils.obj(val);
    if(svc.indexOf('services') < 0) {
      console.log("Service can't defined.");
      proc.exit(1);
    }
    var app = utils.obj(val.services);
    app.forEach((v)=>{
      module.exports.prs(v);
    });
  },
  execution : (keyMap)=>{
    var opt = keyMap.opt.join(" ");
    var img = keyMap.img;
    var name = keyMap.name;
    var cmd = "docker service update "+opt+" --image "+img+" "+name;
    chp.exec(cmd,(e, stdout, stderr)=> {
      if(stdout){
        console.log("Service updated: "+stdout);
      }
      if(stderr){
        console.log(stderr)
      }
    })
  },
  prs : (key)=>{
    var app = val.services[key];
    var image = app.image;
    var opt = module.exports.opt(app);
    var keyMap = {
      opt: opt,
      img: image,
      name: key
    }
    module.exports.execution(keyMap);
  },
  opt : (app)=>{
    var arr = [];
    var cmd = utils.obj(app);
    if(cmd.indexOf("ports") >= 0){
      app.ports.forEach((v)=>{
        arr.push("--publish-add "+v);
      });
    }
    if(cmd.indexOf("environment") >= 0){
      app.environment.forEach((v)=>{
        arr.push("--env-add "+v);
      });
    }
    if(cmd.indexOf("replicas") >= 0){
        arr.push("--replicas "+app.replicas);
    }
    if(cmd.indexOf("cpu") >= 0){
        arr.push("--limit-cpu "+app.cpu);
    }
    if(cmd.indexOf("memory") >= 0){
        arr.push("--limit-memory "+app.memory);
    }

    return arr;
  }
}
