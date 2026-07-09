// Bridge between the LAVA domain model (compounds × calipers, in lava-data.ts)
// and the live Wix Stores catalog. Each compound is a product; each caliper
// fitment is a variant. This resolves the (compound, caliper) pair a shopper
// picks in the configurator to the real Wix { catalogItemId, variantId } the
// cart needs. Server-side only — imports the Wix Stores SDK.
import { productsV3 } from "@wix/stores";
import { COMPOUND_SLUGS, type CompoundCode } from "./lava-data";

// The Wix Stores app id — required in every cart catalogReference.
export const WIX_STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

type Raw = Record<string, unknown>;

export interface CompoundEntry {
  productId: string;
  // caliperLabel → variantId
  variants: Record<string, string>;
}

// compound code → its product + fitment variant map. Serialisable: passed as a
// prop into the client configurator island.
export type LavaCatalog = Partial<Record<CompoundCode, CompoundEntry>>;

const PRODUCT_FIELDS = ["VARIANT_OPTION_CHOICE_NAMES"];

function pick(obj: unknown, path: (string | number)[]): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && String(key) in (acc as Raw)) {
      return (acc as Raw)[String(key)];
    }
    return undefined;
  }, obj);
}

async function loadCompound(slug: string): Promise<CompoundEntry | null> {
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
  const productId = (full._id as string) ?? (full.id as string) ?? id;
  const rawVariants = (pick(full, ["variantsInfo", "variants"]) as unknown[]) ?? [];
  const variants: Record<string, string> = {};
  for (const v of rawVariants) {
    const label = pick(v, ["choices", 0, "optionChoiceNames", "choiceName"]) as string | undefined;
    const variantId = (pick(v, ["_id"]) as string) ?? (pick(v, ["id"]) as string) ?? "";
    if (label && variantId) variants[label] = variantId;
  }
  return { productId, variants };
}

// Resolve every compound in parallel. A missing product resolves to absent (the
// configurator then falls back to display-only for that compound), never throws.
export async function loadLavaCatalog(): Promise<LavaCatalog> {
  const entries = await Promise.all(
    (Object.entries(COMPOUND_SLUGS) as [CompoundCode, string][]).map(
      async ([code, slug]) => {
        try {
          return [code, await loadCompound(slug)] as const;
        } catch (err) {
          console.error(`[lava-catalog] failed to load ${slug}:`, err);
          return [code, null] as const;
        }
      },
    ),
  );
  const catalog: LavaCatalog = {};
  for (const [code, entry] of entries) if (entry) catalog[code] = entry;
  return catalog;
}
