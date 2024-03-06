"use client";

import {
  GameInfoArray,
  GameInfoArrayType,
  IGame,
  buildGameId,
} from "@/models/Game.interface";
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "./store";
import { config } from "@/wagmi";
import { ICard } from "@/models/Card.interface";
import { readContract } from "wagmi/actions";
import GAME_CONTRACT from "@/contracts/RestrictedRPSGame.json";
import FACTORY_CONTRACT from "@/contracts/RestrictedRPSFactory.json";
import { fetchMatchesForGame } from "./matches.slice";
import {
  fetchPlayersStateForGame,
  selectCurrentGameGlobalId,
  setCurrentGameGlobalId,
} from "./playersState.slice";

const { abi: GAME_ABI } = GAME_CONTRACT;
const { abi: FACTORY_ABI } = FACTORY_CONTRACT;

// API
const fetchGameInfo = async (
  gameAddress: string,
  playerAddress: string | undefined
): Promise<IGame | undefined> => {
  let gameInfo: GameInfoArray | undefined;
  try {
    gameInfo = (await readContract(config, {
      address: gameAddress as `0x${string}`,
      abi: GAME_ABI,
      functionName: "getGameInfo",
    })) as GameInfoArray | undefined;
  } catch (e) {
    console.error(e);
    return;
  }
  if (gameInfo) {
    const players = gameInfo[GameInfoArrayType.PLAYERS].map((p) =>
      p.toLowerCase()
    );
    const gameId = gameInfo[GameInfoArrayType.GAME_ID]!.toString();
    const cards: number[] = gameInfo[GameInfoArrayType.CARDS]!;
    const game: IGame = {
      id: buildGameId(config.state.chainId, gameAddress, gameId),
      gameAddress,
      gameId,
      nbrMatches: gameInfo[GameInfoArrayType.NBR_MATCHES]!,
      starCost: gameInfo[GameInfoArrayType.STAR_COST]!.toString(),
      cashCost: gameInfo[GameInfoArrayType.CASH_COST]!.toString(),
      endTimestamp: Number(gameInfo[GameInfoArrayType.ENDTIME]!),
      nbrRocks: cards[ICard.ROCK],
      nbrPapers: cards[ICard.PAPER],
      nbrScissors: cards[ICard.SCISSORS],
      players,
      playerId: players.findIndex((addr) => addr == playerAddress),
    };

    return game;
  }
};
export const fetchOpenGamesInfo = createAsyncThunk(
  "openGames/fetchOpenGamesInfo",
  async (factoryAddress: string, thunkAPI): Promise<IGame[]> => {
    const data = (await readContract(config, {
      address: factoryAddress as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: "getOpenGames",
    })) as string[];
    const games: IGame[] = [];
    const playerAddress = (thunkAPI.getState() as RootState).playersState
      .playerAddress;

    let currentGame: IGame | undefined;
    for (const address of data) {
      const gameAddress = address.toLowerCase();
      const game: IGame | undefined = await fetchGameInfo(
        gameAddress,
        playerAddress
      );
      if (game) {
        games.push(game);
        if (game.playerId >= 0) {
          if (!currentGame) currentGame = game;

          thunkAPI.dispatch(
            fetchMatchesForGame({ gameAddress, gameGlobalId: game.id })
          );
        }
      }
    }

    if (currentGame) {
      thunkAPI.dispatch(setCurrentGameGlobalId(currentGame.id));
    }

    return games;
  }
);

export const fetchOpenGameInfo = createAsyncThunk(
  "openGames/fetchOpenGameInfo",
  async (address: string, thunkAPI): Promise<IGame | undefined> => {
    const playerAddress = (thunkAPI.getState() as RootState).playersState
      .playerAddress;
    const gameAddress = address.toLowerCase();
    const game: IGame | undefined = await fetchGameInfo(
      gameAddress,
      playerAddress
    );
    if (game) {
      if (game.playerId >= 0) {
        thunkAPI.dispatch(
          fetchMatchesForGame({ gameAddress, gameGlobalId: game.id })
        );
      }
    }
    return game;
  }
);

