import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, ShippingStrategy } from "@/lib/prisma";

export async function GET() {
  const [settings, zones] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: "global_settings" } }),
    prisma.shippingZoneRate.findMany({ orderBy: { province: "asc" } }),
  ]);

  return NextResponse.json({ settings, zones });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const {
    activeShippingStrategy,
    ivaPercent,
    freeShippingThresholdUsd,
    fallbackBaseShippingUsd,
    baseDispatchFeeUsd,
    costPerKgUsd,
    costPerCubicMeterUsd,
  } = body;

  const updated = await prisma.storeSettings.upsert({
    where: { id: "global_settings" },
    update: {
      activeShippingStrategy: activeShippingStrategy as ShippingStrategy,
      ivaPercent: Number(ivaPercent),
      freeShippingThresholdUsd: Number(freeShippingThresholdUsd),
      fallbackBaseShippingUsd: Number(fallbackBaseShippingUsd),
      baseDispatchFeeUsd: Number(baseDispatchFeeUsd),
      costPerKgUsd: Number(costPerKgUsd),
      costPerCubicMeterUsd: Number(costPerCubicMeterUsd),
    },
    create: {
      id: "global_settings",
      activeShippingStrategy: activeShippingStrategy as ShippingStrategy,
      ivaPercent: Number(ivaPercent),
      freeShippingThresholdUsd: Number(freeShippingThresholdUsd),
      fallbackBaseShippingUsd: Number(fallbackBaseShippingUsd),
      baseDispatchFeeUsd: Number(baseDispatchFeeUsd),
      costPerKgUsd: Number(costPerKgUsd),
      costPerCubicMeterUsd: Number(costPerCubicMeterUsd),
    },
  });

  return NextResponse.json({ success: true, settings: updated });
}