// AUTO-GENERATED from model-pricing.csv (.context/emit-data.py). Do not edit by hand.
// Domain: a pad "model" is a COMPOUND (MK→TWe); the "shape" is the CALIPER fitment.
// Price = f(caliper, compound), in PLN (zł). TW and TWe prices are derived from the
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
      "MK": 600,
      "SR": 700,
      "TW": 750,
      "TW/2": 800,
      "TWe": 900
    }
  },
  {
    "name": "Lancer EVO/Megane RS",
    "position": "Front",
    "id": "101",
    "prices": {
      "MK": 600,
      "SR": 700,
      "TW": 750,
      "TW/2": 800,
      "TWe": 900
    }
  },
  {
    "name": "RS3 RS5",
    "position": "Front",
    "id": "103",
    "prices": {
      "MK": 700,
      "SR": 900,
      "TW": 950,
      "TW/2": 1000,
      "TWe": 1100
    }
  },
  {
    "name": "Porsche Banan 18mm",
    "position": "Front",
    "id": "105",
    "prices": {
      "MK": 700,
      "SR": 800,
      "TW": 900,
      "TW/2": 1000,
      "TWe": 1100
    }
  },
  {
    "name": "Brembo Nissan GTR",
    "position": "Front",
    "id": "106",
    "prices": {
      "MK": 800,
      "SR": 900,
      "TW": 950,
      "TW/2": 1000,
      "TWe": 1100
    }
  },
  {
    "name": "Land Rover Sport",
    "position": "Front",
    "id": "107",
    "prices": {
      "MK": 700,
      "SR": 800,
      "TW": 900,
      "TW/2": 950,
      "TWe": 1050
    }
  },
  {
    "name": "MUSTANG",
    "position": "Front",
    "id": "125",
    "prices": {
      "MK": 700,
      "SR": 800,
      "TW": 900,
      "TW/2": 1000,
      "TWe": 1100
    }
  },
  {
    "name": "Audi S3 VW 7R",
    "position": "Front",
    "id": "116",
    "prices": {
      "MK": 700,
      "SR": 800,
      "TW": 850,
      "TW/2": 900,
      "TWe": 1000
    }
  },
  {
    "name": "Clio RS",
    "position": null,
    "id": "108",
    "prices": {
      "MK": 550,
      "SR": 600,
      "TW": 650,
      "TW/2": 700,
      "TWe": 800
    }
  },
  {
    "name": "Lancer EVO STI",
    "position": "Rear",
    "id": "114",
    "prices": {
      "MK": 500,
      "SR": 600,
      "TW": 600,
      "TW/2": 650,
      "TWe": 750
    }
  },
  {
    "name": "i20N",
    "position": "Front",
    "id": "110",
    "prices": {
      "MK": 500,
      "SR": 650,
      "TW": 700,
      "TW/2": 800,
      "TWe": 900
    }
  },
  {
    "name": "BMW M2",
    "position": "Rear",
    "id": "113",
    "prices": {
      "MK": 600,
      "SR": 700,
      "TW": 800,
      "TW/2": 850,
      "TWe": 950
    }
  },
  {
    "name": "BMW M2",
    "position": "Front",
    "id": "112",
    "prices": {
      "MK": 700,
      "SR": 800,
      "TW": 850,
      "TW/2": 900,
      "TWe": 1000
    }
  },
  {
    "name": "Alfa Romeo Giulia",
    "position": "Front",
    "id": "111",
    "prices": {
      "MK": 700,
      "SR": 800,
      "TW": 900,
      "TW/2": 1000,
      "TWe": 1100
    }
  },
  {
    "name": "Alfa Romeo Giulia/Stelvio",
    "position": "Rear",
    "id": "119",
    "prices": {
      "MK": 500,
      "SR": 650,
      "TW": 700,
      "TW/2": 800,
      "TWe": 900
    }
  },
  {
    "name": "Yaris GR",
    "position": "Front",
    "id": "118",
    "prices": {
      "MK": 800,
      "SR": 900,
      "TW": 950,
      "TW/2": 1000,
      "TWe": 1100
    }
  },
  {
    "name": "i30N",
    "position": "Front",
    "id": "120",
    "prices": {
      "MK": 650,
      "SR": 800,
      "TW": 850,
      "TW/2": 900,
      "TWe": 1000
    }
  },
  {
    "name": "Supra GR",
    "position": "Rear",
    "id": "121",
    "prices": {
      "MK": 550,
      "SR": 650,
      "TW": 700,
      "TW/2": 750,
      "TWe": 850
    }
  },
  {
    "name": "MX-5 NB BBK",
    "position": "Rear",
    "id": "123",
    "prices": {
      "MK": 450,
      "SR": 550,
      "TW": 600,
      "TW/2": 650,
      "TWe": 750
    }
  },
  {
    "name": "MX-5 NB BBK",
    "position": "Front",
    "id": "109",
    "prices": {
      "MK": 450,
      "SR": 550,
      "TW": 600,
      "TW/2": 650,
      "TWe": 750
    }
  },
  {
    "name": "RX-8",
    "position": "Front",
    "id": "102",
    "prices": {
      "MK": 550,
      "SR": 650,
      "TW": 700,
      "TW/2": 750,
      "TWe": 850
    }
  },
  {
    "name": "MX-5 NC",
    "position": "Front",
    "id": "117",
    "prices": {
      "MK": 550,
      "SR": 650,
      "TW": 700,
      "TW/2": 750,
      "TWe": 850
    }
  },
  {
    "name": "MX-5 NC/ND",
    "position": "Rear",
    "id": "115",
    "prices": {
      "MK": 500,
      "SR": 600,
      "TW": 650,
      "TW/2": 700,
      "TWe": 800
    }
  },
  {
    "name": "MX-5 NB MID",
    "position": "Front",
    "id": "124",
    "prices": {
      "MK": 500,
      "SR": 600,
      "TW": 650,
      "TW/2": 700,
      "TWe": 800
    }
  },
  {
    "name": "MX-5 NB MID",
    "position": "Rear",
    "id": "122",
    "prices": {
      "MK": 450,
      "SR": 550,
      "TW": 600,
      "TW/2": 650,
      "TWe": 750
    }
  },
  {
    "name": "CP3905 D54 18mm",
    "position": null,
    "id": "302",
    "prices": {
      "MK": 800,
      "SR": 900,
      "TW": 950,
      "TW/2": 1000,
      "TWe": 1100
    }
  },
  {
    "name": "CP3558 D54 25mm",
    "position": null,
    "id": "301",
    "prices": {
      "MK": 800,
      "SR": 900,
      "TW": 950,
      "TW/2": 1000,
      "TWe": 1100
    }
  },
  {
    "name": "AP Racing D50 FRP3076",
    "position": null,
    "id": "303",
    "prices": {
      "MK": 700,
      "SR": 800,
      "TW": 900,
      "TW/2": 950,
      "TWe": 1050
    }
  },
  {
    "name": "AP Racing R5",
    "position": null,
    "id": "304",
    "prices": {
      "MK": 700,
      "SR": 800,
      "TW": 900,
      "TW/2": 950,
      "TWe": 1050
    }
  }
];

export const CURRENCY = "zł";

// Cheapest MK across the range — the "from" price hook.
export const FROM_PRICE = Math.min(...CALIPERS.map((c) => c.prices.MK));

export function priceFor(caliperId: string, compound: CompoundCode): number | null {
  const c = CALIPERS.find((x) => x.id === caliperId);
  return c ? c.prices[compound] : null;
}
