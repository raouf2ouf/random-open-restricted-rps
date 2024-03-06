"use client";

import { memo } from "react";
import { Tab, Tabs } from "@nextui-org/tabs";
import { usePathname, useRouter } from "next/navigation";

import { MdHome, MdLocalOffer, MdVideogameAsset } from "react-icons/md";

type Props = {};

import "./TabsNav.scss";
import { GiUpCard } from "react-icons/gi";

const TabsNav: React.FC<Props> = ({}) => {
  const pathname = usePathname();
  const router = useRouter();

  function goTo(route: any) {
    router.push(route);
  }
  return (
    <div className="tabs-nav">
      <Tabs
        selectedKey={pathname}
        onSelectionChange={goTo}
        fullWidth
        color="primary"
        variant="underlined"
      >
        <Tab
          key="/home"
          title={
            <div className="tab-button">
              <MdHome />
              <div>Home</div>
            </div>
          }
        ></Tab>
        <Tab
          key="/play"
          title={
            <div className="tab-button">
              <GiUpCard />
              <div>Play</div>
            </div>
          }
        ></Tab>
        <Tab
          key="/matches"
          title={
            <div className="tab-button">
              <MdVideogameAsset />
              <div>Matches</div>
            </div>
          }
        ></Tab>
        {/* <Tab
          key="/offers"
          title={
            <div className="tab-button">
              <MdLocalOffer />
              <div>Offers</div>
            </div>
          } 
        ></Tab>*/}
      </Tabs>
    </div>
  );
};

export default memo(TabsNav);
