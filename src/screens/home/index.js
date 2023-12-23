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
    ScrollView,
    Image,
    Linking,
    Alert
} from 'react-native';
import {
    getStorage,
    ref,
    listAll,
    uploadString,
    deleteObject,
    getDownloadURL,
    move,
    uploadBytes,
    uploadBytesResumable
} from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import { appfirebase } from '../../storage/firestorage';
import * as Print from 'expo-print';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { TextEncoder } from 'text-encoding';

import * as MediaLibrary from 'expo-media-library';

const DocumentExplorer = () => {
    const [currentPath, setCurrentPath] = useState('/');
    const [contents, setContents] = useState([]);
    const [newDirectoryName, setNewDirectoryName] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [numColumns, setNumColumns] = useState(2);
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [isDocumentPickerOpen, setDocumentPickerOpen] = useState(false);
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [selectedDocumentPath, setSelectedDocumentPath] = useState(null);
    const [showDocument, setShowDocument] = useState(false);
    const Almacenamiento = getStorage(appfirebase);
    const [uploadProgress, setUploadProgress] = useState(null);

    useEffect(() => {
        listContents(currentPath);
    }, [currentPath]);

    const listContents = async (path) => {
        try {
            const storageRef = ref(Almacenamiento, path);
            const result = await listAll(storageRef);

            const contentDetails = await Promise.all(
                result.items.map(async (itemRef) => {
                    const name = itemRef.name;
                    const isDirectory = !name.includes('.'); // Si no tiene un punto en el nombre, se considera un directorio

                    return { name, isDirectory };
                })
            );

            setContents(contentDetails);
        } catch (error) {
            console.error('Error listing contents:', error);
        }
    };


    const createDirectory = async () => {
        if (newDirectoryName.trim() !== '') {
            try {
                const newDirPath = `${currentPath}/${newDirectoryName}/`; // Add a trailing slash for Firebase Storage path
                const newDirRef = ref(Almacenamiento, newDirPath);

                // Create a placeholder file inside the folder to simulate its existence
                await uploadString(newDirRef, '');

                setNewDirectoryName('');
                listContents(currentPath);
            } catch (error) {
                console.error('Error creating directory:', error);
            }
        } else {
            console.error('Error creating directory: Name is empty');
        }
    };

    const createPDF = async (newFileName) => {
        const pdfFileName = `${newFileName}.pdf`;

        const htmlContent = `
            <html>
                <body>
                    <h1>Hello, this is a PDF!</h1>
                    <p>You can put your content here.</p>
                </body>
            </html>
        `;

        try {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });

            if (Platform.OS === 'ios') {
                try {
                    await MediaLibrary.saveToLibraryAsync(uri);

                    // Upload the PDF to Firebase Storage
                    const response = await fetch(uri);
                    const blob = await response.blob();

                    // Build the reference to the current directory in Firebase Storage
                    const storageRef = ref(Almacenamiento, `${currentPath}/${pdfFileName}`);

                    // Upload the PDF to Firebase Storage
                    await uploadBytes(storageRef, blob);

                    console.log(`PDF '${pdfFileName}' uploaded successfully to Firebase Storage in '${currentPath}'`);
                    listContents(currentPath);

                } catch (error) {
                    console.error('Error uploading or saving PDF:', error);
                    Alert.alert('Error', 'Failed to upload or save PDF file.');
                }
            } else {
                try {
                    await FileSystem.copyAsync({ from: uri, to: FileSystem.documentDirectory + pdfFileName });

                    // Subir el archivo PDF a Firebase Storage en el directorio actual (currentPath)
                    const response = await fetch(uri);
                    const blob = await response.blob();

                    // Construye la referencia al directorio actual
                    const storageRef = ref(Almacenamiento, `${currentPath}/${pdfFileName}`);

                    // Sube el archivo PDF al directorio actual
                    await uploadBytes(storageRef, blob);

                    console.log(`PDF '${pdfFileName}' uploaded successfully to Firebase Storage in '${currentPath}'`);
                    listContents(currentPath);

                } catch (error) {
                    console.error('Error uploading or saving PDF:', error);
                    Alert.alert('Error', 'Failed to upload or save PDF file.');
                }
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
        }

    };

    const createWord = async () => {
        try {
            if (newFileName !== '') {
                const wordFileName = `${newFileName}.docx`;
                const wordFilePath = `${currentPath}/${wordFileName}`;
    
                // Generate Word content (using XML)
                const wordContent = `
                    <?xml version="1.0" encoding="UTF-8"?>
                    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                        <w:body>
                            <w:p>
                                <w:r>
                                    <w:t>Hello, this is a Word document!</w:t>
                                </w:r>
                            </w:p>
                            <w:p>
                                <w:r>
                                    <w:t>This is a sample paragraph.</w:t>
                                </w:r>
                            </w:p>
                        </w:body>
                    </w:document>
                `;
    
                // Use TextEncoder from text-encoding library
                const textEncoder = new TextEncoder();
    
                // Upload the Word file to Firebase Storage
                await uploadBytes(ref(Almacenamiento, wordFilePath), textEncoder.encode(wordContent), {
                    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                });
    
                // Get the download URL for the Word file
                const downloadURL = await getDownloadURL(ref(Almacenamiento, wordFilePath));
    
                console.log('Word created and stored successfully. Download URL:', downloadURL);
    
                listContents(currentPath);
                setNewFileName('');
            } else {
                console.error('Error creating Word: Name is empty');
            }
        } catch (error) {
            console.error('Error creating and storing Word:', error);
        }
    };

    const createExcel = async () => {
        try {
            if (newFileName !== '') {
                const excelFileName = `${newFileName}.xlsx`;
                const excelFilePath = `${currentPath}/${excelFileName}`;
    
                // Create Excel content (you can adjust the content as needed)
                const excelContent = 'Sample excel content';
    
                // Upload the Excel file to Firebase Storage
                await uploadBytes(ref(Almacenamiento, excelFilePath), new TextEncoder().encode(excelContent), {
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
    
                // Get the download URL for the Excel file
                const downloadURL = await getDownloadURL(ref(Almacenamiento, excelFilePath));
    
                console.log('Excel created and stored successfully. Download URL:', downloadURL);
    
                listContents(currentPath);
                setNewFileName('');
            } else {
                console.error('Error creating Excel: Name is empty');
            }
        } catch (error) {
            console.error('Error creating and storing Excel:', error);
        }
    };

    const createPowerPoint = async () => {
        try {
            if (newFileName !== '') {
                const pptFileName = `${newFileName}.pptx`;
                const pptFilePath = `${currentPath}/${pptFileName}`;
    
                // Create PowerPoint content (you can adjust the content as needed)
                const pptContent = 'Sample ppt content';
    
                // Upload the PowerPoint file to Firebase Storage
                await uploadBytes(ref(Almacenamiento, pptFilePath), new TextEncoder().encode(pptContent), {
                    contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                });
    
                // Get the download URL for the PowerPoint file
                const downloadURL = await getDownloadURL(ref(Almacenamiento, pptFilePath));
    
                console.log('PowerPoint created and stored successfully. Download URL:', downloadURL);
    
                listContents(currentPath);
                setNewFileName('');
            } else {
                console.error('Error creating PowerPoint: Name is empty');
            }
        } catch (error) {
            console.error('Error creating and storing PowerPoint:', error);
        }
    };

    const createText = async () => {
        try {
            if (newFileName !== '') {
                const textFileName = `${newFileName}.txt`;
                const textFilePath = `${currentPath}/${textFileName}`;
    
                // Create text content (you can adjust the content as needed)
                const textContent = 'Sample text content';
    
                // Upload the text file to Firebase Storage
                await uploadBytes(ref(Almacenamiento, textFilePath), new TextEncoder().encode(textContent), {
                    contentType: 'text/plain',
                });
    
                // Get the download URL for the text file
                const downloadURL = await getDownloadURL(ref(Almacenamiento, textFilePath));
    
                console.log('Text created and stored successfully. Download URL:', downloadURL);
    
                listContents(currentPath);
                setNewFileName('');
            } else {
                console.error('Error creating text: Name is empty');
            }
        } catch (error) {
            console.error('Error creating and storing Text:', error);
        }
    };

    const uploadFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*'});

            if (result.type === 'success') {
                const response = await fetch(result.uri);
                const blob = await response.blob();

                const fileName = result.name || 'unnamed';

                // Construye la referencia al directorio actual
                const storageRef = ref(Almacenamiento, `${currentPath}/${fileName}`);

                // Sube el archivo al directorio actual
                const uploadTask = uploadBytesResumable(storageRef, blob);

                // Escucha los cambios en el progreso de la carga
                uploadTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                });

                // Espera a que la carga se complete
                await uploadTask;

                // Obtiene la URL de descarga del archivo
                const downloadURL = await getDownloadURL(storageRef);

                console.log(`File '${fileName}' uploaded successfully to Firebase Storage`);
                console.log('Download URL:', downloadURL);
            } else {
                console.log('No file selected');
            }
        } catch (error) {
            console.error('Error uploading or saving PDF:', error);
            Alert.alert('Error', 'Failed to upload or save PDF file.');
        }
    };


    const editItem = async (oldName, newName) => {
        try {
            const oldPath = `${currentPath}/${oldName}`;
            const newPath = `${currentPath}/${newName}`;

            const storageRef = ref(storage, oldPath);
            const newStorageRef = ref(storage, newPath);

            // Mover el archivo o directorio a la nueva ubicación (renombrar)
            await move(storageRef, newStorageRef);

            // Actualizar la lista después de la edición
            listContents(currentPath);
        } catch (error) {
            console.error(`Error editing ${oldName}:`, error);
        }
    };

    const downloadFile = async (fileName) => {
        try {

            const filePath = `${currentPath}/${fileName}`;

            const fileRef = ref(Almacenamiento, filePath);

            // Obtén el enlace de descarga del archivo
            const downloadURL = await getDownloadURL(fileRef);

            // Abre el enlace utilizando Linking
            await Linking.openURL(downloadURL);

        } catch (error) {
            console.error('Error al descargar y abrir el archivo:', error);
        }
    }


    const openFile = async (fileName) => {
        try {
            const filePath = `${currentPath}/${fileName}`;
            const fileExtension = fileName.split('.').pop();
            console.log('Opening file:', filePath);

            if (fileExtension === 'pdf') {
                navigation.navigate('FileViewer', { filePath, fileType: 'pdf' });
            } else if (['docx', 'xlsx', 'pptx'].includes(fileExtension)) {
                navigation.navigate('FileViewer', { filePath, fileType: fileExtension });
            } else if (fileExtension === 'txt') {
                navigation.navigate('FileViewer', { filePath, fileType: 'txt' });
            } else {
                Linking.openURL(filePath);
            }
        } catch (error) {
            console.error('Error opening file:', error);
        }
    };

    const showAlert = (fileName) => {
        Alert.alert(
            'Select Action',
            `What action do you want to perform with ${fileName}?`,
            [
                {
                    text: 'Download File',
                    onPress: () => downloadFile(fileName),
                },
                {
                    text: 'Open File',
                    onPress: () => openFile(fileName),
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel'),
                    style: 'cancel',
                },
            ],
            { cancelable: false }
        );
    };

    const deleteFile = async (fileName) => {
        try {
            const filePath = `${currentPath}/${fileName}`;
            const fileRef = ref(Almacenamiento, filePath);

            // Delete the file from Firebase Storage
            await deleteObject(fileRef);

            // Update the contents list after deleting the file
            listContents(currentPath);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const deleteDirectory = async (directoryName) => {
        try {
            const directoryPath = `${currentPath}/${directoryName}/`; // Add a trailing slash for Firebase Storage path
            const directoryRef = ref(Almacenamiento, directoryPath);

            // List all items in the directory
            const items = await listAll(directoryRef);

            // Delete all items inside the directory
            await Promise.all(items.items.map(async (itemRef) => deleteObject(itemRef)));

            // Delete the directory itself
            await deleteObject(directoryRef);

            // Update the contents list after deleting the directory
            listContents(currentPath);
        } catch (error) {
            console.error('Error deleting directory:', error);
        }
    };

    const handleDeleteConfirmation = () => {
        if (itemToDelete) {
            const { isDirectory, name } = itemToDelete;
            const deleteFunction = isDirectory ? deleteDirectory : deleteFile;
            deleteFunction(name);
            setItemToDelete(null);
        }
        setConfirmationModalVisible(false);
        setShowDocument(false);
    };

    const handleLongPress = (item) => {
        setItemToDelete(item);
        setConfirmationModalVisible(true);
    };

    const handleFileAction = (item) => {
        console.log('Pressed item:', item);
        if (item.isDirectory) {
            setCurrentPath(`${currentPath}/${item.name}`);
        } else {
            showAlert(item.name);
            console.log(`Handling file: ${item.name}`);
        }
    };

    const renderDirectoryItem = ({ item }) => (
        <TouchableOpacity
            key={item.name}
            onPress={() => handleFileAction(item)}
            onLongPress={() => handleLongPress(item)}
            style={styles.directoryItemContainer}
        >
            <Text>{item.name}</Text>
        </TouchableOpacity>
    );

    const goBack = () => {
        const rootPath = '/'; // Adjust this if your root path is different

        if (currentPath === rootPath) {
            navigation.goBack();
        } else {
            // Remove the last segment from the current path to go back
            const lastSegmentIndex = currentPath.lastIndexOf('/');
            const parentPath = currentPath.substring(0, lastSegmentIndex);

            setCurrentPath(parentPath || rootPath); // Set the root path if no parent path exists
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#2c3e50" barStyle="default" />

            <ScrollView style={styles.scrollView}>
                {showDocument && (
                    <View style={styles.documentContainer}>
                        <Image source={{ uri: selectedDocumentPath }} style={styles.documentImage} />
                    </View>
                )}
                {contents.map((item) => renderDirectoryItem({ item }))}
                <TouchableOpacity style={styles.buttonadd}
                    onPress={() => {
                        setModalVisible(true);
                    }}>
                    <Text style={{ color: '#fff', fontSize: 30 }}>+</Text>
                </TouchableOpacity>
            </ScrollView>


            <View>

                <Modal transparent visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                    }}>
                    <View style={styles.blackgoundblack}>
                        <View style={styles.whitecover}>
                            <View style={{
                                flexDirection: 'row',
                                paddingRight: 11,
                                paddingLeft: 10,
                            }}>

                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        createPDF(newFileName);
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 25 }}>.PDF</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        createWord();
                                        setModalVisible(false);
                                    }}>

                                    <Text style={{ color: '#fff', fontSize: 25 }}>.Docx</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        createExcel();
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 25 }}>.Xlsx</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                paddingRight: 11,
                                paddingLeft: 10,
                            }}>
                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        createPowerPoint();
                                        setModalVisible(false);
                                    }}>

                                    <Text style={{ color: '#fff', fontSize: 25 }}>.Pptx</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        createText();
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 25 }}>.Txt</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        uploadFile();
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 25 }}>Upload</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput placeholder="Enter Name" placeholderTextColor="gray" style={{
                                width: '90%',
                                height: 50,
                                borderWidth: 1,
                                alignSelf: 'center',
                                marginTop: 30,
                                paddingLeft: 20,
                                borderRadius: 10,
                            }}
                                value={newFileName}
                                onChangeText={(text) => setNewFileName(text)}
                            ></TextInput>
                            <TouchableOpacity style={{
                                marginTop: 20,
                                alignSelf: 'center',
                                width: '90%',
                                height: 50,
                                borderRadius: 10,
                                backgroundColor: '#000',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }} onPress={() => {
                                setModalVisible(false);
                            }}>
                                <Text style={{ color: '#fff', fontSize: 30 }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal transparent visible={confirmationModalVisible} onRequestClose={() => setConfirmationModalVisible(false)}>
                    <View style={styles.blackgoundblack}>
                        <View style={styles.whitecover}>
                            <Text style={{ fontSize: 30, paddingTop: 30, textAlign: 'center' }}>Are you sure to delete: {itemToDelete?.name}?</Text>
                            <View style={{ flexDirection: 'row', marginTop: 30 }}>
                                <TouchableOpacity
                                    style={styles.buttonfiles}
                                    onPress={() => {
                                        handleDeleteConfirmation();
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 30 }}>Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.buttonfiles}
                                    onPress={() => {
                                        setItemToDelete(null);
                                        setConfirmationModalVisible(false);
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 30 }}>No</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>


            <View style={styles.footer}>
                <TouchableOpacity onPress={goBack}>
                    <Text style={styles.footerText}>Go Back</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Enter new directory name"
                    value={newDirectoryName}
                    onChangeText={(text) => setNewDirectoryName(text)}
                />
                <TouchableOpacity style={styles.button} onPress={createDirectory}>
                    <Text>Create Directory</Text>
                </TouchableOpacity>
            </View>
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
    scrollView: {
        marginBottom: 73,
    },
    directoryItemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e0e0e0',
        margin: 8,
        padding: 16,
        borderRadius: 8,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 5,
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
    footer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#fff',
    },
    footerText: {
        paddingRight: 5,
        color: 'blue', // Customize the color of the "Go Back" text
    },
    buttonadd: {
        position: 'relative',
        top: 0,
        left: 0,
        botton: 10,
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
    buttonfiles: {
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

export default DocumentExplorer;