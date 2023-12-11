import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';

const FileViewerScreen = () => {

    

    return (
        <View style={{ flex: 1 }}>

            <TouchableOpacity style={styles.buttonoptions}
                onPress={() => {
                    
                }}>
                <Text style={{ color: '#fff', fontSize: 30 }}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonoptions: {
        position: 'absolute',
        top: '80%',
        left: 10,
        botton: 10,
        backgroundColor: '#000',
        width: 80,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default FileViewerScreen;