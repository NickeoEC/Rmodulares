import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LookbooksIndexPage() {
  const lookbooks = await prisma.lookbook.findMany({
    where: { isPublished: true },
    include: {
      scenes: {
        include: { hotspots: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-10">
        <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Revista Digital & Espacios Reales
        </div>
        <h1 className="mt-3 font-serif text-5xl font-normal text-foreground sm:text-6xl">
          Lookbooks & <span className="italic">Arquitectura Interior</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          Explora nuestras intervenciones residenciales en Ecuador. Cada
          fotografía es interactiva: pulsa sobre las piezas para conocer sus
          materiales o personalizarlas en 3D.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {lookbooks.map((lb) => {
          const totalHotspots = lb.scenes.reduce(
            (acc, s) => acc + s.hotspots.length,
            0
          );

          return (
            <article
              key={lb.id}
              className="group flex flex-col justify-between border border-border bg-surface p-6"
            >
              <div>
                <Link
                  href={`/lookbooks/${lb.slug}`}
                  className="relative block aspect-[16/10] w-full overflow-hidden bg-background"
                >
                  <Image
                    src={lb.coverImage}
                    alt={lb.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 bg-background/90 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-foreground backdrop-blur-md">
                    {lb.seasonTag || "Editorial"} · {totalHotspots} Piezas Interactivas
                  </div>
                </Link>

                <h2 className="mt-6 font-serif text-3xl font-normal text-foreground group-hover:text-accent">
                  <Link href={`/lookbooks/${lb.slug}`}>{lb.title}</Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {lb.excerpt}
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <Link
                  href={`/lookbooks/${lb.slug}`}
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-foreground hover:text-accent"
                >
                  Explorar Reportaje e Inspeccionar Piezas
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}