<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/readme/header-dark.svg">
  <img src="assets/readme/header-light.svg" alt="Svoboda." width="420">
</picture>

### Private messages over any messenger.

Svoboda encrypts on your phone with post-quantum cryptography.<br>
WhatsApp, iMessage or Slack carry the result. Only the person you wrote to can read it.

<br>

[![Download for Android](https://img.shields.io/badge/Download-Android-0A0A0A?style=for-the-badge&logo=android&logoColor=white)](https://github.com/TzvetomirTz/svoboda/releases/latest)
&nbsp;
[![Install on iOS](https://img.shields.io/badge/Install-iOS-0A0A0A?style=for-the-badge&logo=apple&logoColor=white)](#ios)

[![ML-KEM-768](https://img.shields.io/badge/ML--KEM--768-FIPS_203-E30613?style=flat-square)](https://csrc.nist.gov/pubs/fips/203/final)
[![ML-DSA-65](https://img.shields.io/badge/ML--DSA--65-FIPS_204-E30613?style=flat-square)](https://csrc.nist.gov/pubs/fips/204/final)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-0A0A0A?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![MIT License](https://img.shields.io/badge/License-MIT-0A0A0A?style=flat-square)](LICENSE)

</div>

<br>

> [!WARNING]
> **Not yet reviewed.** The message format has not had an independent security review. Use Svoboda to try it out, not to protect anything that matters.

<br>

## How it works

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/readme/how-it-works-dark.svg">
  <img src="assets/readme/how-it-works-light.svg" alt="Your phone encrypts and signs. Any messenger carries the text but can never read it. Their phone checks it is from you and decrypts it." width="100%">
</picture>

|  |  |
|---|---|
| **Create your identity** | Your phone generates a key pair. The private key never leaves it. |
| **Add someone** | Meet in person and scan each other's code. Compare fingerprints out loud. |
| **Send** | Pick who it's to, write, tap *Copy encrypted*, paste it into any chat. |
| **Receive** | Copy what they sent, pick who it's from, tap *Paste and decrypt*. |

*Svoboda* means freedom in most Slavic languages.

<br>

## Which messengers work

A Svoboda message is plain text made of letters, digits, `+` and `/`, so any app that delivers text unchanged can carry it. What decides it is length. Post-quantum keys and signatures are big: even a one-word message comes out at about **5,900 characters**, and every 3 bytes of what you write add 4 more (a Latin letter is 1 byte, a Cyrillic or Greek letter 2, an emoji 4). A message has to arrive in one piece: Svoboda can't put one back together from parts.

| Messenger | Works | Why |
|---|---|---|
| **WhatsApp** | Yes | Takes about 65,000 characters per message. |
| **iMessage** | Yes | No published limit between Apple devices. Not when it falls back to SMS (green bubbles), see SMS. |
| **Facebook Messenger** | Yes | Takes about 20,000 characters per message. |
| **Slack** | Yes | Takes 40,000 characters per message. |
| **Microsoft Teams** | Yes | Takes about 28 KB per post. |
| **Element** and other Matrix apps | Yes | Takes about 64 KB per message. |
| **Viber** | Yes | Tested: messages arrive whole and decrypt. Viber doesn't publish a limit for personal chats. |
| **Telegram** | No | Caps a message at 4,096 characters, well short of 5,900, so it can't arrive in one piece. |
| **Discord** | No | Caps a message at 2,000 characters, or 4,000 with Nitro. Both are too short. |
| **SMS** | No | A long text is sent as parts of 153 characters each, so a message would need about 39 of them. Many carriers cap how many parts they deliver or convert long texts, and the parts don't reliably arrive whole. |
| **Signal** | Untested | No published limit. Long messages may be handled differently from short ones. Try it before relying on it. |
| **Threema** | Untested | Older versions of the app split long messages into several, which would break a Svoboda message. The app's current limit isn't published. |

Viber was tested by sending real messages. The other limits come from each service's documentation where it publishes one, otherwise from developer and support sources, as of October 2026. Messengers change their limits; if a message won't decrypt, check that it arrived complete.

<br>

## Under the hood

| | |
|---|---|
| **Encryption** | ML-KEM-768 (FIPS 203) agrees a fresh key for every message |
| **Signatures** | ML-DSA-65 (FIPS 204) proves who wrote it |
| **Message cipher** | XChaCha20-Poly1305, keyed through HKDF-SHA256 |
| **Your keys** | Kept in the phone's keychain, never synced to another device |
| **Contacts** | Public keys only, stored on your phone. No servers, no accounts |

<details>
<summary><b>Message format</b></summary>

<br>

Each message is base64 text you can paste anywhere:

```
header ("SVM" · version · suite) │ ML-KEM-768 ciphertext │ nonce │ XChaCha20-Poly1305 ciphertext │ ML-DSA-65 signature
```

Both people's fingerprints are authenticated with the message, so it only opens for the person it was written to, and only when checked against the person who wrote it. The suite byte leaves room for new algorithms, such as FN-DSA once FIPS 206 is final, without breaking existing contacts.

A short message comes out at about 5,900 characters. See [Which messengers work](#which-messengers-work) for where that fits.

Source: [`src/lib/message.ts`](src/lib/message.ts), [`src/lib/contact-card.ts`](src/lib/contact-card.ts).

</details>

<br>

## Install

### Android

1. On your phone, open the [latest release](https://github.com/TzvetomirTz/svoboda/releases/latest) and download `Svoboda-<version>.apk`. No account needed.
2. Open it. If Android asks, allow your browser or file manager to install unknown apps.
3. Tap **Install**.

Updates install the same way and keep your identity and contacts.

To check that the APK hasn't been tampered with, compare its SHA-256 with the one in the release notes (`shasum -a 256 Svoboda-<version>.apk`).

Want update notifications? Add `https://github.com/TzvetomirTz/svoboda` to [Obtainium](https://obtainium.imranr.dev).

### iOS

Svoboda isn't on the App Store. You build it on a Mac and install it on your iPhone yourself, signed with your own Apple ID. It's free and doesn't depend on anyone else's servers. You'll paste a few commands into Terminal, but you don't need to know how to code.

**Know the catch before you start**

- **It has to be redone every 7 days.** A free Apple ID signs apps for 7 days. After that, Svoboda won't open until you connect the iPhone to the Mac and run one command again. That takes a few minutes; set a weekly reminder.
- **Missing a week loses nothing.** Your identity and contacts stay on the phone. The app just won't open until you redo it.
- **Never delete the app.** Deleting Svoboda deletes your identity and contacts with it. To fix or update it, install over it.
- **You need a Mac** with room for Xcode (a large download), a USB cable for the iPhone and an Apple ID. A free one works. No Mac? See [Without a Mac](#ios-without-a-mac).
- **A free Apple ID can have three of these apps on a phone at a time.** Svoboda is one of them.
- **After an iOS update**, update Xcode from the App Store too before you build again.

With a paid Apple Developer account ($99/year), the same steps sign the app for a year instead of a week.

<a id="build-it-onto-your-iphone-with-xcode"></a>
#### One-time setup

This takes about an hour, most of it downloading.

To use Terminal, press <kbd>Cmd</kbd>+<kbd>Space</kbd>, type **Terminal** and press <kbd>Return</kbd>. Paste each command, press <kbd>Return</kbd> and wait until it finishes and the prompt (`%`) comes back. When it asks for a password, type your Mac login password. Nothing appears as you type; that's normal.

**1. Install the tools on the Mac**

1. Install **Xcode** from the Mac App Store. Open it once, agree to the terms and, when it asks which platforms to download, include **iOS**.
2. Install **Node.js**: download the **LTS** installer for macOS from [nodejs.org](https://nodejs.org) and run it.
3. Install **Homebrew** with the command on [brew.sh](https://brew.sh). At the end it shows **Next steps** with commands to run; run them, or `brew` won't be found. Then:
   ```bash
   brew install cocoapods
   ```
4. Finish setting up Xcode:
   ```bash
   sudo xcodebuild -license accept
   xcodebuild -runFirstLaunch
   ```

**2. Add your Apple ID to Xcode**

1. In Xcode, open **Xcode → Settings → Apple Accounts**, click **+** and sign in with your Apple ID.
2. Select your account, open **Manage Certificates…**, click **+** and choose **Apple Development**. Click **Done** and quit Xcode.
3. Let your Mac sign the app without asking for your password over and over:
   ```bash
   security set-key-partition-list -S apple-tool:,apple:,codesign: -s ~/Library/Keychains/login.keychain-db
   ```
   Enter your Mac login password. It prints a long list; let it finish.

**3. Download Svoboda**

```bash
cd ~
git clone https://github.com/TzvetomirTz/svoboda.git
cd svoboda
npm ci
```

This puts Svoboda in a `svoboda` folder in your home folder. `npm ci` may print warnings; they're fine.

**4. Choose your own app ID**

Apple needs every app to have its own ID, and Svoboda's is already taken. Make one up, such as `com.yourname.svoboda` (letters, numbers, dots and hyphens, no spaces), and save it:

```bash
echo "SVOBODA_BUNDLE_ID=com.yourname.svoboda" > .env
```

Keep this ID for good. iOS treats a different ID as a different app, which would start out empty.

**5. Prepare the iPhone**

1. Connect it to the Mac by USB, unlock it and tap **Trust This Computer**.
2. Turn on **Settings → Privacy & Security → Developer Mode**. The phone restarts; unlock it and tap **Turn On**. If the option isn't there, open Xcode with the phone connected, wait a minute, then look again.

#### Install it

With the iPhone connected and unlocked:

```bash
cd ~/svoboda
npm run iphone
```

Pick your iPhone from the list with the arrow keys and press <kbd>Return</kbd>. The first time takes 5–15 minutes; keep the phone unlocked until Svoboda appears on it.

The first time, iOS won't open the app until you trust your Apple ID: **Settings → General → VPN & Device Management →** your Apple ID **→ Trust**.

#### Every week

Connect the iPhone, unlock it and run the same two commands. You can do it any time before the 7 days are up; each run starts a new 7 days. It's also how you get back in if the app has stopped opening.

#### Updating Svoboda

```bash
cd ~/svoboda
git pull
npm ci
npm run iphone
```

Your identity and contacts are kept.

#### If something goes wrong

| What you see | What to do |
|---|---|
| `command not found: brew` | Run the **Next steps** commands Homebrew showed at the end of its install, or open a new Terminal window. |
| `command not found: npm` | Install Node.js (step 1), then open a new Terminal window. |
| Your iPhone isn't in the list | Unlock it, check the cable, tap **Trust This Computer** and make sure Developer Mode is on (step 5). |
| `No profiles for '…' were found` | Open **Xcode → Settings → Apple Accounts**. If your account shows an error or asks you to sign in, sign in again. Then run `npm run iphone` again. |
| Bundle identifier can't be registered or isn't available | Someone else has that ID. If Svoboda has never been installed on this phone, pick another ID in step 4 and run `npm run iphone` again. |
| `No code signing certificates are available to use` | Download [`AppleWWDRCAG3.cer`](https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer) and open it to add it to your keychain, then try again. If that's not it, redo step 2. |
| The Mac keeps asking for your password | Press <kbd>Ctrl</kbd>+<kbd>C</kbd>, run the command from step 2.3, then run `npm run iphone` again. |
| `invalid code signature … not been explicitly trusted`, or **Untrusted Developer** on the phone | The app is installed. Trust your Apple ID on the iPhone, as in [Install it](#install-it). |
| `EPERM: operation not permitted` or `Sandbox: … deny` | This happens after building with Xcode's ▶ button. Run `npm run iphone` again; it starts from a clean project. |
| Svoboda stopped opening | Its 7 days are up. Do the [weekly step](#every-week). |

<a id="ios-without-a-mac"></a>
#### Without a Mac

[Sideloadly](https://sideloadly.io) runs on Windows and macOS. Download `Svoboda-<version>-unsigned.ipa` from the [latest release](https://github.com/TzvetomirTz/svoboda/releases/latest), open it in Sideloadly and sign in with your Apple ID. The same 7-day limit applies: install it from the computer again each week. [SideStore](https://sidestore.io) and [AltStore](https://altstore.io) can refresh it for you, but SideStore depends on servers that are often down, and AltStore needs the computer on the same Wi-Fi.

<br>

## For developers

<details>
<summary><b>Run it locally</b></summary>

<br>

```bash
nvm use            # Node 24 LTS
npm install
npx expo start     # then scan the QR code with Expo Go
```

Run `npx tsc --noEmit` and `npx expo lint` before committing. After changing an icon master in `assets/`, run `npm run icons`.

</details>

<details>
<summary><b>Make a release</b></summary>

<br>

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

EAS keeps the Android signing key. Every update must be signed with the same key, so keep a backup (`npx eas-cli@latest credentials`). If it's lost, people have to uninstall Svoboda, and lose their identity and contacts, to update.

</details>

<br>

---

<div align="center">

<sub>Powered by <b>OblivionWare</b> · <a href="LICENSE">MIT License</a></sub>

</div>
