import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  ScrollView,
} from 'react-native';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';

import { Match, StartXI, Player } from '../../types/futbol';
import { useFetchData } from '../../hooks/fetch';
import { TopTabParamList } from '../../types/navigation';
import { screenHeight, screenWidth } from '../../helpers/constants';

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    flex: 1,
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
    marginTop: '1%',
    marginBottom: '1%',
    // flexGrow: 1,
    // flexShrink: 1
  },
  text: {
    color: 'white',
    textAlign: 'center',
  },
});

type LineupProps = MaterialTopTabScreenProps<TopTabParamList, 'Lineup'>
// TODO: Clean up the code. Fix dynamic positioning of players on the field
function Lineup({ route }: LineupProps) {
  const { id } = route.params.data.fixture;
  const headers = {
    'Content-Type': 'application/json',
  };
  const url = `http://localhost:8080/v1/api/futbol/lineup?match_id=${id}`;
  const {data, isLoading, error} = useFetchData<any>(url, 'GET', headers, null);
  let homeRow = '1';
  let homeColumns = '1';
  let awayRow: any;
  let awayColumns = '1';

  if (error) return <Text>ERROR: {error.message}</Text>;
  if (isLoading) return <Text>Loading....</Text>;
  if (data === "No lineup data available" && !isLoading) return <Text>No lineup data available</Text>;

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={{position: 'relative'}}>
        <Image
          source={require('./field.jpeg')}
          style={{
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
                    style={{height: 30, width: 30, alignSelf: 'center'}}
                  />
                  <Text style={styles.text}>{item.number}</Text>
                  <Text style={styles.text}>{item.name}</Text>
                </View>
              );
            })}
          </View>

          {/* AWAY TEAM*/}
          <View style={styles.away}>
            {data.away.starters.map((item: Player, index: number) => {
              const [r, col] = item.grid.split(':');
              if (r !== awayRow) {
                awayRow = r;
                awayColumns = col;
              }
              return (
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
                    style={{height: 25, width: 25, alignSelf: 'center'}}
                  />
                  <Text style={styles.text}>{item.number || 'D'}</Text>
                  <Text style={styles.text}>{item.name || 'D'}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

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

const sortAwayArray = (arr: any): StartXI[] =>
  arr.sort((a: any, b: any) => {
    const [rowA, colA] = a.grid.split(':').map(Number);
    const [rowB, colB] = b.grid.split(':').map(Number);

    if (rowA === rowB) {
      return colA - colB; // Sort by column if rows are the same
    } else {
      return rowA - rowB; // Sort by row first
    }
  });
