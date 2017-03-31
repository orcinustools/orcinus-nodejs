'use strict';

var chp = require('child_process');
var async = require('async');

var cmds = [
  'cd ' + process.cwd() + ' && node cli.js cluster leave',
  'cd ' + process.cwd() + ' && node cli.js cluster leave-manager',
  'docker network rm orcinus-unit-testing-stack',
];

async.eachSeries(cmds, (cmd, cb) => {
	chp.exec(cmd, (err, stdout, stderr) => {
		cb();
	});
}, () => {
});
