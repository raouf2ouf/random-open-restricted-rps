import { memo, useEffect } from "react";

import "./Wallet.scss";
import { useAccount, useConnect } from "wagmi";
import { Button } from "@nextui-org/react";
import { useAppDispatch } from "@/store/store";
import { setPlayerAddress } from "@/store/playersState.slice";
type Props = {};

const Wallet: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect();

  useEffect(() => {
    if (address && isConnected) {
      dispatch(setPlayerAddress(address));
    }
  }, [address, isConnected]);

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
