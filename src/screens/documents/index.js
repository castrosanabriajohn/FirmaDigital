import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Button,
    StyleSheet,
} from 'react-native';
import Signature from 'react-native-signature-canvas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNCrypto from 'react-native-crypto';

const SECRET_KEY = 'tuClaveSecreta';

const FileViewerScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const signatureRef = useRef();

    useEffect(() => {
        loadStoredSignature();
    }, []);

    const handleSignature = async (signature) => {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(signature);

            // Calcular el hash SHA-256 usando react-native-crypto
            const hashedSignature = RNCrypto.createHash('sha256')
                .update(data)
                .digest('hex');

            // Guardar la firma codificada en AsyncStorage
            await AsyncStorage.setItem('encodedSignature', hashedSignature);

            // Llamar a la función de devolución de llamada con la firma codificada
            onSignatureComplete(hashedSignature);
        } catch (error) {
            console.error('Error al guardar la firma:', error);
        }
    };

    const handleClear = () => {
        signatureRef.current.clearSignature();
        clearStoredSignature();
        setModalVisible(false);
    };

    const clearStoredSignature = async () => {
        try {
            await AsyncStorage.removeItem('encodedSignature');
        } catch (error) {
            console.error('Error al borrar la firma almacenada:', error);
        }
    };

    const loadStoredSignature = async () => {
        try {
            const encodedSignature = await AsyncStorage.getItem('encodedSignature');
            // Haz algo con la firma cargada si es necesario
        } catch (error) {
            console.error('Error al cargar la firma almacenada:', error);
        }
    };

    return (
        <View style={styles.container}>

            

            <View>
                <Modal transparent visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                    }}>
                    <View style={styles.blackgoundblack}>
                        <View style={styles.whitecover}>
                            <Text style={{ fontSize: 30, paddingBottom: 10, paddingTop: 30, textAlign: 'center' }}>Do you want to sign the document</Text>
                            <Signature
                                ref={signatureRef}
                                onOK={handleSignature}
                                onEmpty={() => console.log('empty')}
                            />
                            <Button title="Close Sign" onPress={handleClear} onPress={() => setModalVisible(false)} />
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
        height: 510,
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