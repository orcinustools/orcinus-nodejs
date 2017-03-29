'use strict';

var chp = require('child_process');
var async = require('async');

var cmds = [
	// TODO check for nginx image
  'cd ' + process.cwd() + ' && node cli.js cluster leave',
  'cd ' + process.cwd() + ' && node cli.js cluster leave-manager',
  'cd ' + process.cwd() + ' && node cli.js cluster init 127.0.0.1',
  'docker network rm orcinus-unit-testing-stack',
];

async.eachSeries(cmds, (cmd, cb) => {
	chp.exec(cmd, (err, stdout, stderr) => {
		cb();
	});
}, () => {
  console.log('Ready to test');
});
