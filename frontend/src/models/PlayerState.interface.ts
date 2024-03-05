export interface PlayerState {
  id: string;
  gameAddress: string;
  gameGlobalId: string;
  playerAddress: string;
  playerId: number;
  nbrStars: number;
  nbrStarsLocked: number;
  nbrRocks: number;
  nbrPapers: number;
  nbrScissors: number;
  lockedRocks?: number;
  lockedPapers?: number;
  lockedScissors?: number;
  cheated: boolean;
  cardsGiven: boolean;
}

export function buildPlayerStateId(
  gameGlobalId: string,
  playerAddress: string
) {
  return `${gameGlobalId}-${playerAddress.toLowerCase()}`;
}
