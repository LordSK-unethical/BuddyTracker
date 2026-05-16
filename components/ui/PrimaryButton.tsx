import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function PrimaryButton({ title, onPress, loading, disabled, variant = 'primary' }: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], (loading || disabled) && styles.disabled]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000' : '#fff'} />
      ) : (
        <Text style={[styles.text, variant !== 'primary' && styles.secondaryText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#fff',
  },
  secondary: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  danger: {
    backgroundColor: '#2a0000',
    borderWidth: 1,
    borderColor: '#440000',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  secondaryText: {
    color: '#fff',
  },
});
