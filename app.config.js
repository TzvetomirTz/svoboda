// Lets people who build Svoboda onto their own iPhone use an iOS bundle ID of their own, since a
// free Apple ID can't sign an ID another team has registered. Set SVOBODA_BUNDLE_ID in .env
// (git-ignored, so it survives `git pull`); without it, the ID from app.json is used.
module.exports = ({ config }) => {
  const bundleIdentifier = process.env.SVOBODA_BUNDLE_ID?.trim();
  if (!bundleIdentifier) return config;
  return { ...config, ios: { ...config.ios, bundleIdentifier } };
};
