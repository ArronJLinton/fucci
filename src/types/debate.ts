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

export interface DebateContent {
  headline: string;
  description: string;
  cards: DebateCard[];
}

export interface DebatePrompt extends DebateContent {}

export interface DebateResponse extends DebateContent {}
export type DebateType = 'pre_match' | 'post_match';
