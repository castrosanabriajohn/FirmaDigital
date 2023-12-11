import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DocumentExplorer from '../screens/home/index';
import FileViewerScreen from '../screens/documents/index';

const Stack = createStackNavigator();

const MyStack = () => {
    return (
        <Stack.Navigator initialRouteName='Home' screenOptions={{
            headerShown: true, 
            headerTitleAlign: 'center',
        }}>
            <Stack.Screen name='Document Explorer' component={DocumentExplorer} />
            <Stack.Screen name='FileViewer' component={FileViewerScreen} />
        </Stack.Navigator>
    );
};

export default MyStack;
