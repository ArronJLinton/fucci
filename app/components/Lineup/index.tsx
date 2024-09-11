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
import {useFetchData} from '../../hooks/fetch';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

interface LineupProps {
  data: Match;
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

// TODO: Clean up the code. Fix dynamic positioning of players on the field
const Lineup: React.FC<LineupProps> = props => {
  const {id} = props.data.fixture;
  const headers = {
    'Content-Type': 'application/json',
  };
  const url = `http://localhost:8080/v1/api/futbol/lineup?match_id=${id}`;
  const {data, isLoading, error} = useFetchData<any>(url, 'GET', headers, null);

  let row = '1';
  let columns = '1';
  let arow: any;
  let acolumns = '1';

  if (error) return <Text>ERROR: {error.message}</Text>;
  if (isLoading) return <Text>Loading....</Text>;
  if (data === "No lineup data available" && !isLoading) return <Text>No lineup data available</Text>;

  return (
    <ScrollView>

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
              if (r !== row) {
                row = r;
                columns = col;
              }
              return (
                <View
                  key={index}
                  style={[
                    styles.item,
                    {
                      flexBasis: `${100 / parseInt(columns)}%`,
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
            {data.away.starters.map((item, index) => {
              const [r, col] = item.grid.split(':');
              if (r !== arow) {
                arow = r;
                acolumns = col;
              }
              return (
                <View
                  key={index}
                  style={[
                    styles.item,
                    {
                      flexBasis: `${100 / parseInt(acolumns)}%`, 
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
