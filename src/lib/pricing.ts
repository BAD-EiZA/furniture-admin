type TierPrice = {
    minQty: number;
    price: number;
    label?: string | null;
  };
  
  export function getTierPrice(
    quantity: number,
    basePrice: number,
    tiers: TierPrice[]
  ) {
    const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  
    let selected = {
      price: basePrice,
      label: "Retail",
    };
  
    for (const tier of sorted) {
      if (quantity >= tier.minQty) {
        selected = {
          price: Number(tier.price),
          label: tier.label || `Min ${tier.minQty}`,
        };
      }
    }
  
    return selected;
  }
  
  export function getPaymentAdjustment(
    subtotal: number,
    paymentMethod: "TRANSFER" | "COD" | "TEMPO"
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