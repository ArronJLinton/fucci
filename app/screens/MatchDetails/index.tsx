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

interface MatchDetailsProps {
  route: {
    params: {
      data: Match;
    };
  };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    aspectRatio: 1, // Keeps item square
    backgroundColor: '#ccc', // Placeholder color
  },
});

const MatchDetails: React.FC<MatchDetailsProps> = props => {
  // const { data } = props.route.params;
  // console.log('\n DATA: ', data);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const itemWidth = screenWidth / 2;
  const s = data[0].startXI;
  const starting = sortArray(s);
  const awayTeam = sortArray1(data[1].startXI).reverse();
  //   console.log('\n STARTING2131231231: ', data[0].startXI);
  //   console.log('\n STARTING: ', sortArray(starting));

  let row = '1';
  let columns = '1';

  let arow = awayTeam[0].player.grid.split(':')[0];
  let acolumns = '1';
  return (
    <ScrollView>
      <MatchDetailHeader />

      <View style={{position: 'relative'}}>
        <Image
          source={require('./field.jpeg')}
          style={{
            width: screenWidth,
            height: screenHeight,
          }}
        />

        <View
          style={[styles.container, {padding: 0, position: 'absolute'}]}>
          {starting.map((item: StartXI, index: number) => {
            const [r, col] = item.player.grid.split(':');
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
                    flex: 1,
                    flexBasis: `${100 / parseInt(columns)}%`,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginTop: screenHeight / (5 * 5),
                    marginBottom: screenHeight / (5 * 6),
                    // width: itemWidth,
                  },
                ]}>
                <Text>{item.player.pos}</Text>
              </View>
            );
          })}

          {/* AWAY TEAM*/}

          {awayTeam.map((item, index) => {
            const [r, col] = item.player.grid.split(':');
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
                    flex: 1,
                    flexBasis: `${100 / parseInt(acolumns)}%`,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginTop: screenHeight / (5 * 3.5),
                    marginBottom: screenHeight / (5 *4.5),
                    // width: itemWidth,
                  },
                ]}>
                <Text>{item.player.pos || 'D'}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default MatchDetails;

