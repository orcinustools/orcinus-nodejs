'use strict';

const mode = process.argv[2];


var chp = require('child_process');
var async = require('async');

var cmds = [
  'cd ' + process.cwd() + ' && node cli.js cluster leave',
  'cd ' + process.cwd() + ' && node cli.js cluster leave-manager',
  'cd ' + process.cwd() + ' && node cli.js cluster init 127.0.0.1',
  'docker service rm orcinus-ut-web',
  'docker network rm orcinus-unit-testing-stack',
  'docker swarm init',
];

if (mode === 'pre') {
  console.log('Before run the test, you may consider preparing few points bellow :');
  console.log(' - Pull aksaramaya/docker-http-server:v1 from hub.docker.com');
  console.log(' - The test may use host ports from 7001 to 7010, make sure no other service run on these ports');
  console.log(' - If your machine is not fast enough, please increase deployTimeout value in test/test.js\n');
} else {
  cmds.splice(2,1);
}

async.eachSeries(cmds, (cmd, cb) => {
  chp.exec(cmd, (err, stdout, stderr) => {
    cb();
  });
}, () => {
  if (mode === 'pre') {
    console.log('Ready to test');
  }
});
