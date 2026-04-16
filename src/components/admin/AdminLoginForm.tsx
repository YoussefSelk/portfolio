"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError("Invalid credentials.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/20 bg-[#111315] p-4 sm:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-[#78ffe0]">Private Access</p>
      <h1 className="text-xl font-bold text-white sm:text-2xl">Admin Sign In</h1>
      <p className="text-sm text-zinc-300">
        This area is hidden and secured with database-backed authentication.
      </p>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-zinc-300">Username</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-lg border border-white/20 bg-[#15181c] px-3 py-2 text-sm text-white outline-none focus:border-[#3cffd0]"
          autoComplete="username"
          required
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-zinc-300">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-white/20 bg-[#15181c] px-3 py-2 text-sm text-white outline-none focus:border-[#3cffd0]"
          autoComplete="current-password"
          required
        />
      </label>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-[#3cffd0] px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-black disabled:opacity-70 sm:w-auto"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
