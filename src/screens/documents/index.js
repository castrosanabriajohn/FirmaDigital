import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    TextInput,
    StyleSheet,
    StatusBar,
    Modal,
    
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';


const FileViewerScreen = () => {

    
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    

    

    return (
        <View style={styles.container}>
            <View>
                <Modal transparent visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                    }}>
                    <View style={styles.blackgoundblack}>
                        <View style={styles.whitecover}>
                            <Text style={{ fontSize: 30, paddingTop: 30, textAlign: 'center' }}>Do you want to sign the document</Text>
                            <View style={{ flexDirection: 'row', marginTop: 30 }}>
                                <TouchableOpacity
                                    style={styles.buttonsign}
                                    onPress={() => {
                                        
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 30 }}>Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.buttonsign}
                                    onPress={() => {

                                        setModalVisible(false);
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 30 }}>No</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>

            <TouchableOpacity style={styles.buttonoptions}
                onPress={() => {
                    setModalVisible(true);  // Implement your logic here
                }}>
                <Text style={{ color: '#fff', fontSize: 30 }}>+</Text>
            </TouchableOpacity>

            




        </View>
    );


};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 0,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    buttonoptions: {
        position: 'absolute',
        top: '80%',
        left: 10,
        bottom: 10,  // Fix the typo here
        backgroundColor: '#000',
        width: 80,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    blackgoundblack: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
    },
    whitecover: {
        backgroundColor: '#fff',
        marginTop: 0, // Center the modal vertically
        width: '90%',
        height: 290,
        borderRadius: 10,
        alignSelf: 'center', // Center the modal horizontally 
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginRight: 8,
        padding: 8,
        borderRadius: 5,
    },
    buttonsign: {
        marginBottom: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        top: 20,
        backgroundColor: '#e0e0e0',
        width: '30%',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    }
});

export default FileViewerScreen;