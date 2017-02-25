function getByEmail(email, callback) {

  var IDP_ENDPOINT = configuration.ENDPOINT_LOCAL + "/api/v1/account";

  request.get({
    url: IDP_ENDPOINT + '?email=' + email
  }, function (err, response, body) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode != 200) {
      return callback(new Error('Forbidden'));
    }
    callback(null, body);
  });
}
