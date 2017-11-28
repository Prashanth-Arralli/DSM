var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
exports.getProfileData = async(app_id, app_secret, access_token) => {
    var client = new auth.OAuth2(app_id, app_secret, '');
    let profileData = await new Promise((rs, rj) => {
      client.verifyIdToken(
        access_token,
        app_id, (err, user) => {
          !err ? rs(user.getPayload()) : rj(err);
        });
    });
    return {
      id: profileData['sub'],
      name: profileData['name'],
      email: profileData['email'],
      picture: profileData['picture'],
      first_name: profileData['given_name'],
      last_name: profileData['family_name']
    };
  }
