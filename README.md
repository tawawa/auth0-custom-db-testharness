# What is it?

The *auth0-custom-db-testharness* library provides an easy way to deploy, execute, and test the output of Auth0 Custom DB Scripts using a real
webtask sandbox environment. It is very simple to use, and requires under 15 minutes to get started testing your Auth0 Custom DB scripts! 

For see here for further documentation on [Auth0 Custom Databases](https://auth0.com/docs/connections/database/mysql)

Sometimes you just want to execute your Custom DB Scripts against the same sandbox environment it will be deployed to at Runtime in
Auth0, and test everything works as expected. You may also wish to write your Custom DB Scripts using a test driven development approach, and gain real feedback as you code - this is where this npm module can help. It actually executes your Custom DB script, by first wrapping it internally, and passing the wrapped function a  `user` object and `callback` function declare in your tests. Then the library spins up a webtask, executes your Custom DB Script passing the results to the provided callback, and finally tears the environment down again.

It is worth noting that under the covers, the script this npm module generates for deployment to a webtask environment
depends upon  [auth0-rules-testharness](https://github.com/tawawa/auth0-rules-testharness), which in turn depends upon [auth0-authz-rules-api](https://github.com/auth0/auth0-authz-rules-api). If you wish to study and understand the generated script code that wraps the Rule being tested, then these are the repos to checkout ;)

## Prerequisites 

Assumes you have an Auth0 Tenant webtask container to run your Rules against.

#### Create a free Auth0 Account

1. Go to [Auth0](https://auth0.com/signup) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

#### What is Auth0?

See bottom of this README for further info...


## How to use it? 

Just install it as an npm dependency and reference in your testsuite.

```bash
$ npm install auth0-custom-db-testharness
```

You can test any of the standard Custom DB Scripts used by Auth0. These include:
 
* Login
* Create
* Verify
* Change Password
* Get User
* Delete


Below is a complete testsuite illustrating how you might go about using this library. It is very intuitive, but you need to be aware
of a couple of things.

1). You always pass a `User` object and a `callback` function to the available functions in this library.

The user object is just a JavaScript literal that encloses any params you need to send to your script.

For example, with login you would need to pass say `email` and `password` so the `user` object would simply be of the form:

```
{
  email: 'email@domain.com',
  password: 'secret'
}
```

Please note, the `user` can be as lightweight as needed just to meet the parameter requirements of the function you are going to run.
Note also that for `login` scripts it is sometimes required to use a `username` rather than `email` - this library fully supports both options.

The callback always takes the form of `function (err, result)` where result is whatever that means in the context of the Script that executes (a user profile, a boolean flag etc).

2). There are some params that additionally you pass to the library so it has the instructions to know of and control the webtask container that it will run against. 

Full testcase follows illustrating every call option, and beneath some information on the params involved!


```
'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var should = require('chai').should();
var testharness = require('auth0-custom-db-testharness');


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
```

Above, hopefully everything is reasonably self-documenting if you are already familiar with Auth0 Custom DB Scripts.

The `configuration` object can contain any special configuration constants you may have. For example, testing your script when it expects an API endpoint, or perhaps the DB connection information etc etc.

The `params` object takes a set of expected attribute values

```
var params = {
  timeout: 5,
  ca: '',
  tenant: 'my-super-tenant',
  url: 'https://sandbox.it.auth0.com',
  token: '<webtask-token>'
};
```

*Params Attributes Description*

* `timeout`: refers the timeout in seconds for the webtask to execute. Note, this is independent of your local testcase timeout..
* `ca`: you can just leave as empty string.
* `tenant`: your tenant name in Auth0 
* `url`: sandbox container url - 'https://sandbox.it.auth0.com' for public cloud
* `token`: the webtask token. You can get your webtask token from [your auth0 dashboard](https://manage.auth0.com/#/account/webtasks).

That is it! You should be up and running in under 15 minutes with an easy way to execute and test your Rules against a webtask sandbox environment.

## Special Warning

It is possible that if one Rule fails due to malformed Script content, it could bring down the Webtask Container for a short period of time, affecting any other webtasks deployed in the same container. For this reason, usage of this library against a PRODUCTION webtask environment is strongly discouraged. This is meant to be a library for testing against DEV / TEST / STG envs. only!!!

## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, among others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free Auth0 Account

1. Go to [Auth0](https://auth0.com/signup) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
