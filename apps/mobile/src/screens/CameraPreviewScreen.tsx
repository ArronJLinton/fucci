import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Text,
} from 'react-native';
<<<<<<< HEAD
import { Camera, CameraView } from 'expo-camera';
import type { PermissionResponse } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, RootStackParamList } from '../types/navigation';
=======
import {useVideoPlayer, VideoView} from 'expo-video';
import {Camera, CameraView} from 'expo-camera';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import IconComponent from 'react-native-vector-icons/Ionicons';
const IconComponentComponent = IconComponent as any;
import type {
  NavigationProp,
  RootStackParamList,
  MediaType,
} from '../types/navigation';
>>>>>>> f0663344 (migrating to expo ...)

type FacingMode = 'front' | 'back';
type FlashMode = 'off' | 'on' | 'auto';

type CameraPreviewScreenRouteProp = RouteProp<
  RootStackParamList,
  'CameraPreview'
>;

const CameraPreviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CameraPreviewScreenRouteProp>();
  const { onPhotoCapture } = route.params;

<<<<<<< HEAD
  const [permission, setPermission] = useState<PermissionResponse | null>(null);
  const [facing, setFacing] = useState<FacingMode>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      const resp = await Camera.requestCameraPermissionsAsync();
      setPermission(resp);
    })();
  }, []);

  const requestPermission = async () => {
    const resp = await Camera.requestCameraPermissionsAsync();
    setPermission(resp);
  };

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) {
          setCapturedImage(photo.uri);
          setIsProcessing(true);
          setTimeout(() => {
            setIsProcessing(false);
            if (onPhotoCapture) {
              onPhotoCapture(photo.uri, 'photo');
            }
            navigation.goBack();
          }, 1000);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      } finally {
        setIsCapturing(false);
      }
=======
  // Camera states
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>(
    'back',
  );
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [zoom, setZoom] = useState(1);
  const camera = useRef<CameraView>(null);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusCoordinates, setFocusCoordinates] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressing = useRef(false);

  // Preview states
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayer = useVideoPlayer(previewUri || '', player => {
    player.loop = true;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressBarWidth, setProgressBarWidth] = useState(300);

  // Setup zoom pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, {dy}) => {
        // Convert vertical pan gesture to zoom level
        // Moving up increases zoom, moving down decreases
        const zoomFactor = Math.max(1, zoom - dy / 200);
        handleZoom(zoomFactor);
      },
    }),
  ).current;

  useEffect(() => {
    const checkPermission = async () => {
      const {status} = await Camera.getCameraPermissionsAsync();
      if (status !== 'granted') {
        const {status: newStatus} =
          await Camera.requestCameraPermissionsAsync();
        setHasPermission(newStatus === 'granted');
      } else {
        setHasPermission(true);
      }
    };
    checkPermission();
  }, []);

  useEffect(() => {
    StatusBar.setHidden(true);
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const handleFocus = useCallback(async (event: any) => {
    const {pageX, pageY} = event.nativeEvent;
    const focusPoint = {
      x: pageX,
      y: pageY,
    };

    setFocusCoordinates(focusPoint);
    setIsFocusing(true);

    // Hide focus indicator after 1 second
    setTimeout(() => {
      setIsFocusing(false);
      setFocusCoordinates(null);
    }, 1000);
  }, []);

  const startRecordingTimer = useCallback(() => {
    setRecordingDuration(0);
    recordingTimer.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopRecordingTimer = useCallback(() => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current as unknown as number);
      recordingTimer.current = null;
>>>>>>> f0663344 (migrating to expo ...)
    }
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'off';
      }
    });
