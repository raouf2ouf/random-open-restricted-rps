"use client";

import { memo } from "react";
import { MdArrowLeft, MdArrowRight } from "react-icons/md";
import { Button } from "@nextui-org/button";

type Props = {};

import "./RightMenu.scss";
import { useMenuContext } from "@/contexts/MenuContext";
import GameState from "./GameState/GameState";
import PlayersState from "./PlayersState/PlayersState";
// import GameState from "./GameState/GameState";

const RightMenu: React.FC<Props> = ({}) => {
  const { rightMenuOpen, toggleRightSide } = useMenuContext();

  return (
    <div id="right-menu" className={rightMenuOpen ? "open" : "closed"}>
      <div className="small-section">
        <Button
          isIconOnly
          variant="light"
          color="primary"
          onClick={() => toggleRightSide()}
        >
          {rightMenuOpen ? <MdArrowRight /> : <MdArrowLeft />}
        </Button>
        <GameState />
      </div>
      <div className="big-section">
        <PlayersState />
      </div>
    </div>
  );
};

export default memo(RightMenu);
