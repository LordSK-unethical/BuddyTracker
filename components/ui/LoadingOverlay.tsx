import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
}

export function LoadingOverlay({ visible }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  box: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
  },
});
