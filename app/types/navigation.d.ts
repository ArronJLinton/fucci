// types/navigation.d.ts

import { Match } from './futbol';
export type TopTabParamList = {
  Lineup: { data: Match; scroll: any };
  Table: undefined;
  Facts: undefined;
  Story: undefined;
};
