import { Redirect } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { useState } from 'react';

import { PillBar, PillButton } from '@/components/pill';
import { useAppState } from '@/state/app-state';
import { MainChromeProvider } from '@/state/main-chrome';

export default function MainLayout() {
  const { identity } = useAppState();
  const [chromeHidden, setChromeHidden] = useState(false);
  if (!identity) return <Redirect href="/" />;

  return (
    <MainChromeProvider setHidden={setChromeHidden}>
      <Tabs>
        <TabSlot />
        <TabList asChild>
          <PillBar accessibilityLabel="Mode" hidden={chromeHidden}>
            <TabTrigger name="send" href="/send" asChild>
              <PillButton label="Send" width={104} />
            </TabTrigger>
            <TabTrigger name="receive" href="/receive" asChild>
              <PillButton label="Receive" width={104} />
            </TabTrigger>
          </PillBar>
        </TabList>
      </Tabs>
    </MainChromeProvider>
  );
}
