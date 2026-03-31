import LoginForm from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextUrl = params.next || "/admin/dashboard";

  return <LoginForm nextUrl={nextUrl} />;
}