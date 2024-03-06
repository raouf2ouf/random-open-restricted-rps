"use client";

import { useContractsContext } from "@/contexts/ContractsContext";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { memo } from "react";
import { useWatchContractEvent } from "wagmi";

import FACTORY_CONTRACT from "@/contracts/RestrictedRPSFactory.json";
import GAME_CONTRACT from "@/contracts/RestrictedRPSGame.json";
import {
  fetchOpenGameInfo,
  gameJoined,
  playerWasGivenCards,
  selectAllOpenGames,
} from "@/store/openGames.slice";
import { IGame } from "@/models/Game.interface";
import { string32BytesToAddress } from "@/contracts";

const { abi: GAME_ABI } = GAME_CONTRACT;
const { abi: FACTORY_ABI } = FACTORY_CONTRACT;

const FactoryListener: React.FC = () => {
  const dispatch = useAppDispatch();
  const { factoryAddress } = useContractsContext();

  useWatchContractEvent({
    address: factoryAddress as `0x${string}`,
    abi: FACTORY_ABI,
    onLogs(logs) {
      console.log("logs from factory", logs);
      for (const log of logs) {
        const eventName = (log as any).eventName;
        switch (eventName) {
          case "GameCreated":
            const gameAddress = (log as any).topics[2];
            dispatch(fetchOpenGameInfo(string32BytesToAddress(gameAddress)));
        }
      }
    },
  });
  return <></>;
};

export const FactoryListenerContainer = memo(FactoryListener);

type GameProps = {
  gameAddress: string;
  gameGlobalId: string;
};

const GameListener: React.FC<GameProps> = ({ gameAddress, gameGlobalId }) => {
  const dispatch = useAppDispatch();
  useWatchContractEvent({
    address: gameAddress as `0x${string}`,
    abi: GAME_ABI,
    onLogs(logs) {
      console.log("game logs", logs);
      for (const log of logs) {
        const eventName = (log as any).eventName;
        const args = (log as any).args as any;
        const topics = (log as any).topics as any;
        switch (eventName) {
          case "GameJoined":
            const joinedPlayerAddress = string32BytesToAddress(topics[2]);
            dispatch(
              gameJoined({ gameAddress, gameGlobalId, joinedPlayerAddress })
            );
            break;
          case "PlayerWasGivenCards":
            const playerId = Number(BigInt(topics[1]));
            dispatch(
              playerWasGivenCards({ gameAddress, gameGlobalId, playerId })
            );
            break;
        }
      }
    },
  });
  return <></>;
};

const GameListenerMemo = memo(GameListener);

const GamesListeners: React.FC = () => {
  const games: IGame[] = useAppSelector((state) => selectAllOpenGames(state));
  return (
    <>
      {games &&
        games.map((g) => (
          <GameListenerMemo
            key={g.id}
            gameAddress={g.gameAddress}
            gameGlobalId={g.id}
          />
        ))}
    </>
  );
};

export const GamesListenersContainer = memo(GamesListeners);
