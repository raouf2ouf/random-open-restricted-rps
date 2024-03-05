import { readContract, Config } from "@wagmi/core";
import {
  PlayerState,
  buildPlayerStateId,
} from "@/models/PlayerState.interface";
import * as GAME_CONTRACT from "@/contracts/RestrictedRPSGame.json";
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
  upsertPlayerState,
} from "./playersState.slice";
import { ICard } from "@/models/Card.interface";
import { getMatchData, getMatchesData, removeMatchData } from "@/api/local";
import { buildGameId } from "@/models/Game.interface";

// API
const getMatchesForGame = async (
  config: Config,
  gameAddress: string,
  gameGlobalId: string
): Promise<IMatch[]> => {
  const matches: IMatch[] = [];
  const data = (await readContract(config, {
    address: gameAddress as `0x${string}`,
    abi: GAME_CONTRACT.abi,
    functionName: "getMatches",
  })) as any[];
  for (let i = 0; i < data.length; i++) {
    const d = data[i] as any;
    const m: IMatch = {
      id: buildMatchId(gameGlobalId, i),
      gameGlobalId,
      matchId: i,
      player1: d.player1,
      player2: d.player2,
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
      config,
      gameAddress,
      gameGlobalId,
    }: {
      config: Config;
      gameAddress: string;
      gameGlobalId: string;
    },
    thunkAPI
  ): Promise<IMatch[]> => {
    const playerAddress = (thunkAPI.getState() as RootState).playersState
      .playerAddress;
    const matches = await getMatchesForGame(config, gameAddress, gameGlobalId);
    const matchesData = await getMatchesData(gameGlobalId, playerAddress);
    if (matchesData) {
      for (const match of matches) {
        if (
          playerAddress &&
          (match.result == MatchState.UNDECIDED ||
            match.result == MatchState.ANSWERED)
        ) {
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
    }
    await thunkAPI.dispatch(
      fetchPlayersStateForGame({ config, gameAddress, gameGlobalId })
    );
    return matches;
  }
);
export const closeOrCancelMatch = createAsyncThunk(
  "matches/cancelMatch",
  async (match: IMatch, thunkAPI): Promise<IMatch> => {
    const state = thunkAPI.getState() as RootState;
    const { playerAddress } = state.playersState;
    const playerState =
      state.playersState.entities[
        buildPlayerStateId(match.gameGlobalId, playerAddress)
      ];

    if (playerAddress) {
      await removeMatchData(match.gameGlobalId, playerAddress, match.matchId);
    }
    if (playerState) {
      thunkAPI.dispatch(updatePlayerState({ ...playerState }));
    }
    return match;
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

export const selectOpenMatchesForCurrentGame = createSelector(
  [
    selectMatchesForCurrentGame,
    (state) => {
      return state.playersState.currentPlayerId;
    },
  ],
  (matches: IMatch[], playerId: number) => {
    return matches.filter(
      (m) => m.player1 == playerId && m.result == MatchState.UNDECIDED
    );
  }
);

export const selectOpenMatchesForCurrentGameOfNotPlayer = createSelector(
  [
    selectMatchesForCurrentGame,
    (state) => {
      return state.playersState.currentPlayerId;
    },
  ],
  (matches: IMatch[], playerId: number) => {
    return matches.filter(
      (m) => m.player1 != playerId && m.result == MatchState.UNDECIDED
    );
  }
);

export const selectAnsweredMatchesForCurrentGameOfPlayer = createSelector(
  [
    selectMatchesForCurrentGame,
    (state) => {
      return state.playersState.currentPlayerId;
    },
  ],
  (matches: IMatch[], playerId: number) => {
    return matches.filter(
      (m) => m.player1 == playerId && m.result == MatchState.ANSWERED
    );
  }
);

export const selectPlayedMatchesForCurrentGame = createSelector(
  [selectMatchesForCurrentGame],
  (matches: IMatch[]) => {
    return matches.filter((m) => m.result >= MatchState.DRAW);
  }
);
// Slice
type ExtraState = {};
export const matchesSlice = createSlice({
  name: "matches",
  initialState: matchesAdapter.getInitialState<ExtraState>({}),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMatchesForGame.fulfilled, (state, { payload }) => {
      matchesAdapter.upsertMany(state, payload);
    });
    builder.addCase(closeOrCancelMatch.fulfilled, (state, { payload }) => {
      matchesAdapter.upsertOne(state, payload);
    });
  },
});

export const {} = matchesSlice.actions;
export default matchesSlice.reducer;