import * as React from 'react';
import { Text, View } from 'react-native';

const Matches = () => {

    React.useEffect(() => {
        const headers = {
            'Content-Type': 'application/json',
            'x-rapidapi-key': 'eHEXcBfXlvmshTKBzDaZsMjlg3vsp1S9P4tjsnkCPsukbJlULL',
          };
        fetch('https://api-football-v1.p.rapidapi.com/v3/fixtures?date=2024-07-16', {
            method: 'GET',
            headers: headers
          })
            .then(response => {
                console.log('Data received:', response)
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // parses JSON response into native JavaScript objects
            })
            .then(data => {
                console.log('Data received:', data);
                // Handle the data here
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error)               


                // Handle errors here
            });
    })


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Matches!</Text>
        </View>
    );
}

export default Matches;
