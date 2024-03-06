import { memo } from "react";

import "./MatchesHistory.scss";
import Tooltip from "@/ui/components/Tooltip/Tooltip";
import CustomList from "@/ui/components/CustomList/CustomList";
import SmallCard from "@/ui/components/SmallCard/SmallCard";
import SmallStars from "@/ui/components/SmallStars/SmallStars";
import { useAppSelector } from "@/store/store";
import { selectMatchesForCurrentGame } from "@/store/matches.slice";
import { selectCurrentPlayerId } from "@/store/playersState.slice";
import { MatchState } from "@/models/Match.interface";
type Props = {};

const MatchesHistory: React.FC<Props> = ({}) => {
  const matches = useAppSelector((state) => selectMatchesForCurrentGame(state));
  const playerId = useAppSelector((state) => selectCurrentPlayerId(state));
  function shortenAddress(addr: any) {
    return addr.slice(0, 7) + "..." + addr.slice(-5);
  }
  return (
    <div className="section matches-history">
      <div className="label">
        <div>Matches History</div>
        <Tooltip text="" />
      </div>
      <CustomList>
        {matches &&
          matches
            .filter((m) => m.player1 == playerId || m.player2 == playerId)
            .map((m) => (
              <div className="match-history-container" key={m.id}>
                <div className="game-info">
                  <div className="game-offer">
                    <div className="label">
                      Game: <span>{shortenAddress(m.gameId)}</span>
                    </div>
                  </div>
                  <div className="game-id-container">
                    <div className="label">
                      Match Id: <span>{m.matchId}</span>
                    </div>
                  </div>
                </div>
                <div className="game-details">
                  <div className="cards">
                    <SmallCard hideNumber card={m.player1Card} />
                    <div>X</div>
                    <SmallCard hideNumber card={m.player2Card} />
                    <div>=</div>
                  </div>
                  {((m.player1 == playerId && m.result == MatchState.WIN1) ||
                    (m.player2 == playerId && m.result == MatchState.WIN2)) && (
                    <div className="game-status">
                      <div className="won">You Won</div>
                      <SmallStars
                        direction="row"
                        nbr={
                          m.result == MatchState.WIN1
                            ? m.player2Bet
                            : m.player1Bet
                        }
                        expanded={1}
                      />
                    </div>
                  )}
                  {((m.player1 == playerId && m.result == MatchState.WIN2) ||
                    (m.player2 == playerId && m.result == MatchState.WIN1)) && (
                    <div className="game-status">
                      <div className="lost">You Lost</div>
                      <SmallStars
                        direction="row"
                        nbr={
                          m.result == MatchState.WIN1
                            ? m.player2Bet
                            : m.player1Bet
                        }
                        expanded={1}
                      />
                    </div>
                  )}
                  {m.result == MatchState.DRAW && (
                    <div className="game-status">
                      <div className="draw">Draw</div>
                      <SmallStars
                        direction="row"
                        nbr={
                          m.player1 == playerId ? m.player1Bet : m.player2Bet
                        }
                        expanded={1}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
      </CustomList>
    </div>
  );
};

export default memo(MatchesHistory);
