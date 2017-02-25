function verify(email, callback) {

  var IDP_ENDPOINT = configuration.ENDPOINT_LOCAL + "/api/v1/verify/account/";

  request.get({
    url: IDP_ENDPOINT + '?email=' + email + '&email_verified=true'
  }, function (err, response) {
    console.log('VERIFY: Response status code: ' + response.statusCode);
    if (err) {
      return callback(err);
    }
    if (response.statusCode != 200) {
      return callback(new Error('Forbidden'));
    }
    console.log('@@@ verify - end @@@');
    return callback(null, true);
  });

}