<<<<<<< HEAD
  };

  const getFlashIcon = () => {
    switch (flash) {
      case 'off':
        return 'flash-off';
      case 'on':
        return 'flash';
      case 'auto':
        return 'flash-outline';
      default:
        return 'flash-off';
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
=======
    Vibration.vibrate(50);
  }, []);

  const toggleGrid = useCallback(() => {
    setIsGridVisible(prev => !prev);
    Vibration.vibrate(50);
  }, []);

  const handleZoom = useCallback((value: number) => {
    setZoom(Math.max(1, Math.min(value, 10)));
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (camera.current) {
        console.log('Starting recording...');
        setIsRecording(true);
        startRecordingTimer();
        Vibration.vibrate([0, 100, 50, 100]);
        await camera.current.recordAsync();
      }
    } catch (recordingError) {
      console.error('Start recording error:', recordingError);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
      stopRecordingTimer();
    }
  }, [startRecordingTimer, stopRecordingTimer]);

  const stopRecording = useCallback(async () => {
    try {
      console.log('Stopping recording...');
      if (camera.current && isRecording) {
        camera.current.stopRecording();
        console.log('Recording stopped');
        setIsRecording(false);
        stopRecordingTimer();
        Vibration.vibrate(200);
        // Note: In expo-camera, we need to handle video recording differently
        // For now, we'll just stop recording without preview
      }
    } catch (recordingError) {
      console.error('Stop recording error:', recordingError);
    } finally {
      setIsRecording(false);
      stopRecordingTimer();
    }
  }, [isRecording, stopRecordingTimer]);

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setIsLoading(false);
  };

  const handleImageError = (imageError: any) => {
    console.error('Image loading error:', imageError.nativeEvent.error);
    setError('Failed to load image');
    setIsLoading(false);
  };

  const handleCapture = useCallback(async () => {
    try {
      setIsLoading(true);
      Vibration.vibrate(100);
      if (camera.current) {
        const photo = await camera.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo?.uri) {
          console.log('Camera captured photo URI:', photo.uri);
          setPreviewUri(photo.uri);
          setMediaType('photo');
        }
      }
    } catch (captureError) {
      console.error('Camera capture error:', captureError);
      Alert.alert('Error', 'Failed to take photo');
      setIsLoading(false);
    }
  }, []);

  const handleCapturePress = useCallback(() => {
    console.log('Capture press started');
    isLongPressing.current = false;

    // Start a timer to detect long press
    longPressTimeout.current = setTimeout(() => {
      console.log('Long press detected, starting recording');
      isLongPressing.current = true;
      startRecording();
    }, 500);
  }, [startRecording]);

  const handleCaptureRelease = useCallback(() => {
    console.log('Capture released');

    // If it was a short press (not recording), take a photo
    if (!isLongPressing.current) {
      handleCapture();
    }

    // Clear the long press timer
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    // If we were recording, stop
    if (isRecording) {
      stopRecording();
    }
  }, [isRecording, stopRecording, handleCapture, isLongPressing]);

  const toggleCameraPosition = useCallback(() => {
    setCameraPosition(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  const handleRetake = () => {
    console.log('Retake pressed');
    setPreviewUri(null);
    setMediaType('photo');
    setError(null);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleAccept = () => {
    if (previewUri) {
      console.log('Accept pressed with URI:', previewUri, 'type:', mediaType);
      navigation.goBack();
      onPhotoCapture(previewUri, mediaType);
    }
  };

  const handleVideoProgress = () => {
    if (videoPlayer) {
      setCurrentTime(videoPlayer.currentTime);
      setVideoDuration(videoPlayer.duration);
    }
  };

  const handleVideoLoad = () => {
    console.log('Video loaded');
    setIsLoading(false);
  };

  const handleVideoError = (videoError: any) => {
    console.error('Video loading error:', videoError);
    setError('Failed to load video');
    setIsLoading(false);
  };

  const togglePlayPause = () => {
    if (videoPlayer) {
      if (isPlaying) {
        videoPlayer.pause();
      } else {
        videoPlayer.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoPlayer) {
      videoPlayer.currentTime = time;
    }
  };

  const handleClose = () => {
    StatusBar.setHidden(false);
    navigation.goBack();
  };

  if (!hasPermission) {
    return null;
  }

  if (previewUri) {
    // Preview mode
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <TouchableOpacity style={styles.closeButton} onPress={handleRetake}>
          <IconComponent name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {mediaType === 'photo' ? (
            <>
              <Image
                source={{uri: previewUri}}
                style={styles.previewImage}
                onError={handleImageError}
                onLoad={handleImageLoad}
                resizeMode="contain"
              />
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              )}
            </>
          ) : (
            <Pressable style={styles.videoContainer} onPress={togglePlayPause}>
              <VideoView
                player={videoPlayer}
                style={styles.previewVideo}
                nativeControls={false}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />
              {!isPlaying && (
                <View style={styles.playButtonOverlay}>
                  <IconComponent name="play" size={50} color="#fff" />
                </View>
              )}
            </Pressable>
          )}

          {error && (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Retake Button */}
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={handleRetake}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <View style={styles.retakeButtonInner}>
            <IconComponent name="close" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        {mediaType === 'video' && (
          <View style={styles.videoControls}>
            <Text style={styles.timeText}>
              {formatDuration(Math.floor(currentTime))} /{' '}
              {formatDuration(Math.floor(videoDuration))}
            </Text>
            <Pressable
              style={styles.videoProgressBar}
              onPress={(event: GestureResponderEvent) => {
                const {pageX} = event.nativeEvent;
                const progress = Math.max(
                  0,
                  Math.min(1, pageX / progressBarWidth),
                );
                handleSeek(progress * videoDuration);
              }}
              onLayout={(event: LayoutChangeEvent) => {
                setProgressBarWidth(event.nativeEvent.layout.width);
              }}>
              <View style={styles.progressBackground} />
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      100,
                      (currentTime / videoDuration) * 100,
                    )}%`,
                  },
                ]}
              />
            </Pressable>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}>
            <Text style={[styles.buttonText, styles.acceptText]}>
              Add to Story
            </Text>
          </TouchableOpacity>
        </View>
>>>>>>> f0663344 (migrating to expo ...)
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
<<<<<<< HEAD
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Ionicons name={getFlashIcon()} size={30} color="white" />
            </TouchableOpacity>
=======
      <Pressable
        style={styles.cameraContainer}
        onPress={handleFocus}
        {...panResponder.panHandlers}>
        <CameraView
          ref={camera}
          style={StyleSheet.absoluteFill}
          facing={cameraPosition}
          flash={flash}
          zoom={zoom}
        />
        {isGridVisible && (
          <View style={styles.gridOverlay}>
            <View style={[styles.gridRow, {top: '33.33%'}]} />
            <View style={[styles.gridRow, {top: '66.66%'}]} />
            <View style={[styles.gridColumn, {left: '33.33%'}]} />
            <View style={[styles.gridColumn, {left: '66.66%'}]} />
>>>>>>> f0663344 (migrating to expo ...)
          </View>

<<<<<<< HEAD
          <View style={styles.bottomControls}>
            <View style={styles.bottomRow}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleFacing}
              >
                <Ionicons name="camera-reverse" size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isCapturing && styles.capturingButton,
                ]}
                onPress={takePicture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>

              <View style={styles.controlButton} />
            </View>
          </View>
=======
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <IconComponent name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.topRightControls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <IconComponent
              name={
                flash === 'off'
                  ? 'flash-off'
                  : flash === 'on'
                  ? 'flash'
                  : 'flash-auto'
              }
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={toggleGrid}>
            <IconComponent
              name={isGridVisible ? 'grid' : 'grid-outline'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraPosition}>
            <IconComponent name="camera-reverse" size={24} color="#fff" />
          </TouchableOpacity>
>>>>>>> f0663344 (migrating to expo ...)
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  capturingButton: {
    backgroundColor: '#007AFF',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraPreviewScreen;
