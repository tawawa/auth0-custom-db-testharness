function login(username, password, callback) {

  // This is a more complex login script as it can detect whether an email is provided
  // for the username or whether to parse a stringified JavaScript literal object..
  // Illustration only, your script would likely be more simplified !!

  username = username || '';

  var body, IDP_ENDPOINT;

  if (/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(username)) {

    IDP_ENDPOINT = configuration.ENDPOINT_LOCAL + "/api/v1/loginByEmail";

    body = {
      email: username,
      password: password
    };

  } else {


    IDP_ENDPOINT = configuration.ENDPOINT_LOCAL + "/api/v1/loginByAccountNumber";

    var params, account_number;

    try {

      params = JSON.parse(username);
      account_number = params.account_number;

    } catch (e) {
      return callback('Unable to parse username: ' + username);
    }

    body = {
      account_number: account_number,
      password: password
    };

  }

  var options = {
    method: 'POST',
    url: IDP_ENDPOINT,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json'
    },
    body: body,
    json: true
  };

  request(options, function (error, response, body) {
    if (error) {
      throw new Error(error);
    }

    if (response.statusCode != 200 && response.statusCode != 201) {
      return callback(new Error('Wrong Username / Password'));
    }
    var user = body;

    callback(null, {
      user_id: user.id,
      nickname: user.nickname,
      email: user.email,
      email_verified: user.email_verified == 'true' ? true : false,
      user_metadata: {
        account_number: user.account_number
      }
    });

  });
}