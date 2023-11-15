import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DocumentExplorer from '../screens/home/index';

const Stack = createStackNavigator();

const MyStack = () => {
  return (
    <Stack.Navigator initialRouteName='Home' screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name='Home' component={DocumentExplorer} />
    </Stack.Navigator>
  );
};

export default MyStack;
