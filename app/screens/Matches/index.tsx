import { FOOTBALL_API_KEY } from "@env"
import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Image, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    section: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    }
})
const Matches = () => {
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState(false)

    useEffect(() => {
        const headers = {
            'Content-Type': 'application/json',
            'x-rapidapi-key': `${FOOTBALL_API_KEY}`,
        };
        fetch('https://api-football-v1.p.rapidapi.com/v3/fixtures?date=2024-07-20', {
            method: 'GET',
            headers: headers
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setMatches(data.response)
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error)
                setError(error)
            });
    }, [])

    type Match = {
        teams: any;
        score: any;
    }
    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {matches.map((e: Match, i) => {
                    const home = e.teams.home;
                    const away = e.teams.away;
                    return (
                        <View key={i} style={{
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
                                <Text>{e.score.fulltime.home} - {e.score.fulltime.home}</Text>
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
                )}
            </View>
        </ScrollView >
    );
}

export default Matches;
