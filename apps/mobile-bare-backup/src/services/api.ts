interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  goalDifference: number;
}

export const fetchStandings = async (
  leagueId: number,
  seasonYear: number,
): Promise<Standing[]> => {
  try {
    const apiUrl = `https://fucci-api-staging.up.railway.app/v1/api/futbol/league_standings?league_id=${leagueId}&season=${seasonYear}`;
    console.log('fetchStandings API URL:', apiUrl);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch standings: ${response.status}`);
    }
    const data = await response.json();
    return data.response[0].league.standings || [];
  } catch (error) {
    console.error('Error fetching standings:', error);
    throw error;
  }
};
