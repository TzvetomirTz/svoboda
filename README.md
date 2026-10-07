# Svoboda

*Svoboda* means freedom in most Slavic languages. The app lets two people talk privately over any messenger: it encrypts a message on your phone with post-quantum cryptography (ML-KEM-768 and ML-DSA-65), you paste the result into WhatsApp, Telegram, email or anything else, and only the intended person can turn it back into text.

> **Not yet reviewed.** The message format has not had an independent security review. Use it to try the app, not to protect anything that matters.

**[Download for Android](https://expo.dev/accounts/oblivionware/projects/svoboda/builds/befe28ce-e06f-46c7-8597-6ba245b68d8d)** · iOS: see [Install](#ios)

## Install

Download the files from the [latest release](https://github.com/TzvetomirTz/svoboda/releases/latest).

### Android

1. On your phone, download `Svoboda-<version>.apk`.
2. Open it. If Android asks, allow your browser or file manager to install unknown apps.
3. Tap **Install**.

Install updates the same way. They keep your identity and contacts.

### iOS

Svoboda isn't on the App Store. You can sideload it with your own Apple ID, at no cost:

1. Install [AltStore](https://altstore.io), [SideStore](https://sidestore.io) or [Sideloadly](https://sideloadly.io) by following its guide.
2. Download `Svoboda-<version>-unsigned.ipa`.
3. Open it with that app and sign in with your Apple ID when asked.

With a free Apple ID, the install expires after 7 days. AltStore and SideStore can refresh it automatically; with Sideloadly, sideload it again. Your identity and contacts stay on the phone as long as you don't delete the app. A free Apple ID can have three sideloaded apps at a time.

## Develop

```bash
nvm use            # Node 24 LTS
npm install
npx expo start     # then scan the QR code with Expo Go
```

Run `npx tsc --noEmit` and `npx expo lint` before committing. After changing an icon master in `assets/`, run `npm run icons`.

## Release

1. Set the new version in `app.json` (`expo.version`).
2. Commit, then tag and push:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   The **iOS release** workflow builds the unsigned `.ipa` and attaches it to a draft GitHub Release for the tag. The tag must match the version in `app.json`.
3. Build the Android APK:
   ```bash
   npx eas-cli@latest build --platform android --profile release
   ```
4. Download the APK from EAS, rename it `Svoboda-<version>.apk` and add it to the draft release.
5. Publish the release.

EAS keeps the Android signing key. Every update must be signed with the same key, so keep a backup (`npx eas-cli@latest credentials`); if it's lost, people have to uninstall Svoboda, and lose their identity and contacts, to update.
