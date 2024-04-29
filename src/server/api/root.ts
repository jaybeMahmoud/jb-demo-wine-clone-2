import { wineRouter } from "~/server/api/routers/wine";
import { createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  wine: wineRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