const data = [
  {
    team: {
      id: 456,
      name: 'Talleres Cordoba',
      logo: 'https://media.api-sports.io/football/teams/456.png',
      colors: null,
    },
    coach: {
      id: 898,
      name: 'A. Medina',
      photo: 'https://media.api-sports.io/football/coachs/898.png',
    },
    formation: '4-2-3-1',
    startXI: [
      {
        player: {
          id: 6225,
          name: 'G. Herrera',
          number: 22,
          pos: 'G',
          grid: '1:1',
        },
      },
      {player: {id: 6228, name: 'L. Godoy', number: 25, pos: 'D', grid: '2:4'}},
      {player: {id: 6229, name: 'J. Komar', number: 6, pos: 'D', grid: '2:3'}},
      {
        player: {
          id: 6233,
          name: 'N. Tenaglia',
          number: 14,
          pos: 'D',
          grid: '2:2',
        },
      },
      {player: {id: 6236, name: 'A. Cubas', number: 8, pos: 'M', grid: '2:1'}},
      {
        player: {
          id: 6237,
          name: 'E. D\u00edaz',
          number: 15,
          pos: 'D',
          grid: '3:2',
        },
      },
      {
        player: {
          id: 6240,
          name: 'I. M\u00e9ndez',
          number: 18,
          pos: 'M',
          grid: '3:1',
        },
      },
      {
        player: {
          id: 6250,
          name: 'D. Moreno',
          number: 17,
          pos: 'F',
          grid: '4:3',
        },
      },
      {
        player: {
          id: 6096,
          name: 'J. Men\u00e9ndez',
          number: 27,
          pos: 'M',
          grid: '4:2',
        },
      },
      {
        player: {
          id: 6128,
          name: 'F. Fragapane',
          number: 20,
          pos: 'M',
          grid: '4:1',
        },
      },
      {
        player: {
          id: 35667,
          name: 'N. Bustos',
          number: 10,
          pos: 'M',
          grid: '5:1',
        },
      },
    ],
    substitutes: [
      {
        player: {
          id: 76122,
          name: 'B. Guzm\u00e1n',
          number: 23,
          pos: 'M',
          grid: null,
        },
      },
      {player: {id: 6383, name: 'M. Payero', number: 21, pos: 'M', grid: null}},
      {player: {id: 6241, name: 'F. Navarro', number: 5, pos: 'M', grid: null}},
      {player: {id: 6254, name: 'D. Valoyes', number: 7, pos: 'F', grid: null}},
      {
        player: {
          id: 6227,
          name: 'J. Gandolfi',
          number: 3,
          pos: 'D',
          grid: null,
        },
      },
      {player: {id: 6223, name: 'M. Caranta', number: 1, pos: 'G', grid: null}},
      {player: {id: 6231, name: 'F. Medina', number: 13, pos: 'D', grid: null}},
    ],
  },
  {
    team: {
      id: 446,
      name: 'Lanus',
      logo: 'https://media.api-sports.io/football/teams/446.png',
      colors: null,
    },
    coach: {
      id: 846,
      name: 'L. Zubeld\u00eda',
      photo: 'https://media.api-sports.io/football/coachs/846.png',
    },
    formation: '4-5-1',
    startXI: [
      {player: {id: 11756, name: 'A. Rossi', number: 1, pos: 'G', grid: '1:1'}},
      {
        player: {
          id: 47406,
          name: 'E. Mu\u00f1oz',
          number: 6,
          pos: 'D',
          grid: '2:4',
        },
      },
      {
        player: {
          id: 6201,
          name: 'L. Di Pl\u00e1cido',
          number: 26,
          pos: 'D',
          grid: '2:3',
        },
      },
      {
        player: {
          id: 129902,
          name: 'A. Bernabei',
          number: 25,
          pos: null,
          grid: '2:2',
        },
      },
      {
        player: {
          id: 6214,
          name: 'F. Quign\u00f3n',
          number: 19,
          pos: 'M',
          grid: '2:1',
        },
      },
      {
        player: {
          id: 6213,
          name: 'N. Pasquini',
          number: 21,
          pos: 'D',
          grid: '3:5',
        },
      },
      {player: {id: 59197, name: 'L. Vera', number: 14, pos: 'M', grid: '3:4'}},
      {player: {id: 6219, name: 'J. Sand', number: 9, pos: 'F', grid: '3:3'}},
      {
        player: {
          id: 6187,
          name: 'C. Auzqui',
          number: 28,
          pos: 'M',
          grid: '3:2',
        },
      },
      {
        player: {
          id: 6217,
          name: 'D. Moreno',
          number: 10,
          pos: 'M',
          grid: '3:1',
        },
      },
      {
        player: {
          id: 6221,
          name: 'L. Valenti',
          number: 30,
          pos: 'D',
          grid: '4:1',
        },
      },
    ],
    substitutes: [
      {
        player: {
          id: 6209,
          name: 'T. Belmonte',
          number: 13,
          pos: 'M',
          grid: null,
        },
      },
      {player: {id: 6211, name: 'G. Lodico', number: 16, pos: 'M', grid: null}},
      {player: {id: 5187, name: 'N. Orsini', number: 33, pos: 'F', grid: null}},
      {
        player: {
          id: 6294,
          name: 'L. Abecasis',
          number: 24,
          pos: 'D',
          grid: null,
        },
      },
      {
        player: {
          id: 6204,
          name: 'Tiago Pagnussat',
          number: 2,
          pos: 'D',
          grid: null,
        },
      },
      {
        player: {
          id: 6196,
          name: 'L. Morales',
          number: 17,
          pos: 'G',
          grid: null,
        },
      },
      {
        player: {
          id: 6200,
          name: 'P. De la Vega',
          number: 39,
          pos: 'F',
          grid: null,
        },
      },
    ],
  },
];

const sortArray = (arr: any): StartXI[] =>
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
    const [rowA, colA] = a.player.grid.split(':').map(Number);
    const [rowB, colB] = b.player.grid.split(':').map(Number);

    if (rowA === rowB) {
      return colA - colB; // Sort by column if rows are the same
    } else {
      return rowA - rowB; // Sort by row first
    }
  });
