import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { database, ref, onValue, push, set, update } from '../firebaseConfig';
import Geocoder from '../geocodingConfig';

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [electricityStatus, setElectricityStatus] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchLocationAndAddress = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        const geocode = await Geocoder.from(location.coords.latitude, location.coords.longitude);
        const address = geocode.results[0].formatted_address;
        setAddress(address);
        console.log('Address:', address); // Log address to check if it's correctly fetched
      } catch (error) {
        console.error('Error fetching location or address:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndAddress();

    const locationsRef = ref(database, '/locations');
    const unsubscribe = onValue(locationsRef, (snapshot) => {
      const data = snapshot.val() || {};
      console.log('Firebase data:', data); // Log Firebase data
      const fetchedMarkers = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));
      setMarkers(fetchedMarkers);
    }, (error) => {
      console.error('Error fetching Firebase data:', error);
    });

    return () => {
      console.log('Removing Firebase listener');
      unsubscribe();
    };
  }, []);

  const handleStatusChange = useCallback(async (status) => {
    setElectricityStatus(status);
    setUpdatingStatus(true);
    try {
      if (address) {
        const locationsRef = ref(database, '/locations');
        onValue(locationsRef, (snapshot) => {
          const data = snapshot.val() || {};
          const addressKey = Object.keys(data).find(key => data[key].address === address);

          if (addressKey) {
            update(ref(database, `/locations/${addressKey}`), { status: status }).finally(() => {
              setUpdatingStatus(false);
            });
          } else {
            const newRef = push(locationsRef);
            set(newRef, {
              address: address,
              latitude: location.latitude,
              longitude: location.longitude,
              status: status,
            }).finally(() => {
              setUpdatingStatus(false);
            });
          }
        });
      } else {
        console.log('Address is not set');
        setUpdatingStatus(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setUpdatingStatus(false);
    }
  }, [address, location]);

  const memoizedMarkers = useMemo(() => markers.map(marker => (
    <Marker
      key={marker.id}
      coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
      title={marker.address}
      pinColor={marker.status ? 'green' : 'red'}
    />
  )), [markers]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {location && (
            <MapView style={styles.map} initialRegion={location}>
              {memoizedMarkers}
            </MapView>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => handleStatusChange(true)} disabled={updatingStatus}>
              <Text style={styles.buttonText}>Electricity ON</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleStatusChange(false)} disabled={updatingStatus}>
              <Text style={styles.buttonText}>Electricity OFF</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.listButton} onPress={() => navigation.navigate('List')} disabled={updatingStatus}>
            <Text style={styles.buttonText}>View List</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0000ff',
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listButton: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ff0000',
    borderRadius: 5,
  },
});

export default HomeScreen;
