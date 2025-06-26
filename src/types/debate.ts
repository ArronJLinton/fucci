export interface DebateStance {
  id: string;
  type: 'agree' | 'disagree' | 'wildcard';
  text: string;
  votes: number;
}

export interface DebateCard {
  stance: 'agree' | 'disagree' | 'wildcard';
  title: string;
  description: string;
}

export interface DebatePrompt {
  headline: string;
  description: string;
  cards: DebateCard[];
}

export interface DebateResponse {
  headline: string;
  description: string;
  cards: DebateCard[];
}

export type DebateType = 'pre_match' | 'post_match';
