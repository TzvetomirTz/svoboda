import { createContext, use, useEffect, type ReactNode } from 'react';

// Lets a main screen hide the Send/Receive pill, for example while the Svoboda keyboard is open.

const MainChromeContext = createContext<(hidden: boolean) => void>(() => {});

export function MainChromeProvider({ setHidden, children }: { setHidden: (hidden: boolean) => void; children: ReactNode }) {
  return <MainChromeContext value={setHidden}>{children}</MainChromeContext>;
}

export function useHideMainChrome(hidden: boolean) {
  const setHidden = use(MainChromeContext);
  useEffect(() => {
    setHidden(hidden);
    return () => setHidden(false);
  }, [hidden, setHidden]);
}
