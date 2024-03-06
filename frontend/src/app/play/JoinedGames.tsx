import {
  selectAllOpenGamesIdsJoinedByCurrentPlayer,
  selectOpenGameById,
} from "@/store/openGames.slice";
import { setCurrentGameGlobalId } from "@/store/playersState.slice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import Timer from "@/ui/components/Timer/Timer";
import { Button } from "@nextui-org/react";
import { memo } from "react";

type Props = {
  gameGlobalId: string;
};
const JoinedGameDisplay: React.FC<Props> = ({ gameGlobalId }) => {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) =>
    selectOpenGameById(state, gameGlobalId)
  );

  function selectGame() {
    dispatch(setCurrentGameGlobalId(gameGlobalId));
  }
  return (
    <>
      {game && (
        <div className="game">
          {/* {game.gameAddress} */}
          <div className="game-id column">
            <div className="label">
              <span className="hide-md">Game </span>ID
            </div>
            <div className="data">{game.gameId.toString()}</div>
          </div>
          <div className="game-players column">
            <div className="label">Players</div>
            <div className="data">{game.players.length}/20</div>
          </div>
          <div className="game-matches column hide-md">
            <div className="label">
              Matches <span className="hide-md">Played</span>
            </div>
            <div className="data">{game.nbrMatches}</div>
          </div>
          <div className="game-duration column">
            <div className="label">Duration</div>
            <div className="data">
              <Timer endTime={game.endTimestamp} />
            </div>
          </div>

          <Button
            className="rectangle"
            variant="bordered"
            color="primary"
            onClick={selectGame}
          >
            Select
          </Button>
        </div>
      )}
    </>
  );
};
const JoinedGameDisplayMemo = memo(JoinedGameDisplay);

const JoinedGames: React.FC = () => {
  const joinedGames = useAppSelector((state) =>
    selectAllOpenGamesIdsJoinedByCurrentPlayer(state)
  );
  return (
    <>
      {joinedGames.map((id) => {
        return <JoinedGameDisplayMemo gameGlobalId={id} key={id} />;
      })}
    </>
  );
};

export default memo(JoinedGames);
