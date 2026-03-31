"use client";

import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

type Props = {
  productName: string;
  qrValue: string;
  qrUrl: string;
};

export default function ProductQrCard({ productName, qrValue, qrUrl }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!qrRef.current) return;

    try {
      setDownloading(true);

      const dataUrl = await toPng(qrRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `qr-${qrValue}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("DOWNLOAD_QR_ERROR", error);
      alert("Gagal mendownload QR");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div ref={qrRef} className="rounded-2xl bg-white p-6">
        <div className="flex flex-col items-center">
          <div className="rounded-2xl bg-white p-4">
            <QRCode value={qrUrl} size={240} />
          </div>

          <div className="mt-4 text-center">
            <p className="text-lg font-semibold text-slate-900">
              {productName}
            </p>
            <p className="mt-1 text-sm text-slate-500">{qrValue}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p>
          <span className="font-medium">QR Value:</span> {qrValue}
        </p>
        <p className="break-all">
          <span className="font-medium">QR URL:</span> {qrUrl}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {downloading ? "Downloading..." : "Download PNG"}
        </button>

        <a
          href={qrUrl}
          target="_blank"
          className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Buka Link
        </a>
      </div>
    </div>
  );
}
