import { memo } from "react";

import "./PlayerAccount.scss";
import Tooltip from "@/ui/components/Tooltip/Tooltip";
import Wallet from "./Wallet";
import WinLossRatio from "./WinLossRatio";
import GainsChart from "./GainsChart";
type Props = {};

const PlayerAccount: React.FC<Props> = ({}) => {
  return (
    <div className="section player">
      <div className="label">
        <div>Current Player</div>
        <Tooltip text="" />
      </div>
      <Wallet />
      <WinLossRatio />
      <GainsChart />
    </div>
  );
};

export default memo(PlayerAccount);
