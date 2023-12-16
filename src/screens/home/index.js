import React, { useState, useEffect, Linking,  } from 'react';
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
    Alert,
    Image,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import Files from '../files';
//import Directory from '../directory';

const DocumentExplorer = () => {
    const [currentPath, setCurrentPath] = useState(FileSystem.documentDirectory);
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


    useEffect(() => {
        listContents(currentPath);
    }, [currentPath]);

    const listContents = async (path) => {
        try {
            const result = await FileSystem.readDirectoryAsync(path);
            const contentDetails = await Promise.all(
                result.map(async (item) => {
                    const contentPath = `${path}/${item}`;
                    try {
                        const info = await FileSystem.getInfoAsync(contentPath);
                        return { name: item, isDirectory: info.isDirectory };
                    } catch (error) {
                        console.error(`Error reading ${contentPath}:`, error);
                        return null;
                    }
                })
            );

            const filteredContent = contentDetails.filter((item) => item !== null);
            setContents(filteredContent);
        } catch (error) {
            console.error('Error reading contents:', error);
        }
    };


    const createDirectory = async () => {
        if (newDirectoryName.trim() !== '') {
            try {
                const newDirPath = `${currentPath}/${newDirectoryName}`;
                await FileSystem.makeDirectoryAsync(newDirPath);
                setNewDirectoryName('');
                listContents(currentPath);
            } catch (error) {
                console.error('Error creating directory:', error);
            }
        } else {
            console.error('Error creating directory: Name is empty');
        }
    };

    const saveFileInfoToStorage = async (fileName, filePath) => {
        try {
            const fileInfo = await AsyncStorage.getItem('fileInfo') || '{}';
            const fileInfoObject = JSON.parse(fileInfo);

            // Almacenar información del nuevo archivo
            fileInfoObject[fileName] = filePath;

            // Guardar la información actualizada
            await AsyncStorage.setItem('fileInfo', JSON.stringify(fileInfoObject));
        } catch (error) {
            console.error('Error saving file info:', error);
        }
    };

    // Función para obtener información de un archivo desde AsyncStorage
    const getFileInfoFromStorage = async (fileName) => {
        try {
            const fileInfo = await AsyncStorage.getItem('fileInfo') || '{}';
            const fileInfoObject = JSON.parse(fileInfo);

            // Obtener la información del archivo específico
            return fileInfoObject[fileName];
        } catch (error) {
            console.error('Error getting file info:', error);
            return null;
        }
    };


    const createPDF = async () => {
        if (newFileName !== '') {
            try {
                const pdffileName = newFileName + '.pdf';
                const pdfFilePath = `${currentPath}/${pdffileName}`;

                // Guardar información en AsyncStorage
                await saveFileInfoToStorage(pdffileName, pdfFilePath);

                // Resto del código...
            } catch (error) {
                console.error('Error creating pdf:', error);
            }
        } else {
            console.error('Error creating pdf: Name is empty');
        }
    };


    const createWord = async () => {
        if (newFileName !== '') {
            try {
                const wordfileName = newFileName + '.docx';

                const wordFilePath = `${currentPath}/${wordfileName}`;
                await FileSystem.writeAsStringAsync(wordFilePath, 'Sample word content', {
                    encoding: FileSystem.EncodingType.UTF8,
                });
                listContents(currentPath);
                setNewFileName('');
            } catch (error) {
                console.error('Error creating word:', error);
            }
        } else {
            console.error('Error creating word: Name is empty');
        }
    };

    const createExcel = async () => {
        if (newFileName !== '') {
            try {
                const excelfileName = newFileName + '.xlsx';

                const excelFilePath = `${currentPath}/${excelfileName}`;
                await FileSystem.writeAsStringAsync(excelFilePath, 'Sample excel content', {
                    encoding: FileSystem.EncodingType.UTF8,
                });
                listContents(currentPath);
                setNewFileName('');
            } catch (error) {
                console.error('Error creating excel:', error);
            }
        } else {
            console.error('Error creating exel: Name is empty');
        }
    };

    const createPowerPoint = async () => {
        if (newFileName !== '') {
            try {
                const pptfileName = newFileName + '.pptx';

                const pptFilePath = `${currentPath}/${pptfileName}`;
                await FileSystem.writeAsStringAsync(pptFilePath, 'Sample ppt content', {
                    encoding: FileSystem.EncodingType.UTF8,
                });
                listContents(currentPath);
                setNewFileName('');
            } catch (error) {
                console.error('Error creating ppt:', error);
            }
        } else {
            console.error('Error creating powerpoint: Name is empty');
        }
    };

    const createText = async () => {
        if (newFileName !== '') {
            try {
                const textfileName = newFileName + '.txt';

                const textFilePath = `${currentPath}/${textfileName}`;
                await FileSystem.writeAsStringAsync(textFilePath, 'Sample text content', {
                    encoding: FileSystem.EncodingType.UTF8,
                });
                listContents(currentPath);
                setNewFileName('');
            } catch (error) {
                console.error('Error creating text:', error);
            }
        } else {
            console.error('Error creating text: Name is empty');
        }
    };

    const uploadFile = async () => {
        try {
            const existingDocuments = await AsyncStorage.getItem(folder);
            let documents = existingDocuments ? JSON.parse(existingDocuments) : [];
            documents.push(document);
            await AsyncStorage.setItem(folder, JSON.stringify(documents));
        } catch (error) {
            console.error('Error saving document:', error);
        } 
    };

    const editItem = async (oldName, editFunction) => {
        const newName = await promptUserForNewName(oldName);
        if (newName && newName.trim() !== '') {
            try {
                const oldPath = `${currentPath}/${oldName}`;
                const newPath = `${currentPath}/${newName}`;
                await editFunction(oldPath, newPath);
                listContents(currentPath);
            } catch (error) {
                console.error(`Error editing ${oldName}:`, error);
            }
        } else {
            console.error('Error editing: Name is empty');
        }
    };

    const openFile = async (fileName) => {
        try {
            const filePath = `${currentPath}/${fileName}`;
            const fileExtension = fileName.split('.').pop();
            console.log('Opening file:', filePath);

            if (fileExtension === 'pdf') {
                // Abrir PDF
                navigation.navigate('FileViewer', { filePath });
            } else if (fileExtension === 'docx' || fileExtension === 'xlsx' || fileExtension === 'pptx') {
                // Abrir documentos de Word, Excel, PowerPoint
                // Utiliza react-native-doc-viewer o una biblioteca similar para manejar estos tipos de archivos
                // Puedes redirigir al visor del sistema o implementar tu propio visor
                Linking.openURL(filePath);
            } else if (fileExtension === 'txt') {
                // Abrir archivo de texto
                navigation.navigate('FileViewer', { filePath });
            } else {
                // Si no es un tipo de archivo conocido, intentar abrir con el visor del sistema
                Linking.openURL(filePath);
            }
        } catch (error) {
            console.error('Error opening file:', error);
        }
    };

    const deleteFile = async (fileName) => {
        try {
            const filePath = `${currentPath}/${fileName}`;
            await FileSystem.deleteAsync(filePath);
            listContents(currentPath);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const deleteDirectory = async (directoryName) => {
        try {
            const directoryPath = `${currentPath}/${directoryName}`;
            await FileSystem.deleteAsync(directoryPath);
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
            // Pressed a directory, enter it
            console.log('Current Path:', currentPath);
            setCurrentPath(`${currentPath}/${item.name}`);
        } else {
            // Pressed a file, handle it
            openFile(item.name);
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
        if (currentPath === FileSystem.documentDirectory) {
            navigation.goBack();
        } else {
            setCurrentPath(currentPath.substring(0, currentPath.lastIndexOf('/')));
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