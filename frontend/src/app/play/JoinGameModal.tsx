"use client";

import { IGame } from "@/models/Game.interface";
import Tooltip from "@/ui/components/Tooltip/Tooltip";
import {
  Button,
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Slider,
  Spinner,
} from "@nextui-org/react";
import { memo, useEffect, useState } from "react";

import "./JoinGameModal.scss";
import SmallStars from "@/ui/components/SmallStars/SmallStars";
import { useContractsContext } from "@/contexts/ContractsContext";
import { wTe } from "@/contracts";
import { useWriteContract } from "wagmi";

import GAME_CONTRACT from "@/contracts/RestrictedRPSGame.json";
import { extractMessage, makeLoader, updateLoader } from "@/hooks/toast.utils";
import { useAppDispatch } from "@/store/store";
import { setCurrentGameGlobalId } from "@/store/playersState.slice";
const { abi: GAME_ABI } = GAME_CONTRACT;

type Props = {
  isOpen: boolean;
  onClose: any;
  game: IGame;
};
const JoinGameModal: React.FC<Props> = ({ isOpen, onClose, game }) => {
  const dispatch = useAppDispatch();
  const { collateralUnit } = useContractsContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [value, setValue] = useState<bigint>(BigInt(0));
  const [cash, setCash] = useState<bigint>(BigInt(0));

  const { writeContract } = useWriteContract();

  useEffect(() => {
    let t: bigint = BigInt(game.starCost) * BigInt(3) + cash;
    setValue(t);
  }, [game, cash]);

  function handleSubmit() {
    setLoading(true);
    const id = makeLoader(
      <div>
        Joining game <strong>{game.gameId}</strong> ...
      </div>
    );
    writeContract(
      {
        address: game.gameAddress as `0x${string}`,
        abi: GAME_ABI,
        functionName: "joinGame",
        value: value,
      },
      {
        onSuccess: async () => {
          setTimeout(() => {
            updateLoader(
              id,
              <div>
                Joined game <strong>{game.gameId}</strong> successfully!
              </div>,
              "success"
            );
            setLoading(false);
            onClose();
          }, 2000);
          setTimeout(() => {
            dispatch(setCurrentGameGlobalId(game.id));
          }, 5000);
        },
        onError: (error) => {
          updateLoader(
            id,
            <div>
              Failed to join game <strong>{game.gameId}</strong>:{" "}
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
      className="join-game-modal"
      isOpen={isOpen}
      onClose={onClose}
      disableAnimation={true}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="modal-title">
                Join Game <span>{game.gameId}</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="join-game-modal-container">
                {loading && (
                  <div className="join-game-modal-loading">
                    <Spinner color="warning" className="loader" size="lg" />
                  </div>
                )}
                <div className="section">
                  <div className="label">
                    <div>Collateral for Joining This Game</div>
                    <Tooltip text="" />
                  </div>
                  <div className="cost stars-cost">
                    <div className="what-you-get">
                      <div className="cost-label">
                        <div className="label">Stars</div>
                        <Tooltip text="" />
                      </div>
                      <div>
                        <SmallStars nbr={3} expanded={3} direction="row" />
                      </div>
                    </div>
                    <div className="what-you-pay">
                      <div>{wTe(BigInt(game.starCost) * BigInt(3))}</div>
                      <div className="unit">{collateralUnit}</div>
                    </div>
                  </div>

                  {/* <div className="cost cash-cost">
                    <div className="what-you-get">
                      <div className="cost-label">
                        <div className="label">Cash</div>
                        <Tooltip text="" />
                      </div>
                      <Slider
                        className="slider"
                        size="sm"
                        minValue={0}
                        maxValue={10}
                        step={1}
                        defaultValue={0}
                      />
                    </div>
                    <div className="what-you-pay">
                      <div>{wTe(cash)}</div>
                      <div className="unit">{collateralUnit}</div>
                    </div>
                  </div> */}

                  <div className="cost transaction-cost">
                    <div className="what-you-get">
                      <div className="cost-label">
                        <div className="label">Joining Fee</div>
                        <Tooltip text="" />
                      </div>
                    </div>
                    <div className="what-you-pay">
                      <div>{0}</div>
                      <div className="unit">{collateralUnit}</div>
                    </div>
                  </div>
                </div>
                <div className="total">
                  <div className="label">Total</div>
                  <div className="label primary">
                    ~{wTe(value)} {collateralUnit}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="rectangle"
                variant="bordered"
                color="primary"
                onClick={handleSubmit}
              >
                Join
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default JoinGameModal;
