import { FOOTBALL_API_KEY } from "@env"
import { useEffect, useState, useContext } from 'react';
import { ScrollView, Text, View, Image, StyleSheet } from 'react-native';
import { MatchContext } from '../../context/context';
import { Layout, Spinner } from '@ui-kitten/components';

type Match = {
    teams: any;
    score: any;
}

export const useAppContext = () => {
    const context = useContext(MatchContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

const Matches = () => {
    const { state, setMatchDate } = useAppContext();
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState(false)

    useEffect(() => {
        console.log('MATCH DATE: ', state)
        setIsLoading(true)
        const headers = {
            'Content-Type': 'application/json',
            'x-rapidapi-key': `${FOOTBALL_API_KEY}`,
        };
        fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${state.date}`, {
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
                setIsLoading(false)
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error)
                setError(error)
                setIsLoading(false)
            });
    }, [state.date])

    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {isLoading ? (<Spinner size='large' />) : matches.map((e: Match, i) => {
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
                })
            }
            </View>
        </ScrollView >
    );
}

export default Matches;


const styles = StyleSheet.create({
    section: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    }
})
