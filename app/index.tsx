import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { loading, user, userData } = useAuth();

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <Redirect href={userData ? '/(tabs)' : '/onboarding'} />;
}
