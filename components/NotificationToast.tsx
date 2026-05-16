import { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useGroupStore, Notification } from '@/store/groupStore';

const AUTO_DISMISS_MS = 3500;

export function NotificationToast() {
  const notifications = useGroupStore((s) => s.notifications);
  const dismiss = useGroupStore((s) => s.dismissNotification);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const ids = new Set(notifications.map((n) => n.id));

    for (const [id, timer] of timers.current) {
      if (!ids.has(id)) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
    }

    for (const n of notifications) {
      if (timers.current.has(n.id)) continue;
      const timer = setTimeout(() => dismiss(n.id), AUTO_DISMISS_MS);
      timers.current.set(n.id, timer);
    }

    return () => {
      for (const [, timer] of timers.current) clearTimeout(timer);
    };
  }, [notifications, dismiss]);

  if (notifications.length === 0) return null;

  const latest = notifications[notifications.length - 1];
  const isError = latest.type === 'delete';

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.container, isError && styles.error]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => dismiss(latest.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>{latest.message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  error: {
    borderColor: '#ff4444',
    backgroundColor: '#2a1111',
  },
  touchable: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
