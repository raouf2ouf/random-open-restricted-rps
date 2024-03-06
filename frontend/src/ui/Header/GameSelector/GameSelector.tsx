import { memo } from "react";

import "./GameSelector.scss";
import { Select, SelectItem, Selection } from "@nextui-org/react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { selectAllOpenGamesJoinedByCurrentPlayer } from "@/store/openGames.slice";
import {
  selectCurrentGameGlobalId,
  setCurrentGameGlobalId,
} from "@/store/playersState.slice";

type Props = {};

const GameSelector: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const games = useAppSelector((state) =>
    selectAllOpenGamesJoinedByCurrentPlayer(state)
  );
  const currentGameGlobalId = useAppSelector((state) =>
    selectCurrentGameGlobalId(state)
  );

  function select(keys: Selection) {
    const ids = Array.from(keys) as string[];
    if (ids.length > 0) {
      const id = ids[0];
      dispatch(setCurrentGameGlobalId(id));
    }
  }
  return (
    <div className="game-selector-container">
      <Select
        label="Current Game ID"
        popoverProps={{
          classNames: {
            content: "game-select-content",
          },
        }}
        selectedKeys={currentGameGlobalId ? [currentGameGlobalId] : []}
        onSelectionChange={select}
      >
        {games &&
          games.map((g) => <SelectItem key={g.id}>{g.gameId}</SelectItem>)}
      </Select>
    </div>
  );
};

export default memo(GameSelector);
