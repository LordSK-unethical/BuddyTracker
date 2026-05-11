import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Avatar } from '@/components/ui/Avatar';
import { JoinGroupModal } from '@/components/JoinGroupModal';
import { useAuth } from '@/src/context/AuthContext';
import { useGroup } from '@/hooks/useGroup';
import { useTracking } from '@/hooks/useTracking';

export default function HomeScreen() {
  const { userData } = useAuth();
  const { group, isInGroup, isLeader, loading, createGroup, joinGroup, leaveGroup, deleteGroup } =
    useGroup();
  const { tracking, startTracking, stopTracking, error: trackingError } = useTracking();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'This will permanently delete the group for all members. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveGroup();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  if (isInGroup && group) {
    return (
      <ScreenContainer>
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Group Code</Text>
          <Text style={styles.code}>{group.code}</Text>
          <Text style={styles.roleBadge}>
            {isLeader ? 'You are the leader' : 'You are a member'}
          </Text>
        </View>

        <View style={styles.groupInfo}>
          <Text style={styles.memberCount}>
            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
          </Text>
          {tracking && <Text style={styles.trackingBadge}>Sharing location</Text>}
          {trackingError && <Text style={styles.errorText}>{trackingError}</Text>}
        </View>

        <View style={styles.actions}>
          {tracking ? (
            <PrimaryButton title="Stop Tracking" variant="secondary" onPress={stopTracking} />
          ) : (
            <PrimaryButton title="Start Tracking" onPress={startTracking} />
          )}

          <View style={styles.spacer} />

          {isLeader ? (
            <PrimaryButton
              title="Delete Group"
              variant="danger"
              onPress={handleDeleteGroup}
              loading={loading}
            />
          ) : (
            <PrimaryButton
              title="Leave Group"
              variant="secondary"
              onPress={handleLeaveGroup}
              loading={loading}
            />
          )}
        </View>

        <JoinGroupModal
          visible={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSubmit={joinGroup}
          loading={loading}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.welcomeSection}>
        <Avatar uri={userData?.avatarUrl} base64={userData?.avatarBase64} size={64} />
        <Text style={styles.welcome}>Welcome, {userData?.username}</Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Create Group" onPress={createGroup} loading={loading} />
        <View style={styles.spacer} />
        <PrimaryButton
          title="Join Group"
          variant="secondary"
          onPress={() => setShowJoinModal(true)}
        />
      </View>

      <JoinGroupModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={joinGroup}
        loading={loading}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    alignItems: 'center',
    gap: 12,
    marginTop: 32,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  spacer: {
    height: 4,
  },
  codeCard: {
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: '#222',
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  code: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 6,
  },
  roleBadge: {
    marginTop: 12,
    fontSize: 13,
    color: '#888',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  groupInfo: {
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  memberCount: {
    fontSize: 15,
    color: '#555',
  },
  trackingBadge: {
    fontSize: 13,
    color: '#34c759',
    backgroundColor: '#1a2e1a',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  errorText: {
    fontSize: 13,
    color: '#ff4444',
  },
});
