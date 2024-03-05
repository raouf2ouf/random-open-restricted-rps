import { ICard, cardToType } from "@/models/Card.interface";
import { memo, useMemo } from "react";

import Rock from "@/public/rock.svg";
import Paper from "@/public/paper.svg";
import Scissors from "@/public/scissors.svg";

import "./SmallCard.scss";
type Props = {
  card: ICard;
  nbr?: number | string;
  total?: number | string;
  bg?: boolean;
  hideNumber?: boolean;
};

const SmallCard: React.FC<Props> = ({ card, nbr, total, bg, hideNumber }) => {
  const type = useMemo(() => cardToType(card), [card]);
  return (
    <div className="small-card-container">
      <div className={`${type} ${bg ? "bg" : ""}`}>
        {card == ICard.ROCK ? (
          <Rock />
        ) : card == ICard.PAPER ? (
          <Paper />
        ) : (
          <Scissors />
        )}
        {!hideNumber && (
          <div className="number">
            {nbr}
            {total !== undefined && <span>/{total}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(SmallCard);
