import { useMemo, useRef, useState } from "react";
import { currentCart } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import { COMPOUNDS, CALIPERS, CURRENCY, caliperLabel, type CompoundCode, type Caliper } from "../lib/lava-data";
import type { LavaCatalog } from "../lib/lava-catalog";

// LAVA configurator — Studio design system.
// Instrument-grade: labelled steps, segmented compound row (flat accent selection,
// never gradient), a native <select> keyed BY ARRAY INDEX (two calipers can share a
// LAVA part id), a live mono price and a flat primary "Add to set" button with a
// local "Added" state. All styling scoped under .lava-studio-cfg. Mount client:load.

// Reserved thermal gradient — the ONE signature element. Used only on the temp scale.
const THERMAL = "linear-gradient(90deg,#C1001F 0%,#E11437 34%,#F0806F 66%,#FBE7DD 100%)";

// Discipline framing per compound — the ledger's second column.
const USE: Record<CompoundCode, string> = {
  MK: "Daily & fast road",
  SR: "Spirited roads · odd track day",
  TW: "Track days, all session",
  "TW/2": "Race — hardest stops",
  TWe: "Endurance — lowest wear",
};
// Full system temperature domain (°C) for the scale + per-compound brackets.
const T_MIN = 20;
const T_MAX = 850;

// Parse "40–600°C" → [40, 600] for the operating-window bracket.
function parseTemp(t: string): [number, number] {
  const m = t.replace(/[^\d–-]/g, "").split(/[–-]/).map((n) => parseInt(n, 10));
  return [m[0] ?? T_MIN, m[1] ?? T_MAX];
}

function pct(v: number): number {
  return ((v - T_MIN) / (T_MAX - T_MIN)) * 100;
}

// The Wix Stores app id — required in every cart catalogReference.
const WIX_STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

type CartStatus = "idle" | "adding" | "added" | "error";
type Axle = "front" | "rear" | "both" | "universal";

// Step 2 groups the flat caliper list by vehicle name so a car's two axles sit
// together; step 3 then picks Front / Rear / Both. A vehicle offers "Both" only
// when it has BOTH a front and a rear fitment in the catalog (today: BMW M2,
// MX-5 NB BBK, MX-5 NB MID) — otherwise Rear/Both are disabled. Universal-fit
// parts (big-brake kits, AP/CP calipers) have no axle, so they get a single set.
interface Vehicle {
  name: string;
  front?: Caliper;
  rear?: Caliper;
  universal?: Caliper;
}
const VEHICLES: Vehicle[] = (() => {
  const map = new Map<string, Vehicle>();
  const order: string[] = [];
  for (const c of CALIPERS) {
    if (!map.has(c.name)) { map.set(c.name, { name: c.name }); order.push(c.name); }
    const v = map.get(c.name)!;
    if (c.position === "Front") v.front = c;
    else if (c.position === "Rear") v.rear = c;
    else v.universal = c;
  }
  return order.map((n) => map.get(n)!);
})();

// Default axle for a vehicle: front if it has one, else rear, else the universal set.
function defaultAxle(v: Vehicle): Axle {
  return v.front ? "front" : v.rear ? "rear" : "universal";
}
// The caliper fitment(s) a (vehicle, axle) selection resolves to — one, or two for "both".
function calipersFor(v: Vehicle, a: Axle): Caliper[] {
  if (a === "both") return v.front && v.rear ? [v.front, v.rear] : [];
  if (a === "front") return v.front ? [v.front] : [];
  if (a === "rear") return v.rear ? [v.rear] : [];
  return v.universal ? [v.universal] : [];
}

