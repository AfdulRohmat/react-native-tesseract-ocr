import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Button, ScrollView, MaximumOneOf } from 'react-native';
import { launchCamera, launchImageLibrary, MediaType, PhotoQuality } from 'react-native-image-picker';
import TesseractOcr, { useEventListener } from '@devinikhiya/react-native-tesseractocr';
import { removeBackground } from 'react-native-background-remover';

const ImageProcessingScreen = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [numberSIMPattern, setNumberSIMPattern] = useState(null)
    const [namePattern, setNamePattern] = useState(null)
    const [loadingProcessImage, setLoadingProcessImage] = useState(false)
    const [ocrResult, setOcrResult] = useState("")
    const [loading, setLoading] = useState(false)


    const handleGetImage = async (isCamera: boolean, getFromGallery: boolean) => {
        const options = {
            mediaType: isCamera ? 'photo' : 'video' as MediaType,
            quality: 1 as PhotoQuality
        };

        try {
            const response = getFromGallery ? await launchImageLibrary(options) : await launchCamera(options);

            if (getFromGallery) {
                const dataImage = response.assets[0].uri;
                setSelectedImage(dataImage);
            } else {
                const dataImage = response.assets[0].originalPath;
                setSelectedImage(dataImage);
            }


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

            const noSimPattern = findSIMNumberPattern(recognizedText);
            setNumberSIMPattern(noSimPattern)

            const namePattern = findNamePattern(recognizedText)
            setNamePattern(namePattern)
        } catch (error) {
            // error is [Error: java.io.FileNotFoundException: tessdata/eng.traineddata]
            console.log('error is', error);
        }
        setLoading(false)
    };

    const findSIMNumberPattern = (text: string): string | null => {
        const pattern = /\b(\w-\d{4}-\d{4}-\d{5}|\d{4}-\d{4}-\d{6})\b/;
        const match = text.match(pattern);
        return match ? match[0] : null;
    };

    const findNamePattern = (text: string): string | null => {
        const pattern = /1[.\s]\s[A-Z]{2}.*\n/;
        const match = text.match(pattern);
        return match ? match[0] : null;
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
                    <View style={styles.buttonsRow}>
                        <TouchableOpacity onPress={() => handleGetImage(true, false)} style={styles.uploadButton}>
                            <Text>Take Image</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleGetImage(true, true)} style={styles.uploadButton}>
                            <Text>Upload Image</Text>
                        </TouchableOpacity>
                    </View>



                    {/* 
                        <Button title="Remove BG" onPress={() => handleRemoveBackground()} />
                        <Button title="Make Contrast" onPress={handleGrayscale} />
                    </View> */}

                    <Button title="Process Image" onPress={() => handleProcessImage()} />

                    <View style={styles.textContainer}>
                        <Text style={styles.text}>
                            {ocrResult}
                        </Text>
                    </View>

                    {/* SIM NUMBER PATTER */}
                    <View style={styles.textContainer}>
                        <Text style={styles.text}>
                            NO SIM: {numberSIMPattern}
                        </Text>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.text}>
                            NAMA : {namePattern}
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
        resizeMode: 'contain',
    },
    uploadButton: {
        padding: 10,
        backgroundColor: 'lightblue',
        borderRadius: 5,
        marginBottom: 16
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
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
