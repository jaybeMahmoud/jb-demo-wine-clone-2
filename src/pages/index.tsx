import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { UserNav } from "~/components/UserNav";
import { Button } from "~/components/ui/button";
import * as Table from "~/components/ui/table";

import { api } from "~/utils/api";

import { wineries } from "~/lib/data";
import { useRouter } from "next/router";
import { ScrollArea } from "~/components/ui/scroll-area";

export default function Home() {
  const { data: session } = useSession({ required: true });
  const { data: wines } = api.wine.getWines.useQuery();

  const router = useRouter();

  return (
    <>
      <Head>
        <title>Wine Demo App</title>
        <meta name="description" content="Zamaqo wine demo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto my-4 max-w-6xl space-y-4 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button>
              <Link href="/create">Create</Link>
            </Button>
          </div>
          <UserNav session={session} />
        </div>

        <Table.Table>
          <Table.TableCaption>A list of your wines</Table.TableCaption>
          <Table.TableHeader>
            <Table.TableRow>
              <Table.TableHead>Image</Table.TableHead>
              <Table.TableHead>Name</Table.TableHead>
              <Table.TableHead>Quantity</Table.TableHead>
              <Table.TableHead>Year</Table.TableHead>
              <Table.TableHead>Type</Table.TableHead>
              <Table.TableHead>Winery</Table.TableHead>
              <Table.TableHead>Rating</Table.TableHead>
              <Table.TableHead>Variatal</Table.TableHead>
              <Table.TableHead>Note</Table.TableHead>
            </Table.TableRow>
          </Table.TableHeader>
          <Table.TableBody>
            {wines?.map((wine, index) => (
              <Table.TableRow
                key={wine.name + index}
                onClick={(e) => {
                  if (
                    e.target instanceof HTMLElement &&
                    e.target.closest("#scroll-area")
                  )
                    return;

                  void router.push(`/${wine.id}`);
                }}
                className="cursor-pointer"
              >
                <Table.TableCell>
                  {wine.imageUrl ? (
                    <Image
                      src={wine.imageUrl}
                      width={50}
                      height={50}
                      alt={wine.name}
                      className="h-[50px] w-[50px] rounded-md object-contain"
                    />
                  ) : (
                    "N/A"
                  )}
                </Table.TableCell>
                <Table.TableCell>{wine.name}</Table.TableCell>
                <Table.TableCell>{wine._count.wineBottles}</Table.TableCell>
                <Table.TableCell>{wine.year}</Table.TableCell>
                <Table.TableCell>{wine.type}</Table.TableCell>
                <Table.TableCell>
                  {
                    wineries.find((winery) => winery.key === wine.wineryKey)
                      ?.name
                  }
                </Table.TableCell>
                <Table.TableCell>{wine.rating}</Table.TableCell>
                <Table.TableCell>{wine.varietal}</Table.TableCell>
                <Table.TableCell className="relative h-full w-60">
                  <div className="absolute inset-0" id="scroll-area">
                    <ScrollArea className="h-full">{wine.note}</ScrollArea>
                  </div>
                </Table.TableCell>
              </Table.TableRow>
            ))}
          </Table.TableBody>
        </Table.Table>
      </main>
    </>
  );
}
