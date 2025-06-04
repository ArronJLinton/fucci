export interface Match {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    name: string;
    logo: string;
  };
  teams: {
    home: {
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}
