function remove(id, callback) {

  if (!id) {
     return callback(null);
  }

  var IDP_ENDPOINT = configuration.ENDPOINT_LOCAL + "/api/v1/remove/account/";

  request.del({
    url: IDP_ENDPOINT + id
  }, function (err, response, body) {

    if (err) {
      return callback(err);
    }
    if (response.statusCode != 200) {
      return callback(new Error('Forbidden'));
    }
    callback(null, true);
  });

}
