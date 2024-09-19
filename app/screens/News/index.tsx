import { NEWS_API_KEY } from '@env';
import { useState, useContext, useRef } from 'react';
import { FlatList, ActivityIndicator, Image } from 'react-native';
import { ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { Card, List, Text } from '@ui-kitten/components';
import MatchContext, { MatchContextType } from '../../context/context';
import MatchCard from '../../components/MatchCard';
import { useFetchData } from '../../hooks/fetch';
import { NewsResponse, NewsData } from '../../types/news';

const styles = StyleSheet.create({
  container: {
    // maxHeight: 320,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  item: {
    marginVertical: 4,
    justifyContent: 'center',
  },
});

const NewsScreen = () => {
  // const { state } = useContext<MatchContextType>(MatchContext)
  // const nextPageIdentifierRef = useRef();
  // const [isFirstPageReceived, setIsFirstPageReceived] = useState<boolean>(false);
  const headers = {
    'Content-Type': 'application/json',
    'x-rapidapi-key': `${NEWS_API_KEY}`,
  };
  const url = `https://news-api14.p.rapidapi.com/v2/trendings?topic=soccer&language=en`;
  const { data, isLoading, error } = useFetchData<NewsResponse>(
    url,
    'GET',
    headers,
  );

  const renderItemHeader = (
    headerProps,
    info: NewsData,
  ): React.ReactElement => (
    <View {...headerProps}>
      <Text category="h6">{`${info.title}`}</Text>
    </View>
  );

  const renderItemFooter = (
    footerProps,
    info: NewsData,
  ): React.ReactElement => <Text {...footerProps}>{info.publisher.name}</Text>;

  const renderItem = (info: NewsData): React.ReactElement => (
    <Card
      style={styles.item}
      status="basic"
      header={headerProps => renderItemHeader(headerProps, info)}
      footer={footerProps => renderItemFooter(footerProps, info)}>
      <Image
        style={{
          flex: 1,
          width: 300,
          height: 300,
          alignSelf: 'center',
        }}
        source={{ uri: info.publisher.favicon }}
      />
    </Card>
  );

  return (
    <View style={{ flex: 1 }}>
      <List
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        data={data?.data}
        renderItem={({ item }) => renderItem(item)}
      />
    </View>
  );
};

export default NewsScreen;
