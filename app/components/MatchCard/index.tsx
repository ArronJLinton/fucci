import React, { memo, PureComponent } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';

// TODO: Clean Up styles
const styles = StyleSheet.create({
    section: {
        flex: 2, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'
    },
    section2: {
        flex: 2, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'
    },
    middle: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    },
    text: { flex: 1, textAlign: 'right' }
})

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
class MatchCard extends PureComponent<Props> {

    render() {
        const { teams, score } = this.props.info;
        const { home, away } = teams;
        return (
            <>
                <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('MatchDetails', { data: this.props.info })}
                    style={{
                        marginTop: 10, padding: 15, flexDirection: 'row', backgroundColor: 'white', justifyContent: 'space-between',
                    }}>

                    <View style={styles.section}>
                        <Text style={styles.text}>{home.name}</Text>
                        <Image
                            style={{
                                marginLeft: 10,
                                width: 20,
                                height: 20,
                            }}
                            source={{ uri: home.logo }}
                        />
                    </View>

                    <View style={styles.middle}>
                        <Text>{score.fulltime.home} - {score.fulltime.home}</Text>
                    </View>

                    <View style={styles.section2}>
                        <Image
                            style={{
                                width: 20,
                                height: 20,
                            }}
                            source={{ uri: away.logo }}
                        />
                        <Text style={{
                            ...styles.text,
                            textAlign: 'left',
                            marginLeft: 10,
                        }}>{away.name}</Text>

                    </View>
                </TouchableOpacity>
            </>
        )
    }
}

export default MatchCard;