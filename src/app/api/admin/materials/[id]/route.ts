import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MaterialCategory } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const updated = await prisma.materialOption.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        skuCode: skuCode.trim().toUpperCase(),
        category: category as MaterialCategory,
        colorHex: colorHex || "#FFFFFF",
        swatchImageUrl: swatchImageUrl?.trim() || null,
        albedoMapUrl: albedoMapUrl?.trim() || null,
        normalMapUrl: normalMapUrl?.trim() || null,
        roughnessMapUrl: roughnessMapUrl?.trim() || null,
        roughnessFactor: Number(roughnessFactor ?? 0.7),
        metalnessFactor: Number(metalnessFactor ?? 0.0),
        textureRepeat: Number(textureRepeat ?? 1.0),
        priceDeltaUsd: Number(priceDeltaUsd ?? 0),
        extraLeadDays: Number(extraLeadDays ?? 0),
        isAvailable: Boolean(isAvailable),
      },
    });

    return NextResponse.json({ success: true, material: updated });
  } catch (error: any) {
    console.error("Error actualizando material PBR:", error);
    return NextResponse.json(
      { error: error?.message || "No se pudo actualizar el material." },
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

    await prisma.materialOption.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando material:", error);
    return NextResponse.json(
      {
        error:
          "No se pudo eliminar el material. Verifica que no sea el material por defecto de algún mueble.",
      },
      { status: 500 }
    );
  }
}