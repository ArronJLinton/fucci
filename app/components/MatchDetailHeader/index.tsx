import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {Match, StartXI} from '../../types/futbol';

interface MatchDetailHeaderProps {
    title: string;
    subtitle: string;
    data: Match
}

const MatchDetailHeader: React.FC<MatchDetailHeaderProps> = ({ title, subtitle }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>HEADER</Text>
            {/* <Text style={styles.subtitle}>{subtitle}</Text> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f2f2f2',
        borderBottomColor: '#ccc',
        borderBottomWidth: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});

export default MatchDetailHeader;