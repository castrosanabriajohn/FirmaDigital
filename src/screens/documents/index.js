import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

const PDFViewerScreen = () => {
    useEffect(() => {
        const openPDF = async () => {
            const pdfUri = `${FileSystem.documentDirectory}generated2.pdf`; // Update with your file name
            try {
                const contentUri = await FileSystem.getContentUriAsync(pdfUri);
                await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
                    data: contentUri,
                    flags: 1,
                    type: "application/pdf",
                });
            } catch (error) {
                console.error('Error opening PDF:', error);
            }
        };

        openPDF();
    }, []);

    return (
        <View>
            <Text>PDF Viewer Screen</Text>
            {/* Add any other components or UI elements as needed */}
        </View>
    );
};

export default PDFViewerScreen;
