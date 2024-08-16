export interface Period {
	first: number;
	second: number;
}

export interface Venue {
	id: number;
	name: string;
	city: string;
}

export interface Statu {
	long: string;
	short: string;
	elapsed: number;
}

export interface Fixture {
	id: number;
	referee: string;
	timezone: string;
	date: string;
	timestamp: number;
	periods: Period;
	venue: Venue;
	status: Statu;
}

export interface League {
	id: number;
	name: string;
	country: string;
	logo: string;
	flag?: any;
	season: number;
	round: string;
}

export interface Home {
	id: number;
	name: string;
	logo: string;
	winner?: any;
}

export interface Away {
	id: number;
	name: string;
	logo: string;
	winner?: any;
}

export interface Team {
	home: Home;
	away: Away;
}

export interface Goal {
	home: number;
	away: number;
}

export interface Halftime {
	home: number;
	away: number;
}

export interface Fulltime {
	home: number;
	away: number;
}

export interface Extratime {
	home?: any;
	away?: any;
}

export interface Penalty {
	home?: any;
	away?: any;
}

export interface Score {
	halftime: Halftime;
	fulltime: Fulltime;
	extratime: Extratime;
	penalty: Penalty;
}

export interface Response {
	fixture: Fixture;
	league: League;
	teams: Team;
	goals: Goal;
	score: Score;
}

export interface Fixtures {
	errors: any[];
	results: number;
	response: Response[];
}