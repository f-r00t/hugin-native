import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useThemeStore } from '@/services';

export const LoadingPlaceholder: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.foreground} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
