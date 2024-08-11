import { useEffect, useState, useContext } from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    section: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    }
})

const MatchCard = ({info}: any) => {
    const { teams, score } = info;
    const { home, away } = teams;
    return(
        <View style={{
            marginTop: 10, padding: 15, flexDirection: 'row', backgroundColor: 'white', justifyContent: 'space-between',
        }}>
            <View style={styles.section}>
                <Text>{home.name}</Text>
                <Image
                    style={{
                        marginLeft: 10,
                        width: 20,
                        height: 20,
                    }}
                    source={{ uri: home.logo }}
                />
            </View>

            <View style={styles.section}>
                <Text>{score.fulltime.home} - {score.fulltime.home}</Text>
            </View>

            <View style={styles.section}>
                <Text>{away.name}</Text>
                <Image
                    style={{
                        marginLeft: 10,
                        width: 20,
                        height: 20,
                    }}
                    source={{ uri: away.logo }}
                />
            </View>
        </View>
    )
}

export default MatchCard;