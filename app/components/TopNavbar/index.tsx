import { useContext, useState } from 'react';
import { ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Tab, TabBar } from '@ui-kitten/components';
import MatchContext, { MatchContextType } from '../../context/context';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  tab: {
    marginLeft: 15,
    marginRight: 15,
  },
});

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',  // 'Mon'
    day: 'numeric',    // '19'
    month: 'short',    // 'Sept'
  }).replace(',', '');
};

const TopNavBar: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(4);
  const { state, setMatchDate } = useContext<MatchContextType>(MatchContext);
  const date = new Date();
  const threeDaysAgo = new Date();
  const twoDaysAgo = new Date();
  const twoDaysFromNow = new Date();
  const threeDaysFromNow = new Date();
  threeDaysAgo.setDate(date.getDate() - 3);
  twoDaysAgo.setDate(date.getDate() - 2);
  twoDaysFromNow.setDate(date.getDate() + 2);
  threeDaysFromNow.setDate(date.getDate() + 3);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentOffset={{ x: screenWidth / 1.5, y: 0 }}>
      <TabBar
        style={{ backgroundColor: 'transparent', alignContent: 'center' }}
        selectedIndex={selectedIndex}
        onSelect={i => {
          setSelectedIndex(i);
          switch (i) {
            case 0:
              date.setDate(date.getDate() - 3);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 1:
              date.setDate(date.getDate() - 2);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 2:
              date.setDate(date.getDate() - 1);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 3:
              date.setDate(date.getDate());
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 4:
              date.setDate(date.getDate() + 1);

              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 5:
              date.setDate(date.getDate() + 2);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 6:
              date.setDate(date.getDate() + 3);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            default:
              break;
          }
        }}>
        <Tab style={styles.tab} title={formatDate(threeDaysAgo)} />
        <Tab style={styles.tab} title={formatDate(twoDaysAgo)} />
        <Tab style={styles.tab} title="Yesterday" />
        <Tab style={styles.tab} title="Today" />
        <Tab style={styles.tab} title="Tomorrow" />
        <Tab style={styles.tab} title={formatDate(twoDaysFromNow)} />
        <Tab style={styles.tab} title={formatDate(threeDaysFromNow)}/>
      </TabBar>
    </ScrollView>
  );
};

export default TopNavBar;
