"use client";

import { extractMessage, makeLoader, updateLoader } from "@/hooks/toast.utils";
import { selectMatchById } from "@/store/matches.slice";
import { useAppSelector } from "@/store/store";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import { Button } from "@nextui-org/react";
import { memo } from "react";
import { useWriteContract } from "wagmi";

import GAME_CONTRACT from "@/contracts/RestrictedRPSGame.json";
const { abi: GAME_ABI } = GAME_CONTRACT;

type Props = {
  id: string;
  gameAddress: string;
};

const DisplayAnsweredMatch: React.FC<Props> = ({ id, gameAddress }) => {
  const match = useAppSelector((state) => selectMatchById(state, id));

  const { writeContract } = useWriteContract();

  function handleClose() {
    const toastId = makeLoader(
      <div>
        Closing Match <strong>{match!.matchId}</strong> ...
      </div>
    );
    const matchId = match!.matchId;
    writeContract(
      {
        address: gameAddress as `0x${string}`,
        abi: GAME_ABI,
        functionName: "closeMatch",
        args: [match.matchId, match.player1Card, match.secret],
      },
      {
        onSuccess: async () => {
          updateLoader(
            toastId,
            <div>
              Match <strong>{matchId}</strong> closed successfully!
            </div>,
            "success"
          );
        },
        onError: (error) => {
          updateLoader(
            toastId,
            <div>
              Failed to close match <strong>{matchId}</strong>:{" "}
              {extractMessage(error)}
            </div>,
            "error"
          );
        },
      }
    );
  }

  return (
    <>
      {match && (
        <div className="match to-close">
          <div className="match-id column">
            <div className="label">
              <span className="hide-md">Match </span>ID
            </div>
            <div className="data">{match.matchId}</div>
          </div>

          <div className="match-player column">
            <div className="label">You Played</div>
            <div className="data">
              <SmallCard hideNumber card={match.player1Card} />
            </div>
          </div>
          <div className="match-player column">
            <div className="label">Player {match.player2 + 1} Played</div>
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

          <Button
            color="warning"
            className="rectangle"
            variant="flat"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      )}
    </>
  );
};

export default memo(DisplayAnsweredMatch);
