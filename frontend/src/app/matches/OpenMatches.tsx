import { selectOpenMatchesIdsForCurrentGameOfNotPlayer } from "@/store/matches.slice";
import { useAppSelector } from "@/store/store";
import { memo } from "react";
import DisplayOpenMatch from "./DisplayOpenMatch";

const OpenMatches: React.FC = () => {
  const matchesIds = useAppSelector((state) =>
    selectOpenMatchesIdsForCurrentGameOfNotPlayer(state)
  );

  return (
    <>
      {matchesIds &&
        matchesIds.map((id) => <DisplayOpenMatch id={id} key={id} />)}
    </>
  );
};

export default memo(OpenMatches);
