import { redirect } from "next/navigation";

import { getSiteSetting } from "@/lib/site-settings";
import SiteSettingsForm from "@/components/site-settings-form";

export default async function AdminSiteSettingsPage() {
  const setting = await getSiteSetting();

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Site Settings</h1>
        <p className="mt-2 text-sm text-slate-500">
          Kelola informasi perusahaan, rekening, QRIS, WhatsApp, sosial media,
          dan Google Maps.
        </p>
      </div>

      <SiteSettingsForm
        initialValues={{
          companyName: setting.companyName || "",
          bankName: setting.bankName || "",
          bankAccountName: setting.bankAccountName || "",
          bankAccountNumber: setting.bankAccountNumber || "",
          qrisImageUrl: setting.qrisImageUrl || "",
          googleMapsEmbed: setting.googleMapsEmbed || "",
          whatsappAdmin: setting.whatsappAdmin || "",
          whatsappMarketing: setting.whatsappMarketing || "",
          whatsappSales: setting.whatsappSales || "",
          whatsappOwner: setting.whatsappOwner || "",
          instagramUrl: setting.instagramUrl || "",
          facebookUrl: setting.facebookUrl || "",
          tiktokUrl: setting.tiktokUrl || "",
          lineupTitle: setting.lineupTitle || "Lineup Produk",
          homepageHeadline: setting.homepageHeadline || "",
          homepageSubheadline: setting.homepageSubheadline || "",
          featuredMode: setting.featuredMode || "PRODUCT",
          featuredPromoTitle: setting.featuredPromoTitle || "",
          featuredPromoText: setting.featuredPromoText || "",
          featuredPromoBadge: setting.featuredPromoBadge || "",
        }}
      />
    </div>
  );
}
