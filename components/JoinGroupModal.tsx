import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PrimaryButton } from './ui/PrimaryButton';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
  loading?: boolean;
}

export function JoinGroupModal({ visible, onClose, onSubmit, loading }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setError('Enter a valid 6-digit code');
      return;
    }
    setError('');
    try {
      await onSubmit(trimmed);
      setCode('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modal}>
                <Text style={styles.title}>Join Group</Text>
                <Text style={styles.subtitle}>Enter the 6-digit group code</Text>

                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  placeholderTextColor="#444"
                  value={code}
                  onChangeText={(t) => {
                    setCode(t);
                    setError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <PrimaryButton title="Join" onPress={handleSubmit} loading={loading} />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 28,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  input: {
    height: 56,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  error: {
    color: '#ff4444',
    fontSize: 13,
    textAlign: 'center',
  },
});
