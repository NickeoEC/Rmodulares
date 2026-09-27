import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/editorial/ProductCard";

export const dynamic = "force-dynamic";

interface CatalogoPageProps {
  searchParams: {
    categoria?: string;
    stock?: string;
  };
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const activeCategorySlug = searchParams.categoria;
  const onlyImmediateStock = searchParams.stock === "inmediato";

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(activeCategorySlug
          ? { category: { slug: activeCategorySlug } }
          : {}),
        ...(onlyImmediateStock
          ? {
              stockVariants: {
                some: { stockQuantity: { gt: 0 }, isActive: true },
              },
            }
          : {}),
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        stockVariants: { where: { isActive: true } },
        meshZones: {
          include: {
            allowedMaterials: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeCategoryObj = categories.find(
    (c) => c.slug === activeCategorySlug
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Encabezado Editorial */}
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Catálogo RModulares / {activeCategoryObj ? activeCategoryObj.name : "Todas las Colecciones"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-foreground sm:text-5xl">
          {activeCategoryObj ? activeCategoryObj.name : "Archivo de Mobiliario Modular"}
        </h1>
        {activeCategoryObj?.description && (
          <p className="mt-3 max-w-2xl text-sm text-muted">
            {activeCategoryObj.description}
          </p>
        )}
      </div>

      {/* Barra de Filtros Sticky */}
      <div className="sticky top-20 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background/90 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/catalogo"
            className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
              !activeCategorySlug
                ? "bg-foreground text-background"
                : "border border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}${
                onlyImmediateStock ? "&stock=inmediato" : ""
              }`}
              className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
                activeCategorySlug === cat.slug
                  ? "bg-foreground text-background"
                  : "border border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Filtro Entrega Inmediata vs Todos */}
        <Link
          href={
            onlyImmediateStock
              ? `/catalogo${activeCategorySlug ? `?categoria=${activeCategorySlug}` : ""}`
              : `/catalogo?${activeCategorySlug ? `categoria=${activeCategorySlug}&` : ""}stock=inmediato`
          }
          className={`inline-flex items-center gap-2 border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
            onlyImmediateStock
              ? "border-accent bg-accent text-white"
              : "border-border bg-surface text-foreground hover:border-foreground"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              onlyImmediateStock ? "bg-white" : "bg-emerald-500"
            }`}
          />
          Entrega Inmediata (En Stock)
        </Link>
      </div>

      {/* Grilla de Productos */}
      {products.length === 0 ? (
        <div className="my-16 border border-border bg-surface p-12 text-center">
          <p className="font-serif text-2xl text-foreground">
            No encontramos piezas con estos filtros.
          </p>
          <Link
            href="/catalogo"
            className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-accent underline"
          >
            Limpiar filtros
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const primaryImg =
              p.images.find((i) => i.isPrimary)?.url ||
              p.images[0]?.url ||
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";
            const hoverImg = p.images.find((i) => i.isHover)?.url || null;

            const totalStock = p.stockVariants.reduce(
              (acc, v) => acc + v.stockQuantity,
              0
            );

            // Extraer materiales únicos para los swatches de la tarjeta
            const uniqueMaterialsMap = new Map();
            p.meshZones.forEach((zone) => {
              zone.allowedMaterials.forEach((mat) => {
                if (!uniqueMaterialsMap.has(mat.id)) {
                  uniqueMaterialsMap.set(mat.id, {
                    id: mat.id,
                    name: mat.name,
                    colorHex: mat.colorHex,
                    priceDeltaUsd: Number(mat.priceDeltaUsd),
                  });
                }
              });
            });

            return (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  subtitle: p.subtitle,
                  basePriceUsd: Number(p.basePriceUsd),
                  inventoryMode: p.inventoryMode,
                  baseLeadTimeDays: p.baseLeadTimeDays,
                  categoryName: p.category.name,
                  primaryImage: primaryImg,
                  hoverImage: hoverImg,
                  inStockCount: totalStock,
                  availableSwatches: Array.from(uniqueMaterialsMap.values()),
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}