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
    Alert
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
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
                        // Ignorar directorios no legibles
                        console.error(`Error reading ${contentPath}:`, error);
                        return null;
                    }
                })
            );

            // Filtrar directorios nulos (no legibles)
            const filteredContent = contentDetails.filter((item) => item !== null);

            setContents(filteredContent);
        } catch (error) {
            console.error('Error reading contents:', error);
        }
    };


    const createDirectory = async () => {
        try {
            const newDirPath = `${currentPath}/${newDirectoryName}`;
            console.log('New Directory Path:', newDirPath);

            // Create the new directory
            await FileSystem.makeDirectoryAsync(newDirPath);

            // Create placeholder PDF files
            /*const pdfFileNames = ['document1.pdf', 'document2.pdf', 'document3.pdf'];
            await Promise.all(
                pdfFileNames.map(async (pdfFileName) => {
                    const pdfFilePath = `${newDirPath}/${pdfFileName}`;
                    await FileSystem.writeAsStringAsync(pdfFilePath, 'Sample PDF content', {
                        encoding: FileSystem.EncodingType.UTF8,
                    });
                })
            );
            */
            setNewDirectoryName('');
            listContents(currentPath);
        } catch (error) {
            console.error('Error creating directory:', error);
        }
    };


    const createPDF = async () => {
        if (newFileName !== '') {
            try {
                const pdffileName = newFileName + '.pdf';

                const pdfFilePath = `${currentPath}/${pdffileName}`;
                await FileSystem.writeAsStringAsync(pdfFilePath, 'Sample PDF content', {
                    encoding: FileSystem.EncodingType.UTF8,
                });
                listContents(currentPath);
                setNewFileName('');

                

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
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
            });

            console.log('result', result);

            if (result.type === 'success') {
                const fileUri = result.uri;
                const fileName = result.name.trim(); // Eliminar espacios antes y después del nombre del archivo
                const fileExtension = fileName.split('.').pop(); // Utilizar split con límite de 2
                const fileToMove = `${FileSystem.documentDirectory}${fileName}`;

                console.log('fileToMove', fileToMove);
                console.log('fileUri', fileUri);
                console.log('fileName', fileName);
                console.log('fileExtension', fileExtension);

                await FileSystem.copyAsync({
                    from: fileUri,
                    to: fileToMove,
                });

                listContents(currentPath);
            }
        } catch (error) {
            onsole.error('Error uploading file:', error);
        }
    };

    const openFile = async (fileName) => {
        try {
            const filePath = `${currentPath}/${fileName}`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            const fileExtension = fileName.split('.').pop();
            console.log('Opening file:', filePath);

            if (fileExtension === 'pdf') {
                // Abrir PDF
                navigation.navigate('FileViewer', { filePath, fileUri });
            } else if (fileExtension === 'docx') {
                // Abrir Word
                navigation.navigate('FileViewer', { filePath, fileUri });
            } else if (fileExtension === 'xlsx') {
                // Abrir Excel
                navigation.navigate('FileViewer', { filePath, fileUri });
            } else if (fileExtension === 'pptx') {
                // Abrir PowerPoint
                navigation.navigate('FileViewer', { filePath, fileUri });
            } else if (fileExtension === 'txt') {
                // Abrir Texto
                navigation.navigate('FileViewer', { filePath, fileUri });
            } else {
                // Abrir otros archivos
                navigation.navigate('FileViewer', { filePath, fileUri });
            }
        } catch (error) { }
    }

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
            if (itemToDelete.isDirectory) {
                // Handle directory deletion
                deleteDirectory(itemToDelete.name);
            } else {
                // Handle file deletion
                deleteFile(itemToDelete.name);
            }
            setItemToDelete(null);
        }
        setConfirmationModalVisible(false);
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