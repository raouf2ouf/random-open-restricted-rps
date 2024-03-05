import { ICard } from "./Card.interface";
import { IMatchData } from "./Match.interface";

export type GameInfoArray = [
  bigint | undefined, // gameId
  number | undefined, // nbrPlayers
  number | undefined, // nbrMatches
  bigint | undefined, // starCost
  bigint | undefined, // 1M cash cost
  bigint | undefined, // endtime
  string[], // players
];

export function buildGameId(
  chainId: number,
  gameAddress: string,
  gameId: bigint
): string {
  return `${chainId}-${gameAddress.toLowerCase()}-${gameId}`;
}

export interface IGame {
  id: string;
  gameId: bigint;
  gameAddress: string;
  nbrPlayers: number;
  nbrMatches: number;
  starCost: string;
  cashCost: string;
  endTimestamp: number;
  players: string[];
  playerId: number;
}

export function gameArrayToGame(
  chainId: number,
  gameAddress: string,
  data: GameInfoArray,
  playerAddress: string
): IGame {
  const players = data[6].map((addr) => addr.toLowerCase());
  return {
    id: buildGameId(chainId, gameAddress, data[0]!),
    gameAddress,
    gameId: data[0]!,
    nbrPlayers: data[1]!,
    nbrMatches: data[2]!,
    starCost: data[3]!.toString(),
    cashCost: data[4]!.toString(),
    endTimestamp: Number(data[5]),
    players,
    playerId: players.findIndex((addr) => addr == playerAddress),
  };
}
