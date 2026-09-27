import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateOrderShippingAndTax,
  CartShippingItem,
} from "@/lib/shipping-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { province, canton, items } = body as {
      province: string;
      canton: string;
      items: CartShippingItem[];
    };

    if (!province || !canton || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Faltan datos de ubicación o ítems del carrito." },
        { status: 400 }
      );
    }

    const quote = await calculateOrderShippingAndTax(
      prisma,
      province,
      canton,
      items
    );

    return NextResponse.json(quote);
  } catch (error) {
    console.error("Error al calcular envío:", error);
    return NextResponse.json(
      { error: "No se pudo calcular la tarifa de envío." },
      { status: 500 }
    );
  }
}