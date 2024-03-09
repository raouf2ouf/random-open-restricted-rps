import { memo, useState } from "react";

import Star from "@/public/star.svg";
import StarSlot from "@/public/star_slot.svg";
import "./StarSelector.scss";
import { Button } from "@nextui-org/react";

interface Prop {
  max: number;
  onSelect: (nbrStars: number) => void;
}

const StarSelector: React.FC<Prop> = ({ max, onSelect }) => {
  const [nbr, setNbr] = useState<number>(0);

  function handleSelect(nbrStars: number) {
    if (nbrStars > max) return;
    if (nbr == nbrStars) {
      nbrStars--;
    }
    setNbr(nbrStars);
    onSelect(nbrStars);
  }

  return (
    <div className="star-selector-container">
      <div className="star-selector-background">
        {[...Array(4)].map((i, idx) => {
          return (
            <div
              key={idx}
              onClick={() => handleSelect(idx + 1)}
              className={`star ${idx + 1 > max && "above-max"}`}
            >
              {nbr > idx ? <Star /> : <StarSlot />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(StarSelector);
