import { createContext } from 'react';

export type MatchState = {
    date: string;
};

export type MatchContextType = {
    state: MatchState;
    setMatchDate: (date: string) => void;
};

export type Match = {
    teams: any;
    score: any;
}

const initialState = {
    date: new Date().toISOString().split('T')[0]
}
const MatchContext = createContext<MatchContextType>({
    state: initialState,
    setMatchDate: () => {}
});

export default MatchContext
