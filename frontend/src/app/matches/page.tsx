"use client";

import { useAppSelector } from "@/store/store";
import "./page.scss";
import Tooltip from "@/ui/components/Tooltip/Tooltip";
import { selectCurrentGameGlobalId } from "@/store/playersState.slice";
import PlayerOpenMatches from "./PlayerOpenMatches";
import OpenMatches from "./OpenMatches";
import PlayedMatches from "./PlayedMatches";
import PlayerAnsweredMatches from "./PlayerAnsweredMatches";
import MatchesAnsweredByPlayer from "./MatchesAnsweredByPlayer";
function App() {
  const currentGameGlobalId = useAppSelector((state) =>
    selectCurrentGameGlobalId(state)
  );
  return (
    <div className="page play-page">
      {!currentGameGlobalId ? (
        <div className="section">
          <div className="label">
            <div>Please select a Game to check Matches</div>
            <Tooltip text="" />
          </div>
        </div>
      ) : (
        <>
          <div className="section player-matches">
            <div className="label">
              <div>Your Open Matches</div>
              <Tooltip text="" />
            </div>
            <PlayerOpenMatches />
          </div>

          <div className="section to-close-matches">
            <div className="label">
              <div>Your Matches To Close</div>
              <Tooltip text="" />
            </div>
            <PlayerAnsweredMatches />
          </div>

          <div className="section to-close-matches">
            <div className="label">
              <div>Matches That You Answered</div>
              <Tooltip text="" />
            </div>
            <MatchesAnsweredByPlayer />
          </div>

          <div className="section to-close-matches">
            <div className="label">
              <div>Other Players&apos; Open Matches</div>
              <Tooltip text="" />
            </div>
            <OpenMatches />
          </div>

          <div className="section to-close-matches">
            <div className="label">
              <div>All Played Matches</div>
              <Tooltip text="" />
            </div>
            <PlayedMatches />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
