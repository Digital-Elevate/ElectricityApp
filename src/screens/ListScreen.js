import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { database, ref } from '../firebaseConfig';
import { onValue } from 'firebase/database';

const ListScreen = ({ navigation }) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const locationsRef = ref(database, '/locations');
    const unsubscribe = onValue(locationsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const fetchedLocations = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));
      setLocations(fetchedLocations);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>Address: {item.address}</Text>
      <Text>Status: {item.status ? 'ON' : 'OFF'}</Text>
    </View>
  );

  return (
    <FlatList
      data={locations}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#f9c2ff',
    borderRadius: 5,
  },
});

export default ListScreen;
