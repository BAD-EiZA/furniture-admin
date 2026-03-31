import { nanoid } from "nanoid";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function generateProductQrValue() {
  return `PRD-${nanoid(10)}`;
}
