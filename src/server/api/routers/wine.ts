import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const wineRouter = createTRPCRouter({
  getWines: protectedProcedure.query(async ({ ctx }) => {
    const wines = await ctx.db.wine.findMany({
      where: { createdById: ctx.session.user.id },
      include: { _count: { select: { wineBottles: true } } },
    });
    return wines;
  }),

  getWine: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const wine = await ctx.db.wine.findUnique({
        where: { id: input.id },
        include: {
          wineBottles: {
            orderBy: {
              counter: "asc",
            },
          },
        },
      });

      if (wine?.createdById !== ctx.session.user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      return wine;
    }),

  getBottle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const bottle = await ctx.db.wineBottle.findUnique({
        where: { id: input.id },
      });
      return bottle;
    }),

  createWine: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        imageUrl: z.string().nullish(),
        type: z.enum(["RED", "WHITE", "ROSE"]),
        year: z.number(),
        varietal: z.string(),
        rating: z.number(),
        note: z.string(),
        wineryKey: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const wine = await ctx.db.wine.create({
        data: {
          ...input,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
      return wine;
    }),

  editWine: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        imageUrl: z.string().nullish(),
        type: z.enum(["RED", "WHITE", "ROSE"]),
        year: z.number(),
        varietal: z.string(),
        rating: z.number(),
        wineryKey: z.string().min(1),
        note: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const _wine = await ctx.db.wine.findUnique({
        where: { id: input.id },
      });

      if (_wine?.createdById !== ctx.session.user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const wine = await ctx.db.wine.update({
        where: { id: input.id },
        data: {
          ...input,
          imageUrl: input.imageUrl,
        },
      });
      return wine;
    }),

  deleteWine: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wine = await ctx.db.wine.delete({
        where: { id: input.id },
      });
      return wine;
    }),

  editWineBottle: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        dateConsumed: z.date().nullish(),
        note: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const wineBottle = await ctx.db.wineBottle.update({
        where: { id: input.id },
        data: {
          consumed: input.dateConsumed !== null,
          dateConsumed: input.dateConsumed,
          note: input.note ?? "",
        },
      });
      return wineBottle;
    }),

  deleteWineBottle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wineBottle = await ctx.db.wineBottle.delete({
        where: { id: input.id },
      });
      return wineBottle;
    }),

  addBottle: protectedProcedure
    .input(z.object({ id: z.number(), quantity: z.number(), note: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const lastWine = await ctx.db.wineBottle.findFirst({
        where: { wine: { createdById: ctx.session.user.id } },
        orderBy: { id: "desc" },
        select: { counter: true },
      });

      const data = Array.from({ length: input.quantity }).map((_, idx) => ({
        consumed: false,
        counter: lastWine ? lastWine.counter + 1 + idx : 1 + idx,
        note: input.note,
      }));

      const wine = await ctx.db.wine.update({
        where: { id: input.id },
        data: {
          wineBottles: {
            createMany: {
              data,
            },
          },
        },
      });
      return wine;
    }),

  editApplicationVersion: protectedProcedure
    .input(z.object({ version: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const version = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          version: input.version,
        },
      });
      return version;
    }),

  getApplicationVersion: protectedProcedure.query(async ({ ctx }) => {
    const version = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { version: true },
    });
    return version?.version;
  }),
});
