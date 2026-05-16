import { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { MemberListItem } from '@/components/MemberListItem';
import { useGroupStore } from '@/store/groupStore';

function Skeleton({ count }: { count: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View
          key={`skel_${i}`}
          entering={FadeIn.duration(400).delay(i * 60)}
          style={styles.skeleton}
        />
      ))}
    </View>
  );
}

export default function MembersScreen() {
  const groupId = useGroupStore((s) => s.groupId);
  const leaderUid = useGroupStore((s) => s.leaderUid);
  const members = useGroupStore((s) => s.members);
  const isSynced = useGroupStore((s) => s.isSynced);
  const isOnline = useGroupStore((s) => s.isOnline);

  const isInGroup = !!groupId;

  const sorted = useMemo(
    () =>
      [...members].sort((a, b) => {
        if (a.uid === leaderUid) return -1;
        if (b.uid === leaderUid) return 1;
        return b.joinedAt - a.joinedAt;
      }),
    [members, leaderUid]
  );

  if (!isInGroup) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No Group</Text>
          <Text style={styles.emptySubtitle}>
            Join or create a group to see members
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!isSynced) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <Text style={styles.count}>Loading...</Text>
        </View>
        <Skeleton count={4} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.count}>
          {members.length} member{members.length !== 1 ? 's' : ''}
        </Text>
        {!isOnline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.uid}
        renderItem={({ item, index }) => (
          <MemberListItem
            member={item}
            isLeader={item.uid === leaderUid}
            index={index}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#555',
  },
  header: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
  offlineBadge: {
    backgroundColor: '#2a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  list: {
    gap: 6,
    paddingBottom: 24,
  },
  skeleton: {
    height: 68,
    backgroundColor: '#111',
    borderRadius: 16,
    opacity: 0.5,
  },
});
