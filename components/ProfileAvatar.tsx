import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

export function ProfileAvatar() {
  const router = useRouter();
  const { userData } = useAuth();

  return (
    <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
      <Avatar uri={userData?.avatarUrl} base64={userData?.avatarBase64} size={32} />
    </TouchableOpacity>
  );
}
