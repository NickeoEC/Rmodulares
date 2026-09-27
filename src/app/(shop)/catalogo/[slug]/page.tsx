import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductConfiguratorClient } from "@/components/configurator/ProductConfiguratorClient";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      sizeOptions: { orderBy: { priceDeltaUsd: "asc" } },
      stockVariants: { where: { isActive: true } },
      meshZones: {
        orderBy: { sortOrder: "asc" },
        include: {
          allowedMaterials: {
            where: { isAvailable: true },
            orderBy: { priceDeltaUsd: "asc" },
          },
        },
      },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const primaryImageUrl =
    product.images.find((i) => i.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";

  return (
    <ProductConfiguratorClient
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        subtitle: product.subtitle,
        description: product.description,
        categoryName: product.category.name,
        basePriceUsd: Number(product.basePriceUsd),
        baseLeadTimeDays: product.baseLeadTimeDays,
        modelGlbUrl: product.modelGlbUrl,
        modelUsdzUrl: product.modelUsdzUrl,
        primaryImageUrl,
        sizeOptions: product.sizeOptions.map((s) => ({
          id: s.id,
          label: s.label,
          code: s.code,
          widthCm: s.widthCm,
          heightCm: s.heightCm,
          depthCm: s.depthCm,
          weightKg: s.weightKg,
          scaleX: s.scaleX,
          scaleY: s.scaleY,
          scaleZ: s.scaleZ,
          priceDeltaUsd: Number(s.priceDeltaUsd),
          isDefault: s.isDefault,
        })),
        meshZones: product.meshZones.map((z) => ({
          id: z.id,
          zoneLabel: z.zoneLabel,
          meshNodeName: z.meshNodeName,
          defaultMaterialId: z.defaultMaterialId,
          allowedMaterials: z.allowedMaterials.map((m) => ({
            id: m.id,
            name: m.name,
            skuCode: m.skuCode,
            colorHex: m.colorHex,
            albedoMapUrl: m.albedoMapUrl,
            normalMapUrl: m.normalMapUrl,
            roughnessMapUrl: m.roughnessMapUrl,
            roughnessFactor: m.roughnessFactor,
            metalnessFactor: m.metalnessFactor,
            textureRepeat: m.textureRepeat,
            priceDeltaUsd: Number(m.priceDeltaUsd),
            extraLeadDays: m.extraLeadDays,
          })),
        })),
        stockVariants: product.stockVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          configurationHash: v.configurationHash,
          stockQuantity: v.stockQuantity,
          priceOverrideUsd: v.priceOverrideUsd
            ? Number(v.priceOverrideUsd)
            : null,
        })),
      }}
    />
  );
}