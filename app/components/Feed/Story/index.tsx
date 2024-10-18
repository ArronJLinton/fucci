import React, { useCallback, useMemo, useState, useEffect } from 'react';
import type { ImageLoadEventData, NativeSyntheticEvent } from 'react-native';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Image,
  Animated,
} from 'react-native';
// import OnVideoErrorData from 'react-native-video';
// import OnLoadData from 'react-native-video';
import Video from 'react-native-video';
import { SAFE_AREA_PADDING } from '../../../helpers/constants';
import { useIsForeground } from '../../../hooks/useIsForeground';
import { PressableOpacity } from 'react-native-pressable-opacity';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { StatusBarBlurBackground } from '../views/StatusBarBlurBackground';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Routes } from '../Routes';
import { useIsFocused } from '@react-navigation/core';
import {
  CONTENT_SPACING,
  CONTROL_BUTTON_SIZE,
  MAX_ZOOM_FACTOR,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from '../../../helpers/constants';

type File = { path: string; type: 'photo' | 'video' };
type Props = NativeStackScreenProps<Routes, 'MediaPage'> & {
  data: File[];
  setMediaData: (data: null) => void;
};
type OnLoadImage = NativeSyntheticEvent<ImageLoadEventData>;
const isVideoOnLoadEvent = (
  event: OnLoadData | OnLoadImage,
): event is OnLoadData => 'duration' in event && 'naturalSize' in event;

export default function StoryPage({
  data,
  setMediaData,
}: Props): React.ReactElement {
  const [hasMediaLoaded, setHasMediaLoaded] = useState(false);
  const isForeground = useIsForeground();
  const isScreenFocused = useIsFocused();
  const isVideoPaused = !isForeground || !isScreenFocused;
  const [count, setCount] = useState(0);
  const [file, setFile] = useState<File | null>(null);
//   const { path, type } = data[count];

  const onMediaLoad = useCallback((event: OnLoadData | OnLoadImage) => {
    if (isVideoOnLoadEvent(event)) {
      console.log(
        `Video loaded. Size: ${event.naturalSize.width}x${event.naturalSize.height} (${event.naturalSize.orientation}, ${event.duration} seconds)`,
      );
    } else {
      const source = event.nativeEvent.source;
      console.log(`Image loaded. Size: ${source.width}x${source.height}`);
    }
  }, []);
  const onMediaLoadEnd = useCallback(() => {
    console.log('media has loaded.');
    setHasMediaLoaded(true);
  }, []);
  const onMediaLoadError = useCallback((error: OnVideoErrorData) => {
    console.error(`failed to load media: ${JSON.stringify(error)}`);
  }, []);

//   const source = useMemo(() => path, [path]);
  const screenStyle = useMemo(
    () => ({ opacity: hasMediaLoaded ? 1 : 0 }),
    [hasMediaLoaded],
  );
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();


    setFile(data[count]);

  }, [count, fadeAnim]);

//   if (!hasMediaLoaded) return <ActivityIndicator size={50} color="black" />;
//   const { path, type } = file;
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {file && file.type === 'photo' && (
        <Image
          source={file.path}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoadEnd={onMediaLoadEnd}
          onLoad={onMediaLoad}
          onError={onMediaLoadError}
        />
      )}
      {file && file.type === 'video' && (
        <Video
          source={'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
          style={StyleSheet.absoluteFill}
          paused={isVideoPaused}
          resizeMode="cover"
          posterResizeMode="cover"
          allowsExternalPlayback={false}
          automaticallyWaitsToMinimizeStalling={false}
          disableFocus={true}
          repeat={true}
          useTextureView={false}
          controls={false}
          playWhenInactive={true}
          ignoreSilentSwitch="ignore"
          onReadyForDisplay={onMediaLoadEnd}
          onLoad={onMediaLoad}
          onError={onMediaLoadError}
          onEnd={() => setCount(prev => prev + 1)}
        />
      )}
      <View style={styles.leftButtonRow}>
        <PressableOpacity
          style={styles.button}
          onPress={() => setMediaData(null)}>
          <IonIcon name="close" size={35} color="white" style={styles.icon} />
        </PressableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  leftButtonRow: {
    position: 'absolute',
    left: SAFE_AREA_PADDING.paddingLeft,
    top: SAFE_AREA_PADDING.paddingTop,
    marginTop: '10%',
    zIndex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: SAFE_AREA_PADDING.paddingTop,
    left: SAFE_AREA_PADDING.paddingLeft,
    width: 40,
    height: 40,
    marginTop: '10%',
  },
  saveButton: {
    position: 'absolute',
    bottom: SAFE_AREA_PADDING.paddingBottom,
    left: SAFE_AREA_PADDING.paddingLeft,
    width: 40,
    height: 40,
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 1,
  },
});
