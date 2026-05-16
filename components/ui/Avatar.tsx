import { Image } from 'expo-image';
import { View, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface Props {
  uri?: string | null;
  base64?: string | null;
  size?: number;
}

export function Avatar({ uri, base64, size = 48 }: Props) {
  const source = base64
    ? { uri: `data:image/jpeg;base64,${base64}` }
    : uri
    ? { uri }
    : null;

  if (!source) {
    return (
      <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
        <IconSymbol name="person.fill" size={size * 0.4} color="#555" />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
});
