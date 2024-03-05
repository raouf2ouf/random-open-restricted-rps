import { memo } from "react";

import "./GameSelector.scss";
import { Select, SelectItem } from "@nextui-org/react";

type Props = {};

const GameSelector: React.FC<Props> = ({}) => {
  return (
    <div className="game-selector-container">
      <Select
        label="Current Game ID"
        popoverProps={{
          classNames: {
            content: "game-select-content",
          },
        }}
      >
        <SelectItem key="0">0</SelectItem>
        <SelectItem key="1">1</SelectItem>
        <SelectItem key="2">2</SelectItem>
        <SelectItem key="3">3</SelectItem>
      </Select>
    </div>
  );
};

export default memo(GameSelector);
