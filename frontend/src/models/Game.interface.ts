export type GameInfoArray = [
  bigint | undefined, // gameId
  number | undefined, // nbrMatches
  bigint | undefined, // starCost
  bigint | undefined, // 1M cash cost
  bigint | undefined, // endtime
  number[], // cards
  string[], // players
];

export enum GameInfoArrayType {
  GAME_ID = 0,
  NBR_MATCHES,
  STAR_COST,
  CASH_COST,
  ENDTIME,
  CARDS,
  PLAYERS,
}

export function buildGameId(
  chainId: number,
  gameAddress: string,
  gameId: string
): string {
  return `${chainId}-${gameAddress.toLowerCase()}-${gameId}`;
}

export interface IGame {
  id: string;
  gameId: string;
  gameAddress: string;
  nbrMatches: number;
  starCost: string;
  cashCost: string;
  endTimestamp: number;
  players: string[];
  nbrRocks: number;
  nbrPapers: number;
  nbrScissors: number;
  playerId: number;
}
