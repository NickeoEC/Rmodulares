"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IdType } from "@/lib/ecuador-validators";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identificationType, setIdentificationType] =
    useState<IdType>("CEDULA");
  const [identificationNum, setIdentificationNum] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        identificationType,
        identificationNum,
        phone,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al crear la cuenta.");
      setLoading(false);
      return;
    }

    // Iniciar sesión automáticamente tras registrarse
    await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    router.push("/perfil/pedidos");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md border border-border bg-surface p-8 sm:p-10">
        <Link href="/" className="font-serif text-2xl font-medium text-foreground">
          RMODULARES<span className="text-accent">.</span>
        </Link>
        <h1 className="mt-6 font-serif text-3xl font-normal text-foreground">
          Crear Cuenta de Cliente
        </h1>
        <p className="mt-1 text-xs text-muted">
          Guarda tus configuraciones 3D y consulta el estado de tus pedidos en
          Ecuador.
        </p>

        {error && (
          <div className="mt-4 border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase text-muted">
              Nombres Completos *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-border bg-background px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-muted">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-border bg-background px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-muted">
              Contraseña (Mín. 6 caracteres) *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-border bg-background px-3.5 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-mono text-xs uppercase text-muted">
                Tipo ID (Ecuador)
              </label>
              <select
                value={identificationType}
                onChange={(e) =>
                  setIdentificationType(e.target.value as IdType)
                }
                className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs"
              >
                <option value="CEDULA">Cédula</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs uppercase text-muted">
                Número ID
              </label>
              <input
                type="text"
                placeholder="1710034065"
                value={identificationNum}
                onChange={(e) => setIdentificationNum(e.target.value)}
                className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-muted">
              Teléfono Celular
            </label>
            <input
              type="tel"
              placeholder="0991234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border border-border bg-background px-3.5 py-2 font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground py-3.5 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-accent hover:text-white"
          >
            {loading ? "Registrando..." : "Registrarme en RModulares"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-accent underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}