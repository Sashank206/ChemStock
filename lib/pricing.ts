import { convertQuantity, Unit } from "./conversions";

export function calculatePrice(
  quantity: number,
  quantityUnit: Unit,
  baseUnit: Unit,
  basePrice: number
) {
  const convertedQuantity = convertQuantity(quantity, quantityUnit, baseUnit);
  const total = Number((convertedQuantity * basePrice).toFixed(2));

  return {
    convertedQuantity,
    baseUnit,
    total,
  };
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
