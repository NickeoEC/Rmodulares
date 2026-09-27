"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@rmodulares.ec");
  const [password, setPassword] = useState("AdminRModulares2026!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md border border-border bg-surface p-8 sm:p-10">
        <Link href="/" className="font-serif text-2xl font-medium text-foreground">
          RMODULARES<span className="text-accent">.</span>
        </Link>
        <h1 className="mt-6 font-serif text-3xl font-normal text-foreground">
          Iniciar Sesión
        </h1>
        <p className="mt-2 text-xs text-muted">
          Ingresa con tu cuenta de cliente o credenciales de Administrador.
        </p>

        {error && (
          <div className="mt-4 border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase text-muted">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-muted">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground py-3.5 text-xs font-medium uppercase tracking-widest text-background transition hover:bg-accent hover:text-white disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Entrar a RModulares"}
          </button>
        </form>
      </div>
    </div>
  );
}