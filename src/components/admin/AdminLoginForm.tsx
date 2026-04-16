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
    <form
      onSubmit={submit}
      className="space-y-4 rounded-3xl border border-white/15 bg-[#13161a] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.28)] sm:p-7"
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-(--accent-mint)">
        Private Access
      </p>
      <h1 className="text-xl font-black text-white sm:text-2xl">
        Admin Sign In
      </h1>
      <p className="text-sm text-zinc-200/85">
        This area is hidden and secured with database-backed authentication.
      </p>

      <label className="block">
        <span className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-zinc-200/90">
          Username
        </span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-white/20 bg-[#0f1318] px-3.5 py-2.5 text-[0.95rem] text-white outline-none transition focus:border-(--accent-mint) focus:ring-2 focus:ring-(--accent-mint)/25"
          autoComplete="username"
          required
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-zinc-200/90">
          Password
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-white/20 bg-[#0f1318] px-3.5 py-2.5 text-[0.95rem] text-white outline-none transition focus:border-(--accent-mint) focus:ring-2 focus:ring-(--accent-mint)/25"
          autoComplete="current-password"
          required
        />
      </label>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full border border-(--accent-mint) bg-(--accent-mint) px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-black transition hover:brightness-95 disabled:opacity-70 sm:w-auto"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
