import React, { useCallback, useMemo, useState } from 'react';
import type { ImageLoadEventData, NativeSyntheticEvent } from 'react-native';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Image,
} from 'react-native';
// import type { OnVideoErrorData, OnLoadData } from 'react-native-video';
import Video from 'react-native-video';
import { SAFE_AREA_PADDING } from '../../../helpers/constants';
import { useIsForeground } from '../../../hooks/useIsForeground';
import { PressableOpacity } from 'react-native-pressable-opacity';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';
// import { CameraRoll } from '@react-native-camera-roll/camera-roll'
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

const requestSavePermission = async (): Promise<boolean> => {
  // On Android 13 and above, scoped storage is used instead and no permission is needed
  if (Platform.OS !== 'android' || Platform.Version >= 33) return true;

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  if (permission == null) return false;
  let hasPermission = await PermissionsAndroid.check(permission);
  if (!hasPermission) {
    const permissionRequestResult = await PermissionsAndroid.request(
      permission,
    );
    hasPermission = permissionRequestResult === 'granted';
  }
  return hasPermission;
};

type Props = NativeStackScreenProps<Routes, 'MediaPage'> & {
  data: { path: string; type: 'photo' | 'video' };
  setMediaData: (data: null) => void;
};
type OnLoadImage = NativeSyntheticEvent<ImageLoadEventData>;
// const isVideoOnLoadEvent = (
//   event: OnLoadData | OnLoadImage,
// ): event is OnLoadData => 'duration' in event && 'naturalSize' in event;

export default function MediaPage({
  data,
  setMediaData,
}: Props): React.ReactElement {
  console.log('MEDIA PAGE PROPS: ', data);
  const { path, type } = data;
  const [hasMediaLoaded, setHasMediaLoaded] = useState(false);
  const isForeground = useIsForeground();
  const isScreenFocused = useIsFocused();
  const isVideoPaused = !isForeground || !isScreenFocused;
  const [savingState, setSavingState] = useState<'none' | 'saving' | 'saved'>(
    'none',
  );

  // const onMediaLoad = useCallback((event: OnLoadData | OnLoadImage) => {
  //   if (isVideoOnLoadEvent(event)) {
  //     console.log(
  //       `Video loaded. Size: ${event.naturalSize.width}x${event.naturalSize.height} (${event.naturalSize.orientation}, ${event.duration} seconds)`,
  //     );
  //   } else {
  //     const source = event.nativeEvent.source;
  //     console.log(`Image loaded. Size: ${source.width}x${source.height}`);
  //   }
  // }, []);
  const onMediaLoadEnd = useCallback(() => {
    console.log('media has loaded.');
    setHasMediaLoaded(true);
  }, []);
  // const onMediaLoadError = useCallback((error: OnVideoErrorData) => {
  //   console.error(`failed to load media: ${JSON.stringify(error)}`);
  // }, []);

  const onSavePressed = useCallback(async () => {
    try {
      setSavingState('saving');

      const hasPermission = await requestSavePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission denied!',
          'Vision Camera does not have permission to save the media to your camera roll.',
        );
        return;
      }
      // await CameraRoll.save(`file://${path}`, {
      //   type: type,
      // })
      setSavingState('saved');
    } catch (e) {
      const message = e instanceof Error ? e.message : JSON.stringify(e);
      setSavingState('none');
      Alert.alert(
        'Failed to save!',
        `An unexpected error occured while trying to save your ${type}. ${message}`,
      );
    }
  }, [path, type]);

  const source = useMemo(() => ({ uri: `file://${path}` }), [path]);

  const screenStyle = useMemo(
    () => ({ opacity: hasMediaLoaded ? 1 : 0 }),
    [hasMediaLoaded],
  );

  return (
    <View style={[styles.container, screenStyle]}>
      {type === 'photo' && (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoadEnd={onMediaLoadEnd}
          // onLoad={onMediaLoad}
        />
      )}
      {type === 'video' && (
        <Video
          source={source}
          style={StyleSheet.absoluteFill}
          // paused={isVideoPaused}
          // resizeMode="cover"
          // posterResizeMode="cover"
          // allowsExternalPlayback={false}
          // automaticallyWaitsToMinimizeStalling={false}
          // disableFocus={true}
          // repeat={true}
          // useTextureView={false}
          // controls={false}
          // playWhenInactive={true}
          // ignoreSilentSwitch="ignore"
          // onReadyForDisplay={onMediaLoadEnd}
          // onLoad={onMediaLoad}
          // onError={onMediaLoadError}
        />
      )}
      <View style={styles.leftButtonRow}>
        <PressableOpacity
          style={styles.button}
          onPress={() => setMediaData(null)}>
          <IonIcon name="close" size={35} color="white" style={styles.icon} />
        </PressableOpacity>
      </View>

      <PressableOpacity
        style={styles.saveButton}
        onPress={onSavePressed}
        disabled={savingState !== 'none'}>
        {savingState === 'none' && (
          <IonIcon
            name="download"
            size={35}
            color="white"
            style={styles.icon}
          />
        )}
        {savingState === 'saved' && (
          <IonIcon
            name="checkmark"
            size={35}
            color="white"
            style={styles.icon}
          />
        )}
        {savingState === 'saving' && <ActivityIndicator color="white" />}
      </PressableOpacity>

      <StatusBarBlurBackground />
    </View>
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
    zIndex: 1
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
