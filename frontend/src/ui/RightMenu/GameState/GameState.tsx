import { memo, useEffect, useState } from "react";

import SmallPlayers from "@/ui/components/SmallPlayers/SmallPlayers";
import SmallStars from "@/ui/components/SmallStars/SmallStars";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import { ICard } from "@/models/Card.interface";
import { useAppSelector } from "@/store/store";
import { selectCurrentGame } from "@/store/openGames.slice";
import { selectPlayersStateForCurrentGame } from "@/store/playersState.slice";

import "./GameState.scss";
type Props = {};

const GameState: React.FC<Props> = ({}) => {
  const currentGame = useAppSelector((state) => selectCurrentGame(state));

  const [nbrRocks, setNbrRocks] = useState<number>(0);
  const [nbrPapers, setNbrPapers] = useState<number>(0);
  const [nbrScissors, setNbrScissors] = useState<number>(0);
  const [nbrStars, setNbrStars] = useState<number>(0);
  const [nbrPlayers, setNbrPlayers] = useState<number>(0);

  const states = useAppSelector((state) =>
    selectPlayersStateForCurrentGame(state)
  );

  useEffect(() => {
    let nbrR = 0,
      nbrP = 0,
      nbrS = 0,
      nbrSt = 0,
      nbrPl = states.length;
    for (const state of states) {
      nbrSt += state.nbrStars;
      nbrR += state.nbrRocks;
      nbrP += state.nbrPapers;
      nbrS += state.nbrScissors;
    }
    setNbrRocks(nbrR);
    setNbrPapers(nbrP);
    setNbrScissors(nbrS);
    setNbrStars(nbrSt);
    setNbrPlayers(nbrPl);
  }, [states]);

  return (
    <>
      {currentGame && states ? (
        <div className="game-state-container on">
          <SmallPlayers nbr={nbrPlayers} />
          <SmallCard
            nbr={nbrRocks}
            total={currentGame.nbrRocks}
            card={ICard.ROCK}
          />
          <SmallCard
            nbr={nbrPapers}
            total={currentGame.nbrPapers}
            card={ICard.PAPER}
          />
          <SmallCard
            nbr={nbrScissors}
            total={currentGame.nbrScissors}
            card={ICard.SCISSORS}
          />
          <SmallStars
            nbr={nbrStars}
            expanded={1}
            showNumber
            direction="column"
          />
        </div>
      ) : (
        <div className="game-state-container off">
          <SmallPlayers nbr={nbrPlayers} />
          <SmallCard nbr="?" total="?" card={ICard.ROCK} />
          <SmallCard nbr="?" total="?" card={ICard.PAPER} />
          <SmallCard nbr="?" total="?" card={ICard.SCISSORS} />
          <SmallStars
            nbr={nbrStars}
            expanded={1}
            showNumber
            direction="column"
          />
        </div>
      )}
    </>
  );
};

export default memo(GameState);
