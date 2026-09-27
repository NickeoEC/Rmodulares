"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-2 border border-border bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted transition hover:border-red-500 hover:text-red-500"
    >
      <LogOut className="h-3.5 w-3.5" />
      Cerrar Sesión
    </button>
  );
}