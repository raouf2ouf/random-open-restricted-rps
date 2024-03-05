import { ICard } from "./Card.interface";

export enum MatchState {
  UNDECIDED = 0,
  ANSWERED,
  CANCELLED,
  DRAW,
  WIN1, // win for player 1
  WIN2, // win for player 2
}

export function matchStateToText(result: MatchState) {
  switch (result) {
    case MatchState.UNDECIDED:
      return "undecided";
    case MatchState.ANSWERED:
      return "answered";
    case MatchState.DRAW:
      return "draw";
    case MatchState.WIN1:
      return "win1";
    case MatchState.WIN2:
      return "win2";
  }
}

export interface IMatch {
  id: string;
  matchId: number;
  gameGlobalId: string;
  player1: number;
  player2: number;
  player1Card: ICard;
  player2Card: ICard;
  player1Bet: number;
  player2Bet: number;
  result: MatchState;
  secret?: string;
}

export function buildMatchesDataId(
  gameGlobalId: string,
  wallet: string
): string {
  return `${gameGlobalId}-${wallet.toLowerCase()}`;
}

export interface IMatchData {
  secret: string;
  card: ICard;
}

export function buildMatchId(gameGlobalId: string, matchId: number): string {
  return `${gameGlobalId}-${matchId}`;
}
