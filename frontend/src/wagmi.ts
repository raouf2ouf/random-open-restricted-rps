import { http, createConfig } from "wagmi";
import { foundry, lightlinkPegasus, polygonMumbai } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [foundry, polygonMumbai, lightlinkPegasus],
  connectors: [
    injected(),
    // coinbaseWallet({ appName: "Create Wagmi" }),
    // walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
  ],
  ssr: true,
  transports: {
    [foundry.id]: http(),
    [polygonMumbai.id]: http(),
    [lightlinkPegasus.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
