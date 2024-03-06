import { ICard } from "@/models/Card.interface";
import { IMatchData, buildMatchesDataId } from "@/models/Match.interface";

export async function clearMatchesData(id: string): Promise<void> {
  localStorage.removeItem(id);
}

export async function getMatchesData(
  gameGlobalId: string,
  wallet: string | undefined
): Promise<Record<number, IMatchData> | undefined> {
  let matchesData: Record<number, IMatchData> | undefined;
  if (wallet) {
    const matchesDataString = localStorage.getItem(
      buildMatchesDataId(gameGlobalId, wallet)
    );
    if (matchesDataString) {
      matchesData = JSON.parse(matchesDataString);
    }
  }
  return matchesData;
}

export async function getMatchData(
  gameGlobalId: string,
  wallet: string,
  matchId: number
): Promise<IMatchData | undefined> {
  const matchesData = await getMatchesData(gameGlobalId, wallet);
  if (matchesData) {
    return matchesData[matchId];
  }
}

export async function setMatchData(
  gameGlobalId: string,
  wallet: string,
  matchId: number,
  secret: string,
  card: ICard
): Promise<void> {
  const matchData: IMatchData = {
    card,
    secret,
  };
  let matchesData = await getMatchesData(gameGlobalId, wallet);
  if (!matchesData) {
    matchesData = {};
  }
  const matchesDataId = buildMatchesDataId(gameGlobalId, wallet);
  matchesData[matchId] = matchData;
  localStorage.setItem(matchesDataId, JSON.stringify(matchesData));
}

export async function removeMatchData(
  gameGlobalId: string,
  wallet: string,
  matchId: number
): Promise<void> {
  let matchesData = await getMatchesData(gameGlobalId, wallet);
  if (!matchesData) {
    return;
  }
  const matchesDataId = buildMatchesDataId(gameGlobalId, wallet);
  delete matchesData[matchId];
  localStorage.setItem(matchesDataId, JSON.stringify(matchesData));
}
