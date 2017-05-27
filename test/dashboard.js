'use strict';

global.test = true;

var chp = require('child_process');
var config = require('./config');
var server = require('../server')(config);
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
            console.log(res.body[keys[i]]);
            should(JSON.stringify(res.body[keys[i]])).equal(JSON.stringify(result[keys[i]]));
          }
          done();
        });
      });
    });
  });
});
