"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";

import { NextUIProvider } from "@nextui-org/react";

import { config } from "@/wagmi";
import { MenuProvider } from "@/contexts/MenuContext";
import { ContractsProvider } from "@/contexts/ContractsContext";
import { Provider } from "react-redux";
import { store } from "@/store/store";

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NextUIProvider>
      <MenuProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <ContractsProvider>{props.children}</ContractsProvider>
            </Provider>
          </QueryClientProvider>
        </WagmiProvider>
      </MenuProvider>
    </NextUIProvider>
  );
}
