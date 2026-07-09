// AUTO-GENERATED from model-pricing.csv (.context/emit-data.py). Do not edit by hand.
// Domain: a pad "model" is a COMPOUND (MK→TWe); the "shape" is the CALIPER fitment.
// Price = f(caliper, compound); amounts come from model-pricing.csv and are sold and
// displayed in EUR (€) — the store's base currency. TW and TWe prices are derived from the
// listed MK/SR/TW-2 columns (TW = midpoint of SR..TW/2; TWe = TW/2 + endurance premium).

export type CompoundCode = "MK" | "SR" | "TW" | "TW/2" | "TWe";

export interface Compound {
  code: CompoundCode;
  name: string;
  temp: string;
  rival: string;
  note: string;
}

export interface Caliper {
  name: string;
  position: "Front" | "Rear" | null;
  id: string;
  prices: Record<CompoundCode, number>;
}

export const COMPOUNDS: Compound[] = [
  {
    "code": "MK",
    "name": "Fast Road",
    "temp": "20–500°C",
    "rival": "≈ Ferodo DS2500 / EBC Yellow",
    "note": "Quiet, low-dust, confident from cold."
  },
  {
    "code": "SR",
    "name": "Sport",
    "temp": "40–600°C",
    "rival": "≈ EBC Bluestuff",
    "note": "Spirited roads and the odd track day."
  },
  {
    "code": "TW",
    "name": "Trackday",
    "temp": "60–750°C",
    "rival": "≈ Ferodo DS1.11 / RP-1",
    "note": "A high thermal ceiling that holds all session."
  },
  {
    "code": "TW/2",
    "name": "Race",
    "temp": "80–800°C",
    "rival": "≈ Ferodo DS3.12 / RP-X",
    "note": "Endurance-grade bite for the hardest stops."
  },
  {
    "code": "TWe",
    "name": "Endurance",
    "temp": "80–850°C",
    "rival": "Lowest wear in class",
    "note": "The lowest wear we make. Kind to your discs."
  }
];

