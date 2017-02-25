'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var should = require('chai').should();
var testharness = require('./index');


// The underlying scripts that are being tested here actually use an HTTPS Endpoint rather than a Relational / NoSql DB
// The usage would be almost identical regardless, just the configuration might be settings for a DB etc instead.


var configuration = {
  ENDPOINT_LOCAL: 'https://api.com'
};

var params = {
  timeout: 5,
  ca: '',
  tenant: 'demo-workshop',
  url: 'https://sandbox.it.auth0.com',
  token: '<TOKEN>'
};


describe('auth0-custom-db-testharness', function () {


  it('should login user with email and password', function (done) {

    var loginScript = fs.readFileSync('./sample-db-scripts/login.js', 'utf8');

    var user = {
      email: "richard.seldon@auth0.com",
      password: "pwd"
    };

    var callback = function (err, user) {
      console.log('user: ', user);
      should.not.exist(err);
      expect(user.user_id).to.equal(1);
      expect(user.nickname).to.equal('arcseldon');
      expect(user.email).to.equal('richard.seldon@auth0.com');
      expect(user.email_verified).to.be.true;
      user.user_metadata = user.user_metadata || {};
      expect(user.user_metadata.account_number).to.equal('1234');
      done();
    };

    testharness(params).loginByEmail(loginScript, configuration, user, callback);

  });


  it('should login user with username and password', function (done) {

    var loginScript = fs.readFileSync('./sample-db-scripts/login.js', 'utf8');

    // here, we use a "hack" to get extra param info into the single username parameter of the custom db login script
    var username = JSON.stringify({
      account_number: '1234',
      company_code: '123'
    });

    var user = {
      username: username,
      password: "pwd"
    };

    var callback = function (err, user) {
      console.log('user: ', user);
      should.not.exist(err);
      expect(user.user_id).to.equal(1);
      expect(user.nickname).to.equal('arcseldon');
      expect(user.email).to.equal('richard.seldon@auth0.com');
      expect(user.email_verified).to.be.true;
      user.user_metadata = user.user_metadata || {};
      expect(user.user_metadata.account_number).to.equal('1234');
      done();
    };

    testharness(params).loginByUsername(loginScript, configuration, user, callback);

  });


  it('should create user', function (done) {

    var createScript = fs.readFileSync('./sample-db-scripts/create.js', 'utf8');

    var user = {
      "email": "arcseldon+test@gmail.com",
      "password": "pwd",
      "user_metadata": {
        "nickname": "arcseldon",
        "employee_id": "12345",
        "company_code": "54321"
      }
    };

    var callback = function (err, response) {
      should.not.exist(err);
      console.log('response: ', response);
      expect(response.email).to.equal(user.email);
      expect(response.nickname).to.equal(user.user_metadata.nickname);
      done();
    };

    testharness(params).create(createScript, configuration, user, callback);

  });


  it('should verify user email', function (done) {

    var verifyScript = fs.readFileSync('./sample-db-scripts/verify.js', 'utf8');

    var user = {
      "email": "richard.seldon@auth0.com",
    };

    var callback = function (err, response) {
      should.not.exist(err);
      console.log('response: ', response);
      expect(response).to.be.true;
      done();
    };

    testharness(params).verify(verifyScript, configuration, user, callback);

  });


  it('should change password for user', function (done) {

    // increase timeout threshold for testcase since this sometimes takes more than 2 seconds
    this.timeout(5000);

    var user = {
      "email": "richard.seldon@auth0.com",
      "password": "supersecret"
    };

    var changePasswordScript = fs.readFileSync('./sample-db-scripts/changepassword.js', 'utf8');

    var callback = function (err, response) {
      console.log('response: ', response);
      should.not.exist(err);
      expect(response).to.be.true;
      done();
    };

    testharness(params).changePassword(changePasswordScript, configuration, user, callback);

  });


  it('should get user by email', function (done) {

    var getUserScript = fs.readFileSync('./sample-db-scripts/getuser.js', 'utf8');

    var user = {
      "email": "richard.seldon@auth0.com"
    };

    var callback = function (err, user) {
      should.not.exist(err);
      user = JSON.parse(user);
      console.log('user: ', user);
      expect(user.id).to.equal(1);
      expect(user.email).to.equal('richard.seldon@auth0.com');
      done();
    };

    testharness(params).getUser(getUserScript, configuration, user, callback);

  });


  it('should delete user by id', function (done) {

    var deleteScript = fs.readFileSync('./sample-db-scripts/delete.js', 'utf8');

    var user = {
      "id": 2
    };

    var callback = function (err, response) {
      should.not.exist(err);
      console.log('response: ', response);
      expect(response).to.be.true;
      done();
    };

    testharness(params).deleteUser(deleteScript, configuration, user, callback);

  });


});