'use strict';

global.test = true;
    
process.env.ORCINUS_HOST = '127.0.0.1';
process.env.ORCINUS_PORT = '4000';
process.env.ORCINUS_HTTP_CORS = '*'
process.env.ORCINUS_DB = 'localhost';

var pkg = require(__dirname + '/../package.json');
var mongoose = require('mongoose');
mongoose.connection.dropDatabase('test');
var chp = require('child_process');
var server = require('../server')();
var request = require('supertest');
var should = require('should');
var faker = require('faker');
var password = faker.internet.password();
var token;

const timeout = 5000;

// TODO : drop test db before testing

describe('Orcinus Dashboard', function() {
  describe('API', function() {
    it('Signup', function(done) {
      this.timeout(timeout);
      request(server)
      .post('/apis/auth/signup')
      .send({ 
        username : 'admin',
        password : password,
        email : faker.internet.email(),
        firstname : faker.name.firstName(),
        lastname : faker.name.lastName(),
        admin : true,
      })
      .end((err, res) => {
        var result = JSON.parse(res.text);
        done();
      });
    });
    it('Get token', function(done) {
      this.timeout(timeout);
      request(server)
      .post('/apis/auth/signin')
      .send({ 
        username : 'admin',
        password : password,
      })
      .end((err, res) => {
        var result = JSON.parse(res.text);
        token = result.token;
        done();
      });
    });
    it('Ping', function(done) {
      this.timeout(timeout);
      request(server)
      .get('/apis/ping')
      .set('X-Access-Token', token)
      .end((err, res) => {
        should(res.text).equal('OK');
        done();
      });
    });
    it('Unauthorized', function(done) {
      this.timeout(timeout);
      request(server)
      .get('/apis/ping')
      .end((err, res) => {
        should(res.text).equal('{"success":false,"message":"No token provided."}');
        done();
      });
    });
    it('Info', function(done) {
      this.timeout(timeout);
      request(server)
      .get('/apis/info')
      .set('X-Access-Token', token)
      .end((err, res) => {
        should(res.body.name).equal(pkg.name);
        should(res.body.version).equal(pkg.version);
        should(res.body.description).equal(pkg.description);
        should(res.body.bugs.url).equal(pkg.bugs.url);
        should(res.body.deployment).equal('dev');
        should(res.body.cors).equal(process.env.ORCINUS_HTTP_CORS);
        done();
      });
    });
  });
});
