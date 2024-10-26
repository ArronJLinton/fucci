import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { screenHeight } from '../../helpers/constants';
import { DataTable } from 'react-native-paper';
import { useFetchData } from '../../hooks/fetch';
import { Match, StartXI, Player } from '../../types/futbol';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: screenHeight,
    backgroundColor: 'pink',
  },
});

interface LeagueTableProps {
  data: Match;
}

export default function LeagueTable(props: LeagueTableProps) {
  const { id } = props.data.league;
  const headers = {
    'Content-Type': 'application/json',
  };
  const url = `http://localhost:8080/v1/api/futbol/league_standings?league_id=${id}`;
  const { data, isLoading, error } = useFetchData<any>(
    url,
    'GET',
    headers,
    null,
  );
  if (isLoading) return <Text>Loading....</Text>;
  if (error) return <Text>ERROR: {error.message}</Text>;

  return (
    <ScrollView>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>#</DataTable.Title>
          <DataTable.Title numeric>P</DataTable.Title>
          <DataTable.Title numeric>W</DataTable.Title>
          <DataTable.Title numeric>D</DataTable.Title>
          <DataTable.Title numeric>L</DataTable.Title>
          <DataTable.Title numeric>GD</DataTable.Title>
          <DataTable.Title numeric>Pts</DataTable.Title>
        </DataTable.Header>

        {/* TODO: Add type for league object */}
        {data.map(({ rank, team, all, goalsDiff, points }: any, i: number) => (
          <DataTable.Row key={i.toString()}>
            <DataTable.Cell>{rank}</DataTable.Cell>
            <DataTable.Cell style={{ flex: 5 }}>{team.name}</DataTable.Cell>
            <DataTable.Cell>{all.played}</DataTable.Cell>
            <DataTable.Cell>{all.win}</DataTable.Cell>
            <DataTable.Cell>{all.draw}</DataTable.Cell>
            <DataTable.Cell>{all.lose}</DataTable.Cell>
            <DataTable.Cell>{goalsDiff}</DataTable.Cell>
            <DataTable.Cell>{points}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
}