"use client";

import { selectMatchById } from "@/store/matches.slice";
import { useAppSelector } from "@/store/store";
import { Button, useDisclosure } from "@nextui-org/react";
import { memo } from "react";
import AnswerMatchModal from "./AnswerMatchModal";

type Props = {
  id: string;
};

const DisplayOpenMatch: React.FC<Props> = ({ id }) => {
  const match = useAppSelector((state) => selectMatchById(state, id));

  const { isOpen, onOpen, onClose } = useDisclosure();

  function answerMatch() {
    onOpen();
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
            <div className="label">Offered by</div>
            <div className="data"> Player {match.player1 + 1}</div>
          </div>
          <div className="match-bet column">
            <div className="label">Bet</div>
            <div className="data">
              {match.player1Bet}/{match.player2Bet}
            </div>
          </div>

          <Button
            color="primary"
            className="rectangle"
            variant="bordered"
            onClick={answerMatch}
          >
            Answer
          </Button>
          <AnswerMatchModal isOpen={isOpen} onClose={onClose} match={match} />
        </div>
      )}
    </>
  );
};

export default memo(DisplayOpenMatch);
