import { useEffect, useState } from "react";
import { currentCart } from "@wix/ecom";
import { redirects } from "@wix/redirects";

// Header cart affordance: shows the live item count and starts a Wix-hosted
// checkout. A full on-page cart page is deferred (scaffold scope).
export default function CartButton() {
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const cart = await currentCart.getCurrentCart();
      setCount((cart.lineItems ?? []).reduce((n, li) => n + (li.quantity ?? 0), 0));
    } catch {
      // No cart yet for this visitor — empty, not an error.
      setCount(0);
    }
  }

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("cart-updated", onUpdate);
    return () => window.removeEventListener("cart-updated", onUpdate);
  }, []);

  async function handleCheckout() {
    if (count === 0 || busy) return;
    setBusy(true);
    try {
      const { checkoutId } = await currentCart.createCheckoutFromCurrentCart({
        channelType: currentCart.ChannelType.WEB,
      });
      const { redirectSession } = await redirects.createRedirectSession({
        ecomCheckout: { checkoutId },
        callbacks: { postFlowUrl: window.location.origin },
      });
      if (redirectSession?.fullUrl) window.location.href = redirectSession.fullUrl;
      else setBusy(false);
    } catch (err) {
      console.error("[cart] checkout failed:", err);
      setBusy(false);
    }
  }

  return (
    <button
      className="cart-btn"
      onClick={handleCheckout}
      disabled={count === 0 || busy}
      aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
    >
      {busy ? "Redirecting…" : `Cart (${count})`}
    </button>
  );
}
