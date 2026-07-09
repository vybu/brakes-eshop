// Server-side catalog reads. Under @wix/astro the SDK auth is ambient, so we
// call productsV3 directly — no createClient. These run during SSR.
import { productsV3 } from "@wix/stores";

// Domain model: a product is a brake-pad *model*; the "Fitment" option holds
// the shapes (each a Wix variant with its own id + price).
export type PadVariant = {
  id: string; // variantId — required by the cart's catalogReference
  label: string; // fitment choice name ("" for a single-variant product)
  price: string | null; // formatted, e.g. "€89.00"
  priceAmount: number | null;
};

export type Pad = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceFrom: string | null;
  priceMax: string | null;
  image: string | null;
  optionName: string | null;
  variants: PadVariant[];
};

const PRODUCT_FIELDS = [
  "CURRENCY",
  "URL",
  "PLAIN_DESCRIPTION",
  "VARIANT_OPTION_CHOICE_NAMES",
  "MEDIA_ITEMS_INFO",
  "THUMBNAIL",
  "MIN_VARIANT_PRICE_INFO",
];

type Raw = Record<string, unknown>;

function pick(obj: unknown, path: (string | number)[]): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && String(key) in (acc as Raw)) {
      return (acc as Raw)[String(key)];
    }
    return undefined;
  }, obj);
}

function normalizeVariants(raw: Raw): PadVariant[] {
  const variants = (pick(raw, ["variantsInfo", "variants"]) as unknown[]) ?? [];
  return variants.map((v) => ({
    id: (pick(v, ["_id"]) as string) ?? (pick(v, ["id"]) as string) ?? "",
    label: (pick(v, ["choices", 0, "optionChoiceNames", "choiceName"]) as string) ?? "",
    price: (pick(v, ["price", "actualPrice", "formattedAmount"]) as string) ?? null,
    priceAmount: (() => {
      const a = pick(v, ["price", "actualPrice", "amount"]) as string | undefined;
      return a ? Number(a) : null;
    })(),
  }));
}

function normalizePad(raw: Raw): Pad {
  const range = raw.actualPriceRange as
    | { minValue?: { formattedAmount?: string }; maxValue?: { formattedAmount?: string } }
    | undefined;
  const minFormatted = range?.minValue?.formattedAmount ?? null;
  const maxFormatted = range?.maxValue?.formattedAmount ?? null;
  const optionName = (pick(raw, ["options", 0, "name"]) as string) ?? null;
  const image =
    (pick(raw, ["media", "main", "image", "url"]) as string) ??
    (pick(raw, ["media", "itemsInfo", "items", 0, "image", "url"]) as string) ??
    null;

  return {
    id: (raw._id as string) ?? (raw.id as string) ?? "",
    name: (raw.name as string) ?? "Untitled",
    slug: (raw.slug as string) ?? "",
    description: (raw.plainDescription as string) ?? "",
    priceFrom: minFormatted,
    priceMax: maxFormatted && maxFormatted !== minFormatted ? maxFormatted : null,
    image,
    optionName: optionName && optionName.length ? optionName : null,
    variants: normalizeVariants(raw),
  };
}

export async function listPads(): Promise<Pad[]> {
  try {
    const { items } = await productsV3
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .queryProducts({ fields: PRODUCT_FIELDS as any })
      .eq("visible", true)
      .limit(50)
      .find();
    return (items ?? []).map((p) => normalizePad(p as Raw));
  } catch (err) {
    console.error("[products] listing query failed:", err);
    return [];
  }
}

export async function getPadBySlug(slug: string): Promise<Pad | null> {
  try {
    const { items } = await productsV3
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .queryProducts({ fields: PRODUCT_FIELDS as any })
      .eq("slug", slug)
      .limit(1)
      .find();
    const listItem = (items ?? [])[0] as Raw | undefined;
    const id = listItem ? ((listItem._id as string) ?? (listItem.id as string)) : undefined;
    if (!id) return null;
    // queryProducts omits variants; getProduct hydrates variantsInfo.variants.
    const res = (await productsV3.getProduct(id, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fields: PRODUCT_FIELDS as any,
    })) as Raw;
    const full = (res.product ?? res) as Raw;
    return normalizePad(full);
  } catch (err) {
    console.error("[products] detail query failed:", err);
    return null;
  }
}
