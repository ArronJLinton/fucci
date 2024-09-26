import { Dimensions, Platform } from 'react-native'
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export { screenWidth, screenHeight };
// const insets = useSafeAreaInsets();

export const CONTENT_SPACING = 15

const SAFE_BOTTOM =
  Platform.select({
    ios: 20,
  }) ?? 0

// export const SAFE_AREA_PADDING = {
//   paddingLeft: insets.left + CONTENT_SPACING,
//   paddingTop: insets.top + CONTENT_SPACING,
//   paddingRight: insets.right + CONTENT_SPACING,
//   paddingBottom: SAFE_BOTTOM + CONTENT_SPACING,
// }

export const SAFE_AREA_PADDING = {
  paddingLeft: 20,
  paddingTop: 20,
  paddingRight: 20,
  paddingBottom: 20,
}

// The maximum zoom _factor_ you should be able to zoom in
export const MAX_ZOOM_FACTOR = 10

export const SCREEN_WIDTH = Dimensions.get('window').width
export const SCREEN_HEIGHT = Platform.select<number>({
  android: Dimensions.get('screen').height - 20,
  ios: Dimensions.get('window').height,
}) as number

// Capture Button
export const CAPTURE_BUTTON_SIZE = 78

// Control Button like Flash
export const CONTROL_BUTTON_SIZE = 40