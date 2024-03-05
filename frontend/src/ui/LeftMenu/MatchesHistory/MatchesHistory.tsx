import { memo } from "react";

import "./MatchesHistory.scss";
import Tooltip from "@/ui/components/Tooltip/Tooltip";
import CustomList from "@/ui/components/CustomList/CustomList";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import { ICard } from "@/models/Card.interface";
import SmallStars from "@/ui/components/SmallStars/SmallStars";
type Props = {};

const MatchesHistory: React.FC<Props> = ({}) => {
  return (
    <div className="section matches-history">
      <div className="label">
        <div>Matches History</div>
        <Tooltip text="" />
      </div>
      <CustomList>
        <div className="match-history-container">
          <div className="game-info">
            <div className="game-offer">
              <div className="label">
                Game: <span>{"0x0ed0ef020e"}</span>
              </div>
            </div>
            <div className="game-id-container">
              <div className="label">
                Match Id: <span>1</span>
              </div>
            </div>
          </div>
          <div className="game-details">
            <div className="cards">
              <SmallCard hideNumber card={ICard.ROCK} />
              <div>X</div>
              <SmallCard hideNumber card={ICard.PAPER} />
              <div>=</div>
            </div>
            <div className="game-status">
              <div className="won">You Won</div>
              <SmallStars direction="row" nbr={1} expanded={1} />
            </div>
          </div>
        </div>
      </CustomList>
    </div>
  );
};

export default memo(MatchesHistory);
