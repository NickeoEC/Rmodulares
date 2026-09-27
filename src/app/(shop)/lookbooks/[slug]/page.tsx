import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  LookbookHotspotImage,
  HotspotItem,
} from "@/components/editorial/LookbookHotspotImage";

export const dynamic = "force-dynamic";

export default async function LookbookDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const lookbook = await prisma.lookbook.findUnique({
    where: { slug: params.slug },
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
  });

  if (!lookbook || !lookbook.isPublished) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/lookbooks"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a Lookbooks
      </Link>

      <header className="mt-6 border-b border-border pb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          {lookbook.seasonTag || "Editorial RModulares"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-foreground sm:text-6xl">
          {lookbook.title}
        </h1>
        <p className="mt-6 max-w-3xl font-serif text-xl italic leading-relaxed text-muted">
          “{lookbook.excerpt}”
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90">
          {lookbook.editorialMd}
        </p>
      </header>

      {/* Escenas Interactivas */}
      <div className="mt-12 space-y-16">
        {lookbook.scenes.map((scene) => {
          const hotspots: HotspotItem[] = scene.hotspots.map((h) => ({
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
          }));

          return (
            <div key={scene.id}>
              <LookbookHotspotImage
                imageUrl={scene.imageUrl}
                caption={scene.caption || undefined}
                hotspots={hotspots}
              />
            </div>
          );
        })}
      </div>
    </article>
  );
}