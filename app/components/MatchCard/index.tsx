import React, { memo } from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';

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


const MatchCard = ({ info }: any) => {
    const { teams, score } = info;
    const { home, away } = teams;

    return (
        <View style={{
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
        </View>
    )
}

export default memo(MatchCard);