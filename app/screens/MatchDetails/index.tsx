import React from 'react';
import {
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Match} from '../../types/futbol';
import MatchDetailHeader from '../../components/MatchDetailHeader';
import { screenHeight } from '../../helpers/constants';

interface MatchDetailsProps {
  route: {
    params: {
      data: Match;
    };
  };
}

const MatchDetails: React.FC<MatchDetailsProps> = props => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MatchDetailHeader data={props.route.params.data} />
    </SafeAreaView>
  );
};

export default MatchDetails;
