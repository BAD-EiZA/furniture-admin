export function getPageParams(searchParams?: {
  page?: string;
  limit?: string;
}) {
  const page = Math.max(1, Number(searchParams?.page || 1));
  const limit = Math.max(1, Math.min(50, Number(searchParams?.limit || 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
