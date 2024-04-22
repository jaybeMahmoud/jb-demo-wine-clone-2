import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import { Inter as FontSans } from "next/font/google";
import { cn } from "~/lib/utils";
import { useEffect } from "react";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  useEffect(() => {
    cn("bg-background font-sans antialiased", fontSans.variable)
      .split(" ")
      .forEach((className) => {
        document.documentElement.classList.add(className);
      });
  }, []);

  return (
    <SessionProvider session={session}>
      <main
        className={cn("bg-background font-sans antialiased", fontSans.variable)}
      >
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
