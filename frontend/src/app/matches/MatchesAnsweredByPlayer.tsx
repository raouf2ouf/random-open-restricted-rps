import { useAppSelector } from "@/store/store";
import { memo } from "react";
import { selectAnsweredMatchesIdsForCurrentGameByPlayer } from "@/store/matches.slice";
import DisplayMatchAnsweredByPlayer from "./DisplayMatchAnsweredByPlayer";

const PlayedMatches: React.FC = () => {
  const matchesIds = useAppSelector((state) =>
    selectAnsweredMatchesIdsForCurrentGameByPlayer(state)
  );

  return (
    <>
      {matchesIds &&
        matchesIds.map((id) => (
          <DisplayMatchAnsweredByPlayer id={id} key={id} />
        ))}
    </>
  );
};

export default memo(PlayedMatches);
