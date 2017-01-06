var utils = require("./utils");
var proc = require('process');
var chp = require('child_process');
var base64 = require('base-64');
var utf8 = require('utf8');
var fs = require('fs');
var home = utils.getUserHome()+"/.orcinus";
var config = home+"/config.json"
var tokenFile = home+"/token.json"
var port = "2377";
var arg;
module.exports = {
  start : (cli,args)=>{
    arg = args;
    if (!fs.existsSync(home)){
      fs.mkdirSync(home);
    }
    if(typeof(cli) == 'string'){
      switch (cli) {
        case 'init':
          module.exports.init(args)
        break;
        case 'join':
          module.exports.joinManager(args);
        break;
        case 'leave':
          module.exports.leave();
        break;
        case 'leave-manager':
          module.exports.leave_manager();
        break;
        case 'ls':
          module.exports.list();
        break;
        case 'token':
          module.exports.token();
        break;
        case 'inspect':
          module.exports.inspect();
        break;
        case 'promote':
          module.exports.promote();
        break;
        default:

      }
    }
    else{
      module.exports.help();
    }
  },
  init : (args)=>{
    var adv;
    if(args.length == 1){
      var ip = module.exports.ipCheck(args[0]);
      adv = "--advertise-addr "+ip
    }
    else{
      module.exports.help();
    }

    var cmdJoin = "docker swarm init "+adv;
    var cmdToken = "docker swarm join-token -q worker"
    chp.exec(cmdJoin,(e, stdout, stderr)=> {
      if(stdout){
        chp.exec(cmdToken,(e, stdout, stderr)=> {
          if(stdout){
            var token = {
              addr: ip+":"+port,
              token: stdout
            }
            var utf = utf8.encode(JSON.stringify(token))
            var encodedToken = base64.encode(utf);
            fs.writeFile(tokenFile, JSON.stringify(token), function(err) {
                if(err) {
                    return console.log(err);
                }
                module.exports.joinOpt(encodedToken);
            });
          }
          if(stderr){
            console.log('This node is not a cluster manager. Use "orcinus init [IP ADDRESS]" or "orcinus join [TOKEN]" to connect this node to cluster and try again.');
            console.log("");
            module.exports.help();
          }
        })
      }
      if(stderr){
        console.log('This node is already part of a cluster. Use "orcinus cluster leave" to leave this cluster and join another one.');
        console.log("");
        module.exports.help();
      }
    })
  },
  joinManager : (args)=>{
    var decodedToken = JSON.parse(base64.decode(args));
    var cmd = "docker swarm join "+decodedToken.addr+" --token "+decodedToken.token;
    chp.exec(cmd,(e, stdout, stderr)=> {
      if(stdout){
        console.log("This node joined a cluster as a worker.");
      }
      if(stderr){
        console.log('This node is not a cluster manager. Use "orcinus init [IP ADDRESS]" or "orcinus join [TOKEN]" to connect this node to cluster and try again.');
        console.log("");
        module.exports.help();
      }
    })
  },
  leave : ()=>{
    var cmd = "docker swarm leave";
    chp.exec(cmd,(e, stdout, stderr)=> {
      if(stdout){
        console.log("Node left the cluster");
      }
      if(stderr){
        console.log('You are attempting to leave the cluster on a node that is participating as a manager.');
        console.log('Use `orcinus cluster leave-manager` to remove manager.');
        console.log("");
        module.exports.help();
      }
    })
  },
  leave_manager : ()=>{
    var cmd = "docker swarm leave --force";
    chp.exec(cmd,(e, stdout, stderr)=> {
      if(stdout){
        console.log("Node left the cluster");
        fs.unlinkSync(tokenFile);
      }
      if(stderr){
        console.log('This node is not part of a cluster')
        console.log("");
        module.exports.help();
      }
    })
  },
  list : ()=>{
    var cmd = "docker node ls";
    chp.exec(cmd,(e, stdout, stderr)=> {
      if(stdout){
        console.log(stdout);
      }
      if(stderr){
        console.log('This node is not a cluster manager. Use "orcinus cluster init [IP ADDRESS]" or "orcinus cluster join [TOKEN]" to connect this node to swarm and try again.');
        console.log("");
        module.exports.help();
      }
    })
  },
  inspect : ()=>{
    var nodes = arg.join(" ");
    var cmd = "docker node inspect --pretty "+nodes;
    chp.exec(cmd,(e, stdout, stderr)=> {
      if(stdout){
        console.log(stdout);
      }
      if(stderr){
        console.log('This node is not a cluster manager. Use "orcinus cluster init [IP ADDRESS]" or "orcinus cluster join [TOKEN]" to connect this node to swarm and try again.');
        console.log("");
        module.exports.help();
      }
    })
  },
  promote : ()=>{
    var nodes = arg.join(" ");
    var cmd = "docker node promote "+nodes;
    chp.exec(cmd,(e, stdout, stderr)=> {
      if(stdout){
        console.log("Node "+nodes+" promoted to a manager in the cluster.");
      }
      if(stderr){
        console.log('This node is not a cluster manager. Use "orcinus cluster init [IP ADDRESS]" or "orcinus cluster join [TOKEN]" to connect this node to swarm and try again.');
        console.log("");
        module.exports.help();
      }
    })
  },
  token : ()=>{
    if (fs.existsSync(tokenFile)){
      fs.readFile(tokenFile, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var utf = utf8.encode(JSON.stringify(data))
        var encodedToken = base64.encode(utf);
        if(arg.indexOf('out') > -1){
          console.log("orcinus cluster join "+encodedToken);
        }
        else if(arg.indexOf('only') > -1){
          console.log(encodedToken);
        }
        else{
            module.exports.joinOpt(encodedToken);
        }
      });
    }
    else{
      console.log('This node is not a cluster manager. Use "orcinus cluster init [IP ADDRESS]" or "orcinus cluster join [TOKEN]" to connect this node to swarm and try again.');
      console.log("");
      module.exports.help();
    }
  },
  help : ()=>{
    console.log("Usage:	orcinus cluster COMMAND");
    console.log("");
    console.log("Manage Docker Swarm Cluster From Orcinus");
    console.log("");
    console.log("Commands:");
    console.log("  info               Print usage");
    console.log("  init [IP ADDRESS]  Initialize a manager");
    console.log("  join [TOKEN]       Join a node as a worker");
    console.log("  ls                 List all nodes");
    console.log("  token [out|only]        Manage join tokens");
    console.log("  promote [HOSTNAME] Promote worker as a manager");
    console.log("  leave              Leave the worker on cluster");
    console.log("  leave-manager      Leave the manager on cluster");
    console.log("  inspect [HOSTNAME] Display detailed information on node")
    process.exit(0);
  },
  joinOpt : (token)=>{
    console.log("Add a worker to this manager.");
    console.log("");
    console.log("  Token : "+token);
    console.log("");
    console.log("  or run the following command:");
    console.log("           orcinus cluster join "+token);
    console.log("");
  },
  ipCheck : (ip)=>{
    if(ip.split(".").length != 4){
      console.log("Ip Address is not valid!");
      module.exports.help();
      process.exit(0);
    }
    return ip;
  }
}
