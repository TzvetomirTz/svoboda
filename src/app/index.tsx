import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Svoboda.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    color: '#000',
    fontSize: 48,
    fontWeight: '600',
  },
});
