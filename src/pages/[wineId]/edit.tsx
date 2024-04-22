/* eslint-disable @next/next/no-img-element */
import type { WineType } from "@prisma/client";
import { XIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

import { api, type RouterOutputs } from "~/utils/api";

const WINE_TYPES: WineType[] = [
  "RED",
  "WHITE",
  "ROSE",
];

import { Check, ChevronsUpDown } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { wineries } from "~/lib/data";
import { Textarea } from "~/components/ui/textarea";
import { UploadButton } from "~/utils/uploadthing";

export default function EditWine() {
  useSession({ required: true });
  const router = useRouter();
  const utils = api.useUtils();
  const wineId = router.query.wineId as string | undefined;

  const [wine, setWine] = useState<RouterOutputs["wine"]["getWine"] | null>(
    null,
  );

  useEffect(() => {
    if (wineId === undefined || wine) return;
    void utils.wine.getWine
      .fetch({ id: parseInt(wineId) })
      .then((wine) => setWine(wine));
  }, [wineId, wine, utils.wine.getWine]);

  const editWine = api.wine.editWine.useMutation();
  const handleSaveWine = async () => {
    if (wine === null) return;

    await editWine.mutateAsync(wine);
    await router.push("/");
  };

  const [winerySelectorOpen, setWinerySelectorOpen] = useState(false);
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);

  const [uploadBusy, setUploadBusy] = useState(false);

  const deleteWine = api.wine.deleteWine.useMutation();
  const handleDeleteWine = async (id: number) => {
    utils.wine.getWines.setData(undefined, (prev) => {
      if (!prev) return prev;
      return prev.filter((wine) => wine.id !== id);
    });

    await deleteWine.mutateAsync({ id });
    await router.push("/");
  };

  return (
    <>
      <Head>
        <title>Wine Demo App</title>
        <meta name="description" content="Zamaqo wine demo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto my-4 max-w-lg space-y-4 px-8">
        <h1 className="text-center text-3xl font-bold">Edit Wine</h1>

        {wine?.imageUrl ?? !wine ? (
          <>
            {wine ? (
              <div className="relative">
                <img
                  src={wine?.imageUrl ?? ""}
                  alt="Uploaded wine label"
                  className="max-h-80 w-full rounded-md border border-border object-contain"
                  fetchPriority="high"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-2 h-5 w-5"
                  onClick={() => wine && setWine({ ...wine, imageUrl: "" })}
                >
                  <XIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <div className="h-52 w-full animate-pulse rounded-md bg-muted" />
            )}
          </>
        ) : uploadBusy ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className="m-auto block h-10 w-10 bg-transparent grayscale"
            width="200px"
            height="200px"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
          >
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke-width="5"
              stroke="#93dbe9"
              stroke-dasharray="54.97787143782138 54.97787143782138"
              fill="none"
              stroke-linecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                dur="1s"
                repeatCount="indefinite"
                keyTimes="0;1"
                values="0 50 50;360 50 50"
              ></animateTransform>
            </circle>
            <circle
              cx="50"
              cy="50"
              r="29"
              stroke-width="5"
              stroke="#689cc5"
              stroke-dasharray="45.553093477052 45.553093477052"
              stroke-dashoffset="45.553093477052"
              fill="none"
              stroke-linecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                dur="1s"
                repeatCount="indefinite"
                keyTimes="0;1"
                values="0 50 50;-360 50 50"
              ></animateTransform>
            </circle>
          </svg>
        ) : (
          <Button>
            <UploadButton
              endpoint="imageUploader"
              content={{
                allowedContent: <></>,
              }}
              onClientUploadComplete={(res) => {
                setUploadBusy(false);

                setWine((prev) => ({
                  ...prev!,
                  imageUrl: res.at(0)?.url ?? "",
                }));
              }}
              onUploadError={(error: Error) => {
                console.error("Upload error", error);
                setUploadBusy(false);
              }}
              onUploadBegin={() => {
                setUploadBusy(true);
              }}
            />
          </Button>
        )}

        <fieldset>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={wine?.name}
            onChange={(e) => wine && setWine({ ...wine, name: e.target.value })}
            disabled={!wine}
          />
        </fieldset>

        <fieldset>
          <Label htmlFor="winery">Winery</Label>
          <Popover
            open={winerySelectorOpen}
            onOpenChange={setWinerySelectorOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={winerySelectorOpen}
                className="flex w-64 justify-between"
              >
                {wine?.wineryKey
                  ? wineries.find((winery) => winery.key === wine.wineryKey)
                      ?.name
                  : "Select winery..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
              <Command>
                <CommandInput placeholder="Search winery..." />
                <CommandEmpty>No wineries found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {wineries
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((winery) => (
                      <CommandItem
                        key={winery.key}
                        value={winery.key}
                        onSelect={(currentValue: string) => {
                          setWine((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  wineryKey:
                                    currentValue === prev.wineryKey
                                      ? ""
                                      : currentValue,
                                }
                              : null,
                          );
                          setWinerySelectorOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            wine?.wineryKey === winery.key
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {winery.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </fieldset>

        <fieldset>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            max={new Date().getFullYear()}
            min={1900}
            value={wine?.year}
            onChange={(e) =>
              wine && setWine({ ...wine, year: parseInt(e.target.value) })
            }
            disabled={!wine}
          />
        </fieldset>
        <fieldset>
          <Label htmlFor="type">Type</Label>
          <Popover open={typeSelectorOpen} onOpenChange={setTypeSelectorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={typeSelectorOpen}
                className="flex w-[200px] justify-between"
              >
                {wine?.type
                  ? WINE_TYPES.find((type) => type === wine.type)
                  : "Select type..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {WINE_TYPES.map((type) => (
                    <CommandItem
                      key={type}
                      value={type}
                      onSelect={() => {
                        if (!wine) return;

                        setWine({
                          ...wine,
                          type,
                        });

                        setTypeSelectorOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          wine?.type === type ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {type}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </fieldset>
        <fieldset>
          <Label htmlFor="varietal">Varietal</Label>
          <Input
            id="varietal"
            value={wine?.varietal}
            onChange={(e) =>
              wine && setWine({ ...wine, varietal: e.target.value })
            }
            disabled={!wine}
          />
        </fieldset>
        <fieldset>
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            max="5"
            value={wine?.rating}
            onChange={(e) =>
              wine && setWine({ ...wine, rating: parseFloat(e.target.value) })
            }
            disabled={!wine}
          />
        </fieldset>

        <fieldset>
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            name="note"
            value={wine?.note ?? ""}
            onChange={(e) => wine && setWine({ ...wine, note: e.target.value })}
          />
        </fieldset>

        <div className="flex justify-between">
          <Button>
            <Link href="/">Cancel</Link>
          </Button>
          <div className="flex gap-4">
            <Button
              onClick={() => handleDeleteWine(wine!.id)}
              variant="destructive"
            >
              Delete
            </Button>
            <Button onClick={handleSaveWine}>Save</Button>
          </div>
        </div>
      </main>
    </>
  );
}
