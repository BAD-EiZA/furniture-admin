export const CITY_SHIPPING_COST: Record<string, number> = {
  Samarinda: 0,
  Balikpapan: 15000,
  Bontang: 18000,
  Sangatta: 20000,
  Bengalon: 22000,
};

export function getBulkDiscountPercent(quantity: number, pcsPerBal = 24) {
  if (pcsPerBal > 0 && quantity >= pcsPerBal) {
    return 0.2;
  }

  if (quantity >= 12) {
    return 0.05;
  }

  return 0;
}

export function getDiscountLabel(quantity: number, pcsPerBal = 24) {
  if (pcsPerBal > 0 && quantity >= pcsPerBal) {
    return "Diskon 1 Bal 20%";
  }

  if (quantity >= 12) {
    return "Diskon 12 pcs 5%";
  }

  return "Retail";
}

export function getUnitPriceAfterBulkDiscount(
  basePrice: number,
  quantity: number,
  pcsPerBal = 24,
) {
  const discountPercent = getBulkDiscountPercent(quantity, pcsPerBal);
  const discountedUnitPrice = basePrice - basePrice * discountPercent;

  return {
    discountPercent,
    discountedUnitPrice,
    discountLabel: getDiscountLabel(quantity, pcsPerBal),
  };
}

export function getShippingCostPerItem(city: string) {
  return CITY_SHIPPING_COST[city] || 0;
}

export function getPaymentAdjustment(
  subtotal: number,
  paymentMethod: "TRANSFER" | "COD" | "TEMPO",
) {
  if (paymentMethod === "TRANSFER") {
    const adjustmentValue = subtotal * 0.01;

    return {
      adjustmentType: "DISCOUNT" as const,
      adjustmentValue,
      total: subtotal - adjustmentValue,
    };
  }

  if (paymentMethod === "TEMPO") {
    const adjustmentValue = subtotal * 0.03;

    return {
      adjustmentType: "SURCHARGE" as const,
      adjustmentValue,
      total: subtotal + adjustmentValue,
    };
  }

  return {
    adjustmentType: "NONE" as const,
    adjustmentValue: 0,
    total: subtotal,
  };
}

export function splitReadyAndPO(quantity: number, readyStock: number) {
  if (quantity <= readyStock) {
    return {
      readyQty: quantity,
      poQty: 0,
    };
  }

  return {
    readyQty: Math.max(0, readyStock),
    poQty: quantity - Math.max(0, readyStock),
  };
}
