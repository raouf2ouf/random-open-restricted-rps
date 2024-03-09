import { memo, useState } from "react";

import Rock from "@/public/rock.svg";
import Paper from "@/public/paper.svg";
import Scissors from "@/public/scissors.svg";

import "./CardSelector.scss";
import { ICard } from "@/models/Card.interface";

interface Prop {
  nbrRocks?: number;
  nbrPapers?: number;
  nbrScissors?: number;
  onSelect: (card: ICard) => void;
}

const CardSelector: React.FC<Prop> = ({
  nbrRocks,
  nbrPapers,
  nbrScissors,
  onSelect,
}) => {
  const [card, setCard] = useState<ICard | undefined>();

  function handleSubmit(c: ICard) {
    if (c == ICard.ROCK && nbrRocks == 0) return;
    if (c == ICard.PAPER && nbrPapers == 0) return;
    if (c == ICard.SCISSORS && nbrScissors == 0) return;
    setCard(c);
    onSelect(c);
  }

  return (
    <div className="card-selector-container">
      <div
        className={`rock  ${card === ICard.ROCK ? "selected" : ""}`}
        onClick={() => handleSubmit(ICard.ROCK)}
      >
        <Rock className={`${nbrRocks == 0 ? "empty" : ""}`} />
        <div className="number">{nbrRocks}</div>
      </div>
      <div
        className={`paper ${card === ICard.PAPER ? "selected" : ""}`}
        onClick={() => handleSubmit(ICard.PAPER)}
      >
        <Paper className={`${nbrPapers == 0 ? "empty" : ""} `} />
        <div className="number">{nbrPapers}</div>
      </div>
      <div
        className={`scissors ${card === ICard.SCISSORS ? "selected" : ""}`}
        onClick={() => handleSubmit(ICard.SCISSORS)}
      >
        <Scissors className={`${nbrScissors == 0 ? "empty" : ""}`} />
        <div className="number">{nbrScissors}</div>
      </div>
    </div>
  );
};

export default memo(CardSelector);
