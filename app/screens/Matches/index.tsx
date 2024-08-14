import { FOOTBALL_API_KEY } from "@env"
import { useEffect, useState, useContext, useRef } from 'react';
import { Text, View, Image, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import MatchContext, { MatchState, MatchContextType } from '../../context/context';
import MatchCard from '../../components/MatchCard';

// TODO: Needs to be accessible globally
type Match = {
    teams: any;
    score: any;
}

// export const useAppContext = () => {
//     const context = useContext(MatchContext);
//     if (!context) {
//         throw new Error('useAppContext must be used within an AppProvider');
//     }
//     return context;
// };

const Matches = (): React.JSX.Element => {
    // const { state } = useAppContext();
    const { state } = useContext<MatchContextType>(MatchContext)
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error>();
    const nextPageIdentifierRef = useRef();
    const [isFirstPageReceived, setIsFirstPageReceived] = useState(false);

    useEffect(() => {
        fetchMatches()
    }, [state.date])

    const fetchMatches = () => {
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
                setIsLoading(false);
                !isFirstPageReceived && setIsFirstPageReceived(true);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error)
                setError(error)
            });
    }

    const fetchNextPage = () => {
        if (nextPageIdentifierRef.current == null) {
            return;
        }
        fetchMatches();
    };
    const renderItem = ({ item }: any) => {
        return <MatchCard info={item} />
    };

    const ListEndLoader = () => {
        if (!isFirstPageReceived && isLoading) {
            // Show loader at the end of list when fetching next page data.
            return <ActivityIndicator size={'large'} />;
        }
    };

    if (!isFirstPageReceived && isLoading) {
        // Show loader when fetching first page data.
        return <ActivityIndicator size={'small'} />;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            { !isLoading ? 
                <FlatList
                data={matches}
                renderItem={renderItem}
                onEndReached={fetchNextPage}
                onEndReachedThreshold={0.8}
                ListFooterComponent={ListEndLoader}
            /> : <ActivityIndicator size={'large'} />
            }
        </View>
    );
}

export default Matches;