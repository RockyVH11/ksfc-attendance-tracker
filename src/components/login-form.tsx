import { loginAction } from "@/app/actions/auth";

export function LoginForm({ error }: { error?: string }) {
  return (
    <form action={loginAction} className="space-y-4 w-full max-w-sm">
      {error ? (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          Invalid name or password.
        </p>
      ) : null}
      <label className="block">
        <span className="text-sm font-medium">First name</span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder="rocky"
          className="mt-1 w-full min-h-11 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full min-h-11 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
      </label>
      <button
        type="submit"
        className="w-full min-h-12 rounded-md bg-[var(--color-primary)] text-white font-semibold"
      >
        Sign in
      </button>
    </form>
  );
}
