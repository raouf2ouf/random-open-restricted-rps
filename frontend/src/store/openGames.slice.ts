import { IGame } from "@/models/Game.interface";
import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

// Adapter
const openGamesAdapter = createEntityAdapter<IGame>({
  sortComparer: (a, b) => a.id.localeCompare(b.id),
});

// Selector
export const { selectAll: selectAllOpenGames, selectById: selectOpenGameById } =
  openGamesAdapter.getSelectors((state: any) => state.games);

export const selectAllOpenGamesJoinedByCurrentPlayer = createSelector(
  [selectAllOpenGames],
  (openGames: IGame[]) => {
    return openGames.filter((g) => g.playerId >= 0);
  }
);

export const selectAllOpenGamesNotYetJoinedByCurrentPlayer = createSelector(
  [selectAllOpenGames],
  (openGames: IGame[]) => {
    return openGames.filter((g) => g.playerId < 0);
  }
);

export const openGamesSlice = createSlice({
  name: "openGames",
  initialState: openGamesAdapter.getInitialState(),
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
    setAllOpenGames: (state, { payload }: { payload: IGame[] }) => {
      openGamesAdapter.setAll(state, payload);
    },
    upsertOpenGame: (state, { payload }: { payload: IGame }) => {
      openGamesAdapter.upsertOne(state, payload);
    },
    removeOpenGame: (state, { payload }: { payload: string }) => {
      openGamesAdapter.removeOne(state, payload);
    },
  },
});

export const {
  setAllOpenGames,
  upsertOpenGame,
  removeOpenGame,
  updatePlayerAddressForGames,
} = openGamesSlice.actions;
export default openGamesSlice.reducer;