export const gameJoined = createAsyncThunk(
  "openGames/gameJoined",
  async (
    {
      gameAddress,
      gameGlobalId,
      joinedPlayerAddress,
    }: {
      gameAddress: string;
      gameGlobalId: string;
      joinedPlayerAddress: string;
    },
    thunkAPI
  ): Promise<IGame | undefined> => {
    const state = thunkAPI.getState() as RootState;
    const playerAddress = state.playersState.playerAddress;
    let game: IGame | undefined = state.openGames.entities[gameGlobalId];
    if (game) {
      game = { ...game };
      game.players = [...game.players];
      game.players.push(joinedPlayerAddress);
      if (playerAddress) {
        game.playerId = game.players.findIndex((p) => p == playerAddress);
      }
      thunkAPI.dispatch(
        fetchPlayersStateForGame({ gameAddress, gameGlobalId })
      );
    }

    return game;
  }
);

export const playerWasGivenCards = createAsyncThunk(
  "openGames/playerWasGivenCards",
  async (
    {
      gameAddress,
      gameGlobalId,
      playerId,
    }: {
      gameAddress: string;
      gameGlobalId: string;
      playerId: number;
    },
    thunkAPI
  ): Promise<IGame | undefined> => {
    const state = thunkAPI.getState() as RootState;
    const playerAddress = state.playersState.playerAddress;
    const game: IGame | undefined = await fetchGameInfo(
      gameAddress,
      playerAddress
    );
    thunkAPI.dispatch(fetchPlayersStateForGame({ gameAddress, gameGlobalId }));

    return game;
  }
);

// Adapter
const openGamesAdapter = createEntityAdapter<IGame>({
  sortComparer: (a, b) => Number(BigInt(a.gameId) - BigInt(b.gameId)),
});

// Selector
export const { selectAll: selectAllOpenGames, selectById: selectOpenGameById } =
  openGamesAdapter.getSelectors((state: any) => state.openGames);

export const selectCurrentGame = createSelector(
  [selectAllOpenGames, selectCurrentGameGlobalId],
  (games: IGame[], currentGameGlobalId: string | undefined) => {
    if (currentGameGlobalId) {
      return games.find((g) => g.id == currentGameGlobalId);
    }
  }
);
export const selectAllOpenGamesIdsJoinedByCurrentPlayer = createSelector(
  [selectAllOpenGames],
  (openGames: IGame[]) => {
    const ids: string[] = [];
    for (const game of openGames) {
      if (game.playerId >= 0) {
        ids.push(game.id);
      }
    }
    return ids;
  }
);

export const selectAllOpenGamesJoinedByCurrentPlayer = createSelector(
  [selectAllOpenGames],
  (openGames: IGame[]) => {
    const ids: string[] = [];
    return openGames.filter((g) => g.playerId >= 0);
  }
);

export const selectAllOpenGamesNotYetJoinedByCurrentPlayer = createSelector(
  [selectAllOpenGames],
  (openGames: IGame[]) => {
    const ids: string[] = [];
    for (const game of openGames) {
      if (game.playerId < 0) {
        ids.push(game.id);
      }
    }
    return ids;
  }
);

export const openGamesSlice = createSlice({
  name: "openGames",
  initialState: openGamesAdapter.getInitialState({}),
  reducers: {
    updatePlayerAddressForGames: (state, { payload }: { payload: string }) => {
      const games = Object.values(state.entities);
      const changes: { id: string; changes: any }[] = [];
      for (const game of games) {
        changes.push({
          id: game.id,
          changes: {
            playerId: game.players.findIndex((p) => p == payload),
          },
        });
      }
      openGamesAdapter.updateMany(state, changes);
    },
    removeOpenGame: (state, { payload }: { payload: string }) => {
      openGamesAdapter.removeOne(state, payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchOpenGamesInfo.fulfilled,
      (state, { payload }: { payload: IGame[] }) => {
        openGamesAdapter.setAll(state, payload);
      }
    );
    builder.addCase(
      fetchOpenGameInfo.fulfilled,
      (state, { payload }: { payload: IGame | undefined }) => {
        if (payload) {
          openGamesAdapter.upsertOne(state, payload);
        }
      }
    );
    builder.addCase(
      gameJoined.fulfilled,
      (state, { payload }: { payload: IGame | undefined }) => {
        if (payload) {
          openGamesAdapter.upsertOne(state, payload);
        }
      }
    );
    builder.addCase(
      playerWasGivenCards.fulfilled,
      (state, { payload }: { payload: IGame | undefined }) => {
        if (payload) {
          openGamesAdapter.upsertOne(state, payload);
        }
      }
    );
  },
});

export const { removeOpenGame, updatePlayerAddressForGames } =
  openGamesSlice.actions;
export default openGamesSlice.reducer;
