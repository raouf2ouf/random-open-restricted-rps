import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.scss";
import { Providers } from "./providers";
import Header from "@/ui/Header/Header";
import LeftMenu from "@/ui/LeftMenu/LeftMenu";
import TabsNav from "@/ui/TabsNav/TabsNav";
import RightMenu from "@/ui/RightMenu/RightMenu";
import {
  FactoryListenerContainer,
  GamesListenersContainer,
} from "./DataListeners";
import { ToastContainer } from "react-toastify";

const font = Titillium_Web({ weight: ["400", "600"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ethpoir",
  description: "Restricted Random RPS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={font.className}>
        <Providers>
          <div className="global-container">
            <FactoryListenerContainer />
            <GamesListenersContainer />
            <Header />
            <div className="global-content">
              <LeftMenu />
              <div className="main-content">
                {children}
                <TabsNav />
              </div>
              <RightMenu />
            </div>
          </div>
        </Providers>
        <ToastContainer
          theme="dark"
          position="bottom-center"
          autoClose={false}
        />
      </body>
    </html>
  );
}
