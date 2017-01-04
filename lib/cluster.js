var utils = require("./utils");
var proc = require('process');
var chp = require('child_process');
var base64 = require('base-64');
var fs = require('fs');
var home = utils.getUserHome()+"/.orcinus";
module.exports = {
  start : (cli,args)=>{
    if (!fs.existsSync(home)){
      fs.mkdirSync(home);
    }
    if(typeof(cli) == 'string'){
      console.log(cli);
      console.log(args);
      switch (cli) {
        case 'ls':
          console.log('yesh');
          break;
        default:

      }
    }
    else{
      module.exports.help();
    }
  },
  init : ()=>{
    console.log(home);
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
    console.log("  token              Manage join tokens");
    console.log("  promote [HOSTNAME] Promote worker as a manager");
    console.log("  leave              Leave the swarm (workers only)");
    console.log("  inspect [HOSTNAME] Display detailed information on node")
    process.exit(0);
  },
  joinOpt : (token,ip)=>{
    console.log("To add a worker to this manager");
    console.log("");
    console.log("  Token:");
  },
}
