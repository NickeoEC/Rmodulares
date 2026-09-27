import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, InventoryMode } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const productId = params.id;
    const body = await req.json();

    const {
      name,
      slug,
      subtitle,
      description,
      categoryId,
      basePriceUsd,
      inventoryMode,
      baseLeadTimeDays,
      modelGlbUrl,
      modelUsdzUrl,
      baseWidthCm,
      baseHeightCm,
      baseDepthCm,
      baseWeightKg,
      isFeatured,
      isActive,
      images = [],
      sizeOptions = [],
      meshZones = [],
      stockVariants = [],
    } = body;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Limpiar relaciones configurables previas para sincronizar las nuevas
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productSizeOption.deleteMany({ where: { productId } });
      await tx.productMeshZone.deleteMany({ where: { productId } });

      // Para los SKUs, actualizamos o creamos sin romper OrderItems históricos
      for (const sv of stockVariants) {
        await tx.productVariantSku.upsert({
          where: { sku: sv.sku.trim().toUpperCase() },
          update: {
            configurationHash: sv.configurationHash,
            configurationJson: sv.configurationJson || {},
            stockQuantity: Number(sv.stockQuantity || 0),
            priceOverrideUsd: sv.priceOverrideUsd
              ? Number(sv.priceOverrideUsd)
              : null,
          },
          create: {
            productId,
            sku: sv.sku.trim().toUpperCase(),
            configurationHash: sv.configurationHash,
            configurationJson: sv.configurationJson || {},
            stockQuantity: Number(sv.stockQuantity || 0),
            priceOverrideUsd: sv.priceOverrideUsd
              ? Number(sv.priceOverrideUsd)
              : null,
          },
        });
      }

      // 2. Actualizar producto principal y recrear imágenes, tamaños y zonas 3D
      return tx.product.update({
        where: { id: productId },
        data: {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          subtitle: subtitle?.trim() || null,
          description: description?.trim() || "",
          categoryId,
          basePriceUsd: Number(basePriceUsd),
          inventoryMode: (inventoryMode as InventoryMode) || "HYBRID",
          baseLeadTimeDays: Number(baseLeadTimeDays || 15),
          modelGlbUrl: modelGlbUrl.trim(),
          modelUsdzUrl: modelUsdzUrl?.trim() || null,
          baseWidthCm: Number(baseWidthCm),
          baseHeightCm: Number(baseHeightCm),
          baseDepthCm: Number(baseDepthCm),
          baseWeightKg: Number(baseWeightKg),
          isFeatured: Boolean(isFeatured),
          isActive: Boolean(isActive),
          images: {
            create: images.map((img: any, idx: number) => ({
              url: img.url,
              publicId: img.publicId || `img_${Date.now()}_${idx}`,
              altText: img.altText || name,
              isPrimary: Boolean(img.isPrimary),
              isHover: Boolean(img.isHover),
              sortOrder: idx + 1,
            })),
          },
          sizeOptions: {
            create: sizeOptions.map((sz: any, idx: number) => ({
              label: sz.label,
              code: sz.code,
              widthCm: Number(sz.widthCm),
              heightCm: Number(sz.heightCm),
              depthCm: Number(sz.depthCm),
              weightKg: Number(sz.weightKg),
              scaleX: Number(sz.scaleX || 1),
              scaleY: Number(sz.scaleY || 1),
              scaleZ: Number(sz.scaleZ || 1),
              priceDeltaUsd: Number(sz.priceDeltaUsd || 0),
              isDefault: idx === 0 ? true : Boolean(sz.isDefault),
            })),
          },
          meshZones: {
            create: meshZones.map((zone: any, idx: number) => ({
              zoneLabel: zone.zoneLabel,
              meshNodeName: zone.meshNodeName,
              defaultMaterialId: zone.defaultMaterialId,
              sortOrder: idx + 1,
              allowedMaterials: {
                connect: (zone.allowedMaterialIds || []).map((id: string) => ({
                  id,
                })),
              },
            })),
          },
        },
      });
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Error actualizando producto:", error);
    return NextResponse.json(
      { error: error?.message || "No se pudo actualizar el producto." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Verificamos si tiene órdenes asociadas antes de borrar físicamente
    const ordersCount = await prisma.orderItem.count({
      where: { productId: params.id },
    });

    if (ordersCount > 0) {
      // Si ya fue comprado en alguna orden histórica, lo desactivamos (Soft Delete) para no romper facturas
      await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        softDeleted: true,
        message:
          "El producto tiene pedidos históricos asociados, por lo que fue desactivado del catálogo público.",
      });
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, softDeleted: false });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el producto." },
      { status: 500 }
    );
  }
}