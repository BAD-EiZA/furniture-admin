import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  productMedia: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },
    video: {
      maxFileSize: "64MB",
      maxFileCount: 3,
    },
  }).onUploadComplete(async ({ file }) => {
    return {
      url: file.url,
      key: file.key,
      name: file.name,
      type: file.type,
    };
  }),

  paymentProof: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    return {
      url: file.url,
      key: file.key,
      name: file.name,
      type: file.type,
    };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
