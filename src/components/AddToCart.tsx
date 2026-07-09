import { useState } from "react";
import { currentCart } from "@wix/ecom";
import type { Pad } from "../lib/products";

const WIX_STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

// Buy box island: pick a Fitment (the "shape"), then add its variant to the
// cart. Variant-managed products need the variantId in catalogReference.options
// — a bare product id is silently dropped by Wix Cart V2.
export default function AddToCart({ pad }: { pad: Pad }) {
  const variants = pad.variants.filter((v) => v.id);
  const hasChoices = variants.length > 1 && variants.some((v) => v.label);
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");

  const selected = variants.find((v) => v.id === variantId) ?? variants[0];

  async function handleAdd() {
    if (!selected?.id) return;
    setStatus("adding");
    try {
      const { cart } = await currentCart.addToCurrentCart({
        lineItems: [
          {
            catalogReference: {
              appId: WIX_STORES_APP_ID,
              catalogItemId: pad.id,
              options: { variantId: selected.id },
            },
            quantity: 1,
          },
        ],
      });
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: { cart } }));
      setStatus("added");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("[cart] add failed:", err);
      setStatus("error");
    }
  }

  if (variants.length === 0) {
    return <p className="muted">Currently unavailable.</p>;
  }

  return (
    <div className="buybox">
      {hasChoices && (
        <label className="field">
          <span className="field-label">{pad.optionName ?? "Fitment"}</span>
          <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
                {v.price ? ` — ${v.price}` : ""}
              </option>
            ))}
          </select>
        </label>
      )}

      {selected?.price && <p className="buybox-price">{selected.price}</p>}

      <button className="btn" onClick={handleAdd} disabled={status === "adding"}>
        {status === "adding" ? "Adding…" : status === "added" ? "Added to cart ✓" : "Add to cart"}
      </button>

      {status === "error" && <p className="error">Something went wrong. Please try again.</p>}
    </div>
  );
}
