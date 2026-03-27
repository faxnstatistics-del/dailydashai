"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }
      const sign = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (sign?.error) {
        setError("Account created but sign-in failed. Try logging in.");
        setLoading(false);
        router.push("/login");
        return;
      }
      window.location.href = sign?.url ?? "/dashboard";
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
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Create account</h1>
        <p className="text-meta mt-1">8+ character password</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field w-full"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-2.5">
          {loading ? "Creating…" : "Register"}
        </button>
      </form>

      <p className="text-meta mt-6 text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
