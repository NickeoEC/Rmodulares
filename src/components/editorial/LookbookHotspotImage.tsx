"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowUpRight } from "lucide-react";

export interface HotspotItem {
  id: string;
  xPercent: number;
  yPercent: number;
  product: {
    name: string;
    slug: string;
    basePriceUsd: number;
    thumbnailUrl: string;
    subtitle?: string;
  };
}

interface LookbookHotspotImageProps {
  imageUrl: string;
  caption?: string;
  hotspots: HotspotItem[];
}

export function LookbookHotspotImage({
  imageUrl,
  caption,
  hotspots,
}: LookbookHotspotImageProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <figure className="relative w-full overflow-hidden border border-border bg-surface">
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={imageUrl}
          alt={caption || "Lookbook RModulares"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 90vw"
        />

        {/* Renderizado de Hotspots en coordenadas porcentuales */}
        {hotspots.map((spot) => {
          const isOpen = activeId === spot.id;
          return (
            <div
              key={spot.id}
              style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                type="button"
                onClick={() => setActiveId(isOpen ? null : spot.id)}
                aria-label={`Ver producto ${spot.product.name}`}
                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-110"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40 opacity-75" />
                <Plus
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isOpen ? "rotate-45 text-accent" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="absolute left-1/2 top-10 z-30 w-64 -translate-x-1/2 border border-border bg-background/95 p-3 shadow-2xl backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-surface">
                        <Image
                          src={spot.product.thumbnailUrl}
                          alt={spot.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-serif text-base font-medium text-foreground">
                          {spot.product.name}
                        </h4>
                        <p className="font-mono text-xs text-muted">
                          ${spot.product.basePriceUsd.toFixed(2)} USD
                        </p>
                        <Link
                          href={`/catalogo/${spot.product.slug}`}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                          Configurar en 3D
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {caption && (
        <figcaption className="border-t border-border px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}