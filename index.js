'use strict';

var runInSandbox = require("auth0-rules-testharness");

var wrapLogin = function (script, usernameFieldName) {
  usernameFieldName = usernameFieldName || 'email';
  return `function (user, context, callback) {
    var username = user["${usernameFieldName}"];
    var password = user.password;
    var loginFn = ${script};
    loginFn.call(null, username, password, callback);
  }`;
};

var wrapCreate = function (script) {
  return `function (user, context, callback) {
    var createFn = ${script};
    createFn.call(null, user, callback);
  }`;
};

var wrapVerify = function (script) {
  return `function (user, context, callback) {
    var email = user.email; 
    var verifyFn = ${script};
    verifyFn.call(null, email, callback);
  }`;
};

var wrapChangePassword = function (script) {
  return `function (user, context, callback) {
    var email = user.email;
    var newPassword = user.password;
    var changePasswordFn = ${script};
    changePasswordFn.call(null, email, newPassword, callback);
  }`;
};

var wrapGetUser = function (script) {
  return `function (user, context, callback) {
    var email = user.email; 
    var getUserFn = ${script};
    getUserFn.call(null, email, callback);
  }`;
};

var wrapDelete = function (script) {
  return `function (user, context, callback) {
    var id = user.id; 
    var deleteFn = ${script};
    deleteFn.call(null, id, callback);
  }`;
};


module.exports = function (params) {

  var execute = function (script, configuration, user, callback) {
    configuration = configuration || {};
    var args = [user, {}, callback];
    runInSandbox(script, args, configuration, params);
  };

  var loginByEmail = function (loginScript, configuration, user, callback) {
    var script = wrapLogin(loginScript, 'email');
    execute(script, configuration, user, callback);
  };

  var loginByUsername = function (loginScript, configuration, user, callback) {
    var script = wrapLogin(loginScript, 'username');
    execute(script, configuration, user, callback);
  };

  var create = function (createScript, configuration, user, callback) {
    var script = wrapCreate(createScript);
    execute(script, configuration, user, callback);
  };

  var verify = function (verifyScript, configuration, user, callback) {
    var script = wrapVerify(verifyScript);
    execute(script, configuration, user, callback);
  };

  var changePassword = function (changePasswordScript, configuration, user, callback) {
    var script = wrapChangePassword(changePasswordScript);
    execute(script, configuration, user, callback);
  };

  var getUser = function (getUserScript, configuration, user, callback) {
    var script = wrapGetUser(getUserScript);
    execute(script, configuration, user, callback);
  };

  var deleteUser = function (deleteScript, configuration, user, callback) {
    var script = wrapDelete(deleteScript);
    execute(script, configuration, user, callback);
  };

  return {
    loginByEmail: loginByEmail,
    loginByUsername: loginByUsername,
    create: create,
    verify: verify,
    changePassword: changePassword,
    getUser: getUser,
    deleteUser: deleteUser
  };

};





