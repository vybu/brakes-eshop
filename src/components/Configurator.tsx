import { useMemo, useState } from "react";
import { COMPOUNDS, CALIPERS, CURRENCY, type CompoundCode } from "../lib/lava-data";

// Inline pad configurator: pick a compound + your caliper, see the live price.
// Shared across every landing variant (self-styled, dark thermal look). Add-to-cart
// is a local demo state — wiring to the Wix catalog comes with the real SKU matrix.
export default function Configurator({ heading = "Configure your set" }: { heading?: string }) {
  const [compound, setCompound] = useState<CompoundCode>("SR");
  // Index-keyed: two calipers can share a LAVA part id (one pad fits several cars).
  const [caliperIdx, setCaliperIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const caliper = useMemo(() => CALIPERS[caliperIdx] ?? CALIPERS[0], [caliperIdx]);
  const price = caliper?.prices[compound];
  const compoundMeta = COMPOUNDS.find((c) => c.code === compound);

  return (
    <div className="lava-cfg">
      <div className="cfg-head">
        <h3>{heading}</h3>
        <span className="cfg-sub">{CALIPERS.length} fitments · 5 compounds</span>
      </div>

      <label className="cfg-label">1 · Compound</label>
      <div className="cfg-pills">
        {COMPOUNDS.map((c) => (
          <button
            key={c.code}
            className={`cfg-pill${compound === c.code ? " on" : ""}`}
            onClick={() => setCompound(c.code)}
            type="button"
          >
            <span className="cfg-pill-code">{c.code}</span>
            <span className="cfg-pill-name">{c.name}</span>
          </button>
        ))}
      </div>
      {compoundMeta && (
        <p className="cfg-compound-note">
          <b>{compoundMeta.name}</b> · {compoundMeta.temp} · {compoundMeta.rival}
        </p>
      )}

      <label className="cfg-label">2 · Your caliper</label>
      <select className="cfg-select" value={caliperIdx} onChange={(e) => { setCaliperIdx(Number(e.target.value)); setAdded(false); }}>
        {CALIPERS.map((c, i) => (
          <option key={i} value={i}>
            {c.name}{c.position ? ` — ${c.position}` : ""} (#{c.id})
          </option>
        ))}
      </select>

      <div className="cfg-foot">
        <div className="cfg-price">
          <span className="cfg-price-amt">{price} <em>{CURRENCY}</em></span>
          <span className="cfg-price-meta">{compound} · {caliper?.name} · per set</span>
        </div>
        <button className={`cfg-add${added ? " done" : ""}`} type="button" onClick={() => setAdded(true)}>
          {added ? "Added ✓" : "Add to cart"}
        </button>
      </div>

      <style>{`
        .lava-cfg { --c-red:#E43B1B; --c-amber:#F2A85E; --c-cream:#F9EFD5; --c-grad:linear-gradient(90deg,#E43B1B,#EE7B2E,#F2A85E,#F9EFD5);
          font-family: inherit; background:#141416; border:1px solid #2a2a2e; border-radius:18px; padding:28px; color:var(--c-cream); max-width:560px; }
        .lava-cfg *{ box-sizing:border-box; }
        .cfg-head{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:22px; }
        .cfg-head h3{ margin:0; font-size:20px; }
        .cfg-sub{ color:#8a857a; font-size:12px; }
        .cfg-label{ display:block; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:#8a857a; margin:18px 0 10px; }
        .cfg-pills{ display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }
        .cfg-pill{ display:flex; flex-direction:column; align-items:center; gap:3px; padding:12px 6px; border:1px solid #34343a; border-radius:12px; background:#1b1b1e; color:var(--c-cream); cursor:pointer; transition:border-color .15s, background .15s; }
        .cfg-pill:hover{ border-color:#55524a; }
        .cfg-pill.on{ border-color:transparent; background:var(--c-grad); color:#1a0d05; }
        .cfg-pill-code{ font-weight:700; font-size:16px; }
        .cfg-pill-name{ font-size:10px; opacity:.8; }
        .cfg-compound-note{ margin:12px 0 0; font-size:13px; color:#a49e91; }
        .cfg-compound-note b{ color:var(--c-cream); }
        .cfg-select{ width:100%; background:#1b1b1e; color:var(--c-cream); border:1px solid #34343a; border-radius:12px; padding:13px 14px; font-size:15px; font-family:inherit; cursor:pointer; }
        .cfg-select:focus{ outline:none; border-color:var(--c-amber); }
        .cfg-foot{ display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:24px; padding-top:22px; border-top:1px solid #2a2a2e; }
        .cfg-price-amt{ display:block; font-size:34px; font-weight:700; line-height:1; }
        .cfg-price-amt em{ font-style:normal; font-size:16px; color:var(--c-amber); }
        .cfg-price-meta{ display:block; margin-top:6px; font-size:12px; color:#8a857a; }
        .cfg-add{ background:var(--c-grad); color:#1a0d05; border:none; border-radius:100px; padding:15px 28px; font-size:15px; font-weight:600; font-family:inherit; cursor:pointer; transition:transform .15s, filter .15s; white-space:nowrap; }
        .cfg-add:hover{ transform:translateY(-2px); filter:brightness(1.06); }
        .cfg-add.done{ background:#2a2a2e; color:var(--c-amber); }
        @media (max-width:560px){ .cfg-pills{ grid-template-columns:repeat(3,1fr); } .cfg-foot{ flex-direction:column; align-items:stretch; } }
      `}</style>
    </div>
  );
}
