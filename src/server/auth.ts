import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
      };
    },
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials, req) {
        console.log("credentials", credentials, req);
        if (!credentials) throw new Error("No credentials");

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (user) {
          if (user.password === credentials.password) return user;
          if (user.password !== credentials.password)
            throw new Error("Password does not match");
        }

        // User doesn't exist, let them sign up
        const newUser = await db.user.create({
          data: {
            email: credentials.email,
            password: credentials.password,
          },
        });

        if (!newUser) throw new Error("Could not create user");
        return newUser;
      },
      credentials: {
        email: {
          label: "Email",
          type: "text ",
          placeholder: "jsmith@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
    }),
  ],
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
