import {useContext, useState} from 'react';
import {ScrollView, Dimensions, StyleSheet} from 'react-native';
import {Tab, TabBar} from '@ui-kitten/components';
import MatchContext, {
  MatchContextType,
} from '../../context/context';

const {width: screenWidth} = Dimensions.get('window');

const styles = StyleSheet.create({
  tab: {
    marginLeft: 15,
    marginRight: 15,
  },
});

const TopNavBar: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(4);
  const {state, setMatchDate} = useContext<MatchContextType>(MatchContext);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentOffset={{x: screenWidth / 1.5, y: 0}}>
      <TabBar
        style={{backgroundColor: 'transparent', alignContent: 'center'}}
        selectedIndex={selectedIndex}
        onSelect={i => {
          const date = new Date();
          const formattedDate = date.toISOString().split('T')[0];
          setSelectedIndex(i);
          switch (i) {
            case 0:
              date.setDate(date.getDate() - 4);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 1:
              date.setDate(date.getDate() - 3);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 2:
              date.setDate(date.getDate() - 2);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 3:
              date.setDate(date.getDate() - 1);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 4:
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 5:
              date.setDate(date.getDate() + 1);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 6:
              date.setDate(date.getDate() + 2);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 7:
              date.setDate(date.getDate() + 3);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            case 8:
              date.setDate(date.getDate() + 4);
              setMatchDate(date.toISOString().split('T')[0]);
              break;
            default:
              break;
          }
        }}>
        {/* TODO: Dynamically create tab title text */}
        <Tab style={styles.tab} title="Mon 15 Jul" />
        <Tab style={styles.tab} title="Mon 15 Jul" />
        <Tab style={styles.tab} title="Mon 15 Jul" />
        <Tab style={styles.tab} title="Yesterday" />
        <Tab style={styles.tab} title="Today" />
        <Tab style={styles.tab} title="Tomorrow" />
        <Tab style={styles.tab} title="Fri 19 Jul" />
        <Tab style={styles.tab} title="Fri 19 Jul" />
        <Tab style={styles.tab} title="Mon 15 Jul" />
      </TabBar>
    </ScrollView>
  );
};

export default TopNavBar;
