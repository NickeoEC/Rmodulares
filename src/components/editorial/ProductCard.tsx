"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Box, CheckCircle2, Clock } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    subtitle?: string | null;
    basePriceUsd: number;
    inventoryMode: string;
    baseLeadTimeDays: number;
    categoryName: string;
    primaryImage: string;
    hoverImage?: string | null;
    inStockCount: number;
    availableSwatches: {
      id: string;
      name: string;
      colorHex: string;
      priceDeltaUsd: number;
    }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [hoveredSwatch, setHoveredSwatch] = useState<{
    name: string;
    priceDeltaUsd: number;
  } | null>(null);

  const hasImmediateStock = product.inStockCount > 0;

  return (
    <article className="group relative flex flex-col justify-between bg-background p-5 transition-colors duration-300 hover:bg-surface/60">
      <div>
        {/* Badges Superiores */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {product.categoryName}
          </span>

          {hasImmediateStock ? (
            <span className="inline-flex items-center gap-1 border border-emerald-600/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              En Stock ({product.inStockCount})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 border border-border bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
              <Clock className="h-3 w-3" />
              Bajo Pedido ({product.baseLeadTimeDays}d)
            </span>
          )}
        </div>

        {/* Contenedor de Imagen con Microinteracción Crossfade en Hover */}
        <Link
          href={`/catalogo/${product.slug}`}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-surface"
        >
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover transition-all duration-700 ease-editorial ${
              product.hoverImage
                ? "group-hover:scale-105 group-hover:opacity-0"
                : "group-hover:scale-105"
            }`}
          />

          {product.hoverImage && (
            <Image
              src={product.hoverImage}
              alt={`${product.name} en ambiente`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="scale-100 object-cover opacity-0 transition-all duration-700 ease-editorial group-hover:scale-105 group-hover:opacity-100"
            />
          )}

          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground backdrop-blur-md">
            <Box className="h-3 w-3 text-accent" />
            3D / AR
          </div>
        </Link>

        {/* Información Editorial */}
        <div className="mt-4">
          <Link href={`/catalogo/${product.slug}`}>
            <h3 className="font-serif text-2xl font-medium text-foreground transition-colors group-hover:text-accent">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 line-clamp-1 text-xs text-muted">
            {hoveredSwatch
              ? `Acabado: ${hoveredSwatch.name} ${
                  hoveredSwatch.priceDeltaUsd > 0
                    ? `(+$${hoveredSwatch.priceDeltaUsd} USD)`
                    : "(Incluido)"
                }`
              : product.subtitle || "Diseño modular personalizable"}
          </p>
        </div>
      </div>

      {/* Pie de Tarjeta: Swatches de Materiales y Precio */}
      <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Precio Base
          </p>
          <p className="font-mono text-sm font-medium text-foreground">
            ${product.basePriceUsd.toFixed(2)} USD
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Círculos de materiales disponibles */}
          {product.availableSwatches.length > 0 && (
            <div
              className="flex -space-x-1"
              onMouseLeave={() => setHoveredSwatch(null)}
            >
              {product.availableSwatches.slice(0, 4).map((swatch) => (
                <button
                  key={swatch.id}
                  type="button"
                  onMouseEnter={() =>
                    setHoveredSwatch({
                      name: swatch.name,
                      priceDeltaUsd: swatch.priceDeltaUsd,
                    })
                  }
                  style={{ backgroundColor: swatch.colorHex }}
                  className="h-5 w-5 rounded-full border border-border ring-1 ring-background transition-transform hover:z-10 hover:scale-125"
                  title={swatch.name}
                />
              ))}
            </div>
          )}

          <Link
            href={`/catalogo/${product.slug}`}
            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-accent hover:underline"
          >
            Configurar
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}