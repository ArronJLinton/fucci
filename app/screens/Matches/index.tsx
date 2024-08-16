import { FOOTBALL_API_KEY } from "@env"
import { useState, useContext, useRef } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import MatchContext, { MatchContextType } from '../../context/context';
import MatchCard from '../../components/MatchCard';
import { useFetchData } from "../../hooks/fetch";
import { Fixtures } from '../../types/futbol';

const Matches = () => {
    const { state } = useContext<MatchContextType>(MatchContext)
    const nextPageIdentifierRef = useRef();
    const [isFirstPageReceived, setIsFirstPageReceived] = useState<boolean>(false);
    const headers = {
        'Content-Type': 'application/json',
        'x-rapidapi-key': `${FOOTBALL_API_KEY}`,
    };
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${state.date}`;
    const { data, isLoading, error } = useFetchData<Fixtures>(url, 'GET', headers);

    const fetchNextPage = () => {
        if (nextPageIdentifierRef.current == null) {
            return;
        }
        console.log("FETCHING NEXT PAGE")

        // fetchMatches();
    };
    const renderItem = ({ item }: any) => {
        return <MatchCard info={item} />
    };

    const ListEndLoader = () => {
        if (!isFirstPageReceived && isLoading) {
            console.log("LISTING END LOADER")
            // Show loader at the end of list when fetching next page data.
            return <ActivityIndicator size={'large'} />;
        }
    };

    if (!isFirstPageReceived && isLoading) {
        console.log("SHOWING FIRST LOADER")
        // Show loader when fetching first page data.
        return <ActivityIndicator size={'small'} />;
    }

    if (!isFirstPageReceived && !isLoading) {
        setIsFirstPageReceived(true);
    }
    
    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            {!isLoading ?
                <FlatList
                    data={data?.response}
                    initialNumToRender={10}
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