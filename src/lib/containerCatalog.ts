// WHY: Central catalog of standard container types
// WHAT: Names, code prefixes, icon keys; can be used to seed ContainerType records and normalize legacy data

export type CatalogType = {
  name: string;
  codePrefix: string;
  iconKey: "tote" | "box" | "bin" | "suitcase" | "carry-on";
};

export const CONTAINER_CATALOG: readonly CatalogType[] = [
  // Totes by gallon size
  { name: "17 Gallon Tote", codePrefix: "TOTE17", iconKey: "tote" },
  { name: "27 Gallon Tote", codePrefix: "TOTE27", iconKey: "tote" },
  { name: "38 Gallon Tote", codePrefix: "TOTE38", iconKey: "tote" },
  // Boxes
  { name: "Book Box", codePrefix: "BOXBOOK", iconKey: "box" },
  { name: "Small Box", codePrefix: "BOXS", iconKey: "box" },
  { name: "Medium Box", codePrefix: "BOXM", iconKey: "box" },
  { name: "Large Box", codePrefix: "BOXL", iconKey: "box" },
  // Bins
  { name: "Plastic Bin", codePrefix: "BIN", iconKey: "bin" },
  // Luggage
  { name: "Carry-on", codePrefix: "CARRYON", iconKey: "carry-on" },
  { name: "Suitcase", codePrefix: "SUITCASE", iconKey: "suitcase" },
] as const;

export const CATALOG_BY_NAME = new Map(CONTAINER_CATALOG.map((t) => [t.name.toLowerCase(), t]));
export const CATALOG_BY_PREFIX = new Map(CONTAINER_CATALOG.map((t) => [t.codePrefix.toLowerCase(), t]));
