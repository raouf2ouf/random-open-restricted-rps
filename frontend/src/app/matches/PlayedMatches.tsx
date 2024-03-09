import { useAppSelector } from "@/store/store";
import { memo } from "react";
import { selectPlayedMatchesIdsForCurrentGame } from "@/store/matches.slice";
import DisplayClosedMatch from "./DisplayClosedMatch";

const PlayedMatches: React.FC = () => {
  const matchesIds = useAppSelector((state) =>
    selectPlayedMatchesIdsForCurrentGame(state)
  );

  return (
    <>
      {matchesIds &&
        matchesIds.map((id) => <DisplayClosedMatch id={id} key={id} />)}
    </>
  );
};

export default memo(PlayedMatches);
