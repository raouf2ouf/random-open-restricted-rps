import { memo } from "react";

import "./Wallet.scss";
import { useAccount, useConnect } from "wagmi";
import { Button } from "@nextui-org/react";
type Props = {};

const Wallet: React.FC<Props> = ({}) => {
  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect();

  function shortenAddress(addr: any) {
    return addr.slice(0, 7) + "..." + addr.slice(-5);
  }

  function handleConnect() {
    connect({ connector: connectors[0] });
  }

  return (
    <>
      {isConnected ? (
        <Button className="rectangle" variant="bordered" color="primary">
          {shortenAddress(address)}
        </Button>
      ) : (
        <Button
          className="rectangle"
          variant="bordered"
          color="primary"
          onClick={handleConnect}
        >
          Connect
        </Button>
      )}
    </>
  );
};

export default memo(Wallet);
