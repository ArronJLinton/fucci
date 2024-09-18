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

export interface Match {
	fixture: Fixture;
	league: League;
	teams: Team;
	goals: Goal;
	score: Score;
}

export interface Fixtures {
	errors: any[];
	results: number;
	response: Match[];
}





export interface Parameter {
	fixture: string;
}

export interface Paging {
	current: number;
	total: number;
}

export interface Team {
	id: number;
	name: string;
	logo: string;
	colors?: any;
}

export interface Coach {
	id: number;
	name: string;
	photo: string;
}

export interface StartXI {
	player: Player;
}

export interface Player {
	id: number;
	name: string;
	number: number;
	pos: string;
	grid: string;
	photo: string;
}

export interface Substitute {
	player: Player;
}

export interface Response {
	team: Team;
	coach: Coach;
	formation: string;
	startXI: StartXI[];
	substitutes: Substitute[];
}

export interface GetLineupsResponse {
	get: string;
	parameters: Parameter;
	errors: any[];
	results: number;
	paging: Paging;
	response: Response[];
}