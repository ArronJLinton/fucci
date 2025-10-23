import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {Match} from './match';

export type MediaType = 'photo' | 'video';

export type RootStackParamList = {
  Main: undefined;
  HomeTab: undefined;
  MatchDetails: {
    match: Match;
  };
  Table: {
    match: Match;
  };
  News: {
    match: Match;
  };
  NewsWebView: {
    url: string;
  };
  CameraPreview: {
    onPhotoCapture: (uri: string, type: MediaType) => void;
  };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
