"use client";

import Tooltip from "@/ui/components/Tooltip/Tooltip";
import {
  Button,
  Input,
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
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectCurrentPlayerState,
  selectPlayerAddress,
} from "@/store/playersState.slice";
import { randomBytes } from "crypto";
import { ICard } from "@/models/Card.interface";
import { selectCurrentGame } from "@/store/openGames.slice";
import { concat, keccak256 } from "viem";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/wagmi";
import { setMatchData } from "@/api/local";
import { fetchMatchesForGame } from "@/store/matches.slice";
const { abi: GAME_ABI } = GAME_CONTRACT;

import "./OfferMatchModal.scss";
import { useWriteContract } from "wagmi";
import StarSelector from "@/ui/components/StarSelector/StarSelector";
import CardSelector from "@/ui/components/CardSelector/CardSelector";

function computeHash(secret: string, card: ICard): string {
  const encoder = new TextEncoder();
  return keccak256(concat([new Uint8Array([card]), encoder.encode(secret)]));
}
type Props = {
  isOpen: boolean;
  onClose: any;
};
const OfferMatchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => selectCurrentGame(state))!;
  const currentPlayerAddress = useAppSelector((state) =>
    selectPlayerAddress(state)
  )!;
  const playerState = useAppSelector((state) =>
    selectCurrentPlayerState(state)
  )!;

  const [loading, setLoading] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [nbrStars, setNbrStars] = useState<number>(0);
  const [nbrStarsBet, setNbrStarsBet] = useState<number>(0);
  const [card, setCard] = useState<ICard>();
  const [hash, setHash] = useState<string>();
  const [secret, setSecret] = useState<string>(randomBytes(7).toString("hex"));

  const { writeContract } = useWriteContract();

  function handleSetCard(card: ICard) {
    if (nbrStars > 0 && secret.length > 0 && card !== undefined)
      setDisabled(false);
    else setDisabled(true);
    setCard(card);
    if (secret) {
      setHash(computeHash(secret, card));
    }
  }

  function handleSetSecret(secret: string) {
    if (nbrStars > 0 && secret.length > 0 && card !== undefined)
      setDisabled(false);
    else setDisabled(true);
    setSecret(secret);
    if (card) {
      setHash(computeHash(secret, card));
    }
  }

  function handleSetNbrStars(nbrStars: number) {
    if (nbrStars > 0 && secret.length > 0 && card !== undefined)
      setDisabled(false);
    else setDisabled(true);
    setNbrStars(nbrStars);
  }

  function handleSubmit() {
    setLoading(true);
    const id = makeLoader(
      <div>
        Offering Match for game <strong>{game.gameId}</strong> ...
      </div>
    );
    writeContract(
      {
        address: game.gameAddress as `0x${string}`,
        abi: GAME_ABI,
        functionName: "offerMatch",
        args: [hash, nbrStars, nbrStarsBet],
      },
      {
        onSettled: async (hash) => {
          let topic: any | undefined;
          try {
            const receipt = await waitForTransactionReceipt(config, {
              hash: hash as `0x${string}`,
            });
            topic = receipt?.logs[0]?.topics[1];
          } catch (e) {}
          if (topic) {
            console.log("on settled!!!", topic);
            const matchId = Number(BigInt(topic));
            updateLoader(
              id,
              <div>
                Match <strong>{matchId}</strong> offered successfully!
              </div>,
              "success"
            );
            await setMatchData(
              game.id,
              currentPlayerAddress,
              matchId,
              secret,
              card!
            );

            dispatch(
              fetchMatchesForGame({
                gameAddress: game.gameAddress,
                gameGlobalId: game.id,
              })
            );
            setLoading(false);
            onClose();
          }
        },
        onError: (error) => {
          updateLoader(
            id,
            <div>
              Failed to offer match for game <strong>{game.gameId}</strong>:{" "}
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
                      <div className="label">Your Bet</div>
                      <Tooltip text="" />
                    </div>
                    <div className="item-data">
                      <StarSelector
                        max={
                          playerState
                            ? playerState.nbrStars - playerState.nbrStarsLocked
                            : 0
                        }
                        onSelect={handleSetNbrStars}
                      />
                    </div>
                  </div>

                  <div className="item player2bet">
                    <div className="item-label">
                      <div className="label">Oppenent&apos;s Bet</div>
                      <Tooltip text="" />
                    </div>
                    <div className="item-data">
                      <StarSelector max={4} onSelect={setNbrStarsBet} />
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

                  <div className="item secret">
                    <div className="item-label">
                      <div className="label">Secret</div>
                      <Tooltip text="" />
                    </div>
                    <div className="item-data">
                      <Input
                        radius="none"
                        type="text"
                        aria-label="secret"
                        value={secret}
                        onValueChange={handleSetSecret}
                        classNames={{
                          inputWrapper: "input-wrapper",
                        }}
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

export default OfferMatchModal;
