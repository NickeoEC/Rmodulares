import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, InventoryMode } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      stockVariants: { orderBy: { sku: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ products });
}

// PATCH: Ajuste rápido de stock de un SKU o de días de fabricación de un producto
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { type } = body;

    if (type === "UPDATE_SKU_STOCK") {
      const { skuId, stockQuantity, priceOverrideUsd } = body;
      const updatedSku = await prisma.productVariantSku.update({
        where: { id: skuId },
        data: {
          stockQuantity: Math.max(0, Number(stockQuantity)),
          priceOverrideUsd:
            priceOverrideUsd !== undefined && priceOverrideUsd !== ""
              ? Number(priceOverrideUsd)
              : null,
        },
      });
      return NextResponse.json({ success: true, sku: updatedSku });
    }

    if (type === "UPDATE_PRODUCT_LEADTIME") {
      const { productId, baseLeadTimeDays, inventoryMode } = body;
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          baseLeadTimeDays: Number(baseLeadTimeDays),
          inventoryMode: inventoryMode as InventoryMode,
        },
      });
      return NextResponse.json({ success: true, product: updatedProduct });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("Error actualizando inventario:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el inventario." },
      { status: 500 }
    );
  }
}