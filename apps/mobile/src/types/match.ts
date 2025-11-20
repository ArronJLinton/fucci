export interface Match {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
    venue?: {
      id: number;
      name: string;
      city: string;
    };
  };
  league: {
    id: number;
    name: string;
    logo: string;
    season: number;
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
