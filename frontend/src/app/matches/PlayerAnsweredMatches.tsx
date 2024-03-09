import { useAppSelector } from "@/store/store";
import { memo } from "react";
import { selectAnsweredMatchesIdsForCurrentGameOfPlayer } from "@/store/matches.slice";
import DisplayAnsweredMatch from "./DisplayAnsweredMatch";
import { selectCurrentGame } from "@/store/openGames.slice";

const PlayedMatches: React.FC = () => {
  const matchesIds = useAppSelector((state) =>
    selectAnsweredMatchesIdsForCurrentGameOfPlayer(state)
  );
  const game = useAppSelector((state) => selectCurrentGame(state));

  return (
    <>
      {matchesIds &&
        matchesIds.map((id) => (
          <DisplayAnsweredMatch
            id={id}
            key={id}
            gameAddress={game!.gameAddress}
          />
        ))}
    </>
  );
};

export default memo(PlayedMatches);
