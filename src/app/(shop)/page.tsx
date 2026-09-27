import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Box, Sparkles, Truck, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  LookbookHotspotImage,
  HotspotItem,
} from "@/components/editorial/LookbookHotspotImage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Consultar Categorías, Producto Destacado y Lookbook desde PostgreSQL Local
  const [categories, featuredProduct, featuredLookbook] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.product.findFirst({
      where: { isFeatured: true, isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        stockVariants: true,
      },
    }),
    prisma.lookbook.findFirst({
      where: { isPublished: true },
      include: {
        scenes: {
          orderBy: { sortOrder: "asc" },
          include: {
            hotspots: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const primaryScene = featuredLookbook?.scenes?.[0];
  const formattedHotspots: HotspotItem[] =
    primaryScene?.hotspots.map((h) => ({
      id: h.id,
      xPercent: h.xPercent,
      yPercent: h.yPercent,
      product: {
        name: h.product.name,
        slug: h.product.slug,
        basePriceUsd: Number(h.product.basePriceUsd),
        thumbnailUrl:
          h.product.images[0]?.url ||
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
        subtitle: h.product.subtitle || undefined,
      },
    })) || [];

  return (
    <div className="divide-y divide-border">
      {/* 1. HERO EDITORIAL ASIMÉTRICO */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Editorial 01 · Diseño Modular & AR
            </div>

            <h1 className="mt-6 font-serif text-5xl font-normal leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Arquitectura para espacios que{" "}
              <span className="italic text-accent">respiran</span>.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Cada pieza de RModulares combina ebanistería contemporánea con un
              configurador 3D en tiempo real. Elige maderas certificadas, linos
              orgánicos y visualiza el mueble en tu propia sala con Realidad
              Aumentada antes de pedirlo.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-3 bg-foreground px-7 py-4 text-sm font-medium text-background transition hover:bg-accent hover:text-white"
              >
                Explorar Catálogo
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              {featuredProduct && (
                <Link
                  href={`/catalogo/${featuredProduct.slug}`}
                  className="inline-flex items-center gap-2.5 border border-border bg-surface px-6 py-4 text-sm font-medium text-foreground transition hover:border-foreground"
                >
                  <Box className="h-4 w-4 text-accent" />
                  Personalizar en 3D
                </Link>
              )}
            </div>

            {/* Indicadores de Valor */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-8">
              <div>
                <p className="font-mono text-xs uppercase text-muted">Inventario</p>
                <p className="mt-1 font-serif text-lg font-medium">Stock & A Medida</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase text-muted">Tecnología</p>
                <p className="mt-1 font-serif text-lg font-medium">Visor 3D + WebXR</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase text-muted">Logística</p>
                <p className="mt-1 font-serif text-lg font-medium">Todo el Ecuador</p>
              </div>
            </div>
          </div>

          {/* Tarjeta Destacada Derecha */}
          <div className="lg:col-span-6">
            {featuredProduct && (
              <div className="group relative border border-border bg-surface p-4 sm:p-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
                  <Image
                    src={
                      featuredProduct.images[0]?.url ||
                      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={featuredProduct.name}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 bg-background/90 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-foreground backdrop-blur-md">
                    Pieza Insignia · Configurador 3D Activo
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      {featuredProduct.category.name} ·{" "}
                      {featuredProduct.baseWidthCm}×{featuredProduct.baseDepthCm} cm
                    </p>
                    <h2 className="mt-1 font-serif text-2xl font-medium text-foreground">
                      {featuredProduct.name}
                    </h2>
                    <p className="mt-1 font-mono text-sm text-accent">
                      Desde ${Number(featuredProduct.basePriceUsd).toFixed(2)} USD
                    </p>
                  </div>

                  <Link
                    href={`/catalogo/${featuredProduct.slug}`}
                    className="inline-flex items-center gap-1.5 border border-border bg-background px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-foreground transition hover:border-accent hover:text-accent"
                  >
                    Abrir en 3D
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. GRILLA EDITORIAL DE CATEGORÍAS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              01 / Archivo de Espacios
            </p>
            <h2 className="mt-2 font-serif text-4xl font-normal text-foreground">
              Explorar por Categoría
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-accent hover:underline"
          >
            Ver todas las piezas ({categories.length} ambientes)
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group relative flex flex-col justify-between bg-background p-6 transition-colors hover:bg-surface"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-muted">
                  <span>0{idx + 1}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
                <h3 className="mt-3 font-serif text-2xl font-medium text-foreground">
                  {cat.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                  {cat.description}
                </p>
              </div>

              <div className="relative mt-6 aspect-[16/10] w-full overflow-hidden bg-surface">
                <Image
                  src={cat.coverImage}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. SECCIÓN INTERACTIVA "SHOP THE LOOK" (CON HOTSPOTS) */}
      {featuredLookbook && primaryScene && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              02 / Lookbook Interactivo · {featuredLookbook.seasonTag}
            </p>
            <h2 className="mt-2 font-serif text-4xl font-normal text-foreground">
              {featuredLookbook.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {featuredLookbook.excerpt} Haz clic sobre los indicadores{" "}
              <span className="font-mono text-foreground">(+)</span> de la
              fotografía para inspeccionar cada mueble y abrirlo en el
              configurador 3D.
            </p>
          </div>

          <LookbookHotspotImage
            imageUrl={primaryScene.imageUrl}
            caption={primaryScene.caption || undefined}
            hotspots={formattedHotspots}
          />
        </section>
      )}
    </div>
  );
}