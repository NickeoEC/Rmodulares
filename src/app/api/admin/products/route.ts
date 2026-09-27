import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, InventoryMode } from "@/lib/prisma";

// GET: Devuelve todos los productos, categorías y materiales PBR disponibles para poblar el Admin
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [products, categories, materials] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        sizeOptions: { orderBy: { priceDeltaUsd: "asc" } },
        meshZones: {
          orderBy: { sortOrder: "asc" },
          include: { allowedMaterials: true },
        },
        stockVariants: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.materialOption.findMany({
      where: { isAvailable: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ products, categories, materials });
}

// POST: Crea un producto nuevo con sus imágenes, modelo .glb, tamaños, zonas 3D y SKUs en stock
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

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

    if (!name || !slug || !categoryId || !modelGlbUrl) {
      return NextResponse.json(
        { error: "Nombre, slug, categoría y modelo 3D (.glb) son obligatorios." },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { error: `El slug "${slug}" ya está en uso por otro producto.` },
        { status: 400 }
      );
    }

    const created = await prisma.product.create({
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
        baseWidthCm: Number(baseWidthCm || 100),
        baseHeightCm: Number(baseHeightCm || 80),
        baseDepthCm: Number(baseDepthCm || 90),
        baseWeightKg: Number(baseWeightKg || 35),
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
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
        stockVariants: {
          create: stockVariants.map((sv: any) => ({
            sku: sv.sku.trim().toUpperCase(),
            configurationHash: sv.configurationHash,
            configurationJson: sv.configurationJson || {},
            stockQuantity: Number(sv.stockQuantity || 0),
            priceOverrideUsd: sv.priceOverrideUsd
              ? Number(sv.priceOverrideUsd)
              : null,
            isActive: true,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, product: created });
  } catch (error: any) {
    console.error("Error creando producto:", error);
    return NextResponse.json(
      { error: error?.message || "No se pudo crear el producto." },
      { status: 500 }
    );
  }
}