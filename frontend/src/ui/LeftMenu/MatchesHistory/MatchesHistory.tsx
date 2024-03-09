import { memo } from "react";

import "./MatchesHistory.scss";
import Tooltip from "@/ui/components/Tooltip/Tooltip";
import CustomList from "@/ui/components/CustomList/CustomList";
import { useAppSelector } from "@/store/store";
import { selectPlayedMatchesIdsForCurrentGameOfPlayer } from "@/store/matches.slice";
import MatchDisplay from "./MatchDisplay";
type Props = {};

const MatchesHistory: React.FC<Props> = ({}) => {
  const matchesIds = useAppSelector((state) =>
    selectPlayedMatchesIdsForCurrentGameOfPlayer(state)
  );
  return (
    <div className="section matches-history">
      <div className="label">
        <div>Matches History</div>
        <Tooltip text="" />
      </div>
      <CustomList>
        {matchesIds &&
          matchesIds.map((id) => <MatchDisplay key={id} id={id} />)}
      </CustomList>
    </div>
  );
};

export default memo(MatchesHistory);
