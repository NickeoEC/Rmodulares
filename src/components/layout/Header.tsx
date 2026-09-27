"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import {
  ShoppingBag,
  Sun,
  Moon,
  User,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

const NAV_LINKS = [
  { href: "/catalogo?categoria=sala", label: "Sala" },
  { href: "/catalogo?categoria=comedor", label: "Comedor" },
  { href: "/catalogo?categoria=dormitorio", label: "Dormitorio" },
  { href: "/catalogo?categoria=oficina", label: "Oficina" },
  { href: "/catalogo?categoria=exterior", label: "Exterior" },
  { href: "/lookbooks", label: "Lookbooks Editorial" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openCart = useCartStore((s) => s.openCart);
  const totalItems = useCartStore((s) => s.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Botón Mobile Menu */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center p-2 text-foreground lg:hidden"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo Editorial */}
        <Link
          href="/"
          className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl"
        >
          RMODULARES<span className="text-accent">.</span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex lg:items-center lg:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-3 sm:gap-5">
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-accent transition hover:bg-accent hover:text-white sm:inline-flex"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          {/* Toggle Claro / Oscuro */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
              aria-label="Cambiar tema claro/oscuro"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Perfil / Login */}
          <Link
            href={session ? "/perfil/pedidos" : "/login"}
            className="rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Cuenta de usuario"
          >
            <User className="h-4 w-4" />
          </Link>

          {/* Botón Carrito */}
          <button
            type="button"
            onClick={openCart}
            className="group relative flex items-center gap-2 border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground transition hover:border-foreground"
          >
            <ShoppingBag className="h-4 w-4 text-accent" />
            <span className="font-mono">{mounted ? totalItems : 0}</span>
          </button>
        </div>
      </div>

      {/* Menú Desplegable Mobile-First */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-6 py-6 lg:hidden">
          <nav className="flex flex-col space-y-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-xl text-foreground hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="pt-2 font-mono text-xs uppercase tracking-widest text-accent"
              >
                → Panel de Administración
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}