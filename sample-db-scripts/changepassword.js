function changePassword (email, newPassword, callback) {

  var API_ENDPOINT = configuration.ENDPOINT_LOCAL + "/api/v1/change_password/account";

  request.post({
    url: API_ENDPOINT,
    json: {
      email: email,
      new_password: newPassword
    }
  }, function (err, response) {

    if (err) {
      return callback(err);
    }
    if (response.statusCode != 200 && response.statusCode != 201) {
      return callback(new Error('Forbidden'));
    }
    callback(null, true);
  });
}
