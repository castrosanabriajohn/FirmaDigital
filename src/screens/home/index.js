import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { DocumentPicker } from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';

const DocumentExplorer = () => {
  const [currentPath, setCurrentPath] = useState(FileSystem.documentDirectory);
  const [contents, setContents] = useState([]);
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [numColumns, setNumColumns] = useState(2);
  const navigation = useNavigation();

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
      const pdfFileNames = ['document1.pdf', 'document2.pdf', 'document3.pdf'];
      await Promise.all(
        pdfFileNames.map(async (pdfFileName) => {
          const pdfFilePath = `${newDirPath}/${pdfFileName}`;
          await FileSystem.writeAsStringAsync(pdfFilePath, 'Sample PDF content', {
            encoding: FileSystem.EncodingType.UTF8,
          });
        })
      );

      setNewDirectoryName('');
      listContents(currentPath);
    } catch (error) {
      console.error('Error creating directory:', error);
    }
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
      style={styles.directoryItemContainer}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  const goBack = () => {
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    setCurrentPath(parentPath);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2c3e50" barStyle="light-content" />
      <Text style={styles.title}>Document Explorer</Text>

      {contents.map((item) => renderDirectoryItem({ item }))}

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
    marginTop: StatusBar.currentHeight + 20 || 0,
  },
  directoryItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
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
    bottom: 0,
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
    color: 'blue', // Customize the color of the "Go Back" text
  },
});

export default DocumentExplorer;