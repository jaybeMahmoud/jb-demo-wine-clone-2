import { CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

import { api, type RouterOutputs } from "~/utils/api";

import { Textarea } from "~/components/ui/textarea";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { format } from "date-fns";

export default function EditWine() {
  useSession({ required: true });
  const router = useRouter();
  const utils = api.useUtils();
  const bottleId = router.query.bottleId as string | undefined;

  const [bottle, setBottle] = useState<
    RouterOutputs["wine"]["getBottle"] | null
  >(null);

  useEffect(() => {
    if (bottleId === undefined || bottle) return;
    void utils.wine.getBottle
      .fetch({ id: parseInt(bottleId) })
      .then((wine) => setBottle(wine));
  }, [bottleId, bottle, utils.wine.getBottle]);

  const editBottle = api.wine.editWineBottle.useMutation();
  const handleSaveBottle = async () => {
    if (bottle === null) return;

    await editBottle.mutateAsync(bottle);
    await router.push(`/${bottle.wineId}`);
  };

  return (
    <>
      <Head>
        <title>Wine Demo App</title>
        <meta name="description" content="Zamaqo wine demo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto my-4 max-w-lg space-y-4 px-8">
        <h1 className="text-center text-3xl font-bold">Edit Bottle</h1>

        <fieldset className="flex items-center gap-4">
          <Checkbox
            id="consumed"
            checked={bottle?.consumed}
            onCheckedChange={(checked) =>
              bottle && setBottle({ ...bottle, consumed: checked as boolean })
            }
            disabled={!bottle}
          />
          <Label htmlFor="consumed">Consumed</Label>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "ml-auto w-[240px] justify-start text-left font-normal",
                  !bottle?.dateConsumed && "text-muted-foreground",
                )}
                disabled={!bottle || !bottle.consumed}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {bottle?.dateConsumed ? (
                  format(bottle?.dateConsumed, "PPP")
                ) : (
                  <span>Date Consumed</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={bottle?.dateConsumed ?? undefined}
                onSelect={(date) =>
                  bottle && setBottle({ ...bottle, dateConsumed: date ?? null })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </fieldset>

        <fieldset>
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            name="note"
            value={bottle?.note ?? ""}
            onChange={(e) =>
              bottle && setBottle({ ...bottle, note: e.target.value })
            }
          />
        </fieldset>

        <div className="flex justify-between">
          <Button>
            <Link href={`/${bottle?.wineId}`}>Cancel</Link>
          </Button>
          <Button onClick={handleSaveBottle}>Save</Button>
        </div>
      </main>
    </>
  );
}
