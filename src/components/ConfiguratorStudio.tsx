import { useMemo, useRef, useState } from "react";
import { currentCart } from "@wix/ecom";
import { COMPOUNDS, CALIPERS, CURRENCY, caliperLabel, type CompoundCode } from "../lib/lava-data";
import type { LavaCatalog } from "../lib/lava-catalog";

// LAVA configurator — Studio design system.
// Instrument-grade: labelled steps, segmented compound row (flat accent selection,
// never gradient), a native <select> keyed BY ARRAY INDEX (two calipers can share a
// LAVA part id), a live mono price and a flat primary "Add to set" button with a
// local "Added" state. All styling scoped under .lava-studio-cfg. Mount client:load.

// Reserved thermal gradient — the ONE signature element. Used only on the temp scale.
const THERMAL = "linear-gradient(90deg,#E33D1B 0%,#E9682A 34%,#F1A361 66%,#FCEDCC 100%)";

// One image per compound — shown in the card's left media panel, swaps on selection.
const DEFAULT_IMAGES: Record<CompoundCode, string> = {
  MK: "/gen2/pad-detail.jpg",
  SR: "/gen2/compound-macro.jpg",
  TW: "/gen2/caliper.jpg",
  "TW/2": "/gen2/disc-topdown.jpg",
  TWe: "/gen2/hero-assembly.jpg",
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

export default function ConfiguratorStudio({
  heading = "Configure your set",
  compoundImages = {},
  catalog = {},
  appId = WIX_STORES_APP_ID,
}: {
  heading?: string;
  compoundImages?: Partial<Record<CompoundCode, string>>;
  catalog?: LavaCatalog;
  appId?: string;
}) {
  const [compound, setCompound] = useState<CompoundCode>("SR");
  const [caliperIdx, setCaliperIdx] = useState(0);
  const [status, setStatus] = useState<CartStatus>("idle");
  const images = { ...DEFAULT_IMAGES, ...compoundImages };
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Radiogroup keyboard nav: arrows move selection AND focus to the next option.
  function moveCompound(dir: number) {
    const i = COMPOUNDS.findIndex((c) => c.code === compound);
    const next = (i + dir + COMPOUNDS.length) % COMPOUNDS.length;
    setCompound(COMPOUNDS[next].code);
    setStatus("idle");
    cellRefs.current[next]?.focus();
  }

  const caliper = useMemo(() => CALIPERS[caliperIdx] ?? CALIPERS[0], [caliperIdx]);
  const price = caliper?.prices[compound];
  const compoundMeta = COMPOUNDS.find((c) => c.code === compound);
  const [lo, hi] = compoundMeta ? parseTemp(compoundMeta.temp) : [T_MIN, T_MAX];
  const part = `LP-${caliper?.id}-${compound.replace("/", "")}`;

  // Resolve the current (compound, caliper) selection to its live Wix variant.
  const entry = catalog[compound];
  const variantId = caliper ? entry?.variants[caliperLabel(caliper)] : undefined;
  const canBuy = Boolean(entry?.productId && variantId);

  async function handleAdd() {
    if (!canBuy || !entry || !variantId) return;
    setStatus("adding");
    try {
      const { cart } = await currentCart.addToCurrentCart({
        lineItems: [
          {
            catalogReference: {
              appId,
              catalogItemId: entry.productId,
              options: { variantId },
            },
            quantity: 1,
          },
        ],
      });
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: { cart } }));
      setStatus("added");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      console.error("[cart] add failed:", err);
      setStatus("error");
    }
  }

  return (
    <div className="lava-studio-cfg">
      <div className="cfg-frame">
        <span className="cfg-x cfg-x-tl">+</span>
        <span className="cfg-x cfg-x-tr">+</span>
        <span className="cfg-x cfg-x-bl">+</span>
        <span className="cfg-x cfg-x-br">+</span>

        <figure className="cfg-media">
          <img src={images[compound]} alt={`${compoundMeta?.name ?? compound} compound`} />
          <figcaption className="cfg-media-cap">
            <span className="cfg-media-code">{compound}</span>
            <span className="cfg-media-name">{compoundMeta?.name}</span>
          </figcaption>
        </figure>

        <div className="cfg-main">
        <header className="cfg-head">
          <div>
            <span className="cfg-kicker">Configurator</span>
            <h3>{heading}</h3>
          </div>
          <span className="cfg-count">{CALIPERS.length} fitments · 5 compounds</span>
        </header>

        <div className="cfg-step">
          <span className="cfg-label" id="cfg-compound-label"><i>01</i> Compound</span>
          <div
            className="cfg-cells"
            role="radiogroup"
            aria-labelledby="cfg-compound-label"
            onKeyDown={(e) => {
              const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
                : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
              if (dir) { e.preventDefault(); moveCompound(dir); }
            }}
          >
            {COMPOUNDS.map((c, i) => {
              const on = compound === c.code;
              return (
              <button
                key={c.code}
                ref={(el) => { cellRefs.current[i] = el; }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                className={`cfg-cell${on ? " on" : ""}`}
                onClick={() => { setCompound(c.code); setStatus("idle"); }}
              >
                <span className="cfg-cell-code">{c.code}</span>
                <span className="cfg-cell-name">{c.name}</span>
              </button>
              );
            })}
          </div>
        </div>

        {compoundMeta && (
          <div className="cfg-scale">
            <div className="cfg-scale-bar">
              <div
                className="cfg-scale-window"
                style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
              />
            </div>
            <div className="cfg-scale-ticks">
              <span>20</span><span>200</span><span>400</span><span>600</span><span>850&#8201;&deg;C</span>
            </div>
            <p className="cfg-scale-note">
              <b>{compoundMeta.name}</b> — operating window <em>{compoundMeta.temp}</em> · {compoundMeta.rival}
            </p>
          </div>
        )}

        <div className="cfg-step">
          <span className="cfg-label"><i>02</i> Caliper fitment</span>
          <div className="cfg-select-wrap">
            <select
              className="cfg-select"
              value={caliperIdx}
              aria-label="Caliper fitment"
              onChange={(e) => { setCaliperIdx(Number(e.target.value)); setStatus("idle"); }}
            >
              {CALIPERS.map((c, i) => (
                <option key={i} value={i}>
                  {caliperLabel(c)}
                </option>
              ))}
            </select>
            <span className="cfg-caret" aria-hidden="true">&#9662;</span>
          </div>
        </div>

        <footer className="cfg-foot">
          <div className="cfg-price">
            <span className="cfg-part">{part}</span>
            <span className="cfg-amt">{price}<i>{CURRENCY}</i></span>
            <span className="cfg-meta">{compound} · {caliper?.name}{caliper?.position ? ` · ${caliper.position}` : ""} · per set</span>
          </div>
          <button
            type="button"
            className={`cfg-add${status === "added" ? " done" : ""}`}
            onClick={handleAdd}
            disabled={!canBuy || status === "adding"}
          >
            {!canBuy
              ? "Unavailable"
              : status === "adding"
                ? "Adding…"
                : status === "added"
                  ? "Added to set ✓"
                  : "Add to set"}
          </button>
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
          --faint:#6E6656; --accent:#E5451D; --accent-hi:#F1521F; --accent-ink:#120D08;
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
          display:grid; grid-template-columns:minmax(300px,42%) 1fr; align-items:stretch;
        }
        .cfg-x{ position:absolute; z-index:2; color:var(--hairline-strong); font-family:var(--mono);
          font-size:12px; line-height:1; user-select:none; }
        .cfg-x-tl{ top:10px; left:10px; } .cfg-x-tr{ top:10px; right:10px; }
        .cfg-x-bl{ bottom:10px; left:10px; } .cfg-x-br{ bottom:10px; right:10px; }

        /* left media panel — image of the selected compound */
        .cfg-media{ position:relative; margin:0; min-height:100%; overflow:hidden;
          border-right:1px solid var(--hairline); background:var(--base); }
        .cfg-media img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
          filter:contrast(1.05) saturate(.92); }
        .cfg-media::after{ content:""; position:absolute; inset:0;
          background:linear-gradient(180deg, rgba(16,14,11,0) 40%, rgba(16,14,11,.72) 100%); }
        .cfg-media-cap{ position:absolute; left:22px; bottom:20px; z-index:1;
          display:flex; align-items:baseline; gap:10px; }
        .cfg-media-code{ font-family:var(--mono); font-weight:500; font-size:20px; color:var(--paper); }
        .cfg-media-name{ font-size:13px; letter-spacing:.02em; color:var(--muted); }

        .cfg-main{ padding:32px; }

        .cfg-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:28px; }
        .cfg-kicker{ display:block; font-family:var(--mono); font-size:12px; letter-spacing:.14em;
          text-transform:uppercase; color:var(--faint); margin-bottom:8px; }
        .cfg-head h3{ margin:0; font-family:var(--display); font-weight:500; font-size:20px; letter-spacing:-.01em; }
        .cfg-count{ font-family:var(--mono); font-size:12px; color:var(--faint); text-align:right; white-space:nowrap; }

        .cfg-step{ margin-bottom:24px; }
        .cfg-label{ display:flex; align-items:center; gap:10px; font-family:var(--mono); font-size:12px;
          letter-spacing:.14em; text-transform:uppercase; color:var(--faint); margin-bottom:12px; }
        .cfg-label i{ font-style:normal; color:var(--muted); }

        .cfg-cells{ display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }
        .cfg-cell{ display:flex; flex-direction:column; align-items:flex-start; gap:4px;
          padding:12px 10px; background:var(--surface); border:1px solid var(--hairline);
          border-radius:4px; color:var(--muted); cursor:pointer; text-align:left;
          transition:border-color var(--dur,200ms) var(--ease), background 200ms var(--ease), color 200ms var(--ease); }
        .cfg-cell:hover{ border-color:var(--hairline-strong); color:var(--paper); }
        .cfg-cell.on{ border-color:var(--paper); background:var(--raised-2); color:var(--paper); }
        .cfg-cell-code{ font-family:var(--mono); font-weight:500; font-size:15px; letter-spacing:.02em; }
        .cfg-cell-name{ font-size:11px; color:var(--faint); }
        .cfg-cell.on .cfg-cell-name{ color:var(--muted); }

        .cfg-scale{ margin:0 0 24px; padding:16px; background:var(--surface);
          border:1px solid var(--hairline); border-radius:4px; }
        .cfg-scale-bar{ position:relative; height:10px; border-radius:2px; background:var(--thermal);
          opacity:.42; }
        .cfg-scale-window{ position:absolute; top:-3px; bottom:-3px; border:2px solid var(--paper);
          border-radius:3px; box-shadow:0 0 0 3px var(--surface); transition:left 200ms var(--ease), width 200ms var(--ease); }
        .cfg-scale-ticks{ display:flex; justify-content:space-between; margin-top:8px;
          font-family:var(--mono); font-size:11px; color:var(--faint); }
        .cfg-scale-note{ margin:12px 0 0; font-size:13px; color:var(--muted); }
        .cfg-scale-note b{ color:var(--paper); font-weight:600; }
        .cfg-scale-note em{ font-style:normal; font-family:var(--mono); color:var(--paper); }

        .cfg-select-wrap{ position:relative; }
        .cfg-select{ width:100%; appearance:none; -webkit-appearance:none;
          background:var(--surface); color:var(--paper); border:1px solid var(--hairline);
          border-radius:6px; padding:13px 40px 13px 14px; font-size:15px; font-family:var(--text);
          cursor:pointer; transition:border-color 120ms var(--ease), box-shadow 120ms var(--ease); }
        .cfg-select:focus{ outline:none; border-color:var(--paper); box-shadow:0 0 0 3px rgba(244,237,224,.14); }
        .cfg-caret{ position:absolute; right:14px; top:50%; transform:translateY(-50%);
          pointer-events:none; color:var(--faint); font-size:12px; }

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
        .cfg-add:hover{ background:var(--accent-hi); transform:translateY(-2px); }
        .cfg-add.done{ background:transparent; color:var(--paper); border:1px solid var(--hairline-strong); }
        .cfg-add:disabled{ cursor:default; opacity:.55; transform:none; }
        .cfg-add.done:disabled{ opacity:1; }
        .cfg-err{ margin:14px 0 0; font-family:var(--mono); font-size:12px; color:var(--accent-hi); }

        @media (max-width:760px){
          .cfg-frame{ grid-template-columns:1fr; }
          .cfg-media{ min-height:200px; border-right:none; border-bottom:1px solid var(--hairline); }
        }
        @media (max-width:560px){
          .cfg-main{ padding:22px; }
          .cfg-cells{ grid-template-columns:repeat(3,1fr); }
          .cfg-head{ flex-direction:column; gap:6px; }
          .cfg-count{ text-align:left; }
          .cfg-foot{ flex-direction:column; align-items:stretch; }
          .cfg-add{ width:100%; }
        }
        @media (prefers-reduced-motion:reduce){
          .lava-studio-cfg *{ transition:none !important; }
        }
      ` }} />
    </div>
  );
}
