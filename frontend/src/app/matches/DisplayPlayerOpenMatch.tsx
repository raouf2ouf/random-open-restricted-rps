"use client";

import { closeOrCancelMatch, selectMatchById } from "@/store/matches.slice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import { Button } from "@nextui-org/react";
import { memo } from "react";
import { useWriteContract } from "wagmi";
import GAME_CONTRACT from "@/contracts/RestrictedRPSGame.json";
import { IMatch } from "@/models/Match.interface";
import { extractMessage, makeLoader, updateLoader } from "@/hooks/toast.utils";

const { abi: GAME_ABI } = GAME_CONTRACT;

type Props = {
  id: string;
  gameAddress: string;
};

const DisplayPlayerOpenMatch: React.FC<Props> = ({ id, gameAddress }) => {
  const dispatch = useAppDispatch();
  const match: IMatch | undefined = useAppSelector((state) =>
    selectMatchById(state, id)
  );
  const { writeContract } = useWriteContract();

  function cancelMatch() {
    const toastId = makeLoader(
      <div>
        Cancelling Match <strong>{match!.matchId}</strong> ...
      </div>
    );
    const matchId = match!.matchId;
    const gameGlobalId = match!.gameGlobalId;
    const id = match!.id;
    writeContract(
      {
        address: gameAddress as `0x${string}`,
        abi: GAME_ABI,
        functionName: "cancelMatch",
        args: [match!.matchId],
      },
      {
        onSuccess: async () => {
          updateLoader(
            toastId,
            <div>
              Match <strong>{matchId}</strong> cancelled successfully!
            </div>,
            "success"
          );
          dispatch(closeOrCancelMatch({ gameGlobalId, id, match: match! }));
        },
        onError: (error) => {
          updateLoader(
            toastId,
            <div>
              Failed to cancel match <strong>{matchId}</strong>:{" "}
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
        <div className="match">
          <div className="match-id column">
            <div className="label">
              <span className="hide-md">Match </span>ID
            </div>
            <div className="data">{match.matchId}</div>
          </div>

          <div className="match-player column">
            <div className="label">Card You Played</div>
            <div className="data">
              <SmallCard hideNumber card={match.player1Card} />
            </div>
          </div>

          <div className="match-player column hide-md">
            <div className="label">Secret</div>
            <div className="data">{match.secret}</div>
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
            variant="bordered"
            onClick={cancelMatch}
          >
            Cancel
          </Button>
        </div>
      )}
    </>
  );
};

export default memo(DisplayPlayerOpenMatch);
