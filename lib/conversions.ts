export type Unit = "g" | "kg" | "mL" | "L" | "item";

type UnitType = "weight" | "volume" | "count";

const unitMap: Record<Unit, { factor: number; baseUnit: Unit; type: UnitType }> = {
  g: { factor: 1, baseUnit: "g", type: "weight" },
  kg: { factor: 1000, baseUnit: "g", type: "weight" },
  mL: { factor: 1, baseUnit: "mL", type: "volume" },
  L: { factor: 1000, baseUnit: "mL", type: "volume" },
  item: { factor: 1, baseUnit: "item", type: "count" },
};

export function getUnitType(unit: Unit) {
  return unitMap[unit].type;
}

export function normalizeToBaseUnit(quantity: number, unit: Unit) {
  const config = unitMap[unit];
  return {
    quantity: quantity * config.factor,
    unit: config.baseUnit,
  };
}

export function convertQuantity(quantity: number, from: Unit, to: Unit) {
  const fromConfig = unitMap[from];
  const toConfig = unitMap[to];

  if (fromConfig.type !== toConfig.type) {
    throw new Error(`Cannot convert ${fromConfig.type} to ${toConfig.type}`);
  }

  const baseQuantity = quantity * fromConfig.factor;
  return baseQuantity / toConfig.factor;
}

export function convertToBaseUnit(quantity: number, unit: Unit) {
  const config = unitMap[unit];
  return {
    quantityInBase: quantity * config.factor,
    baseUnit: config.baseUnit,
  };
}

export const unitOptions: { label: string; value: Unit }[] = [
  { label: "Gram (g)", value: "g" },
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Milliliter (mL)", value: "mL" },
  { label: "Liter (L)", value: "L" },
  { label: "Item", value: "item" },
];
