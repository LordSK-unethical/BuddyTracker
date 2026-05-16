import { useState, useRef, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { useAuth } from '@/src/context/AuthContext';
import { useGroup } from '@/hooks/useGroup';
import { updateLocation, clearLocation } from '@/services/locationService';

export function useTracking() {
  const { user, userData } = useAuth();
  const { group, isInGroup } = useGroup();
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!isInGroup && tracking) {
      locationSub.current?.remove();
      locationSub.current = null;
      setTracking(false);
    }
  }, [isInGroup]);

  const startTracking = useCallback(async () => {
    if (!group || !user || !userData) return;
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Location permission denied');
      return;
    }

    locationSub.current?.remove();

    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 15000,
        distanceInterval: 10,
      },
      async (loc) => {
        try {
          await updateLocation(
            group.id,
            user.uid,
            userData.username,
            loc.coords.latitude,
            loc.coords.longitude
          );
        } catch (e) {
          console.error('Location update failed', e);
        }
      }
    );

    setTracking(true);
  }, [group, user, userData]);

  const stopTracking = useCallback(async () => {
    locationSub.current?.remove();
    locationSub.current = null;
    setTracking(false);
    if (group && user) {
      await clearLocation(group.id, user.uid);
    }
  }, [group, user]);

  return { tracking, startTracking, stopTracking, error };
}
