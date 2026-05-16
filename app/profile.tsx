import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/src/config/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

export default function ProfileScreen() {
  const { user, userData, signOut } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This will permanently delete your profile and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              if (!user) throw new Error('No authenticated user');
              if (userData?.username) {
                await deleteDoc(doc(db, 'usernames', userData.username.toLowerCase()));
              }
              await deleteDoc(doc(db, 'users', user.uid));
              await user.delete();
              await signOut();
              router.replace('/');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer padded={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Avatar
            uri={userData?.avatarUrl}
            base64={userData?.avatarBase64}
            size={120}
          />
          <Text style={styles.username}>{userData?.username}</Text>
        </View>

        {deleting && (
          <View style={styles.deletingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        <View style={styles.footer}>
          <PrimaryButton
            title="Delete Account"
            variant="danger"
            onPress={handleDeleteAccount}
            disabled={deleting}
          />
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  back: {
    fontSize: 17,
    color: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  username: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
