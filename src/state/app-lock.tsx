import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

import { useAppState } from '@/state/app-state';

type UnlockError = LocalAuthentication.LocalAuthenticationError;

type AppLock = {
  locked: boolean;
  /** Covers the app with the lock screen and resolves once it is unlocked. Resolves at once on a phone without a passcode. */
  lock: () => Promise<void>;
  /** Asks for Face ID, fingerprint or the phone's passcode. Resolves to null once unlocked, or to why it wasn't. */
  unlock: () => Promise<UnlockError | null>;
  /** Runs a system prompt that sends Android to the background, such as a permission request, without locking. */
  withoutLocking: <T>(prompt: () => Promise<T>) => Promise<T>;
};

const AppLockContext = createContext<AppLock | null>(null);

/** Whether the phone has a passcode, PIN, pattern or biometrics to unlock with. */
async function phoneIsSecured(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return (await LocalAuthentication.getEnrolledLevelAsync()) !== LocalAuthentication.SecurityLevel.NONE;
  } catch (error) {
    // Fail closed: the lock screen still lets the phone's own prompt decide.
    console.error('Could not read the phone’s security level', error);
    return true;
  }
}

/**
 * Locks Svoboda whenever it goes to the background, once there is an identity to protect. Opening
 * it again takes Face ID, a fingerprint or the phone's passcode. A phone with no passcode at all
 * has nothing to unlock with, so there the app stays open.
 */
export function AppLockProvider({ children }: { children: ReactNode }) {
  const { identity } = useAppState();
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  // Read synchronously when the app goes to the background, where there may be no time to ask.
  const secured = useRef(true);
  const unlocking = useRef<Promise<UnlockError | null> | null>(null);
  const systemPrompts = useRef(0);
  const waiting = useRef<(() => void)[]>([]);

  function showLock() {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    router.push('/lock');
  }

  async function lock() {
    secured.current = await phoneIsSecured();
    if (!secured.current) return;
    const unlocked = new Promise<void>((resolve) => waiting.current.push(resolve));
    showLock();
    await unlocked;
  }

  function finishUnlock() {
    lockedRef.current = false;
    setLocked(false);
    if (router.canGoBack()) router.back();
    for (const resolve of waiting.current.splice(0)) resolve();
  }

  async function authenticate(): Promise<UnlockError | null> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Svoboda',
      // Class 3 biometrics only; camera-based face unlock falls back to the PIN.
      biometricsSecurityLevel: 'strong',
    });
    if (result.success) {
      finishUnlock();
      return null;
    }
    // The passcode was removed since locking: there's nothing left to unlock with.
    if ((result.error === 'passcode_not_set' || result.error === 'not_enrolled') && !(await phoneIsSecured())) {
      secured.current = false;
      finishUnlock();
      return null;
    }
    return result.error;
  }

  function unlock() {
    // One prompt at a time. Android's passcode screen also sends the app to the background, which
    // must not lock it again.
    unlocking.current ??= authenticate().finally(() => {
      unlocking.current = null;
    });
    return unlocking.current;
  }

  async function withoutLocking<T>(prompt: () => Promise<T>) {
    systemPrompts.current += 1;
    try {
      return await prompt();
    } finally {
      systemPrompts.current -= 1;
    }
  }

  const armed = identity !== null;

  useEffect(() => {
    if (!armed) return;
    phoneIsSecured().then((value) => (secured.current = value));

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        phoneIsSecured().then((value) => (secured.current = value));
        return;
      }
      // Only 'background': iOS also goes 'inactive' for Face ID itself, Control Center and alerts.
      if (state !== 'background') return;
      if (!secured.current || unlocking.current || systemPrompts.current > 0) return;
      showLock();
    });
    return () => subscription.remove();
  }, [armed]);

  return <AppLockContext value={{ locked, lock, unlock, withoutLocking }}>{children}</AppLockContext>;
}

export function useAppLock() {
  const lock = use(AppLockContext);
  if (!lock) throw new Error('useAppLock must be used inside AppLockProvider');
  return lock;
}
