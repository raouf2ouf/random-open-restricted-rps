"use client";

import { fetchOpenGamesInfo } from "@/store/openGames.slice";
import { useAppDispatch } from "@/store/store";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { foundry, lightlinkPegasus, polygonMumbai } from "viem/chains";
import { useChainId } from "wagmi";

type ContractsContextProps = {
  chainId: number;
  factoryAddress: string;
  collateralUnit: string;
};

const DEFAULT_CHAIN = foundry.id;
const DEFAULT_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_FOUNDRY_FACTORY_ADDRESS!.toLowerCase();
const DEFAULT_COLLATERAL_UNIT = "ETH";

const ContractsContext = createContext<ContractsContextProps>({
  chainId: DEFAULT_CHAIN,
  factoryAddress: DEFAULT_FACTORY_ADDRESS,
  collateralUnit: DEFAULT_COLLATERAL_UNIT,
});

type Props = {
  children: ReactNode;
};

export const ContractsProvider: React.FC<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const [collateralUnit, setCollateralUnit] = useState<string>(
    DEFAULT_COLLATERAL_UNIT
  );
  const [factoryAddress, setFactoryAddress] = useState<string>(
    DEFAULT_FACTORY_ADDRESS
  );

  useEffect(() => {
    if (chainId) {
      let address: string | undefined;
      let collateral: string | undefined;
      switch (chainId) {
        case foundry.id:
          address = process.env.NEXT_PUBLIC_FOUNDRY_FACTORY_ADDRESS;
          collateral = process.env.NEXT_PUBLIC_FOUNDRY_COLLATERAL_UNIT;
          break;
        case lightlinkPegasus.id:
          address = process.env.NEXT_PUBLIC_LIGHTLINK_PEGASUS_FACTORY_ADDRESS;
          collateral =
            process.env.NEXT_PUBLIC_LIGHTLINK_PEGASUS_COLLATERAL_UNIT;
          break;
        case polygonMumbai.id:
          address = process.env.NEXT_PUBLIC_MUMBAI_FACTORY_ADDRESS;
          collateral = process.env.NEXT_PUBLIC_MUMBAI_COLLATERAL_UNIT;
          break;
      }
      if (address && collateral) {
        setFactoryAddress(address.toLowerCase());
        setCollateralUnit(collateral);
        dispatch(fetchOpenGamesInfo(address));
      }
    }
  }, [chainId]);

  return (
    <ContractsContext.Provider
      value={{ chainId, factoryAddress, collateralUnit }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

export function useContractsContext() {
  return useContext(ContractsContext);
}
