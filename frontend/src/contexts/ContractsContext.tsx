import { useAppDispatch } from "@/store/store";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { foundry } from "viem/chains";
import { useChainId } from "wagmi";

type ContractsContextProps = {
  chainId: number;
  factoryAddress: string;
  collateralUnit: string;
};

const DEFAULT_CHAIN = foundry.id;
const DEFAULT_FACTORY_ADDRESS =
  process.env[`NEXT_PUBLIC_${DEFAULT_CHAIN}_FACTORY_ADDRESS`]!.toLowerCase();
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
  const chainId = useChainId();
  const [collateralUnit, setCollateralUnit] = useState<string>(
    DEFAULT_COLLATERAL_UNIT
  );
  const [factoryAddress, setFactoryAddress] = useState<string>(
    DEFAULT_FACTORY_ADDRESS
  );

  useEffect(() => {
    if (chainId) {
      const address = process.env[`NEXT_PUBLIC_${chainId}_FACTORY_ADDRESS`];
      const collateral = process.env[`NEXT_PUBLIC_${chainId}_COLLATERAL_UNIT`];
      if (address && collateral) {
        setFactoryAddress(address.toLowerCase());
        setCollateralUnit(collateral);
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
