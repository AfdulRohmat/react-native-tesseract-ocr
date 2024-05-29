import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Button, ScrollView } from 'react-native';
import { launchCamera, MediaType } from 'react-native-image-picker';
import TesseractOcr, { useEventListener } from '@devinikhiya/react-native-tesseractocr';
import { removeBackground } from 'react-native-background-remover';

const ImageProcessingScreen = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loadingProcessImage, setLoadingProcessImage] = useState(false)
    const [ocrResult, setOcrResult] = useState("")
    const [loading, setLoading] = useState(false)


    const handleCameraLaunch = async (isCamera: boolean) => {
        const options = {
            mediaType: isCamera ? 'photo' : 'video' as MediaType,
        };

        try {
            const response = await launchCamera(options);
            const dataImage = response.assets[0].originalPath;
            setSelectedImage(dataImage);

            console.log('pickedFile', response);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleRemoveBackground = async () => {
        setLoading(true);
        try {
            const backgroundRemovedImageURI = await removeBackground(selectedImage);
            setSelectedImage(backgroundRemovedImageURI);

            console.log('backgroundRemovedImageURI', backgroundRemovedImageURI);
        } catch (error) {
            console.error('Error backgroundRemovedImageURI:', error);
        }

        setLoading(false)

    };

    const handleGrayscale = () => {
        // Implement grayscale functionality here
    };

    const handleProcessImage = async () => {
        setLoading(true);

        try {
            const recognizedText = await TesseractOcr.recognize(selectedImage, 'ind', {});
            console.log('test is', recognizedText);
            setOcrResult(recognizedText);
        } catch (error) {
            // error is [Error: java.io.FileNotFoundException: tessdata/eng.traineddata]
            console.log('error is', error);
        }
        setLoading(false)
    };

    return (
        <ScrollView>
            {loading ? <View>
                <Text style={styles.text}>Loading</Text>
            </View> : (
                <View style={styles.container}>
                    <View style={styles.imageContainer}>
                        {
                            selectedImage ? <Image source={{ uri: selectedImage }} style={styles.image} /> : (
                                <View></View>
                            )
                        }
                    </View>

                    <TouchableOpacity onPress={() => handleCameraLaunch(true)} style={styles.uploadButton}>
                        <Text>Upload Image</Text>
                    </TouchableOpacity>

                    <View style={styles.buttonsRow}>
                        <Button title="Remove BG" onPress={() => handleRemoveBackground()} />
                        <Button title="Grayscale" onPress={handleGrayscale} />
                    </View>

                    <Button title="Process Image" onPress={() => handleProcessImage()} />

                    <View style={styles.textContainer}>
                        <Text style={styles.text}>
                            {ocrResult}
                        </Text>
                    </View>

                </View >
            )}

        </ScrollView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    imageContainer: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    image: {
        flex: 1,
        width: undefined,
        height: undefined,
        resizeMode: 'cover',
    },
    uploadButton: {
        padding: 10,
        backgroundColor: 'lightblue',
        borderRadius: 5,
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    textContainer: {
        marginTop: 20,
        borderWidth: 1,
        padding: 10,
        width: '100%',
    },
    text: {
        fontSize: 16,
    },
});

export default ImageProcessingScreen;
