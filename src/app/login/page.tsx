"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      window.location.href = res?.url ?? callbackUrl;
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="surface-panel w-full max-w-md rounded-2xl border border-zinc-200/90 p-8 shadow-sm dark:border-zinc-800">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
          AI
        </div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Sign in</h1>
        <p className="text-meta mt-1">AI Daily Briefing Dashboard</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-2.5">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-meta mt-6 text-center">
        No account?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
