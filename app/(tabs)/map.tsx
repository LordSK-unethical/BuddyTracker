import { useState, useEffect, useRef, useCallback, lazy, Suspense, Component } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { ENV } from '@/src/config/env';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/src/context/AuthContext';
import { useGroup } from '@/hooks/useGroup';
import { subscribeToGroupLocations, LocationData } from '@/services/locationService';

const MAPTILER_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${ENV.maptilerKey}`;

const MapComponent = lazy(() =>
  Promise.all([
    import('@maplibre/maplibre-react-native'),
    new Promise((r) => setTimeout(r, 100)),
  ]).then(([{ Map, Camera, Marker }]) => {
    const Inner = (props: any) => {
      const { cameraRef, locations, group, user, selectedUid, setSelectedUid, mapReady, setMapReady } = props;
      return (
        <Map
          style={styles.map}
          mapStyle={MAPTILER_STYLE}
          onDidFinishLoadingMap={() => setMapReady(true)}
          onPress={() => setSelectedUid(null)}
        >
          <Camera ref={cameraRef} />
          {locations.map((loc: any) => {
            const member = group.members.find((m: any) => m.uid === loc.uid);
            const isCurrentUser = loc.uid === user?.uid;
            return (
              <Marker
                key={loc.uid}
                id={loc.uid}
                lngLat={[loc.longitude, loc.latitude]}
                onPress={() => setSelectedUid(loc.uid)}
              >
                <View style={[styles.marker, isCurrentUser && styles.markerSelf]}>
                  <Avatar base64={member?.avatarBase64 ?? null} size={34} />
                </View>
              </Marker>
            );
          })}
        </Map>
      );
    };
    return { default: Inner };
  })
);

class MapLibreErrorBoundary extends Component<{ children: any }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? (
      <View style={styles.centered}>
        <Text style={styles.title}>Map Unavailable</Text>
        <Text style={styles.subtitle}>Rebuild the native app with the latest config</Text>
      </View>
    ) : (
      this.props.children
    );
  }
}

function LoadingFallback() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Loading Map...</Text>
    </View>
  );
}

export default function MapScreen() {
  const { user } = useAuth();
  const { group, isInGroup } = useGroup();
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!isInGroup || !group) return;
    const unsub = subscribeToGroupLocations(
      group.id,
      (data) => setLocations(data),
      (err) => console.error('Locations subscription error', err)
    );
    return unsub;
  }, [isInGroup, group?.id]);

  const fitToLocations = useCallback(() => {
    if (locations.length === 0 || !cameraRef.current) return;

    if (locations.length === 1) {
      cameraRef.current.flyTo({
        center: [locations[0].longitude, locations[0].latitude],
        duration: 500,
      });
    } else {
      const lngs = locations.map((l) => l.longitude);
      const lats = locations.map((l) => l.latitude);
      cameraRef.current.fitBounds(
        [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)],
        { padding: { top: 80, right: 80, bottom: 80, left: 80 }, duration: 500 }
      );
    }
  }, [locations]);

  useEffect(() => {
    if (mapReady && locations.length > 0) {
      const timer = setTimeout(fitToLocations, 200);
      return () => clearTimeout(timer);
    }
  }, [mapReady, locations, fitToLocations]);

  useFocusEffect(
    useCallback(() => {
      if (mapReady) {
        const timer = setTimeout(fitToLocations, 200);
        return () => clearTimeout(timer);
      }
    }, [mapReady, fitToLocations])
  );

  if (!isInGroup || !group) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.title}>No Group</Text>
          <Text style={styles.subtitle}>Join or create a group to see the map</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.container}>
      <MapLibreErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <MapComponent
            cameraRef={cameraRef}
            locations={locations}
            group={group}
            user={user}
            selectedUid={selectedUid}
            setSelectedUid={setSelectedUid}
            mapReady={mapReady}
            setMapReady={setMapReady}
          />
        </Suspense>
      </MapLibreErrorBoundary>
      {selectedUid && (() => {
        const sel = locations.find(l => l.uid === selectedUid);
        const mem = group.members.find(m => m.uid === selectedUid);
        if (!sel || !mem) return null;
        return (
          <View style={styles.card}>
            <Text style={styles.cardName}>{mem.username}</Text>
            <Text style={styles.navBtn} onPress={() => Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${sel.latitude},${sel.longitude}`
            )}>Navigate</Text>
          </View>
        );
      })()}
      {locations.length > 0 && (
        <View style={styles.legend}>
          <Text style={styles.legendText}>
            {locations.length} location{locations.length !== 1 ? 's' : ''} shared
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  marker: {
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: '#fff',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerSelf: {
    borderColor: '#007aff',
  },
  legend: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 13,
    color: '#aaa',
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  card: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  navBtn: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007aff',
  },
});
