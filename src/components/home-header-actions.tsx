"use client";

import CartBadge from "@/components/cart-badge";
import MyOrdersPopover from "@/components/my-orders-popover";

export default function HomeHeaderActions() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <MyOrdersPopover />
      <CartBadge />
    </div>
  );
}
