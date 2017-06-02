var utils = require("./utils");
var proc = require('process');
var chp = require('child_process');
var val,
volumes = {},
cmdData = [],
stackExec = {},
command = "";

module.exports = {
  init : (value)=>{
    val = value;
    var svc = utils.obj(val);
    if(svc.indexOf('services') < 0) {
      console.log("Service can't defined.");
      if (!utils.exit(1)) return;
    }
    if(svc.indexOf('volumes') >= 0) {
      module.exports.volumes(val.volumes);
    }
    if(svc.indexOf('stack') >= 0) {
      var stack = val.stack;
      if(typeof stack != 'string'){
        console.log("Stack data is not valid!");
        if (!utils.exit(0)) return;
      }
      stackExec.name = stack;
      var cmd = "docker network ls -f 'name="+stack+"' |grep "+stack;
      chp.exec(cmd,(e, stdout, stderr)=> {
        if(!stdout){
          module.exports.stack(stack,val.services);
        }
        else{
          module.exports.services(val.services);
        }
        if(stderr){
          console.log(stderr);
          if (!utils.exit(0)) return;
        }
      })
    }
    else{
      module.exports.services(val.services);
    }
  },
  services : (data)=>{
    var app = utils.obj(data);
    app.forEach((v)=>{
      module.exports.prs(v);
    });
  },
  execution : (keyMap)=>{
    var opt = keyMap.opt.join(" ");
    var img = keyMap.img;
    var name = keyMap.name;
    var exec = ""
    if(typeof(keyMap.cmd) == "object"){
      exec = keyMap.cmd.join(" ");
    }
    var cmd = "docker service create "+opt+" --name "+name+" "+img+" "+exec;
    //console.log(cmd);
    chp.exec(cmd,(e, stdout, stderr)=> {
      if(stdout){
        console.log("Service "+keyMap.name+" created");
        console.log(stdout);
      }
      if(stderr){
        console.log(stderr);
        if (!utils.exit(0)) return;
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
      name: key,
      cmd: command
    }
    module.exports.execution(keyMap);
  },
  opt : (app)=>{
    var arr = [];
    var cmd = utils.obj(app);

    if(cmd.indexOf("commands") >= 0){
      command = app.commands;
    }
    else{
      command = ""
    }

    if(cmd.indexOf("volumes") >= 0){
      app.volumes.forEach((v)=>{
        if(!volumes[v]){
          console.log("Volume data is not exist!");
          if (!utils.exit(0)) return;
        }
        arr.push("--mount "+volumes[v]);
      });
    }
    if(cmd.indexOf("ports") >= 0){
      app.ports.forEach((v)=>{
        arr.push("-p "+v);
      });
    }
    if(cmd.indexOf("environment") >= 0){
      app.environment.forEach((v)=>{
        arr.push("--env "+v);
      });
    }
    if(cmd.indexOf("replicas") >= 0){
        arr.push("--replicas "+app.replicas);
    }
    if(cmd.indexOf("labels") >= 0){
      utils.obj(app.labels).forEach(function(key){
        arr.push("--label "+key+"="+app.labels[key]);
      });
    }
    if(cmd.indexOf("cpu") >= 0){
        arr.push("--limit-cpu "+app.cpu);
    }
    if(cmd.indexOf("memory") >= 0){
        arr.push("--limit-memory "+app.memory);
    }
    if(cmd.indexOf("constraint") >= 0){
        arr.push("--constraint "+app.constraint);
    }
    if(cmd.indexOf("network") >= 0){
      if(!stackExec.name) arr.push("--network "+app.network);
    }
    if(stackExec.name) arr.push("--network "+stackExec.name);
    if(cmd.indexOf("auth") >= 0){
      if(app.auth){
        arr.push("--with-registry-auth");
      }
    }

    return arr;
  },
  volumes : (data)=>{
    var name = utils.obj(data);
    name.forEach((val,k)=>{
      var v = data[val];
      /* Add volume type */
      // NFS
      if(v.type == "nfs"){
        if(!v.address || !v.source || !v.target){
          console.log("NFS volume isn't valid!");
          if (!utils.exit(0)) return;
        }
        volumes[name[k]] = "type=volume,volume-opt=o=addr="+v.address+",volume-opt=device=:"+v.source+",volume-opt=type=nfs,source="+name[k]+",target="+v.target;
      }
      // bind
      if(v.type == "bind"){
        if(!v.source || !v.target){
          console.log("BIND volume isn't valid!");
          if (!utils.exit(0)) return;
        }
        volumes[name[k]] = "type=bind,src="+v.source+",dst="+v.target;
      }
    });
  },
  stack : (stack,services)=>{
    var cmd = "docker network create --driver overlay "+stack;
    chp.exec(cmd,(e, stdout, stderr)=> {
      if(stdout){
        console.log("Stack "+stack+" created : "+stdout);
        module.exports.services(services);
      }
      if(stderr){
        console.log(stderr);
        if (!utils.exit(0)) return;
      }
    })
  }
}
