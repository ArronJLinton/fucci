import * as React from 'react';
import { Text, View, Button, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Tab, TabBar } from '@ui-kitten/components';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
    tab: {
        marginLeft: 15,
        marginRight: 15,
    }
})
const TopNavBar = () => {
    const [selectedIndex, setSelectedIndex] = React.useState(4);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: screenWidth/1.5, y: 0 }}
        >
            <TabBar
                style={{ backgroundColor: 'transparent', alignContent: 'center' }}
                selectedIndex={selectedIndex}
                onSelect={index => setSelectedIndex(index)}
            >
                <Tab style={styles.tab} title='Mon 15 Jul' />
                <Tab style={styles.tab} title='Mon 15 Jul' />
                <Tab style={styles.tab} title='Mon 15 Jul' />
                <Tab style={styles.tab} title='Yesterday' />
                <Tab style={styles.tab} title='Today' />
                <Tab style={styles.tab} title='Tomorrow' />
                <Tab style={styles.tab} title='Fri 19 Jul' />
                <Tab style={styles.tab} title='Fri 19 Jul' />
                <Tab style={styles.tab} title='Mon 15 Jul' />

            </TabBar>
        </ScrollView>
    )
}

export default TopNavBar;