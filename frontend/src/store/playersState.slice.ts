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
import { getMatchesData } from "@/api/local";
import { buildGameId } from "@/models/Game.interface";
import { ICard } from "@/models/Card.interface";
import { updatePlayerAddressForGames } from "./openGames.slice";

// API
const getPlayersStates = async (
  config: Config,
  gameAddress: string,
  gameGlobalId: string
): Promise<PlayerState[]> => {
  const playersStates: PlayerState[] = [];
  const data = (await readContract(config, {
    address: gameAddress as `0x${string}`,
    abi: GAME_CONTRACT.abi,
    functionName: "getPlayersState",
  })) as any[];
  for (let i = 0; i < data.length; i++) {
    const d = data[i] as any;
    const state: PlayerState = {
      id: buildPlayerStateId(gameGlobalId, d.player),
      gameAddress,
      gameGlobalId,
      playerAddress: d.player.toLowerCase(),
      playerId: i,
      nbrStars: d.nbrStars,
      nbrStarsLocked: d.nbrStarsLocked,
      nbrRocks: d.nbrRocks,
      nbrPapers: d.nbrPapers,
      nbrScissors: d.nbrScissors,
      cheated: d.cheated,
      cardsGiven: d.cardsGiven,
    };
    playersStates.push(state);
  }
  return playersStates;
};

const enrichPlayerStateWithLockedCards = async (
  currentPlayerState: PlayerState,
  playerAddress: string
): Promise<void> => {
  const matchesData = await getMatchesData(
    currentPlayerState.gameGlobalId,
    playerAddress
  );
  currentPlayerState.lockedRocks = 0;
  currentPlayerState.lockedPapers = 0;
  currentPlayerState.lockedScissors = 0;
  if (matchesData) {
    for (const m in matchesData) {
      const match = matchesData[m];
      if (match.card == ICard.ROCK) {
        currentPlayerState.lockedRocks++;
      } else if (match.card == ICard.PAPER) {
        currentPlayerState.lockedPapers++;
      } else {
        currentPlayerState.lockedScissors++;
      }
    }
  }
};

export const fetchPlayersStateForGame = createAsyncThunk(
  "playersState/updatePlayerState",
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
  ): Promise<PlayerState[]> => {
    const playerAddress = (thunkAPI.getState() as RootState).playersState
      .playerAddress;
    const playersStates = await getPlayersStates(
      config,
      gameAddress,
      gameGlobalId
    );
    const currentPlayerState = playersStates.find(
      (s) => s.playerAddress == playerAddress
    );
    if (playerAddress && currentPlayerState) {
      await enrichPlayerStateWithLockedCards(currentPlayerState, playerAddress);
    }
    return playersStates;
  }
);

export const updatePlayerState = createAsyncThunk(
  "playersState/updatePlayerState",
  async (playerState: PlayerState, thunkAPI): Promise<PlayerState> => {
    const playerAddress = (thunkAPI.getState() as RootState).playersState
      .playerAddress;
    if (playerAddress) {
      await enrichPlayerStateWithLockedCards(playerState, playerAddress);
    }
    return playerState;
  }
);

export const setPlayerAddress = createAsyncThunk(
  "playersState/setPlayerAddress",
  async (playerAddress: string, thunkAPI): Promise<string> => {
    thunkAPI.dispatch(updatePlayerAddressForGames(playerAddress));
    return playerAddress;
  }
);

export const setCurrentGameGlobalId = createAsyncThunk(
  "playersState/setCurrentGameGlobalId",
  async (
    currentGameGlobalId: string,
    thunkAPI
  ): Promise<
    { currentGameGlobalId: string; currentPlayerId: number } | undefined
  > => {
    const currentGame = (thunkAPI.getState() as RootState).openGames.entities[
      currentGameGlobalId
    ];
    if (currentGame) {
      return {
        currentGameGlobalId,
        currentPlayerId: currentGame.playerId,
      };
    }
  }
);

// Adapter
const playersStateAdapter = createEntityAdapter<PlayerState>({});

// Selectors
export const {
  selectAll: selectAllPlayersStates,
  selectById: selectPlayerStateById,
} = playersStateAdapter.getSelectors((state: any) => state.playersState);

export const selectPlayersStateForCurrentGame = createSelector(
  [selectAllPlayersStates, (state) => state.playersState.currentGameGlobalId],
  (playersStates: PlayerState[], gameGlobalId: string) => {
    return playersStates.filter(
      (playerState) => playerState.gameGlobalId == gameGlobalId
    );
  }
);

// Slice
type ExtraState = {
  playerAddress?: string;
  currentGameGlobalId?: string;
  currentPlayerId: number;
};
export const playersStateSlice: any = createSlice({
  name: "playersState",
  initialState: playersStateAdapter.getInitialState<ExtraState>({
    currentPlayerId: -1,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      fetchPlayersStateForGame.fulfilled,
      (state, { payload }: { payload: PlayerState[] }) => {
        playersStateAdapter.upsertMany(state, payload);
      }
    );
    builder.addCase(
      setPlayerAddress.fulfilled,
      (state, { payload }: { payload: string }) => {
        state.playerAddress = payload;
        state.currentGameGlobalId = undefined;
        state.currentPlayerId = -1;
      }
    );
    builder.addCase(setCurrentGameGlobalId.fulfilled, (state, { payload }) => {
      if (payload) {
        state.currentGameGlobalId = payload.currentGameGlobalId;
        state.currentPlayerId = payload.currentPlayerId;
      }
    });

    builder.addCase(
      updatePlayerState.fulfilled,
      (state, { payload }: { payload: PlayerState }) => {
        playersStateAdapter.upsertOne(state, payload);
      }
    );
  },
});

export const { upsertPlayerState } = playersStateSlice.actions;
export default playersStateSlice.reducer;
