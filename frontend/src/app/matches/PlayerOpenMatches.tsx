import { selectOpenMatchesIdsForCurrentGameOfPlayer } from "@/store/matches.slice";
import { useAppSelector } from "@/store/store";
import { Button, useDisclosure } from "@nextui-org/react";
import { memo } from "react";
import OfferMatchModal from "./OfferMatchModal";
import DisplayPlayerOpenMatch from "./DisplayPlayerOpenMatch";
import { selectCurrentGame } from "@/store/openGames.slice";

const PlayerOpenMatches: React.FC = () => {
  const matchesIds = useAppSelector((state) =>
    selectOpenMatchesIdsForCurrentGameOfPlayer(state)
  );

  const game = useAppSelector((state) => selectCurrentGame(state));

  const { isOpen, onOpen, onClose } = useDisclosure();

  function offerMatch() {
    onOpen();
  }
  return (
    <>
      {matchesIds &&
        matchesIds.map((id) => (
          <DisplayPlayerOpenMatch
            id={id}
            key={id}
            gameAddress={game!.gameAddress}
          />
        ))}
      <Button
        className="rectangle"
        color="primary"
        variant="bordered"
        onClick={offerMatch}
      >
        Offer a Match
      </Button>
      <OfferMatchModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default memo(PlayerOpenMatches);
