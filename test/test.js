var should = require('should');
var orcinusCreate = require('../lib/create');
var chp = require('child_process');
describe('Orcinus', function() {
  describe('Create', function() {
    it('should be able to create a cluster instance from a manifest file', function(done) {
			let cmd = 'cd ' + process.cwd() + ' && node cli.js create ../orcinus.json';
			let data = require(process.cwd() + '/../orcinus.json');
			orcinusCreate.init(data);
			done();
    });
  });
});
