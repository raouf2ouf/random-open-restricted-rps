import { memo, useEffect, useRef, useState } from "react";

import "./PlayerHand.scss";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import { ICard } from "@/models/Card.interface";
import SmallStars from "@/ui/components/SmallStars/SmallStars";
import { selectCurrentPlayerState } from "@/store/playersState.slice";
import { useAppSelector } from "@/store/store";
import { Spinner } from "@nextui-org/react";
import { makeLoader } from "@/hooks/toast.utils";
import { Id, toast } from "react-toastify";

type Props = {};

const PlayerHand: React.FC<Props> = ({}) => {
  const playerState = useAppSelector((state) =>
    selectCurrentPlayerState(state)
  );
  const toastId = useRef<Id | undefined>();

  useEffect(() => {
    if (playerState) {
      if (!playerState.cardsGiven) {
        if (!toastId.current) {
          toastId.current = makeLoader(
            <div>
              Waiting for your cards, should not take more than{" "}
              <strong>2 mins</strong>...
            </div>
          );
        }
      } else {
        if (toastId.current) {
          toast.dismiss(toastId.current);
          toastId.current = undefined;
        }
      }
    } else {
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = undefined;
      }
    }
  }, [playerState]);
  return (
    <div className={`player-hand-container ${playerState ? "on" : "off"}`}>
      {playerState && !playerState.cardsGiven && (
        <div className="player-hand-container-loading">
          <Spinner color="warning" className="loader" size="md" />
        </div>
      )}
      {playerState && playerState.cardsGiven ? (
        <>
          <SmallCard
            nbr={playerState.nbrRocks - (playerState.lockedRocks || 0)}
            total={playerState.nbrRocks}
            card={ICard.ROCK}
            bg
          />
          <SmallCard
            nbr={playerState.nbrPapers - (playerState.lockedPapers || 0)}
            total={playerState.nbrPapers}
            card={ICard.PAPER}
            bg
          />
          <SmallCard
            nbr={playerState.nbrScissors - (playerState.lockedScissors || 0)}
            total={playerState.nbrScissors}
            card={ICard.SCISSORS}
            bg
          />
          <SmallStars
            nbr={playerState.nbrStars}
            nbrLocked={playerState.nbrStarsLocked}
            expanded={4}
            direction="column"
          />
        </>
      ) : (
        <>
          <SmallCard nbr={"?"} total={"?"} card={ICard.ROCK} bg />
          <SmallCard nbr={"?"} total={"?"} card={ICard.PAPER} bg />
          <SmallCard nbr={"?"} total={"?"} card={ICard.SCISSORS} bg />
          <SmallStars nbr={0} nbrLocked={0} expanded={4} direction="column" />
        </>
      )}
    </div>
  );
};

export default memo(PlayerHand);
