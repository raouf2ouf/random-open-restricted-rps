import { memo, useMemo } from "react";

import Star from "@/public/star.svg";
import StarSlot from "@/public/star_slot.svg";

import "./SmallStars.scss";

interface Prop {
  nbr: number;
  expanded: number;
  showNumber?: boolean;
  direction: "column" | "row";
  nbrLocked?: number;
}

const SmallStars: React.FC<Prop> = ({
  nbr,
  expanded,
  showNumber,
  direction,
  nbrLocked,
}) => {
  const stars = useMemo(() => Math.min(nbr, expanded), [nbr, expanded]);
  return (
    <div className="small-star-container">
      <div className={`small-star-background ${direction}`}>
        {[...Array(stars)].map((x, i) => {
          return (
            <Star
              key={i}
              className={`${
                nbrLocked !== undefined && nbrLocked > i ? "locked" : ""
              }`}
            />
          );
        })}
        {[...Array(expanded - stars)].map((x, i) => {
          return <StarSlot key={i} />;
        })}
        <div className="number">
          {showNumber ? nbr : nbr > expanded ? `+${nbr - expanded}` : ""}
        </div>
      </div>
    </div>
  );
};

export default memo(SmallStars);
