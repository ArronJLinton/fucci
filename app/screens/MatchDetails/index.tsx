import React from 'react';
import {
  ScrollView,
  View,
} from 'react-native';
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
    <View style={{ flex: 1 }}>
      <MatchDetailHeader data={props.route.params.data} />
    </View>
  );
};

export default MatchDetails;
