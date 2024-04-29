/* eslint-disable @next/next/no-img-element */
import type { WineType } from "@prisma/client";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

import { api, type RouterInputs } from "~/utils/api";

import { Check, ChevronsUpDown, Loader2, XIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { wineries } from "~/lib/data";
import { UploadButton } from "~/utils/uploadthing";
import { Textarea } from "~/components/ui/textarea";

const WINE_TYPES: WineType[] = [
  "RED",
  "WHITE",
  "ROSE",
];

type WineInput = RouterInputs["wine"]["createWine"];
const DEFAULT_WINE: WineInput = {
  name: "",
  imageUrl: "",
  year: new Date().getFullYear(),
  type: "RED",
  varietal: "",
  rating: 0,
  wineryKey: "",
  note: "",
};

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

const currentYear = new Date().getFullYear();
const yearValidator = z
  .number({ invalid_type_error: "A value for this field is required" })
  .or(z.literal(0))
  .refine((value) => value === 0 || (value >= 1800 && value <= currentYear), {
    message: "Number must be 0 or between 1800 and the current year",
  });

const formSchema = z.object({
  name: z.string().min(2).max(50),
  imageUrl: z.string().nullable(),
  year: yearValidator,
  type: z.enum(["RED", "WHITE", "ROSE"]),
  varietal: z.string(),
  rating: z
    .number({ invalid_type_error: "Number must be less than or equal to 5" })
    .min(0)
    .max(5)
    .step(0.1),
  wineryKey: z.string().min(1, { message: "A selected winery is required" }),
  note: z.string().max(500),
});

export default function CreateWine() {
  useSession({ required: true });
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_WINE,
  });

  // const [wine, setWine] = useState<WineInput>(DEFAULT_WINE);
  const createWine = api.wine.createWine.useMutation();
  const [creatingWine, setCreatingWine] = useState(false);
  const handleSaveWine = async (values: z.infer<typeof formSchema>) => {
    setCreatingWine(true);
    await createWine.mutateAsync(values);
    setCreatingWine(false);
    await router.push("/");
  };

  const [winerySelectorOpen, setWinerySelectorOpen] = useState(false);
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);

  const [uploadBusy, setUploadBusy] = useState(false);

  const { data: version } = api.wine.getApplicationVersion.useQuery();

  return (
    <>
      <Head>
        <title>Wine Demo App</title>
        <meta name="description" content="Zamaqo wine demo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSaveWine)}
          className="mx-auto my-4 max-w-lg space-y-4 px-8"
        >
          <h1 className="text-center text-3xl font-bold">Create Wine</h1>

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  {field.value ? (
                    <div className="relative">
                      <img
                        src={field.value}
                        alt="Uploaded wine label"
                        className="max-h-80 w-full rounded-md border border-border object-contain"
                        fetchPriority="high"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-2 h-5 w-5"
                        onClick={() => field.onChange("")}
                      >
                        <XIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
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
                    <UploadButton
                      className={cn(buttonVariants())}
                      endpoint="imageUploader"
                      content={{
                        allowedContent: <></>,
                      }}
                      onClientUploadComplete={(res) => {
                        setUploadBusy(false);

                        field.onChange(res.at(0)?.url ?? "");
                      }}
                      onUploadError={(error: Error) => {
                        console.error("Upload error", error);
                        setUploadBusy(false);
                      }}
                      onUploadBegin={() => {
                        setUploadBusy(true);
                      }}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="wineryKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Winery</FormLabel>
                <FormControl>
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
                        {field.value
                          ? wineries.find(
                              (winery) => winery.key === field.value,
                            )?.name
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
                                  field.onChange(currentValue);
                                  setWinerySelectorOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === winery.key
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value, 10));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Popover
                    open={typeSelectorOpen}
                    onOpenChange={setTypeSelectorOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={typeSelectorOpen}
                        className="flex w-[200px] justify-between"
                      >
                        {field.value
                          ? WINE_TYPES.find((type) => type === field.value)
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
                                field.onChange(type);
                                setTypeSelectorOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === type
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {type}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="varietal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Varietal</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={parseFloat(field.value.toString())}
                    type="number"
                    onChange={(e) => {
                      version === 1
                        ? field.onChange(parseFloat(e.target.value))
                        : field.onChange(e.target.value.toString());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button>
              <Link href="/">Cancel</Link>
            </Button>
            <Button type="submit">
              {creatingWine ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
