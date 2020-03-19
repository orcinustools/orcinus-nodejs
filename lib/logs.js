var utils = require("./utils");
var ps = require('process');
var chp = require('child_process');
var utf8 = require('utf8');
var fs = require('fs');
var home = utils.getUserHome() + "/.orcinus";
var arg;
var cmd = 'docker';
var cmd_token = ['service','logs']
module.exports = {
    start: (cli, args) => {
        arg = args;
        if (typeof (cli) == 'string') {
            switch (cli) {
                case 'follow':
                    module.exports.follow(args);
                    break;
                case 'tail':
                    module.exports.tail(args);
                    break;
                default:
                    module.exports.init(cli)
                break;
            }
        }
        else {
            module.exports.help();
        }
    },
    init: (cli) => {
        cmd_token.push(cli);
        module.exports.ps(cmd,cmd_token);
    },
    follow: (args) => {
        if(!args[0]){
            module.exports.help();
        }
        else{
            cmd_token.push('-f');
            cmd_token.push(args[0]);
            module.exports.ps(cmd,cmd_token);
        }
    },
    tail: (args) => {
        if(args.length > 0){
            cmd_token.push('--tail');
            if(args.length == 2){
                cmd_token.push(args[0].toString());
                cmd_token.push(args[1]);
            }
            else{
                cmd_token.push('10');
                cmd_token.push(args[1]);
            }
            module.exports.ps(cmd,cmd_token);
        }
        else{
            module.exports.help();
        }
    },
    help: () => {
        console.log("Usage:	orcinus logs [COMMAND] SERVICE_NAME");
        console.log("");
        console.log("Manage Orcinus logs service");
        console.log("");
        console.log("Commands:");
        console.log("  follow               Follow log output");
        console.log("  tail [line]          Number of lines to show from the end of the logs (default=10)");
        ps.exit(0);
    },
    ps: (base, token)=>{
        var child = chp.spawn(base,token);
        child.stdout.on('data', (data) => {
            process.stdout.write(`${data}`);
        });
    }
}
