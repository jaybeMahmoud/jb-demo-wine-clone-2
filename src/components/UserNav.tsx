"use client";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/utils/api";

interface UserNavProps {
  session?: Session | null;
}

export function UserNav({ session }: UserNavProps) {
  const { data: applicationVersion } =
    api.wine.getApplicationVersion.useQuery();
  const editVersion = api.wine.editApplicationVersion.useMutation();
  const handleToggleVersion = async () => {
    await editVersion.mutateAsync({
      version: applicationVersion === 1 ? 2 : 1,
    });
    location.reload();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 justify-self-end rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                session?.user.image ??
                `https://avatar.vercel.sh/${
                  session?.user.name ??
                  session?.user.email ??
                  session?.user.id ??
                  "filler"
                }.svg`
              }
              alt="@shadcn"
            />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleToggleVersion()}>
          Toggle version
          {applicationVersion !== undefined && (
            <DropdownMenuShortcut>V{applicationVersion}</DropdownMenuShortcut>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ redirect: true })}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
