// iOS: refuse third-party keyboard extensions app-wide, so only Apple's keyboard (or the in-app
// Svoboda keyboard) can appear. Expo's AppDelegate doesn't forward this delegate method to
// modules, so it is added to the generated AppDelegate.swift.
const { withAppDelegate } = require('expo/config-plugins');

const MARKER = 'shouldAllowExtensionPointIdentifier';

const METHOD = `
  // Svoboda: refuse third-party keyboards. Added by plugins/with-refuse-third-party-keyboards.js.
  @objc public func application(
    _ application: UIApplication,
    shouldAllowExtensionPointIdentifier extensionPointIdentifier: UIApplication.ExtensionPointIdentifier
  ) -> Bool {
    return extensionPointIdentifier != .keyboard
  }

`;

module.exports = function withRefuseThirdPartyKeyboards(config) {
  return withAppDelegate(config, (config) => {
    const { language, contents } = config.modResults;
    if (language !== 'swift') {
      throw new Error('with-refuse-third-party-keyboards: expected a Swift AppDelegate, got ' + language);
    }
    if (contents.includes(MARKER)) return config;

    const anchor = /class AppDelegate: ExpoAppDelegate \{\n/;
    if (!anchor.test(contents)) {
      throw new Error('with-refuse-third-party-keyboards: could not find the AppDelegate class');
    }
    config.modResults.contents = contents.replace(anchor, (match) => match + METHOD);
    return config;
  });
};
