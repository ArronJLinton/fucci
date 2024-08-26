import {FOOTBALL_API_KEY} from '@env';
import {useState, useContext, useRef, useCallback} from 'react';
import {View, FlatList, ActivityIndicator} from 'react-native';
import MatchContext, {MatchContextType} from '../../context/context';
import MatchCard from '../../components/MatchCard';
import {useFetchData} from '../../hooks/fetch';
import {Fixtures} from '../../types/futbol';
import TopNavBar from '../../components/TopNavbar';
import { Text } from 'react-native-svg';

// TODO: Create props type for navigation props
const Matches = ({navigation}: any) => {
  const {state} = useContext<MatchContextType>(MatchContext);
  const headers = {
    'Content-Type': 'application/json',
    'x-rapidapi-key': `${FOOTBALL_API_KEY}`,
  };
  const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${state.date}`;
  const {data, isLoading, error} = useFetchData<Fixtures>(url, 'GET', headers);

  // useCallback is used to memoize the function so that it is not recreated on every render. This is useful when passing callbacks to optimized child components that rely on reference equality to prevent unnecessary renders.
  const renderItem = useCallback(({item}: any) => {
    return <MatchCard info={item} navigation={navigation} />;
  }, []);

  const renderLoader = useCallback(() => {
    if (isLoading && (data?.response.length ?? 0) > 0) {
        console.log('SHOWING RENDER LOADER');

      return <ActivityIndicator />;
    }
    return null;
  }, [isLoading, data?.response.length]);

  console.log('RENDERING');

  if (error) return <><Text>ERROR: ${error.message}</Text></>;

  return (
    <View style={{ flex: 1}}>
      <TopNavBar />

      {!isLoading ? (
      // https://www.linkedin.com/pulse/optimizing-flatlist-react-native-best-practices/
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={data?.response}
          initialNumToRender={10}
          renderItem={renderItem}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderLoader}
          ListFooterComponent={renderLoader}
          updateCellsBatchingPeriod={1000}
          maxToRenderPerBatch={5}
        />
       ) : ( 
        <ActivityIndicator size={'large'} style={{flexGrow: 5}} />
       )}
    </View>
  );
};

export default Matches;
