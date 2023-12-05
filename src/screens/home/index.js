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
import { DocumentPicker } from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';

const DocumentExplorer = () => {
    const [currentPath, setCurrentPath] = useState(FileSystem.documentDirectory);
    const [contents, setContents] = useState([]);
    const [newDirectoryName, setNewDirectoryName] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [numColumns, setNumColumns] = useState(2);
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        listContents(currentPath);
    }, [currentPath]);

    const listContents = async (path) => {
        try {
            const result = await FileSystem.readDirectoryAsync(path);
            const contentDetails = await Promise.all(
                result.map(async (item) => {
                    const contentPath = `${path}/${item}`;
                    const isDirectory = (await FileSystem.getInfoAsync(contentPath)).isDirectory;
                    return { name: item, isDirectory };
                })
            );
            setContents(contentDetails);
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
                copyToCacheDirectory: false,
            });
            if (result.type === 'success') {
                const { name, size, uri } = result;
                console.log('File Details:', { name, size, uri });
                const fileUri = `${currentPath}/${name}`;
                await FileSystem.copyAsync({ from: uri, to: fileUri });
                listContents(currentPath);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
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

    const handleLongPress = (item) => {
        console.log('Long pressed item:', item);
        if (item.isDirectory) {
            // Pressed a directory, enter it
            console.log('Current Path:', currentPath);
            deleteFile(item.name);
        } else {
            // Pressed a file, handle it
            console.log(`Handling file: ${item.name}`);
            deleteFile(item.name);
        }
        listContents(currentPath);
    };


    const handleFileAction = async (content) => {
        if (content.isDirectory) {
            // Pressed a directory, enter it
            console.log('Before Navigation - Current Path:', currentPath);
            setCurrentPath(`${currentPath}/${content.name}`);
            console.log('After Navigation - Current Path:', currentPath);
        } else {
            // Pressed a file, handle it
            if (content.name.endsWith('.pdf')) {
                console.log(`Handling PDF file: ${content.name}`);
                try {
                    const pdfFilePath = `${currentPath}/${content.name}`;
                    const pdfContent = await FileSystem.readAsStringAsync(pdfFilePath, {
                        encoding: FileSystem.EncodingType.UTF8,
                    });
                    console.log('PDF Content:', pdfContent);
                    // ... (rest of the code)
                } catch (error) {
                    console.error('Error reading PDF file:', error);
                }
            } else {
                console.log(`Unsupported file type: ${content.name}`);
            }
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
        try {
            const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            setCurrentPath(parentPath);
        } catch (error) {
            console.error('Error going back:', error.message, error.stack);
        }
    };

    

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#2c3e50" barStyle="default" />
            <Text style={styles.title}>Document Explorer</Text>

            {contents.map((item) => renderDirectoryItem({ item }))}



            <View style={{ flex: 1 }}>
                <TouchableOpacity style={styles.buttonadd}
                    onPress={() => {
                        setModalVisible(true);
                    }}>
                    <Text style={{ color: '#fff', fontSize: 30 }}>+</Text>
                </TouchableOpacity>
                <Modal transparent visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                    }}>
                    <View style={styles.blackgoundblack}>
                        <View style={styles.whitecover}>
                            <View style={{
                                flexDirection: 'row',
                            }}>

                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        createPDF(newFileName);
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 30 }}>.PDF</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        createWord();
                                        setModalVisible(false);
                                    }}>

                                    <Text style={{ color: '#fff', fontSize: 30 }}>.Docx</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        createExcel();
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 30 }}>.Xlsx</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                            }}>
                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        createPowerPoint();
                                        setModalVisible(false);
                                    }}>

                                    <Text style={{ color: '#fff', fontSize: 30 }}>.Pptx</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        createText();
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 30 }}>.Txt</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonfiles}
                                    onPress={() => {
                                        uploadFile();
                                        setModalVisible(false);
                                    }}>
                                    <Text style={{ color: '#fff', fontSize: 30 }}>Upload</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput placeholder="Enter Name" style={{
                                width: '90%',
                                height: 50,
                                borderWidth: 1,
                                alignSelf: 'center',
                                marginTop: 50,
                                paddingLeft: 20,
                                borderRadius: 10
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
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        marginTop: StatusBar.currentHeight + 40 || 0,
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
        position: 'absolute',
        top: 10,
        right: 0,
        botton: 0,
        backgroundColor: '#000',
        width: 50,
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
        marginTop: 0,
        width: '90%',
        height: 325,
        borderRadius: 10
    },
    buttonfiles: {
        marginBottom: 10,
        marginRight: 10,
        top: 20,
        right: 20,
        left: 15,
        backgroundColor: '#e0e0e0',
        width: 100,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    }
});

export default DocumentExplorer;