import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Button, StyleSheet, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import Signature from 'react-native-signature-canvas';
import { appfirebase } from '../../storage/firestorage';

const FileViewer = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [signatureImage, setSignatureImage] = useState(null);
    const [documentUrl, setDocumentUrl] = useState();
    const signatureRef = useRef(null);

    const handleSignature = async (signature) => {
        // Handle the signature data
        console.log(signature);

        // Convert the signature to an image and set it
        const signatureImage = await signatureRef.current?.saveSignature();
        setSignatureImage(signatureImage);

        setModalVisible(false);
    };

    const FileUrl = 'https://firebasestorage.googleapis.com/v0/b/firma-digital-25ba6.appspot.com/o/Documentos%2FTrabajo%20de%20investigacion%20Grupal.pdf?alt=media&token=0bc431c9-31c5-42a6-bec9-82ae762f19a3';

    const handleOpenInExternalApp = async () => {
        // Intenta abrir el enlace en la aplicación por defecto para manejar archivos PDF
        try {
            const supported = await Linking.canOpenURL(FileUrl);

            if (supported) {
                await Linking.openURL(documentUrl);
            } else {
                console.error('No se puede abrir el enlace en la aplicación externa.');
            }
        } catch (error) {
            console.error('Error al abrir el enlace:', error);
        }
    };

    const handleDownload = () => {
        const url = 'https://firebasestorage.googleapis.com/v0/b/firma-digital-25ba6.appspot.com/o/Documentos%2FTrabajo%20de%20investigacion%20Grupal.pdf?alt=media&token=0bc431c9-31c5-42a6-bec9-82ae762f19a3';

        // Abre el enlace directamente en el navegador o en la aplicación por defecto para archivos PDF
        Linking.openURL(url).catch((err) => console.error('Error al abrir el enlace:', err));
    };

    const handleClear = () => {
        // Clear the signature
        signatureRef.current?.clearSignature();

        // Close the modal
        setModalVisible(false);
    };

    const handleSaveSignature = async () => {
        try {
          // Guardar el documento con la firma en Firebase Storage
          const signatureImage = await signatureRef.current?.saveSignature();
          await saveDocumentWithSignature(signatureImage);
          setModalVisible(false);
        } catch (error) {
          console.error('Error saving signature:', error);
        }
    };

    const saveDocumentWithSignature = async (signatureImage) => {
        const storageRef = appfirebase.storage().ref();
        const documentRef = storageRef.child('Documentos/FirmaDigital.pdf');
        await documentRef.putString(signatureImage, 'data_url');
        console.log('Documento con firma guardado en Firebase Storage');
    };

    return (
        <View style={styles.container}>
            {Platform.OS === 'ios' ? (
            <WebView
                source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/firma-digital-25ba6.appspot.com/o/Documentos%2FTrabajo%20de%20investigacion%20Grupal.pdf?alt=media&token=0bc431c9-31c5-42a6-bec9-82ae762f19a3' }}
                style={styles.webview}
            />
        ) : (
            <Text>Android implementation goes here</Text>
            // Aquí puedes agregar el código específico para Android
        )}
            
            
            <TouchableOpacity style={styles.buttonOptions} onPress={() => setModalVisible(true)}>
                <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttondescargar} onPress={handleDownload}>
                <Text style={styles.plusText}>↓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonAbrir} onPress={handleOpenInExternalApp}>
                <Text style={styles.plusText}>Open</Text>
            </TouchableOpacity>
            
            <Modal transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Do you want to sign the document</Text>
                        <Signature
                            ref={signatureRef}
                            onOK={handleSignature}
                            onEmpty={() => console.log('empty')}
                        />
                        <Button title="Close Sign" onPress={handleClear} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webview: {
        flex: 1,
    },
    buttonOptions: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#000',
        width: 80,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttondescargar: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#000',
        width: 80,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonAbrir: {
        position: 'absolute',
        bottom: 140,
        right: 20,
        backgroundColor: '#000',
        width: 80,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        marginTop: 0,
        width: '90%',
        height: 510,
        borderRadius: 10,
        alignSelf: 'center',
    },
    modalText: {
        fontSize: 30,
        paddingBottom: 10,
        paddingTop: 30,
        textAlign: 'center',
    },
    plusText: {
        color: '#fff',
        fontSize: 30,
    },
    signatureContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signatureImage: {
        width: 100,
        height: 50,
    },
});

export default FileViewer;