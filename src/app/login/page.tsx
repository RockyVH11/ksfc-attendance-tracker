import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { APP_NAME_FULL } from "@/lib/constants";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/teams");

  const params = await searchParams;
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 bg-[var(--color-bg)]">
      <div className="w-full max-w-sm text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          {APP_NAME_FULL}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          Coach sign-in
        </p>
      </div>
      <LoginForm error={params.error} />
    </div>
  );
}
