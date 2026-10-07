import { Redirect } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';

import { PillBar, PillButton } from '@/components/pill';
import { useAppState } from '@/state/app-state';

export default function MainLayout() {
  const { identity } = useAppState();
  if (!identity) return <Redirect href="/" />;

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <PillBar accessibilityLabel="Mode">
          <TabTrigger name="send" href="/send" asChild>
            <PillButton label="Send" width={104} />
          </TabTrigger>
          <TabTrigger name="receive" href="/receive" asChild>
            <PillButton label="Receive" width={104} />
          </TabTrigger>
        </PillBar>
      </TabList>
    </Tabs>
  );
}
