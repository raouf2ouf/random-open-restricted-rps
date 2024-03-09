"use client";

import { selectMatchById } from "@/store/matches.slice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import { Button } from "@nextui-org/react";
import { memo } from "react";

type Props = {
  id: string;
};

const DisplayClosedMatch: React.FC<Props> = ({ id }) => {
  const dispatch = useAppDispatch();
  const match = useAppSelector((state) => selectMatchById(state, id));

  return (
    <>
      {match && (
        <div className="match">
          <div className="match-id column">
            <div className="label">
              <span className="hide-md">Match </span>ID
            </div>
            <div className="data">{match.matchId}</div>
          </div>

          <div className="match-player column">
            <div className="label">Player {match.player1 + 1}</div>
            <div className="data">
              <SmallCard hideNumber card={match.player1Card} />
            </div>
          </div>
          <div className="match-player column">
            <div className="label">Player {match.player2 + 1}</div>
            <div className="data">
              <SmallCard hideNumber card={match.player2Card} />
            </div>
          </div>
          <div className="match-bet column">
            <div className="label">Bet</div>
            <div className="data">
              {match.player1Bet}/{match.player2Bet}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(DisplayClosedMatch);
