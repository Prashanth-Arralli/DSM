let fb = require('./socialProviders/fb');
let google = require('./socialProviders/google');
const providers = {
  fb,
  google
};
const commonHelper = require(HELPERS + 'common');
exports.getProfileData = async(provider_name, access_token) => {
  if (!providers[provider_name]) throw new Error('Providers not found.');
  let settings = await commonHelper.getSocialSettings();
  settings = settings.toObject();
  let credential = settings['social_providers'];
  if (!settings['social_providers'] || !credential[provider_name] ||
    !credential[provider_name]['app_id'] ||
    !credential[provider_name]['app_secret']
  ) throw new Error('Credential has not been configured for social providers.');
  return await providers[provider_name].getProfileData(
    credential[provider_name]['app_id'],
    credential[provider_name]['app_secret'],
    access_token
  );
};
