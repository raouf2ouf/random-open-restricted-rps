"use client";

type Props = {};

import { memo } from "react";
import "./Header.scss";
import Chain from "./Chain/Chain";
import GameSelector from "./GameSelector/GameSelector";

const Header: React.FC<Props> = ({}) => {
  const version = "v0.1";
  return (
    <div id="header">
      <div className="logo">
        <div id="logo-text">
          <span>Eth</span>poir
        </div>
        <div id="version" className="hide-md">
          {version}
        </div>
      </div>
      <GameSelector />
      <Chain />
    </div>
  );
};

export default memo(Header);
