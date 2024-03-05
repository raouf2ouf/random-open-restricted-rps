"use client";

import { memo } from "react";
import { MdArrowLeft, MdArrowRight } from "react-icons/md";
import { Button } from "@nextui-org/button";

type Props = {};

import "./LeftMenu.scss";
import { useMenuContext } from "@/contexts/MenuContext";
import PlayerHand from "./PlayerHand/PlayerHand";
import PlayerAccount from "./PlayerAccount/PlayerAccount";
import MatchesHistory from "./MatchesHistory/MatchesHistory";

const LeftMenu: React.FC<Props> = ({}) => {
  const { leftMenuOpen, toggleLeftSide } = useMenuContext();

  return (
    <div id="left-menu" className={leftMenuOpen ? "open" : "closed"}>
      <div className="big-section">
        <PlayerAccount />
        <MatchesHistory />
      </div>
      <div className="small-section">
        <Button
          isIconOnly
          variant="light"
          color="primary"
          onClick={() => toggleLeftSide()}
        >
          {leftMenuOpen ? <MdArrowLeft /> : <MdArrowRight />}
        </Button>

        <PlayerHand />
      </div>
    </div>
  );
};

export default memo(LeftMenu);
