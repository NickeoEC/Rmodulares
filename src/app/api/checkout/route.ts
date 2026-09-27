import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, IdentificationType } from "@/lib/prisma";
import { calculateOrderShippingAndTax } from "@/lib/shipping-engine";
import {
  validateBillingIdentification,
  IdType,
} from "@/lib/ecuador-validators";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const {
      billingIdType,
      billingIdNumber,
      billingName,
      billingEmail,
      billingPhone,
      billingAddress,
      shippingProvince,
      shippingCanton,
      shippingStreet,
      shippingReference,
      items,
    } = body;

    // 1. Validar Cédula / RUC / Pasaporte ecuatoriano
    const idValidation = validateBillingIdentification(
      billingIdType as IdType,
      billingIdNumber || ""
    );
    if (!idValidation.valid) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío." },
        { status: 400 }
      );
    }

    // 2. Recalcular envío e IVA en el servidor usando la regla activa del Admin
    const quote = await calculateOrderShippingAndTax(
      prisma,
      shippingProvince,
      shippingCanton,
      items.map((i: any) => ({
        quantity: Number(i.quantity),
        unitPriceUsd: Number(i.unitPriceUsd),
        widthCm: Number(i.widthCm),
        heightCm: Number(i.heightCm),
        depthCm: Number(i.depthCm),
        weightKg: Number(i.weightKg),
      }))
    );

    // 3. Generar número de orden único (Ej: RM-2026-4821)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `RM-${new Date().getFullYear()}-${randomSuffix}`;

    const hasMadeToOrderItems = items.some((i: any) => i.isMadeToOrder);

    // 4. Crear la Orden en Transacción en PostgreSQL
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id ?? null,
          status: hasMadeToOrderItems ? "IN_PRODUCTION" : "PAID",
          billingIdType: billingIdType as IdentificationType,
          billingIdNumber: billingIdNumber.trim(),
          billingName: billingName.trim(),
          billingEmail: billingEmail.trim(),
          billingPhone: billingPhone.trim(),
          billingAddress: billingAddress.trim(),
          shippingProvince,
          shippingCanton,
          shippingStreet: shippingStreet.trim(),
          shippingReference: shippingReference?.trim() || null,
          subtotalUsd: quote.subtotalUsd,
          shippingCostUsd: quote.shippingCostUsd,
          appliedShippingStrategy: quote.appliedStrategy,
          ivaPercentApplied: quote.ivaPercent,
          ivaAmountUsd: quote.ivaAmountUsd,
          totalUsd: quote.totalUsd,
          paidAt: new Date(),
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productNameSnapshot: item.name,
              quantity: Number(item.quantity),
              unitPriceUsd: Number(item.unitPriceUsd),
              isMadeToOrder: Boolean(item.isMadeToOrder),
              estimatedLeadTimeDays: Number(item.estimatedLeadTimeDays || 3),
              customConfiguration: item.customConfiguration || {},
              previewImageUrl: item.imageUrl || null,
            })),
          },
        },
      });

      // Si hay productos de entrega inmediata, descontamos el stock del primer SKU activo del producto
      for (const item of items) {
        if (!item.isMadeToOrder) {
          await tx.productVariantSku.updateMany({
            where: {
              productId: item.productId,
              stockQuantity: { gte: Number(item.quantity) },
            },
            data: {
              stockQuantity: { decrement: Number(item.quantity) },
            },
          });
        }
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
    });
  } catch (error) {
    console.error("Error en checkout:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar tu pedido." },
      { status: 500 }
    );
  }
}