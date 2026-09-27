import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MaterialCategory } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const materials = await prisma.materialOption.findMany({
    include: {
      _count: {
        select: { meshZones: true },
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ materials });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      skuCode,
      category,
      colorHex,
      swatchImageUrl,
      albedoMapUrl,
      normalMapUrl,
      roughnessMapUrl,
      roughnessFactor,
      metalnessFactor,
      textureRepeat,
      priceDeltaUsd,
      extraLeadDays,
      isAvailable,
    } = body;

    if (!name || !skuCode || !category) {
      return NextResponse.json(
        { error: "Nombre, código SKU y categoría son obligatorios." },
        { status: 400 }
      );
    }

    const normalizedSku = skuCode.trim().toUpperCase();
    const existing = await prisma.materialOption.findUnique({
      where: { skuCode: normalizedSku },
    });

    if (existing) {
      return NextResponse.json(
        { error: `El código SKU "${normalizedSku}" ya existe.` },
        { status: 400 }
      );
    }

    const created = await prisma.materialOption.create({
      data: {
        name: name.trim(),
        skuCode: normalizedSku,
        category: category as MaterialCategory,
        colorHex: colorHex || "#DCD6CC",
        swatchImageUrl: swatchImageUrl?.trim() || null,
        albedoMapUrl: albedoMapUrl?.trim() || null,
        normalMapUrl: normalMapUrl?.trim() || null,
        roughnessMapUrl: roughnessMapUrl?.trim() || null,
        roughnessFactor: Number(roughnessFactor ?? 0.7),
        metalnessFactor: Number(metalnessFactor ?? 0.0),
        textureRepeat: Number(textureRepeat ?? 1.0),
        priceDeltaUsd: Number(priceDeltaUsd ?? 0),
        extraLeadDays: Number(extraLeadDays ?? 0),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      },
    });

    return NextResponse.json({ success: true, material: created });
  } catch (error: any) {
    console.error("Error creando material PBR:", error);
    return NextResponse.json(
      { error: error?.message || "No se pudo crear el material." },
      { status: 500 }
    );
  }
}