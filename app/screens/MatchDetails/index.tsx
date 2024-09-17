import React from 'react';
import {
  ScrollView,
} from 'react-native';
import {Match} from '../../types/futbol';
import MatchDetailHeader from '../../components/MatchDetailHeader';

interface MatchDetailsProps {
  route: {
    params: {
      data: Match;
    };
  };
}


const MatchDetails: React.FC<MatchDetailsProps> = props => {
  return (
    <>
      <MatchDetailHeader data={props.route.params.data} />
    </>
  );
};

export default MatchDetails;
