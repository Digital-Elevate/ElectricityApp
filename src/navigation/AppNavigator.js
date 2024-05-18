import React, { Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

// Utiliser lazy pour charger les composants au besoin
const HomeScreen = lazy(() => import('../screens/HomeScreen'));
const ListScreen = lazy(() => import('../screens/ListScreen'));

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="List" component={ListScreen} />
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
};

export default AppNavigator;
