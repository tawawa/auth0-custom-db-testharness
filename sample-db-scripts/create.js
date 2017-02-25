function create(user, callback) {

  var API_ENDPOINT = configuration.ENDPOINT_LOCAL + "/api/v1/create/account";

  user.user_metadata = user.user_metadata || {};

  request.post({
    url: API_ENDPOINT,
    json: {
      email: user.email,
      password: user.password,
      nickname: user.user_metadata.nickname,
      employee_id: user.user_metadata.employee_id,
      company_code: user.user_metadata.company_code,
      email_verified: 'false'
    }

  }, function (err, response, body) {

    if (err) {
      return callback(err);
    }
    if (response.statusCode != 200 && response.statusCode != 201) {
      return callback(new Error('Forbidden'));
    }

    callback(null, body);
  });
}
