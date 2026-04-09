"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type SiteSettingsFormValues = {
  companyName: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  qrisImageUrl: string;
  googleMapsEmbed: string;
  whatsappAdmin: string;
  whatsappMarketing: string;
  whatsappSales: string;
  whatsappOwner: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;

  homepageHeadline: string;
  homepageSubheadline: string;
  featuredMode: string;
  featuredPromoTitle: string;
  featuredPromoText: string;
  featuredPromoBadge: string;
};

export default function SiteSettingsForm({
  initialValues,
}: {
  initialValues: SiteSettingsFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof SiteSettingsFormValues>(
    key: K,
    value: SiteSettingsFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Gagal menyimpan settings");
        return;
      }

      toast.success("Site settings berhasil diperbarui");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nama Perusahaan
          </label>
          <input
            type="text"
            value={values.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Google Maps Embed URL
          </label>
          <input
            type="text"
            value={values.googleMapsEmbed}
            onChange={(e) => updateField("googleMapsEmbed", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nama Bank
          </label>
          <input
            type="text"
            value={values.bankName}
            onChange={(e) => updateField("bankName", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Atas Nama Rekening
          </label>
          <input
            type="text"
            value={values.bankAccountName}
            onChange={(e) => updateField("bankAccountName", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nomor Rekening
          </label>
          <input
            type="text"
            value={values.bankAccountNumber}
            onChange={(e) => updateField("bankAccountNumber", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          URL Gambar QRIS
        </label>
        <input
          type="text"
          value={values.qrisImageUrl}
          onChange={(e) => updateField("qrisImageUrl", e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            WhatsApp Admin
          </label>
          <input
            type="text"
            value={values.whatsappAdmin}
            onChange={(e) => updateField("whatsappAdmin", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            WhatsApp Marketing
          </label>
          <input
            type="text"
            value={values.whatsappMarketing}
            onChange={(e) => updateField("whatsappMarketing", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            WhatsApp Sales
          </label>
          <input
            type="text"
            value={values.whatsappSales}
            onChange={(e) => updateField("whatsappSales", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            WhatsApp Owner
          </label>
          <input
            type="text"
            value={values.whatsappOwner}
            onChange={(e) => updateField("whatsappOwner", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Instagram URL
          </label>
          <input
            type="text"
            value={values.instagramUrl}
            onChange={(e) => updateField("instagramUrl", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Facebook URL
          </label>
          <input
            type="text"
            value={values.facebookUrl}
            onChange={(e) => updateField("facebookUrl", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            TikTok URL
          </label>
          <input
            type="text"
            value={values.tiktokUrl}
            onChange={(e) => updateField("tiktokUrl", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
          />
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200/70 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Homepage Content
        </h2>

        <div className="mt-5 grid gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Headline Homepage
            </label>
            <textarea
              value={values.homepageHeadline}
              onChange={(e) => updateField("homepageHeadline", e.target.value)}
              className="min-h-[100px] w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Subheadline Homepage
            </label>
            <textarea
              value={values.homepageSubheadline}
              onChange={(e) =>
                updateField("homepageSubheadline", e.target.value)
              }
              className="min-h-[100px] w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Featured Mode
              </label>
              <select
                value={values.featuredMode}
                onChange={(e) => updateField("featuredMode", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
              >
                <option value="PRODUCT">Featured Products</option>
                <option value="PROMO">Promo Info</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Promo Badge
              </label>
              <input
                type="text"
                value={values.featuredPromoBadge}
                onChange={(e) =>
                  updateField("featuredPromoBadge", e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Promo Title
              </label>
              <input
                type="text"
                value={values.featuredPromoTitle}
                onChange={(e) =>
                  updateField("featuredPromoTitle", e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Promo Text
            </label>
            <textarea
              value={values.featuredPromoText}
              onChange={(e) => updateField("featuredPromoText", e.target.value)}
              className="min-h-[100px] w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#125EA9]"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-[#125EA9] px-6 py-3 text-sm font-medium text-white hover:bg-[#0f4f8f] disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan Settings"}
      </button>
    </form>
  );
}
