"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export type UploadedMedia = {
  fileUrl: string;
  fileKey?: string;
  type: "IMAGE" | "VIDEO";
  sortOrder: number;
};

type Props = {
  value: UploadedMedia[];
  onChange: (value: UploadedMedia[]) => void;
};

export default function ProductMediaUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  function appendFiles(
    files: Array<{ url: string; key?: string; type?: string }>,
    mediaType: "IMAGE" | "VIDEO",
  ) {
    const next = [
      ...value,
      ...files.map((file, index) => ({
        fileUrl: file.url,
        fileKey: file.key,
        type: mediaType,
        sortOrder: value.length + index + 1,
      })),
    ];

    onChange(next);
  }

  function removeItem(index: number) {
    const filtered = value
      .filter((_, i) => i !== index)
      .map((item, idx) => ({
        ...item,
        sortOrder: idx + 1,
      }));

    onChange(filtered);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">Upload Foto / Video Katalog</p>

        <UploadButton<OurFileRouter, "productMedia">
          endpoint="productMedia"
          appearance={{
            button:
              "ut-ready:bg-blue-600 ut-uploading:bg-blue-400 rounded-xl px-4 py-2 text-sm font-medium",
            container: "w-full",
            allowedContent: "text-xs text-slate-500",
          }}
          onUploadBegin={() => setUploading(true)}
          onClientUploadComplete={(res) => {
            setUploading(false);

            const images = res.filter((item) =>
              item.type?.startsWith("image/"),
            );
            const videos = res.filter((item) =>
              item.type?.startsWith("video/"),
            );

            if (images.length > 0) {
              appendFiles(images, "IMAGE");
            }

            if (videos.length > 0) {
              appendFiles(videos, "VIDEO");
            }
          }}
          onUploadError={(error) => {
            setUploading(false);
            alert(error.message);
          }}
        />
      </div>

      {uploading ? (
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Sedang upload media...
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {value.map((item, index) => (
          <div
            key={`${item.fileUrl}-${index}`}
            className="overflow-hidden rounded-2xl border bg-white"
          >
            <div className="aspect-video bg-slate-100">
              {item.type === "IMAGE" ? (
                <img
                  src={item.fileUrl}
                  alt={`media-${index + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={item.fileUrl}
                  controls
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="space-y-2 p-3">
              <p className="text-xs text-slate-500">
                {item.type} • urutan {item.sortOrder}
              </p>

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
