import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  ScrollView,
} from 'react-native';
import {Match, StartXI} from '../../types/futbol';
import MatchDetailHeader from '../../components/MatchDetailHeader';
import Lineup from '../../components/Lineup';
import {useFetchData} from '../../hooks/fetch';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

interface MatchDetailsProps {
  route: {
    params: {
      data: Match;
    };
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  home: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    height: screenHeight / 2,
    overflow: 'hidden',
    justifyContent: 'space-evenly',
  },
  away: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-end',
    height: screenHeight / 2,
    overflow: 'hidden',
    justifyContent: 'space-evenly',
  },
  item: {
    // marginTop: '1%',
    // marginBottom: '1%',
    // flexGrow: 1,
    // flexShrink: 1
  },
  text: {
    color: 'white',
    textAlign: 'center',
  },
});

const MatchDetails: React.FC<MatchDetailsProps> = props => {
  const {data} = props.route.params; 
  return (
    <ScrollView>
      <MatchDetailHeader title="..." subtitle="..." data={data} />
      <Lineup data={data} />
    </ScrollView>
  );
};

export default MatchDetails;



const sortArray = (arr: any): any[] =>
  arr.sort((a: any, b: any) => {
    const [rowA, colA] = a.player.grid.split(':').map(Number);
    const [rowB, colB] = b.player.grid.split(':').map(Number);

    if (rowA === rowB) {
      return colB - colA; // Sort by column if rows are the same
    } else {
      return rowA - rowB; // Sort by row first
    }
  });

const sortArray1 = (arr: any): StartXI[] =>
  arr.sort((a: any, b: any) => {
    const [rowA, colA] = a.grid.split(':').map(Number);
    const [rowB, colB] = b.grid.split(':').map(Number);

    if (rowA === rowB) {
      return colA - colB; // Sort by column if rows are the same
    } else {
      return rowA - rowB; // Sort by row first
    }
  });
