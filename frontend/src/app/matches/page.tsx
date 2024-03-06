"use client";

import { useAppSelector } from "@/store/store";
import "./page.scss";
import Tooltip from "@/ui/components/Tooltip/Tooltip";
import { selectPlayerAddress } from "@/store/playersState.slice";
function App() {
  const playerAddress = useAppSelector((state) => selectPlayerAddress(state));
  return (
    <div className="page play-page">
      {!playerAddress ? (
        <div className="section">
          <div className="label">
            <div>
              Please connect your wallet and use a supported network to see
              games.
            </div>
            <Tooltip text="" />
          </div>
        </div>
      ) : (
        <>
          <div className="section player-games">
            <div className="label">
              <div>Your Current Open Games</div>
              <Tooltip text="" />
            </div>
          </div>
          <div className="section join-game">
            <div className="label">
              <div>Join a Game to Play</div>
              <Tooltip text="" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
