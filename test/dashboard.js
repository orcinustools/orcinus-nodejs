'use strict';

global.test = true;
    
process.env.ORCINUS_HOST = '127.0.0.1';
process.env.ORCINUS_PORT = '4000';
process.env.ORCINUS_HTTP_CORS = '*'

var chp = require('child_process');
var server = require('../server')();
var request = require('supertest');
var should = require('should');

const timeout = 5000;

describe('Orcinus Dashboard', function() {
  describe('API', function() {
    it('Ping', function(done) {
      this.timeout(timeout);
      request(server)
      .get('/apis/ping')
      .end((err, res) => {
        should(res.text).equal('OK');
        done();
      });
    });
    it('Info', function(done) {
      this.timeout(timeout);
      request(server)
      .get('/apis/info')
      .end((err, res) => {
        let cmd = 'docker info --format \'{{json .}}\'';
        chp.exec(cmd, (err, stdout, stderr) => {
          var result = JSON.parse(stdout);
          var keys = Object.keys(res.body);
          for (var i in keys) {
            if (keys[i] == 'SystemTime') continue;
            if (keys[i] == 'Swarm') {
              var swarmKeys = Object.keys(res.body[keys[i]]);
              for (var j in swarmKeys) {
                // Catch the undetermined addr value!
                if (swarmKeys[j] == 'RemoteManagers') {
                  for (var k in res.body[keys[i]][swarmKeys[j]]['RemoteManagers']) {
                    let ret = (res.body[keys[i]][swarmKeys[j]]['RemoteManagers']['NodeID'] == result[keys[i]][swarmKeys[j]]['RemoteManagers']['NodeID'])
                    should(ret).equal(true);
                    ret = (res.body[keys[i]][swarmKeys[j]]['RemoteManagers']['NodeID'] == '127.0.0.1:2337' || '0.0.0.0:2337');
                    should(ret).equal(true);
                  }
                } else {
                  should(JSON.stringify(res.body[keys[i]][swarmKeys[j]]))
                  .equal(JSON.stringify(result[keys[i]][swarmKeys[j]]));
                }
              }
            } else {
              should(JSON.stringify(res.body[keys[i]])).equal(JSON.stringify(result[keys[i]]));
            }
          }
          done();
        });
      });
    });
  });
});
