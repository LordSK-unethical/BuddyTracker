import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { Member } from '@/services/groupService';

interface Props {
  member: Member;
  isLeader: boolean;
  index: number;
}

export function MemberListItem({ member, isLeader, index }: Props) {
  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(index * 50)}
      exiting={FadeOutDown.duration(200)}
      layout={Layout.springify().damping(16)}
      style={styles.row}
    >
      <Avatar uri={null} base64={member.avatarBase64} size={44} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {member.username}
          </Text>
          {isLeader && (
            <View style={styles.leaderBadge}>
              <Text style={styles.leaderText}>Leader</Text>
            </View>
          )}
        </View>
        <Text style={styles.status}>
          {member.tracking ? 'Sharing location' : 'Not sharing'}
        </Text>
      </View>
      <View
        style={[
          styles.dot,
          { backgroundColor: member.tracking ? '#34c759' : '#333' },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flexShrink: 1,
  },
  leaderBadge: {
    backgroundColor: '#1a2e1a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  leaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34c759',
  },
  status: {
    fontSize: 12,
    color: '#555',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
