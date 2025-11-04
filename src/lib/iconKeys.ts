// Canonical list of allowed icon keys for Container Types
// Keep in sync with ContainerTypeIcon mapping

export const ICON_OPTIONS = [
  { value: "", label: "(none)" },
  { value: "tote", label: "Tote" },
  { value: "box", label: "Box" },
  { value: "bin", label: "Bin" },
  { value: "suitcase", label: "Suitcase" },
  { value: "carry-on", label: "Carry-on" },
] as const;

export const ICON_VALUES = ICON_OPTIONS.map((o) => o.value).filter(
  Boolean
) as Array<string>;
