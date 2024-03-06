import {
  selectAllOpenGamesNotYetJoinedByCurrentPlayer,
  selectOpenGameById,
} from "@/store/openGames.slice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import Timer from "@/ui/components/Timer/Timer";
import { Button, useDisclosure } from "@nextui-org/react";
import { memo } from "react";
import JoinGameModal from "./JoinGameModal";

type Props = {
  gameGlobalId: string;
};
const OpenGameDisplay: React.FC<Props> = ({ gameGlobalId }) => {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) =>
    selectOpenGameById(state, gameGlobalId)
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  function joinGame() {
    onOpen();
  }
  return (
    <>
      {game && (
        <div className="game">
          <div className="game-id column">
            <div className="label">
              <span className="hide-md">Game </span>ID
            </div>
            <div className="data">{game.gameId}</div>
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
            variant="flat"
            color="primary"
            onClick={joinGame}
          >
            Join
          </Button>
          <JoinGameModal isOpen={isOpen} onClose={onClose} game={game} />
        </div>
      )}
    </>
  );
};
const OpenGameDisplayMemo = memo(OpenGameDisplay);

const OpenGames: React.FC = () => {
  const games = useAppSelector((state) =>
    selectAllOpenGamesNotYetJoinedByCurrentPlayer(state)
  );
  return (
    <>
      {games.map((id) => {
        return <OpenGameDisplayMemo gameGlobalId={id} key={id} />;
      })}
    </>
  );
};

export default memo(OpenGames);
