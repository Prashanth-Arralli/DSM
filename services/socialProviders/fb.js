const fb = require('fb');
exports.getProfileData = async(appId, appSecret, accessToken) => {
    fb.extend({
      appId,
      appSecret
    })
    fb.options({
      accessToken
    });
    let profileData = await fb.api('/me', {
      fields: ['id', 'name', 'email', 'picture', 'first_name', 'last_name']
    });
    return {
      id: profileData['id'],
      name: profileData['name'],
      email: profileData['email'],
      picture: profileData['picture'] && profileData['picture']['data'] && profileData['picture']['data']['url'],
      first_name: profileData['first_name'],
      last_name: profileData['last_name']
    };
  };

