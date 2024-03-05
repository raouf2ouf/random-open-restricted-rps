import Tooltip from "@/ui/components/Tooltip/Tooltip";
import "./PlayersState.scss";
import CustomList from "@/ui/components/CustomList/CustomList";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import { ICard } from "@/models/Card.interface";
import SmallStars from "@/ui/components/SmallStars/SmallStars";
import { memo } from "react";
type Props = {};

const PlayersState: React.FC<Props> = ({}) => {
  return (
    <div className="section players-state">
      <div className="label">
        <div>Players States</div>
        <Tooltip text="" />
      </div>

      <CustomList>
        <div className="player-state">
          <div className="game-info">
            <div className="game-offer">
              <div className="label">
                Player: <span>0</span>
              </div>
            </div>
            <div className="game-id-container">
              <div className="label">
                Remaining Cards: <span>0</span>
              </div>
            </div>
          </div>
          <div className="game-details">
            <SmallCard nbr={"?"} total="?" card={ICard.ROCK} />
            <SmallCard nbr={"?"} total="?" card={ICard.PAPER} />
            <SmallCard nbr={"?"} total="?" card={ICard.SCISSORS} />
            <SmallStars nbr={6} expanded={3} direction="row" />
          </div>
        </div>
      </CustomList>
    </div>
  );
};

export default memo(PlayersState);
