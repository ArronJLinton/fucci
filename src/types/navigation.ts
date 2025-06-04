import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {Match} from './match';

export type RootStackParamList = {
  HomeTab: undefined;
  MatchDetails: {
    match: Match;
  };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
