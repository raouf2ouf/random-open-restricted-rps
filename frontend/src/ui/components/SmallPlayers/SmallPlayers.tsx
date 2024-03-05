import { memo } from "react";

import Players from "@/public/player.svg";

import "./SmallPlayers.scss";
type Props = {
  nbr: number;
};

const SmallPlayers: React.FC<Props> = ({ nbr }) => {
  return (
    <div className="small-players-container">
      <div className="small-players-background">
        <Players />
        <div className="number">{nbr}</div>
      </div>
    </div>
  );
};

export default memo(SmallPlayers);
