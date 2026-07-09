import { useMemo, useState } from "react";
import { COMPOUNDS, CALIPERS, CURRENCY, type CompoundCode } from "../lib/lava-data";

// Studio/Fast configurator: same logic as Configurator.tsx, restyled to the
// motorsport-engineering system — flat accent, small radii, mono for the price
// and the LAVA part id. No thermal gradient here. Add-to-cart is local state.
export default function ConfiguratorFast({ heading = "Configure your set" }: { heading?: string }) {
  const [compound, setCompound] = useState<CompoundCode>("SR");
  // Key by array INDEX — two calipers can share a LAVA part id.
  const [caliperIdx, setCaliperIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const caliper = useMemo(() => CALIPERS[caliperIdx] ?? CALIPERS[0], [caliperIdx]);
  const price = caliper?.prices[compound];
  const compoundMeta = COMPOUNDS.find((c) => c.code === compound);

  return (
    <div className="lava-cfg">
      <div className="cfg-head">
        <span className="cfg-fig">FIG. 04 / CONFIGURATOR</span>
        <h3>{heading}</h3>
        <span className="cfg-sub">{CALIPERS.length} fitments · 5 compounds · priced live</span>
      </div>

      <div className="cfg-step">
        <span className="cfg-label">01 — Compound</span>
        <div className="cfg-compounds">
          {COMPOUNDS.map((c) => (
            <button
              key={c.code}
              className={`cfg-comp${compound === c.code ? " on" : ""}`}
              onClick={() => { setCompound(c.code); setAdded(false); }}
              type="button"
              aria-pressed={compound === c.code}
            >
              <span className="cfg-comp-code">{c.code}</span>
              <span className="cfg-comp-name">{c.name}</span>
            </button>
          ))}
        </div>
        {compoundMeta && (
          <p className="cfg-note">
            <b>{compoundMeta.name}</b>
            <span className="cfg-note-temp">{compoundMeta.temp}</span>
            <span className="cfg-note-rival">{compoundMeta.rival}</span>
          </p>
        )}
      </div>

      <div className="cfg-step">
        <span className="cfg-label">02 — Your caliper</span>
        <div className="cfg-select-wrap">
          <select
            className="cfg-select"
            value={caliperIdx}
            onChange={(e) => { setCaliperIdx(Number(e.target.value)); setAdded(false); }}
          >
            {CALIPERS.map((c, i) => (
              <option key={i} value={i}>
                {c.name}{c.position ? ` — ${c.position}` : ""} · #{c.id}
              </option>
            ))}
          </select>
          <span className="cfg-select-chevron" aria-hidden="true">▾</span>
        </div>
        <span className="cfg-part">LAVA-{caliper?.id}{caliper?.position ? ` / ${caliper.position.toUpperCase()}` : ""}</span>
      </div>

      <div className="cfg-foot">
        <div className="cfg-price">
          <span className="cfg-price-amt">{price}<em>{CURRENCY}</em></span>
          <span className="cfg-price-meta">{compound} · per set · shipped from Poland</span>
        </div>
        <button
          className={`cfg-add${added ? " done" : ""}`}
          type="button"
          onClick={() => setAdded(true)}
        >
          {added ? "Added to cart" : "Add to cart"}
        </button>
      </div>

      <style>{`
        .lava-cfg {
          --base:#0E0E10; --surface:#151517; --raised:#1C1C1F;
          --hairline:rgba(255,255,255,0.08); --text:#ECE6DA; --muted:#8E897E; --accent:#E0431D;
          font-family:"Satoshi",system-ui,sans-serif;
          background:var(--surface); border:1px solid var(--hairline); border-radius:10px;
          padding:32px; color:var(--text); width:100%;
        }
        .lava-cfg *{ box-sizing:border-box; }
        .lava-cfg .cfg-head{ margin-bottom:28px; }
        .lava-cfg .cfg-fig{ display:block; font-family:"JetBrains Mono",monospace; font-size:11px; letter-spacing:.14em; color:var(--muted); margin-bottom:12px; }
        .lava-cfg .cfg-head h3{ margin:0; font-family:"Clash Display",sans-serif; font-weight:600; font-size:26px; line-height:1.05; letter-spacing:-0.01em; }
        .lava-cfg .cfg-sub{ display:block; margin-top:8px; font-family:"JetBrains Mono",monospace; font-size:12px; color:var(--muted); }

        .lava-cfg .cfg-step{ padding-top:22px; margin-top:22px; border-top:1px solid var(--hairline); }
        .lava-cfg .cfg-step:first-of-type{ border-top:none; padding-top:0; margin-top:0; }
        .lava-cfg .cfg-label{ display:block; font-family:"JetBrains Mono",monospace; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-bottom:14px; }

        .lava-cfg .cfg-compounds{ display:grid; grid-template-columns:repeat(5,1fr); gap:6px; }
        .lava-cfg .cfg-comp{ display:flex; flex-direction:column; gap:4px; align-items:flex-start; text-align:left;
          padding:12px 10px; border:1px solid var(--hairline); border-radius:4px; background:var(--raised);
          color:var(--text); cursor:pointer; transition:border-color .18s ease, background .18s ease; }
        .lava-cfg .cfg-comp:hover{ border-color:rgba(255,255,255,0.22); }
        .lava-cfg .cfg-comp.on{ border-color:var(--accent); background:#241410; }
        .lava-cfg .cfg-comp-code{ font-family:"JetBrains Mono",monospace; font-weight:500; font-size:14px; letter-spacing:.02em; }
        .lava-cfg .cfg-comp.on .cfg-comp-code{ color:var(--accent); }
        .lava-cfg .cfg-comp-name{ font-size:11px; color:var(--muted); }

        .lava-cfg .cfg-note{ display:flex; flex-wrap:wrap; align-items:baseline; gap:8px 16px; margin:16px 0 0; font-size:14px; color:var(--muted); }
        .lava-cfg .cfg-note b{ color:var(--text); font-weight:500; }
        .lava-cfg .cfg-note-temp{ font-family:"JetBrains Mono",monospace; font-size:12px; color:var(--text); }
        .lava-cfg .cfg-note-rival{ font-size:13px; }

        .lava-cfg .cfg-select-wrap{ position:relative; }
        .lava-cfg .cfg-select{ width:100%; -webkit-appearance:none; appearance:none;
          background:var(--raised); color:var(--text); border:1px solid var(--hairline); border-radius:4px;
          padding:14px 40px 14px 14px; font-size:15px; font-family:"Satoshi",system-ui,sans-serif; cursor:pointer; }
        .lava-cfg .cfg-select:focus{ outline:none; border-color:var(--accent); }
        .lava-cfg .cfg-select-chevron{ position:absolute; right:14px; top:50%; transform:translateY(-50%); pointer-events:none; color:var(--muted); font-size:12px; }
        .lava-cfg .cfg-part{ display:inline-block; margin-top:12px; font-family:"JetBrains Mono",monospace; font-size:12px; letter-spacing:.08em; color:var(--muted); }

        .lava-cfg .cfg-foot{ display:flex; align-items:flex-end; justify-content:space-between; gap:20px;
          margin-top:28px; padding-top:24px; border-top:1px solid var(--hairline); }
        .lava-cfg .cfg-price-amt{ display:flex; align-items:baseline; gap:6px; font-family:"JetBrains Mono",monospace;
          font-weight:500; font-size:44px; line-height:1; color:var(--accent); letter-spacing:-0.02em; }
        .lava-cfg .cfg-price-amt em{ font-style:normal; font-size:18px; color:var(--muted); }
        .lava-cfg .cfg-price-meta{ display:block; margin-top:10px; font-family:"JetBrains Mono",monospace; font-size:12px; color:var(--muted); }
        .lava-cfg .cfg-add{ background:var(--accent); color:#fff; border:1px solid var(--accent); border-radius:4px;
          padding:15px 26px; font-size:15px; font-weight:500; font-family:"Satoshi",system-ui,sans-serif; cursor:pointer;
          transition:background .18s ease, transform .18s ease; white-space:nowrap; }
        .lava-cfg .cfg-add:hover{ background:#c93916; }
        .lava-cfg .cfg-add:active{ transform:translateY(1px); }
        .lava-cfg .cfg-add.done{ background:transparent; color:var(--text); border-color:var(--hairline); cursor:default; }

        @media (max-width:560px){
          .lava-cfg{ padding:24px; }
          .lava-cfg .cfg-compounds{ grid-template-columns:repeat(3,1fr); }
          .lava-cfg .cfg-foot{ flex-direction:column; align-items:stretch; }
          .lava-cfg .cfg-add{ width:100%; }
        }
      `}</style>
    </div>
  );
}