export default function ConfiguratorStudio({
  heading = "Configure your set",
  catalog = {},
  appId = WIX_STORES_APP_ID,
}: {
  heading?: string;
  catalog?: LavaCatalog;
  appId?: string;
}) {
  const [compound, setCompound] = useState<CompoundCode>("SR");
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [axle, setAxle] = useState<Axle>(() => defaultAxle(VEHICLES[0]));
  const [status, setStatus] = useState<CartStatus>("idle");
  const [checkingOut, setCheckingOut] = useState(false);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Radiogroup keyboard nav: arrows move selection AND focus to the next option.
  function moveCompound(dir: number) {
    const i = COMPOUNDS.findIndex((c) => c.code === compound);
    const next = (i + dir + COMPOUNDS.length) % COMPOUNDS.length;
    setCompound(COMPOUNDS[next].code);
    setStatus("idle");
    cellRefs.current[next]?.focus();
  }

  const vehicle = useMemo(() => VEHICLES[vehicleIdx] ?? VEHICLES[0], [vehicleIdx]);
  const isUniversal = Boolean(vehicle.universal && !vehicle.front && !vehicle.rear);
  const axleAvail = {
    front: Boolean(vehicle.front),
    rear: Boolean(vehicle.rear),
    both: Boolean(vehicle.front && vehicle.rear),
  };
  const selCalipers = calipersFor(vehicle, axle);
  // Price for a compound at the current axle — sums the fitments (two, for "both").
  const priceForCompound = (code: CompoundCode) =>
    selCalipers.reduce((sum, c) => sum + c.prices[code], 0);
  const price = priceForCompound(compound);
  const compoundMeta = COMPOUNDS.find((c) => c.code === compound);
  const cc = compound.replace("/", "");
  const part = selCalipers.map((c) => `LP-${c.id}-${cc}`).join(" + ");
  const axleMeta = axle === "both" ? "Front + rear · full car"
    : axle === "front" ? "Front set"
    : axle === "rear" ? "Rear set"
    : "Full set";

  // Resolve the current (compound, axle) selection to its live Wix variant(s).
  // Both front and rear are variants of the SAME per-compound product.
  const entry = catalog[compound];
  const variantIds = selCalipers.map((c) => entry?.variants[caliperLabel(c)]);
  const canBuy = Boolean(entry?.productId) && variantIds.length > 0 && variantIds.every(Boolean);

  async function handleAdd() {
    if (!canBuy || !entry) return;
    setStatus("adding");
    try {
      const { cart } = await currentCart.addToCurrentCart({
        lineItems: variantIds.map((variantId) => ({
          catalogReference: {
            appId,
            catalogItemId: entry.productId,
            options: { variantId: variantId! },
          },
          quantity: 1,
        })),
      });
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: { cart } }));
      // Stay in "added" so the checkout / add-another actions persist. Any edit
      // to the selection below resets status to "idle" via its own handler.
      setStatus("added");
    } catch (err) {
      console.error("[cart] add failed:", err);
      setStatus("error");
    }
  }

  // Proceed to a Wix-hosted checkout of the current cart (same flow as CartButton).
  async function handleCheckout() {
    if (checkingOut) return;
    setCheckingOut(true);
    try {
      const { checkoutId } = await currentCart.createCheckoutFromCurrentCart({
        channelType: currentCart.ChannelType.WEB,
      });
      const { redirectSession } = await redirects.createRedirectSession({
        ecomCheckout: { checkoutId },
        callbacks: { postFlowUrl: window.location.origin },
      });
      if (redirectSession?.fullUrl) window.location.href = redirectSession.fullUrl;
      else setCheckingOut(false);
    } catch (err) {
      console.error("[cart] checkout failed:", err);
      setCheckingOut(false);
    }
  }

  function chooseVehicle(i: number) {
    setVehicleIdx(i);
    setAxle(defaultAxle(VEHICLES[i]));
    setStatus("idle");
  }

  return (
    <div className="lava-studio-cfg">
      <div className="cfg-frame">
        <span className="cfg-x cfg-x-tl">+</span>
        <span className="cfg-x cfg-x-tr">+</span>
        <span className="cfg-x cfg-x-bl">+</span>
        <span className="cfg-x cfg-x-br">+</span>

        <div className="cfg-main">
        <header className="cfg-head">
          <div>
            <span className="cfg-kicker">Configurator</span>
            <h3>{heading}</h3>
          </div>
        </header>

        <div className="cfg-step">
          <span className="cfg-label" id="cfg-compound-label"><i>01</i> Compound</span>
          <div
            className="cfg-ledger"
            role="radiogroup"
            aria-labelledby="cfg-compound-label"
            onKeyDown={(e) => {
              const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
                : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
              if (dir) { e.preventDefault(); moveCompound(dir); }
            }}
          >
            <div className="cfg-ledger-head" aria-hidden="true">
              <span>Compound</span><span>Discipline</span>
              <span>Operating window · 20&#8211;850&#8201;&deg;C</span><span>Set</span>
            </div>
            {COMPOUNDS.map((c, i) => {
              const on = compound === c.code;
              const [clo, chi] = parseTemp(c.temp);
              return (
              <button
                key={c.code}
                ref={(el) => { cellRefs.current[i] = el; }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                className={`cfg-lrow${on ? " on" : ""}`}
                onClick={() => { setCompound(c.code); setStatus("idle"); }}
              >
                <span className="cfg-lrow-code">{c.code}</span>
                <span className="cfg-lrow-name">{c.name}<em>{USE[c.code]}</em></span>
                <span className="cfg-lrow-bar" title={c.temp}>
                  <span className="cfg-lrow-track" />
                  <span
                    className="cfg-lrow-fill"
                    style={{ left: `${pct(clo)}%`, width: `${pct(chi) - pct(clo)}%`, background: THERMAL }}
                  />
                  <span className="cfg-lrow-hi" style={{ left: `${Math.min(pct(chi), 94)}%` }}>{chi}&deg;</span>
                </span>
                <span className="cfg-lrow-price">{priceForCompound(c.code)}<i>{CURRENCY}</i></span>
              </button>
              );
            })}
          </div>
          {compoundMeta && (
            <p className="cfg-ledger-note">
              <b>{compoundMeta.code} · {compoundMeta.name}</b> — operating window <em>{compoundMeta.temp}</em> · {compoundMeta.rival}
            </p>
          )}
        </div>

        <div className="cfg-step">
          <span className="cfg-label"><i>02</i> Fitment</span>
          <div className="cfg-select-wrap">
            <select
              className="cfg-select"
              value={vehicleIdx}
              aria-label="Vehicle fitment"
              onChange={(e) => chooseVehicle(Number(e.target.value))}
            >
              {VEHICLES.map((v, i) => (
                <option key={i} value={i}>{v.name}</option>
              ))}
            </select>
            <span className="cfg-caret" aria-hidden="true">&#9662;</span>
          </div>
        </div>

        <div className="cfg-step">
          <span className="cfg-label"><i>03</i> Axle set</span>
          {isUniversal ? (
            <div className="cfg-axle">
              <button type="button" className="cfg-axle-cell on" role="radio" aria-checked="true">
                <span className="cfg-axle-label">Full set</span>
                <span className="cfg-axle-price">{priceForCompound(compound)}{CURRENCY}</span>
              </button>
            </div>
          ) : (
            <div className="cfg-axle" role="radiogroup" aria-label="Axle set">
              {(["front", "rear", "both"] as const).map((a) => {
                const avail = axleAvail[a];
                const on = axle === a && avail;
                const label = a === "front" ? "Front set" : a === "rear" ? "Rear set" : "Front + rear";
                const cals = calipersFor(vehicle, a);
                const p = cals.reduce((s, c) => s + c.prices[compound], 0);
                return (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={!avail}
                    className={`cfg-axle-cell${on ? " on" : ""}`}
                    onClick={() => { setAxle(a); setStatus("idle"); }}
                  >
                    <span className="cfg-axle-label">{label}</span>
                    <span className="cfg-axle-price">{avail ? `${p}${CURRENCY}` : "—"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <footer className="cfg-foot">
          <div className="cfg-price">
            <span className="cfg-part">{part}</span>
            <span className="cfg-amt">{price}<i>{CURRENCY}</i></span>
            <span className="cfg-meta">{compound} · {vehicle.name} · {axleMeta}</span>
          </div>
          {status === "added" ? (
            <div className="cfg-actions">
              <span className="cfg-added-note" role="status">Added to set ✓</span>
              <div className="cfg-actions-btns">
                <button type="button" className="cfg-add-2" onClick={() => setStatus("idle")}>
                  Add another set
                </button>
                <button type="button" className="cfg-add" onClick={handleCheckout} disabled={checkingOut}>
                  {checkingOut ? "Redirecting…" : "Proceed to checkout"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="cfg-add"
              onClick={handleAdd}
              disabled={!canBuy || status === "adding"}
            >
              {!canBuy ? "Unavailable" : status === "adding" ? "Adding…" : "Add to set"}
            </button>
          )}
        </footer>
        {status === "error" && (
          <p className="cfg-err" role="alert">Couldn’t add to cart — please try again.</p>
        )}
        </div>
      </div>

      {/* dangerouslySetInnerHTML: without it Astro's SSR HTML-escapes the quotes
          in the CSS (font-family:&quot;…&quot;), which mismatches the client and
          forces a full hydration replace. Raw injection keeps server === client. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .lava-studio-cfg{
          --base:#100E0B; --surface:#17130E; --raised:#1F1A13; --raised-2:#282117;
          --hairline:#2A241B; --hairline-strong:#3A3225; --paper:#F4EDE0; --muted:#A69C88;
          --faint:#6E6656; --accent:#C1001F; --accent-hi:#E11437; --accent-ink:#fff;
          --thermal:${THERMAL};
          --mono:"JetBrains Mono",ui-monospace,monospace;
          /* Neutral system defaults — consumers override --text/--display with their
             brand face (index.astro sets Montserrat). Avoids referencing unloaded fonts. */
          --text:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
          --display:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
          --ease:cubic-bezier(.2,0,0,1);
          font-family:var(--text); color:var(--paper); width:100%;
        }
        .lava-studio-cfg *{ box-sizing:border-box; }
        .cfg-frame{
          position:relative; background:var(--raised); border:1px solid var(--hairline);
          border-radius:12px; overflow:hidden;
        }
        .cfg-x{ position:absolute; z-index:2; color:var(--hairline-strong); font-family:var(--mono);
          font-size:12px; line-height:1; user-select:none; }
        .cfg-x-tl{ top:10px; left:10px; } .cfg-x-tr{ top:10px; right:10px; }
        .cfg-x-bl{ bottom:10px; left:10px; } .cfg-x-br{ bottom:10px; right:10px; }

        .cfg-main{ padding:clamp(24px,3.5vw,40px); }

        .cfg-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:28px; }
        .cfg-kicker{ display:block; font-family:var(--mono); font-size:12px; letter-spacing:.14em;
          text-transform:uppercase; color:var(--faint); margin-bottom:8px; }
        .cfg-head h3{ margin:0; font-family:var(--display); font-weight:500; font-size:20px; letter-spacing:-.01em; }
        .cfg-count{ font-family:var(--mono); font-size:12px; color:var(--faint); text-align:right; white-space:nowrap; }

        .cfg-step{ margin-bottom:24px; }
        .cfg-label{ display:flex; align-items:center; gap:10px; font-family:var(--mono); font-size:12px;
          letter-spacing:.14em; text-transform:uppercase; color:var(--faint); margin-bottom:12px; }
        .cfg-label i{ font-style:normal; color:var(--muted); }

        /* Compound picker — a spec-ledger: crisp data table, flush accent rule on the
           selected row (no floating outline), one shared 20–850°C axis across rows. */
        .cfg-ledger{ background:var(--surface); border:1px solid var(--hairline);
          border-radius:6px; overflow:hidden; }
        .cfg-ledger-head{ display:grid; grid-template-columns:60px 1.1fr 2fr 88px; gap:16px;
          padding:10px 18px; font-family:var(--mono); font-size:10.5px; letter-spacing:.12em;
          text-transform:uppercase; color:var(--faint); background:var(--base);
          border-bottom:1px solid var(--hairline); }
        .cfg-ledger-head span:last-child{ text-align:right; }
        .cfg-lrow{ position:relative; display:grid; grid-template-columns:60px 1.1fr 2fr 88px;
          gap:16px; align-items:center; width:100%; padding:15px 18px; background:none; border:none;
          border-top:1px solid var(--hairline); cursor:pointer; text-align:left; color:var(--muted);
          transition:background 150ms var(--ease); }
        .cfg-ledger > .cfg-lrow:first-of-type{ border-top:none; }
        .cfg-lrow:hover{ background:var(--raised); }
        .cfg-lrow.on{ background:var(--raised-2); color:var(--paper); }
        .cfg-lrow.on::before{ content:""; position:absolute; left:0; top:0; bottom:0;
          width:3px; background:var(--accent); }
        .cfg-lrow:focus-visible{ outline:none; box-shadow:inset 0 0 0 2px var(--paper); }
        .cfg-lrow-code{ font-family:var(--mono); font-weight:500; font-size:15px;
          letter-spacing:.02em; color:var(--muted); }
        .cfg-lrow.on .cfg-lrow-code{ color:var(--accent-hi); }
        .cfg-lrow-name{ font-size:14px; color:var(--paper); }
        .cfg-lrow-name em{ display:block; font-style:normal; font-size:11.5px; color:var(--faint); margin-top:3px; }
        .cfg-lrow-bar{ position:relative; height:8px; }
        .cfg-lrow-track{ position:absolute; inset:0; border-radius:2px; background:var(--base);
          border:1px solid var(--hairline); }
        .cfg-lrow.on .cfg-lrow-track{ border-color:var(--hairline-strong); }
        .cfg-lrow-fill{ position:absolute; top:0; bottom:0; border-radius:2px; opacity:.5; }
        .cfg-lrow.on .cfg-lrow-fill{ opacity:1; }
        .cfg-lrow-hi{ position:absolute; top:-15px; transform:translateX(-50%);
          font-family:var(--mono); font-size:10px; color:var(--faint); }
        .cfg-lrow.on .cfg-lrow-hi{ color:var(--paper); }
        .cfg-lrow-price{ text-align:right; font-family:var(--mono); font-size:16px; font-weight:500; color:var(--paper); }
        .cfg-lrow-price i{ font-style:normal; font-size:12px; color:var(--muted); margin-left:2px; }
        .cfg-ledger-note{ margin:14px 0 0; font-size:13px; color:var(--muted); }
        .cfg-ledger-note b{ color:var(--paper); font-weight:600; }
        .cfg-ledger-note em{ font-style:normal; font-family:var(--mono); color:var(--paper); }

        .cfg-select-wrap{ position:relative; }
        .cfg-select{ width:100%; appearance:none; -webkit-appearance:none;
          background:var(--surface); color:var(--paper); border:1px solid var(--hairline);
          border-radius:6px; padding:13px 40px 13px 14px; font-size:15px; font-family:var(--text);
          cursor:pointer; transition:border-color 120ms var(--ease), box-shadow 120ms var(--ease); }
        .cfg-select:focus{ outline:none; border-color:var(--paper); box-shadow:0 0 0 3px rgba(244,237,224,.14); }
        .cfg-caret{ position:absolute; right:14px; top:50%; transform:translateY(-50%);
          pointer-events:none; color:var(--faint); font-size:12px; }

        /* Axle set — segmented Front / Rear / Both; unavailable axles disabled. */
        .cfg-axle{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .cfg-axle:has(> :only-child){ grid-template-columns:1fr; }
        .cfg-axle-cell{ display:flex; flex-direction:column; align-items:flex-start; gap:5px;
          padding:13px 14px; background:var(--surface); border:1px solid var(--hairline);
          border-radius:6px; color:var(--muted); cursor:pointer; text-align:left;
          transition:border-color 160ms var(--ease), background 160ms var(--ease), color 160ms var(--ease); }
        .cfg-axle-cell:hover:not(:disabled):not(.on){ border-color:var(--hairline-strong); color:var(--paper); }
        .cfg-axle-cell.on{ border-color:var(--accent); background:var(--raised-2); color:var(--paper); }
        .cfg-axle-cell:disabled{ opacity:.4; cursor:default; }
        .cfg-axle-label{ font-size:14px; font-weight:500; }
        .cfg-axle-price{ font-family:var(--mono); font-size:12px; color:var(--faint); }
        .cfg-axle-cell.on .cfg-axle-price{ color:var(--accent-hi); }

        .cfg-foot{ display:flex; align-items:flex-end; justify-content:space-between; gap:20px;
          margin-top:28px; padding-top:24px; border-top:1px solid var(--hairline); }
        .cfg-part{ display:block; font-family:var(--mono); font-size:12px; letter-spacing:.06em;
          color:var(--faint); margin-bottom:6px; }
        .cfg-amt{ display:block; font-family:var(--display); font-weight:600; font-size:44px;
          line-height:.9; letter-spacing:-.02em; }
        .cfg-amt i{ font-style:normal; font-family:var(--mono); font-size:17px; font-weight:400;
          color:var(--muted); margin-left:6px; }
        .cfg-meta{ display:block; margin-top:10px; font-family:var(--mono); font-size:12px; color:var(--faint); }
        .cfg-add{ background:var(--accent); color:var(--accent-ink); border:none; border-radius:6px;
          padding:15px 26px; font-family:var(--text); font-size:14px; font-weight:600; letter-spacing:.01em;
          cursor:pointer; white-space:nowrap; transition:background 120ms var(--ease), transform 120ms var(--ease); }
        .cfg-add:hover:not(:disabled){ background:var(--accent-hi); transform:translateY(-2px); }
        .cfg-add:disabled{ cursor:default; opacity:.55; transform:none; }
        .cfg-err{ margin:14px 0 0; font-family:var(--mono); font-size:12px; color:var(--accent-hi); }

        /* Post-add state: primary "Proceed to checkout" + secondary "Add another set". */
        .cfg-actions{ display:flex; flex-direction:column; align-items:flex-end; gap:12px; }
        .cfg-added-note{ font-family:var(--mono); font-size:12px; letter-spacing:.02em; color:var(--accent-hi); }
        .cfg-actions-btns{ display:flex; gap:10px; }
        .cfg-add-2{ background:transparent; color:var(--paper); border:1px solid var(--hairline-strong);
          border-radius:6px; padding:15px 22px; font-family:var(--text); font-size:14px; font-weight:600;
          letter-spacing:.01em; cursor:pointer; white-space:nowrap;
          transition:border-color 120ms var(--ease), color 120ms var(--ease); }
        .cfg-add-2:hover{ border-color:var(--paper); }

        @media (max-width:560px){
          .cfg-main{ padding:22px; }
          .cfg-ledger-head, .cfg-lrow{ grid-template-columns:50px 1fr 76px; }
          .cfg-ledger-head span:nth-child(3), .cfg-lrow-bar{ display:none; }
          .cfg-head{ flex-direction:column; gap:6px; }
          .cfg-count{ text-align:left; }
          .cfg-foot{ flex-direction:column; align-items:stretch; }
          .cfg-add{ width:100%; }
          .cfg-actions{ align-items:stretch; }
          .cfg-actions-btns{ flex-direction:column-reverse; }
          .cfg-add-2{ width:100%; }
        }
        @media (prefers-reduced-motion:reduce){
          .lava-studio-cfg *{ transition:none !important; }
        }
      ` }} />
    </div>
  );
}
