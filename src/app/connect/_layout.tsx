import { Redirect } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';

import { PillBar, PillButton } from '@/components/pill';
import { useAppState } from '@/state/app-state';

export default function ConnectLayout() {
  const { identity } = useAppState();
  if (!identity) return <Redirect href="/" />;

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <PillBar accessibilityLabel="Add or be added">
          <TabTrigger name="scan" href="/connect/scan" asChild>
            <PillButton label="Add someone" width={132} />
          </TabTrigger>
          <TabTrigger name="my-code" href="/connect/my-code" asChild>
            <PillButton label="Be added" width={132} />
          </TabTrigger>
        </PillBar>
      </TabList>
    </Tabs>
  );
}
