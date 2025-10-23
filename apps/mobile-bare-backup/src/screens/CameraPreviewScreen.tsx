import React, {useCallback, useEffect, useRef, useState} from 'react';
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
  Pressable,
  Vibration,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  CameraPosition,
} from 'react-native-vision-camera';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import type {
  NavigationProp,
  RootStackParamList,
  MediaType,
} from '../types/navigation';

type FlashMode = 'off' | 'on' | 'auto';

type CameraPreviewScreenRouteProp = RouteProp<
  RootStackParamList,
  'CameraPreview'
>;

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const CameraPreviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CameraPreviewScreenRouteProp>();
  const {onPhotoCapture} = route.params;

  // Camera states
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [zoom, setZoom] = useState(1);
  const device = useCameraDevice(cameraPosition);
  const {hasPermission: cameraPermission, requestPermission} =
    useCameraPermission();
  const camera = useRef<Camera>(null);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusCoordinates, setFocusCoordinates] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timer | null>(null);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const isLongPressing = useRef(false);

  // Preview states
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<VideoRef>(null);
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
      if (!cameraPermission) {
        const granted = await requestPermission();
        setHasPermission(granted);
      } else {
        setHasPermission(true);
      }
    };
    checkPermission();
  }, [cameraPermission, requestPermission]);

  useEffect(() => {
    StatusBar.setHidden(true);
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const handleFocus = useCallback(
    async (event: any) => {
      if (!device?.supportsFocus) return;

      const {pageX, pageY} = event.nativeEvent;
      const focusPoint = {
        x: pageX,
        y: pageY,
      };

      setFocusCoordinates(focusPoint);
      setIsFocusing(true);

      try {
        await camera.current?.focus(focusPoint);
      } catch (error) {
        console.error('Focus error:', error);
      }

      // Hide focus indicator after 1 second
      setTimeout(() => {
        setIsFocusing(false);
        setFocusCoordinates(null);
      }, 1000);
    },
    [device?.supportsFocus],
  );

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
    }
    setRecordingDuration(0);
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash((current: FlashMode) => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        default:
          return 'off';
      }
    });
    Vibration.vibrate(50);
  }, []);

  const toggleGrid = useCallback(() => {
    setIsGridVisible(prev => !prev);
    Vibration.vibrate(50);
  }, []);

  const handleZoom = useCallback(
    (value: number) => {
      setZoom(Math.max(1, Math.min(value, device?.maxZoom || 1)));
    },
    [device?.maxZoom],
  );

  const startRecording = useCallback(async () => {
    try {
      if (camera.current) {
        console.log('Starting recording...');
        setIsRecording(true);
        startRecordingTimer();
        Vibration.vibrate([0, 100, 50, 100]);
        await camera.current.startRecording({
          flash: 'off',
          fileType: 'mp4',
          videoCodec: 'h264',
          onRecordingFinished: video => {
            console.log('Video recorded:', video);
            setIsRecording(false);
            stopRecordingTimer();
            Vibration.vibrate(200);
            // Set video preview
            const uri = video.path.startsWith('file://')
              ? video.path
              : `file://${video.path}`;
            console.log('Setting video preview URI:', uri);
            setPreviewUri(uri);
            setMediaType('video');
          },
          onRecordingError: error => {
            console.error('Recording error:', error);
            Alert.alert('Error', 'Failed to record video');
            setIsRecording(false);
            stopRecordingTimer();
          },
        });
      }
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
      stopRecordingTimer();
    }
  }, [startRecordingTimer, stopRecordingTimer]);

  const stopRecording = useCallback(async () => {
    try {
      console.log('Stopping recording...');
      if (camera.current && isRecording) {
        await camera.current.stopRecording();
      }
    } catch (error) {
      console.error('Stop recording error:', error);
    } finally {
      setIsRecording(false);
      stopRecordingTimer();
    }
  }, [isRecording, stopRecordingTimer]);

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setIsLoading(false);
  };

  const handleImageError = (error: any) => {
    console.error('Image loading error:', error.nativeEvent.error);
    setError('Failed to load image');
    setIsLoading(false);
  };

  const handleCapture = useCallback(async () => {
    try {
      setIsLoading(true);
      Vibration.vibrate(100);
      if (device && camera.current) {
        const photo = await camera.current.takePhoto({
          flash: flash === 'on' ? 'on' : flash === 'auto' ? 'auto' : 'off',
        });
        if (photo?.path) {
          const uri = photo.path.startsWith('file://')
            ? photo.path
            : `file://${photo.path}`;
          console.log('Camera captured photo URI:', uri);
          setPreviewUri(uri);
          setMediaType('photo');
        }
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert('Error', 'Failed to take photo');
      setIsLoading(false);
    }
  }, [device, flash]);

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

  const handleVideoProgress = (data: {currentTime: number}) => {
    setCurrentTime(data.currentTime);
  };

  const handleVideoLoad = (data: {duration: number}) => {
    console.log('Video loaded:', data);
    setVideoDuration(data.duration);
    setIsLoading(false);
  };

  const handleVideoError = (error: any) => {
    console.error('Video loading error:', error);
    setError('Failed to load video');
    setIsLoading(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.seek(time);
    }
  };

  const handleClose = () => {
    StatusBar.setHidden(false);
    navigation.goBack();
  };

  if (!hasPermission || !device) {
    return null;
  }

  if (previewUri) {
    // Preview mode
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <TouchableOpacity style={styles.closeButton} onPress={handleRetake}>
          <Icon name="close" size={28} color="#fff" />
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
              <Video
                ref={videoRef}
                source={{uri: previewUri}}
                style={styles.previewVideo}
                resizeMode="contain"
                onLoad={handleVideoLoad}
                onProgress={handleVideoProgress}
                onError={handleVideoError}
                repeat={true}
                paused={!isPlaying}
                controls={false}
                ignoreSilentSwitch="ignore"
                playInBackground={false}
                playWhenInactive={false}
                bufferConfig={{
                  minBufferMs: 1000,
                  maxBufferMs: 5000,
                  bufferForPlaybackMs: 1000,
                  bufferForPlaybackAfterRebufferMs: 2000,
                }}
              />
              {!isPlaying && (
                <View style={styles.playButtonOverlay}>
                  <Icon name="play" size={50} color="#fff" />
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
            <Icon name="close" size={24} color="#fff" />
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
      </View>
    );
  }

  // Camera mode
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Pressable
        style={styles.cameraContainer}
        onPress={handleFocus}
        {...panResponder.panHandlers}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          video={true}
          audio={true}
          zoom={zoom}
        />
        {isGridVisible && (
          <View style={styles.gridOverlay}>
            <View style={[styles.gridRow, {top: '33.33%'}]} />
            <View style={[styles.gridRow, {top: '66.66%'}]} />
            <View style={[styles.gridColumn, {left: '33.33%'}]} />
            <View style={[styles.gridColumn, {left: '66.66%'}]} />
          </View>
        )}
        {focusCoordinates && isFocusing && (
          <View
            style={[
              styles.focusIndicator,
              {
                left: focusCoordinates.x - 25,
                top: focusCoordinates.y - 25,
              },
            ]}
          />
        )}
      </Pressable>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Icon name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.topRightControls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Icon
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
            <Icon
              name={isGridVisible ? 'grid' : 'grid-outline'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraPosition}>
            <Icon name="camera-reverse" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recording Duration */}
      {isRecording && (
        <View style={styles.durationContainer}>
          <View style={styles.recordingIndicator} />
          <Text style={styles.durationText}>
            {formatDuration(recordingDuration)}
          </Text>
        </View>
      )}

      {/* Zoom Indicator */}
      {zoom > 1 && (
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.controlsContainer}>
        <Pressable
          style={[styles.captureButton, isRecording && styles.recordingButton]}
          onPressIn={handleCapturePress}
          onPressOut={handleCaptureRelease}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <View
              style={[
                styles.captureButtonInner,
                isRecording && styles.recordingButtonInner,
              ]}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridRow: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridColumn: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  durationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff0000',
  },
  durationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  focusIndicator: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
    opacity: 0.7,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderWidth: 4,
    borderColor: '#ff0000',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  recordingButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#ff0000',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
    top: '50%',
    marginTop: 20,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  acceptButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  acceptText: {
    color: '#fff',
  },
  zoomIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoomText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  previewVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoControls: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    gap: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  videoProgressBar: {
    height: 40,
    width: '100%',
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  retakeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 20,
  },
  retakeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CameraPreviewScreen;
