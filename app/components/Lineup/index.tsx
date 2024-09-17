import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  ScrollView,
  Animated,
  ImageBackground,
} from 'react-native';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';

import { Match, StartXI, Player } from '../../types/futbol';
import { useFetchData } from '../../hooks/fetch';
import { TopTabParamList } from '../../types/navigation';
import { screenHeight, screenWidth } from '../../helpers/constants';
const HEADER_MAX_HEIGHT = 200; // Max height of the header

const styles = StyleSheet.create({
  scrollViewContent: {
    // paddingTop: HEADER_MAX_HEIGHT, // Ensure content starts below header
    // height: screenHeight,
  },
  container: {
    flexGrow: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // display: 'flex',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    // paddingTop: '2%',
    // paddingBottom: '2%',
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
    // alignSelf: 'baseline'
  },
  text: {
    color: 'white',
    textAlign: 'center',
  },
  playerImage: { height: 30, width: 30, alignSelf: 'center', borderRadius: 50 },
});

// type LineupProps = MaterialTopTabScreenProps<TopTabParamList, 'Lineup'>;

interface LineupProps  {
  data: Match;
}
// TODO: Clean up the code. Fix dynamic positioning of players on the field
const Lineup = React.forwardRef((props: LineupProps, ref) => {
  const { id } = props.data.fixture;
  const headers = {
    'Content-Type': 'application/json',
  };
  const url = `http://localhost:8080/v1/api/futbol/lineup?match_id=${id}`;
  const { data, isLoading, error } = useFetchData<any>(
    url,
    'GET',
    headers,
    null,
  );
  let homeRow = '1';
  let homeColumns = '1';
  let awayRow: any;
  let awayColumns = '1';

  if (error) return <Text>ERROR: {error.message}</Text>;
  if (isLoading) return <Text>Loading....</Text>;
  if (data === 'No lineup data available' && !isLoading)
    return <Text>No lineup data available</Text>;

  // let awayTeam;
  // if (data.home.away) {
  //   awayTeam = sortAwayArray(data.away.starters);
  //   awayRow = data.away.starters[0].grid.split(':')[0];
  // }

  return (
    <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: ref } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16} // Event throttling for smooth animation
      >
      <ImageBackground
        source={require('./field.jpeg')}
        resizeMode='cover'
        style={{
          // position: 'absolute',
          // top: 0,
          // bottom: 0,
          // left: 0,
          // right: 0,
          width: screenWidth,
          height: screenHeight,
        }}
      />

      <View style={styles.container}>
        {/* HOME TEAM */}
        <View style={styles.home}>
          {data.home.starters.map((item: any, index: number) => {
            const [r, col] = item.grid.split(':');
            if (r !== homeRow) {
              homeRow = r;
              homeColumns = col;
            }
            return (
              <View
                key={index}
                style={[
                  styles.item,
                  {
                    flexBasis: `${100 / parseInt(homeColumns)}%`,
                    // marginTop: '6%',
                    // marginBottom: '6%',
                  },
                ]}>
                <Image
                  source={{
                    uri: item.photo
                      ? item.photo
                      : 'https://via.placeholder.com/150',
                  }}
                  style={styles.playerImage}
                />
                {/* <View style={{ flexDirection: 'row', flexWrap: 'wrap'}}> */}
                  <Text style={styles.text}>{item.name}</Text>
                  <Text style={styles.text}>{item.number}</Text>
                {/* </View> */}

              </View>
            );
          })}
        </View>

        {/* AWAY TEAM*/}
        <View style={styles.away}>
          {sortAwayArray(data.away.starters)
            .reverse()
            .map((item: Player, index: number) => {
              const [r, col] = item.grid.split(':');
              if (r !== awayRow) {
                awayRow = r;
                awayColumns = col;
              }
              return (
                // TODO: Create clickable component for player profile
                <View
                  key={index}
                  style={[
                    styles.item,
                    {
                      flexBasis: `${100 / parseInt(awayColumns)}%`,
                      // marginBottom: '2%',
                      // marginTop: '2%',
                    },
                  ]}>
                  <Image
                    source={{
                      uri: item.photo
                        ? item.photo
                        : 'https://via.placeholder.com/150',
                    }}
                    style={styles.playerImage}
                  />
                  <Text style={styles.text}>{item.number}</Text>
                  <Text style={styles.text}>{item.name}</Text>
                </View>
              );
            })}
        </View>
      </View>
      {/* </View> */}
    </ScrollView>
  );
})

export default Lineup;

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

const sortAwayArray = (arr: any): any[] =>
  arr.sort((a: any, b: any) => {
    const [rowA, colA] = a.grid.split(':').map(Number);
    const [rowB, colB] = b.grid.split(':').map(Number);

    if (rowA === rowB) {
      return colA - colB; // Sort by column if rows are the same
    } else {
      return rowA - rowB; // Sort by row first
    }
  });