export const CALIPERS: Caliper[] = [
  {
    "name": "Impreza STI / Civic FK8",
    "position": "Front",
    "id": "101",
    "prices": {
      "MK": 140,
      "SR": 165,
      "TW": 175,
      "TW/2": 185,
      "TWe": 210
    }
  },
  {
    "name": "Lancer EVO/Megane RS",
    "position": "Front",
    "id": "101",
    "prices": {
      "MK": 140,
      "SR": 165,
      "TW": 175,
      "TW/2": 185,
      "TWe": 210
    }
  },
  {
    "name": "RS3 RS5",
    "position": "Front",
    "id": "103",
    "prices": {
      "MK": 165,
      "SR": 210,
      "TW": 220,
      "TW/2": 235,
      "TWe": 255
    }
  },
  {
    "name": "Porsche Banan 18mm",
    "position": "Front",
    "id": "105",
    "prices": {
      "MK": 165,
      "SR": 185,
      "TW": 210,
      "TW/2": 235,
      "TWe": 255
    }
  },
  {
    "name": "Brembo Nissan GTR",
    "position": "Front",
    "id": "106",
    "prices": {
      "MK": 185,
      "SR": 210,
      "TW": 220,
      "TW/2": 235,
      "TWe": 255
    }
  },
  {
    "name": "Land Rover Sport",
    "position": "Front",
    "id": "107",
    "prices": {
      "MK": 165,
      "SR": 185,
      "TW": 210,
      "TW/2": 220,
      "TWe": 245
    }
  },
  {
    "name": "MUSTANG",
    "position": "Front",
    "id": "125",
    "prices": {
      "MK": 165,
      "SR": 185,
      "TW": 210,
      "TW/2": 235,
      "TWe": 255
    }
  },
  {
    "name": "Audi S3 VW 7R",
    "position": "Front",
    "id": "116",
    "prices": {
      "MK": 165,
      "SR": 185,
      "TW": 200,
      "TW/2": 210,
      "TWe": 235
    }
  },
  {
    "name": "Clio RS",
    "position": null,
    "id": "108",
    "prices": {
      "MK": 130,
      "SR": 140,
      "TW": 150,
      "TW/2": 165,
      "TWe": 185
    }
  },
  {
    "name": "Lancer EVO STI",
    "position": "Rear",
    "id": "114",
    "prices": {
      "MK": 115,
      "SR": 140,
      "TW": 140,
      "TW/2": 150,
      "TWe": 175
    }
  },
  {
    "name": "i20N",
    "position": "Front",
    "id": "110",
    "prices": {
      "MK": 115,
      "SR": 150,
      "TW": 165,
      "TW/2": 185,
      "TWe": 210
    }
  },
  {
    "name": "BMW M2",
    "position": "Rear",
    "id": "113",
    "prices": {
      "MK": 140,
      "SR": 165,
      "TW": 185,
      "TW/2": 200,
      "TWe": 220
    }
  },
  {
    "name": "BMW M2",
    "position": "Front",
    "id": "112",
    "prices": {
      "MK": 165,
      "SR": 185,
      "TW": 200,
      "TW/2": 210,
      "TWe": 235
    }
  },
  {
    "name": "Alfa Romeo Giulia",
    "position": "Front",
    "id": "111",
    "prices": {
      "MK": 165,
      "SR": 185,
      "TW": 210,
      "TW/2": 235,
      "TWe": 255
    }
  },
  {
    "name": "Alfa Romeo Giulia/Stelvio",
    "position": "Rear",
    "id": "119",
    "prices": {
      "MK": 115,
      "SR": 150,
      "TW": 165,
      "TW/2": 185,
      "TWe": 210
    }
  },
  {
    "name": "Yaris GR",
    "position": "Front",
    "id": "118",
    "prices": {
      "MK": 185,
      "SR": 210,
      "TW": 220,
      "TW/2": 235,
      "TWe": 255
    }
  },
  {
    "name": "i30N",
    "position": "Front",
    "id": "120",
    "prices": {
      "MK": 150,
      "SR": 185,
      "TW": 200,
      "TW/2": 210,
      "TWe": 235
    }
  },
  {
    "name": "Supra GR",
    "position": "Rear",
    "id": "121",
    "prices": {
      "MK": 130,
      "SR": 150,
      "TW": 165,
      "TW/2": 175,
      "TWe": 200
    }
  },
  {
    "name": "MX-5 NB BBK",
    "position": "Rear",
    "id": "123",
    "prices": {
      "MK": 105,
      "SR": 130,
      "TW": 140,
      "TW/2": 150,
      "TWe": 175
    }
  },
  {
    "name": "MX-5 NB BBK",
    "position": "Front",
    "id": "109",
    "prices": {
      "MK": 105,
      "SR": 130,
      "TW": 140,
      "TW/2": 150,
      "TWe": 175
    }
  },
  {
    "name": "RX-8",
    "position": "Front",
    "id": "102",
    "prices": {
      "MK": 130,
      "SR": 150,
      "TW": 165,
      "TW/2": 175,
      "TWe": 200
    }
  },
  {
    "name": "MX-5 NC",
    "position": "Front",
    "id": "117",
    "prices": {
      "MK": 130,
      "SR": 150,
      "TW": 165,
      "TW/2": 175,
      "TWe": 200
    }
  },
  {
    "name": "MX-5 NC/ND",
    "position": "Rear",
    "id": "115",
    "prices": {
      "MK": 115,
      "SR": 140,
      "TW": 150,
      "TW/2": 165,
      "TWe": 185
    }
  },
  {
    "name": "MX-5 NB MID",
    "position": "Front",
    "id": "124",
    "prices": {
      "MK": 115,
      "SR": 140,
      "TW": 150,
      "TW/2": 165,
      "TWe": 185
    }
  },
  {
    "name": "MX-5 NB MID",
    "position": "Rear",
    "id": "122",
    "prices": {
      "MK": 105,
      "SR": 130,
      "TW": 140,
      "TW/2": 150,
      "TWe": 175
    }
  },
  {
    "name": "CP3905 D54 18mm",
    "position": null,
    "id": "302",
    "prices": {
      "MK": 185,
      "SR": 210,
      "TW": 220,
      "TW/2": 235,
      "TWe": 255
    }
  },
  {
    "name": "CP3558 D54 25mm",
    "position": null,
    "id": "301",
    "prices": {
      "MK": 185,
      "SR": 210,
      "TW": 220,
      "TW/2": 235,
      "TWe": 255
    }
  },
  {
    "name": "AP Racing D50 FRP3076",
    "position": null,
    "id": "303",
    "prices": {
      "MK": 165,
      "SR": 185,
      "TW": 210,
      "TW/2": 220,
      "TWe": 245
    }
  },
  {
    "name": "AP Racing R5",
    "position": null,
    "id": "304",
    "prices": {
      "MK": 165,
      "SR": 185,
      "TW": 210,
      "TW/2": 220,
      "TWe": 245
    }
  }
];

export const CURRENCY = "€";

// Cheapest MK across the range — the "from" price hook.
export const FROM_PRICE = Math.min(...CALIPERS.map((c) => c.prices.MK));

export function priceFor(caliperId: string, compound: CompoundCode): number | null {
  const c = CALIPERS.find((x) => x.id === caliperId);
  return c ? c.prices[compound] : null;
}

// Canonical, unique label for one caliper fitment. Used verbatim as the Wix
// variant choice name (see .context/seed.mjs) AND as the key that maps a
// configurator selection back to its Wix variantId — so the exact string must
// match on both sides. Unique across all fitments (name disambiguates shared
// ids, position disambiguates same-name front/rear pairs).
export function caliperLabel(c: Pick<Caliper, "name" | "position" | "id">): string {
  return `${c.name} · ${c.position ?? "Universal"} · #${c.id}`;
}

// Each compound is one Wix product; the caliper fitment is its variant option.
export const COMPOUND_SLUGS: Record<CompoundCode, string> = {
  MK: "lava-mk",
  SR: "lava-sr",
  TW: "lava-tw",
  "TW/2": "lava-tw-2",
  TWe: "lava-twe",
};
