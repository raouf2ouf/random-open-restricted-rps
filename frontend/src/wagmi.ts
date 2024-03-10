import { http, createConfig, webSocket } from "wagmi";
import { fantomTestnet, lightlinkPegasus, polygonMumbai } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [fantomTestnet, polygonMumbai, lightlinkPegasus],
  connectors: [
    injected(),
    // coinbaseWallet({ appName: "Create Wagmi" }),
    // walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
  ],
  ssr: true,
  transports: {
    [fantomTestnet.id]: webSocket(
      "wss://go.getblock.io/2b0f21a86beb426a8215a8b369f0043c"
    ),
    [polygonMumbai.id]: http(),
    [lightlinkPegasus.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
