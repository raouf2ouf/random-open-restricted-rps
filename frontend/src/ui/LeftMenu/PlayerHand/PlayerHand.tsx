import { memo } from "react";

import "./PlayerHand.scss";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import { ICard } from "@/models/Card.interface";
import SmallStars from "@/ui/components/SmallStars/SmallStars";

type Props = {};

const PlayerHand: React.FC<Props> = ({}) => {
  return (
    <div className="player-hand-container off">
      <SmallCard nbr={"?"} total={"?"} card={ICard.ROCK} bg />
      <SmallCard nbr={"?"} total={"?"} card={ICard.PAPER} bg />
      <SmallCard nbr={"?"} total={"?"} card={ICard.SCISSORS} bg />
      <SmallStars nbr={0} nbrLocked={0} expanded={4} direction="column" />
    </div>
  );
};

export default memo(PlayerHand);
