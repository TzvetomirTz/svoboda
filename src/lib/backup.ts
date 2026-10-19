import { Paths } from 'expo-file-system';

import { excludeFromBackup } from '../../modules/svoboda-secure';

/**
 * Keeps contacts and preferences out of backups, so the list of people you talk to never reaches
 * iCloud or Google Drive. iOS: the documents folder is marked excluded from backup, which covers
 * every file in it, including ones written later. Android: backups are switched off in the
 * manifest (plugins/with-no-android-backup.js), so there is nothing to do here.
 * The identity keys are in the keychain / Keystore with this-device-only access and never leave the
 * phone either way.
 */
export function excludeAppDataFromBackup() {
  try {
    excludeFromBackup(Paths.document.uri);
  } catch (error) {
    console.error('Could not exclude app data from backup', error);
  }
}
