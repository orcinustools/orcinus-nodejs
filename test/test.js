var should = require('should');
var chp = require('child_process');
var fs = require('fs');
var orcinusCreate = require('../lib/create');
var orcinusRemove = require('../lib/rm');

// TODO fix me
// Check for docker binary and `nginx` image before running unit testing
// var orcinusPs = require('../lib/ps');


describe('Orcinus', function() {
  describe('Create', function() {
    it('should be able to create a cluster instance via API', function(done) {
			this.timeout(20000);
			let data = {
      	"stack" : "test-stack",
      	"services": {
        	"web": {
          	"image": "nginx",
          	"cpu": "1",
          	"memory": "128mb"
      		}
      	}
			}
			orcinusCreate.init(data);
			setTimeout(() => { // wait for docker
				let cmd = 'docker ps -f name=web1 -q';
			  chp.exec(cmd, (err, stdout, stderr) => {
					stdout.length.should.greaterThan(10); // Container ID length was 12
					orcinusRemove.init(data);
			  	done();
			  });
			}, 15000);
    });
    it('should be able to create a cluster instance from a manifest file', function(done) {
			this.timeout(20000);
			let data = {
      	"stack" : "test-stack",
      	"services": {
        	"web": {
          	"image": "nginx",
          	"cpu": "1",
          	"memory": "128mb"
      		}
      	}
			}
			fs.writeFileSync('./test/test.json', JSON.stringify(data));
			chp.exec('cd ' + process.cwd() + ' && node cli.js test/test.json', () => {
			  setTimeout(() => { // wait for docker
			  	let cmd = 'docker ps -f name=web1 -q';
			    chp.exec(cmd, (err, stdout, stderr) => {
			  		stdout.length.should.greaterThan(10); // Container ID length was 12
			  		chp.exec('cd ' + process.cwd() + ' && node cli.js rm -f test/test.json');
			    	done();
			    });
			  }, 15000);
			});
    });
  });
});
