import Tooltip from "@/ui/components/Tooltip/Tooltip";
import "./PlayersState.scss";
import CustomList from "@/ui/components/CustomList/CustomList";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import { ICard } from "@/models/Card.interface";
import SmallStars from "@/ui/components/SmallStars/SmallStars";
import { memo } from "react";
import { useAppSelector } from "@/store/store";
import {
  selectCurrentPlayerId,
  selectPlayersStateForCurrentGame,
} from "@/store/playersState.slice";
type Props = {};

const PlayersState: React.FC<Props> = ({}) => {
  const states = useAppSelector((state) =>
    selectPlayersStateForCurrentGame(state)
  );
  const currentPlayerId = useAppSelector((state) =>
    selectCurrentPlayerId(state)
  );

  return (
    <div className="section players-state">
      <div className="label">
        <div>Players States</div>
        <Tooltip text="" />
      </div>

      <CustomList>
        {states &&
          states.map((s) => (
            <div
              className={`player-state ${s.playerId == currentPlayerId && "you"}`}
              key={s.id}
            >
              <div className="game-info">
                <div className="game-offer">
                  <div className="label">
                    Player: <span>{s.playerId + 1}</span>{" "}
                    <strong>{s.playerId == currentPlayerId && "[You]"}</strong>
                  </div>
                </div>
                <div className="game-id-container">
                  <div className="label">
                    Remaining Cards:{" "}
                    <span>{s.nbrRocks + s.nbrPapers + s.nbrScissors}</span>
                  </div>
                </div>
              </div>
              <div className="game-details">
                <SmallCard nbr={s.nbrRocks} card={ICard.ROCK} />
                <SmallCard nbr={s.nbrPapers} card={ICard.PAPER} />
                <SmallCard nbr={s.nbrScissors} card={ICard.SCISSORS} />
                <SmallStars nbr={s.nbrStars} expanded={3} direction="row" />
              </div>
            </div>
          ))}
      </CustomList>
    </div>
  );
};

export default memo(PlayersState);
