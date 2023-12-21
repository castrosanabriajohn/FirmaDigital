import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Button, StyleSheet } from 'react-native';
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

    const handleClear = () => {
        // Clear the signature
        signatureRef.current?.clearSignature();

        // Close the modal
        setModalVisible(false);
    };

    const handleSaveSignature = () => {
        // Guardar el documento con la firma en Firebase Storage
        saveDocumentWithSignature(signatureImage);
    };

    const saveDocumentWithSignature = async (signatureImage) => {
        // Aquí deberías implementar la lógica para guardar el documento con la firma en Firebase Storage
        // Puedes usar Firebase Storage SDK o la API de almacenamiento de tu elección
        // Ejemplo (usando Firebase Storage):
        // const storageRef = appfirebase.storage().ref();
        // const documentRef = storageRef.child('Documentos/FirmaDigital.pdf');
        // await documentRef.putString(signatureImage, 'data_url');
        // console.log('Documento con firma guardado en Firebase Storage');
    };

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/firma-digital-25ba6.appspot.com/o/Documentos%2FTrabajo%20de%20investigacion%20Grupal.pdf?alt=media&token=0bc431c9-31c5-42a6-bec9-82ae762f19a3' }}
                style={styles.webview}
            />

            

            <TouchableOpacity style={styles.buttonOptions} onPress={() => setModalVisible(true)}>
                <Text style={styles.plusText}>+</Text>
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