import React, { memo } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FasterImageView } from '@candlefinance/faster-image';

// TODO: Clean Up styles
const styles = StyleSheet.create({
  section: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  section2: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  middle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { flex: 1, textAlign: 'right' },
  homeTeamLogo: {
    marginLeft: 10,
    width: 20,
    height: 20,
  },
  awayTeamLogo: {
    width: 20,
    height: 20,
  },
});

type Props = {
  info: {
    teams: {
      home: {
        name: string;
        logo: string;
      };
      away: {
        name: string;
        logo: string;
      };
    };
    score: {
      fulltime: {
        home: number;
        away: number;
      };
    };
  };
  navigation: any; // replace 'any' with the appropriate type for the navigation prop
};
// memo is used to prevent unnecessary re-renders of the component. Lets you skip re-rendering a component when its props are unchanged.
// Use for performance optimization. Wraps the component being exported and incercepts the render of the ocmponent and checks if the props are different from one render to the next. If there are no changes, the component will not re-render.
const MatchCard = ({ info, navigation }: Props) => {
  const { teams, score } = info;
  const { home, away } = teams;
  return (
    <>
      <TouchableOpacity
        onPress={() => navigation.navigate('MatchDetails', { data: info })}
        style={{
          marginTop: 10,
          padding: 15,
          flexDirection: 'row',
          backgroundColor: 'white',
          justifyContent: 'space-between',
        }}>
        <View style={styles.section}>
          <Text style={styles.text}>{home.name}</Text>
          <FasterImageView
            style={styles.homeTeamLogo}
            source={{ url: home.logo }}
          />
        </View>

        <View style={styles.middle}>
          <Text>
            {score.fulltime.home} - {score.fulltime.away}
          </Text>
        </View>

        <View style={styles.section2}>
          <FasterImageView
            style={styles.awayTeamLogo}
            source={{ url: away.logo }}
          />
          <Text
            style={{
              ...styles.text,
              textAlign: 'left',
              marginLeft: 10,
            }}>
            {away.name}
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default memo(MatchCard);
