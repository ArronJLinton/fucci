import { createContext } from 'react';

type MatchState = {
    date: string;
};

type MatchContextType = {
    state: MatchState;
    setMatchDate: (date: string) => void;
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export {
    MatchContext
}