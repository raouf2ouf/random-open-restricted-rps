import { memo } from "react";

import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import { MdHelpCenter } from "react-icons/md";

import "./Tooltip.scss";
type Props = {
  text: string;
};

const Info: React.FC<Props> = ({ text }) => {
  return (
    <div className="tooltip-container">
      <Popover
        showArrow
        classNames={{
          base: ["popover-base"],
          content: ["rounded-none popover-content"],
        }}
      >
        <PopoverTrigger>
          <Button isIconOnly variant="light" color="primary">
            <MdHelpCenter />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="px-1 py-2">
            <div className="text-tiny">{text}</div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default memo(Info);
