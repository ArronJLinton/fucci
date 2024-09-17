import { createContext } from 'react';
import { Match } from '../types/futbol';

export type MatchState = {
    date: string;
    selectedMatch: Match | null;
};

export type MatchContextType = {
    state: MatchState;
    setMatchDate: (date: string) => void;
    setSelectedMatch: (match: Match) => void;
};

// export type Match = {
//     teams: any;
//     score: any;
// }

const initialState = {
    date: new Date().toISOString().split('T')[0],
    selectedMatch: null
}
const MatchContext = createContext<MatchContextType>({
    state: initialState,
    setMatchDate: () => {},
    setSelectedMatch: () => {}
});

export default MatchContext
