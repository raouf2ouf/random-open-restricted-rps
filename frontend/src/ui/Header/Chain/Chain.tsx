import { Select, SelectItem, Selection } from "@nextui-org/react";
import { memo, useEffect, useMemo } from "react";
import { useAccount, useChainId, useChains, useSwitchChain } from "wagmi";

import "./Chain.scss";
type Props = {};

const Chain: React.FC<Props> = ({}) => {
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();

  async function selectChain(keys: Selection) {
    const ids = Array.from(keys);
    if (ids.length > 0) {
      const id = Number(ids[0]);
      if (id != chainId) {
        //@ts-ignore
        await switchChain({ chainId: id });
      }
    }
  }
  return (
    <div className="chain-selector-container">
      <Select
        className="chain-select"
        label="Current Chain"
        selectedKeys={chainId ? [chainId.toString()] : ["ukw"]}
        onSelectionChange={selectChain}
        popoverProps={{
          classNames: {
            content: "chain-select-content",
          },
        }}
      >
        {[...chains, { id: "ukw", name: "Not Supported" }].map((c) => {
          return (
            <SelectItem key={c.id.toString()} value={c.id.toString()}>
              {c.name}
            </SelectItem>
          );
        })}
      </Select>
    </div>
  );
};

export default Chain;
