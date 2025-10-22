import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import {FAB} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import Video, {VideoRef} from 'react-native-video';
import type {NavigationProp} from '../types/navigation';

interface StoryPost {
  id: string;
  type: 'photo' | 'video';
  uri: string;
  timestamp: number;
}

// Get device dimensions including safe areas
const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

// Use the larger of the two to ensure full coverage
const {width: screenWidth} = Dimensions.get('window');
const fullHeight = Math.max(windowDimensions.height, screenDimensions.height);
const mediaSize = screenWidth * 0.7;

const StoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animation values
  const position = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Progress bar animation
  const progress = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef<Animated.CompositeAnimation | null>(null);

  const videoRef = useRef<VideoRef>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Force screen to stay mounted properly
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    return () => {
      StatusBar.setBarStyle('dark-content');
    };
  }, []);

  // Preload images silently in the background
  const preloadImage = useCallback((uri: string): Promise<void> => {
    return Image.prefetch(uri).catch(error => {
      console.warn('Failed to preload image:', error);
    }) as Promise<void>;
  }, []);

  const startProgressAnimation = useCallback(() => {
    progress.setValue(0);
    progressAnim.current?.stop();

    // For videos, we'll update progress based on video progress events
    if (posts[currentIndex]?.type === 'video') {
      return;
    }

    progressAnim.current = Animated.timing(progress, {
      toValue: 1,
      duration: 5000, // 5 seconds for photos
      useNativeDriver: false,
    });
    progressAnim.current.start();
  }, [progress, posts, currentIndex]);

  // Handle image loading for current and adjacent posts
  useEffect(() => {
    if (posts.length > 0) {
      // Start progress animation immediately
      startProgressAnimation();

      // Preload adjacent images in the background
      if (currentIndex < posts.length - 1) {
        preloadImage(posts[currentIndex + 1].uri);
      }
      if (currentIndex > 0) {
        preloadImage(posts[currentIndex - 1].uri);
      }

      return () => {
        progressAnim.current?.stop();
      };
    }
  }, [currentIndex, posts, preloadImage, startProgressAnimation]);

  const handleNext = useCallback(() => {
    if (currentIndex < posts.length - 1) {
      progressAnim.current?.stop();
      Animated.parallel([
        Animated.timing(position, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex(prev => prev + 1);
        position.setValue(0);
        opacity.setValue(1);
        startProgressAnimation();
      });
    }
  }, [currentIndex, posts.length, position, opacity, startProgressAnimation]);

  useEffect(() => {
    const progressListener = progress.addListener(({value}) => {
      if (value === 1) {
        handleNext();
      }
    });

    return () => {
      progress.removeListener(progressListener);
    };
  }, [progress, handleNext]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      progressAnim.current?.stop();
      Animated.parallel([
        Animated.timing(position, {
          toValue: screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex(prev => prev - 1);
        position.setValue(0);
        opacity.setValue(1);
        startProgressAnimation();
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, {dx}) => {
        position.setValue(dx);
      },
      onPanResponderRelease: (_, {dx}) => {
        if (Math.abs(dx) > screenWidth * 0.4) {
          if (dx > 0 && currentIndex > 0) {
            handlePrevious();
          } else if (dx < 0 && currentIndex < posts.length - 1) {
            handleNext();
          } else {
            Animated.spring(position, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        } else {
          Animated.spring(position, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const handleVideoLoad = () => {
    // For videos, we'll use the video duration instead of fixed duration
    if (posts[currentIndex]?.type === 'video') {
      progressAnim.current?.stop();
      startProgressAnimation();
    }
  };

  const handleVideoEnd = () => {
    if (currentIndex < posts.length - 1) {
      handleNext();
    }
  };

  const handleVideoError = (error: any) => {
    console.error('Video playback error:', error);
  };

  // Handle video progress updates
  const handleVideoProgress = (data: {
    currentTime: number;
    playableDuration: number;
  }) => {
    const currentPost = posts[currentIndex];
    if (currentPost?.type === 'video' && data.playableDuration > 0) {
      const progressValue = data.currentTime / data.playableDuration;
      progress.setValue(progressValue);
    }
  };

  const renderMedia = () => {
    const currentPost = posts[currentIndex];
    if (!currentPost) return null;

    if (currentPost.type === 'video') {
      return (
        <Video
          ref={videoRef}
          source={{uri: currentPost.uri}}
          style={styles.media}
          resizeMode="cover"
          repeat={false}
          paused={!isPlaying}
          onLoad={handleVideoLoad}
          onEnd={handleVideoEnd}
          onError={handleVideoError}
          onProgress={handleVideoProgress}
          playInBackground={false}
          playWhenInactive={false}
        />
      );
    }

    return (
      <Image
        source={{uri: currentPost.uri}}
        style={styles.media}
        resizeMode="cover"
      />
    );
  };

  const handleTap = (event: any) => {
    const currentPost = posts[currentIndex];
    if (currentPost?.type === 'video') {
      setIsPlaying(!isPlaying);
      return;
    }

    const x = event.nativeEvent.locationX;
    if (x > screenWidth * 0.5) {
      handleNext();
    } else {
      handlePrevious();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    }
  };

  // Reset video state when changing posts
  useEffect(() => {
    if (posts[currentIndex]?.type === 'video') {
      setIsPlaying(true);
    }
  }, [currentIndex, posts]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <View style={styles.progressContainer}>
        {posts.map((_, index) => (
          <View key={index} style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width:
                    index === currentIndex
                      ? progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      : index < currentIndex
                      ? '100%'
                      : '0%',
                },
              ]}
            />
          </View>
        ))}
      </View>

      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.content}>
          {posts[currentIndex] && (
            <Animated.View
              style={[
                styles.imageContainer,
                {
                  transform: [{translateX: position}],
                  opacity: opacity,
                },
              ]}
              {...panResponder.panHandlers}>
              {renderMedia()}
              <View style={styles.timestamp}>
                <Text style={styles.timestampText}>
                  {formatTimestamp(posts[currentIndex].timestamp)}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>

      <FAB
        icon="camera"
        style={styles.fab}
        onPress={() =>
          navigation.navigate('CameraPreview', {
            onPhotoCapture: (
              uri: string,
              type: 'photo' | 'video' = 'photo',
            ) => {
              setPosts(prev => [
                {
                  id: Date.now().toString(),
                  type,
                  uri,
                  timestamp: Date.now(),
                },
                ...prev,
              ]);
              setCurrentIndex(0);
            },
          })
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    elevation: 999,
    zIndex: 999,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fixedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  fullScreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: fullHeight,
    width: screenWidth,
    backgroundColor: '#000',
    zIndex: 2000,
    elevation: 2000,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  storyWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
    gap: 4,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  storyImageContainer: {
    width: mediaSize,
    height: mediaSize,
    borderRadius: mediaSize / 2,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  navigationHints: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  navigationText: {
    color: '#666',
    fontSize: 12,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 999,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    backgroundColor: 'black',
    zIndex: 9999,
    elevation: 9999,
  },
  fullDeviceOverlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: mediaSize,
    height: mediaSize,
    borderRadius: mediaSize / 2,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  timestampText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
});

export default StoryScreen;
