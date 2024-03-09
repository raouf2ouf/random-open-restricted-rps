"use client";
import { readContract, Config } from "@wagmi/core";
import { buildPlayerStateId } from "@/models/PlayerState.interface";
import GAME_CONTRACT from "@/contracts/RestrictedRPSGame.json";
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "./store";
import { IMatch, MatchState, buildMatchId } from "@/models/Match.interface";
import {
  fetchPlayersStateForGame,
  updatePlayerState,
} from "./playersState.slice";
import { getMatchesData, removeMatchData } from "@/api/local";
import { config } from "@/wagmi";

const { abi: GAME_ABI } = GAME_CONTRACT;

// API
const getMatchesForGame = async (
  config: Config,
  gameAddress: string,
  gameGlobalId: string
): Promise<IMatch[]> => {
  const matches: IMatch[] = [];
  const data = (await readContract(config, {
    address: gameAddress as `0x${string}`,
    abi: GAME_ABI,
    functionName: "getMatches",
  })) as any[];
  for (let i = 0; i < data.length; i++) {
    const d = data[i] as any;
    const m: IMatch = {
      id: buildMatchId(gameGlobalId, i),
      gameGlobalId,
      gameId: gameGlobalId.split("-")[2],
      matchId: i,
      player1: d.realPlayer1Id,
      player2: d.realPlayer2Id,
      player1Card: d.player1Card,
      player2Card: d.player2Card,
      player1Bet: d.player1Bet,
      player2Bet: d.player2Bet,
      result: d.result,
    };
    matches.push(m);
  }
  return matches;
};

export const fetchMatchesForGame = createAsyncThunk(
  "matches/fetchMatchesForGame",
  async (
    {
      gameAddress,
      gameGlobalId,
    }: {
      gameAddress: string;
      gameGlobalId: string;
    },
    thunkAPI
  ): Promise<IMatch[]> => {
    const playerAddress = (thunkAPI.getState() as RootState).playersState
      .playerAddress;
    const matches = await getMatchesForGame(config, gameAddress, gameGlobalId);
    const matchesData = await getMatchesData(gameGlobalId, playerAddress);
    if (playerAddress && matchesData) {
      for (const match of matches) {
        const data = matchesData[match.matchId];
        if (data) {
          if (
            match.result == MatchState.UNDECIDED ||
            match.result == MatchState.ANSWERED
          ) {
            match.secret = data.secret;
            match.player1Card = data.card;
          } else {
            await removeMatchData(gameGlobalId, playerAddress, match.matchId);
          }
        }
      }
    }
    await thunkAPI.dispatch(
      fetchPlayersStateForGame({ gameAddress, gameGlobalId, matches })
    );
    return matches;
  }
);
export const closeOrCancelMatch = createAsyncThunk(
  "matches/cancelMatch",
  async (
    {
      id,
      gameGlobalId,
      match,
    }: { id: string; gameGlobalId: string; match: IMatch },
    thunkAPI
  ): Promise<string> => {
    const state = thunkAPI.getState() as RootState;
    const playerAddress = state.playersState.playerAddress;

    if (playerAddress) {
      await removeMatchData(gameGlobalId, playerAddress, match.matchId);
      let playerState =
        state.playersState.entities[
          buildPlayerStateId(gameGlobalId, playerAddress)
        ];
      if (playerState) {
        playerState = { ...playerState };
        playerState.nbrStarsLocked -= match.player1Bet;

        thunkAPI.dispatch(updatePlayerState({ ...playerState }));
      }
    }
    return id;
  }
);

// Adapter
const matchesAdapter = createEntityAdapter<IMatch>({
  sortComparer: (a: IMatch, b: IMatch) => b.matchId - a.matchId,
});

// Selectors
export const { selectAll: selectAllMatches, selectById: selectMatchById } =
  matchesAdapter.getSelectors((state: any) => state.matches);

export const selectMatchesForCurrentGame = createSelector(
  [selectAllMatches, (state) => state.playersState.currentGameGlobalId],
  (matches: IMatch[], currentGameGlobalId: string) => {
    return matches.filter((m) => m.gameGlobalId == currentGameGlobalId);
  }
);

export const selectOpenMatchesIdsForCurrentGameOfPlayer = createSelector(
  [
    selectMatchesForCurrentGame,
    (state) => {
      return state.playersState.currentPlayerId;
    },
  ],
  (matches: IMatch[], playerId: number) => {
    const ids: string[] = [];
    for (const m of matches) {
      if (m.player1 == playerId && m.result == MatchState.UNDECIDED) {
        ids.push(m.id);
      }
    }
    return ids;
  }
);

export const selectOpenMatchesIdsForCurrentGameOfNotPlayer = createSelector(
  [
    selectMatchesForCurrentGame,
    (state) => {
      return state.playersState.currentPlayerId;
    },
  ],
  (matches: IMatch[], playerId: number) => {
    const ids: string[] = [];
    for (const m of matches) {
      if (m.player1 != playerId && m.result == MatchState.UNDECIDED) {
        ids.push(m.id);
      }
    }
    return ids;
  }
);

export const selectAnsweredMatchesIdsForCurrentGameOfPlayer = createSelector(
  [
    selectMatchesForCurrentGame,
    (state) => {
      return state.playersState.currentPlayerId;
    },
  ],
  (matches: IMatch[], playerId: number) => {
    const ids: string[] = [];
    for (const m of matches) {
      if (m.player1 == playerId && m.result == MatchState.ANSWERED) {
        ids.push(m.id);
      }
    }
    return ids;
  }
);

export const selectAnsweredMatchesIdsForCurrentGameByPlayer = createSelector(
  [
    selectMatchesForCurrentGame,
    (state) => {
      return state.playersState.currentPlayerId;
    },
  ],
  (matches: IMatch[], playerId: number) => {
    const ids: string[] = [];
    for (const m of matches) {
      if (m.player2 == playerId && m.result == MatchState.ANSWERED) {
        ids.push(m.id);
      }
    }
    return ids;
  }
);

export const selectPlayedMatchesIdsForCurrentGame = createSelector(
  [selectMatchesForCurrentGame],
  (matches: IMatch[]) => {
    const ids: string[] = [];
    for (const m of matches) {
      if (m.result >= MatchState.DRAW) {
        ids.push(m.id);
      }
    }
    return ids;
  }
);

export const selectPlayedMatchesIdsForCurrentGameOfPlayer = createSelector(
  [selectMatchesForCurrentGame, (state) => state.playersState.currentPlayerId],
  (matches: IMatch[], currentPlayerId: number) => {
    const ids: string[] = [];
    for (const m of matches) {
      if (
        m.result >= MatchState.DRAW &&
        (m.player1 == currentPlayerId || m.player2 == currentPlayerId)
      ) {
        ids.push(m.id);
      }
    }
    return ids;
  }
);
// Slice
type ExtraState = {};
export const matchesSlice = createSlice({
  name: "matches",
  initialState: matchesAdapter.getInitialState<ExtraState>({}),
  reducers: {
    removeMatch: (state, { payload }: { payload: string }) => {
      matchesAdapter.removeOne(state, payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMatchesForGame.fulfilled, (state, { payload }) => {
      matchesAdapter.upsertMany(state, payload);
    });
    builder.addCase(closeOrCancelMatch.fulfilled, (state, { payload }) => {
      matchesAdapter.removeOne(state, payload);
    });
  },
});

export const { removeMatch } = matchesSlice.actions;
export default matchesSlice.reducer;
