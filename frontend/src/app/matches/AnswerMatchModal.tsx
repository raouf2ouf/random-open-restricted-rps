"use client";

import Tooltip from "@/ui/components/Tooltip/Tooltip";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import { useState } from "react";

import GAME_CONTRACT from "@/contracts/RestrictedRPSGame.json";
import { extractMessage, makeLoader, updateLoader } from "@/hooks/toast.utils";
import { useAppSelector } from "@/store/store";
import { ICard } from "@/models/Card.interface";
import { selectCurrentGame } from "@/store/openGames.slice";
const { abi: GAME_ABI } = GAME_CONTRACT;

import "./AnswerMatchModal.scss";
import { useWriteContract } from "wagmi";
import CardSelector from "@/ui/components/CardSelector/CardSelector";
import { IMatch } from "@/models/Match.interface";
import SmallStars from "@/ui/components/SmallStars/SmallStars";
import { selectCurrentPlayerState } from "@/store/playersState.slice";

type Props = {
  isOpen: boolean;
  onClose: any;
  match: IMatch;
};
const AnswerMatchModal: React.FC<Props> = ({ isOpen, onClose, match }) => {
  const game = useAppSelector((state) => selectCurrentGame(state))!;
  const playerState = useAppSelector((state) =>
    selectCurrentPlayerState(state)
  )!;

  const [loading, setLoading] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [card, setCard] = useState<ICard>();

  const { writeContract } = useWriteContract();

  function handleSetCard(card: ICard) {
    if (card !== undefined) setDisabled(false);
    else setDisabled(true);
    setCard(card);
  }

  function handleSubmit() {
    setLoading(true);
    const id = makeLoader(
      <div>
        Answering Match <strong>{match.matchId}</strong> ...
      </div>
    );
    writeContract(
      {
        address: game.gameAddress as `0x${string}`,
        abi: GAME_ABI,
        functionName: "answerMatch",
        args: [match.matchId, card],
      },
      {
        onSuccess: async () => {
          updateLoader(
            id,
            <div>
              Match <strong>{match.matchId}</strong> answered successfully!
            </div>,
            "success"
          );
          setLoading(false);
          onClose();
        },
        onError: (error) => {
          updateLoader(
            id,
            <div>
              Failed to answer match <strong>{match.matchId}</strong>:{" "}
              {extractMessage(error)}
            </div>,
            "error"
          );
          setLoading(false);
        },
      }
    );
  }
  return (
    <Modal
      className="offer-match-modal"
      isOpen={isOpen}
      onClose={onClose}
      disableAnimation={true}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="modal-title">
                Offer Match for Game <span>{game.gameId}</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="offer-match-modal-container">
                {loading && (
                  <div className="offer-match-modal-loading">
                    <Spinner color="warning" className="loader" size="lg" />
                  </div>
                )}
                <div className="section">
                  <div className="item player1bet">
                    <div className="item-label">
                      <div className="label">Oppenent&apos;s Bet</div>
                      <Tooltip text="" />
                    </div>
                    <div className="item-data">
                      <SmallStars
                        direction="row"
                        nbr={match.player1Bet}
                        expanded={4}
                      />
                    </div>
                  </div>

                  <div className="item player2bet">
                    <div className="item-label">
                      <div className="label">Your Bet</div>
                      <Tooltip text="" />
                    </div>
                    <div className="item-data">
                      <SmallStars
                        direction="row"
                        nbr={match.player2Bet}
                        expanded={4}
                      />
                    </div>
                  </div>

                  <div className="item card">
                    <div className="item-label">
                      <div className="label">Card To Play</div>
                      <Tooltip text="" />
                    </div>
                    <div className="item-data">
                      <CardSelector
                        onSelect={handleSetCard}
                        nbrRocks={
                          playerState
                            ? playerState.nbrRocks -
                              (playerState.lockedRocks || 0)
                            : 0
                        }
                        nbrPapers={
                          playerState
                            ? playerState.nbrPapers -
                              (playerState.lockedPapers || 0)
                            : 0
                        }
                        nbrScissors={
                          playerState
                            ? playerState.nbrScissors -
                              (playerState.lockedScissors || 0)
                            : 0
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="rectangle"
                variant="bordered"
                color="primary"
                isDisabled={disabled}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AnswerMatchModal;
