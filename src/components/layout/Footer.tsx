import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="font-serif text-3xl font-medium tracking-tight">
              RMODULARES<span className="text-accent">.</span>
            </span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Diseño arquitectónico y fabricación de mobiliario modular con
              visualización 3D y Realidad Aumentada en tiempo real. Hecho en
              Ecuador con maderas certificadas.
            </p>
            <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted">
              Quito · Guayaquil · Cuenca — Envíos a todo el Ecuador (USD)
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
              Colecciones
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/catalogo?categoria=sala" className="hover:text-accent">Sala Modular</Link></li>
              <li><Link href="/catalogo?categoria=comedor" className="hover:text-accent">Comedor & Piedra</Link></li>
              <li><Link href="/catalogo?categoria=dormitorio" className="hover:text-accent">Dormitorio</Link></li>
              <li><Link href="/catalogo?categoria=oficina" className="hover:text-accent">Oficina & Estudio</Link></li>
              <li><Link href="/lookbooks" className="hover:text-accent">Lookbooks / Inspiración</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
              Experiencia 3D & Legal
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/catalogo/sofa-modular-aura" className="hover:text-accent">Configurador 3D Interactivo</Link></li>
              <li><Link href="/checkout" className="hover:text-accent">Facturación Electrónica SRI</Link></li>
              <li><Link href="/login" className="hover:text-accent">Acceso Clientes / Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-8 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} RModulares Ecuador. Todos los derechos reservados.</p>
          <p className="mt-2 font-mono sm:mt-0">Next.js 14 · React Three Fiber · Prisma 7</p>
        </div>
      </div>
    </footer>
  );
}