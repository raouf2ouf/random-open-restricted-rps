import { memo, useEffect, useState } from "react";

import "./GameState.scss";
import SmallPlayers from "@/ui/components/SmallPlayers/SmallPlayers";
import SmallStars from "@/ui/components/SmallStars/SmallStars";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import { ICard } from "@/models/Card.interface";
// import { useCurrentGameContext } from "$contexts/CurrentGameContext";
// import { useAppSelector } from "$store/store";
// import { selectPlayersStateForGame } from "$store/playersState.slice";
type Props = {};

const GameState: React.FC<Props> = ({}) => {
  //   const { currentGameAddress } = useCurrentGameContext();

  const [nbrRocks, setNbrRocks] = useState<number>(0);
  const [nbrPapers, setNbrPapers] = useState<number>(0);
  const [nbrScissors, setNbrScissors] = useState<number>(0);
  const [nbrStars, setNbrStars] = useState<number>(0);
  const [nbrPlayers, setNbrPlayers] = useState<number>(0);

  //   const states = useAppSelector((state) =>
  //     selectPlayersStateForGame(state, currentGameAddress || "")
  //   );

  //   useEffect(() => {
  //     let nbrR = 0,
  //       nbrP = 0,
  //       nbrS = 0,
  //       nbrSt = 0,
  //       nbrPl = states.length;
  //     for (const state of states) {
  //       nbrSt += state.nbrStars;
  //       nbrR += state.nbrRockUsed;
  //       nbrP += state.nbrPaperUsed;
  //       nbrS += state.nbrScissorsUsed;
  //     }
  //     setNbrRocks(nbrR);
  //     setNbrPapers(nbrP);
  //     setNbrScissors(nbrS);
  //     setNbrStars(nbrSt);
  //     setNbrPlayers(nbrPl);
  //   }, [states]);
  return (
    <div className={`game-state-container off`}>
      <SmallPlayers nbr={nbrPlayers} />
      <SmallCard nbr="?" total="?" card={ICard.ROCK} />
      <SmallCard nbr="?" total="?" card={ICard.PAPER} />
      <SmallCard nbr="?" total="?" card={ICard.SCISSORS} />
      <SmallStars nbr={nbrStars} expanded={1} showNumber direction="column" />
    </div>
  );
};

export default memo(GameState);
