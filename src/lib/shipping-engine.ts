import { PrismaClient, ShippingStrategy } from "@/lib/prisma";

export interface CartShippingItem {
  quantity: number;
  unitPriceUsd: number;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  weightKg: number;
}

export interface ShippingQuoteResult {
  appliedStrategy: ShippingStrategy;
  subtotalUsd: number;
  shippingCostUsd: number;
  ivaPercent: number;
  ivaAmountUsd: number;
  totalUsd: number;
  totalWeightKg: number;
  totalVolumeCubicMeters: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  explanationLabel: string;
}

export async function calculateOrderShippingAndTax(
  prisma: PrismaClient,
  province: string,
  canton: string,
  items: CartShippingItem[]
): Promise<ShippingQuoteResult> {
  // 1. Obtener configuración global del Administrador
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "global_settings" },
  });

  const activeStrategy: ShippingStrategy =
    settings?.activeShippingStrategy ?? "FLAT_BY_LOCATION";
  const ivaPercent = Number(settings?.ivaPercent ?? 15.0);

  // 2. Buscar tarifa específica del Cantón o general de la Provincia ("*")
  const zoneRates = await prisma.shippingZoneRate.findMany({
    where: {
      province,
      canton: { in: [canton, "*"] },
      isActive: true,
    },
  });

  const matchedZone =
    zoneRates.find((r) => r.canton.toLowerCase() === canton.toLowerCase()) ||
    zoneRates.find((r) => r.canton === "*");

  const flatZoneCost = Number(
    matchedZone?.flatRateUsd ?? settings?.fallbackBaseShippingUsd ?? 25.0
  );
  const zoneMultiplier = matchedZone?.zoneMultiplier ?? 1.2;
  const estimatedDaysMin = matchedZone?.estimatedDaysMin ?? 3;
  const estimatedDaysMax = matchedZone?.estimatedDaysMax ?? 6;

  // 3. Calcular Subtotal, Peso Total (kg) y Volumen Total (m³)
  let subtotalUsd = 0;
  let totalWeightKg = 0;
  let totalVolumeCubicMeters = 0;

  for (const item of items) {
    subtotalUsd += item.unitPriceUsd * item.quantity;
    totalWeightKg += item.weightKg * item.quantity;

    // Conversión de cm³ a m³: (ancho * alto * profundidad) / 1,000,000
    const unitVolumeM3 =
      (item.widthCm * item.heightCm * item.depthCm) / 1_000_000;
    totalVolumeCubicMeters += unitVolumeM3 * item.quantity;
  }

  // 4. Evaluar la Estrategia elegida por el Administrador
  let shippingCostUsd = 0;
  let explanationLabel = "";

  switch (activeStrategy) {
    case "FLAT_BY_LOCATION": {
      shippingCostUsd = flatZoneCost;
      explanationLabel = `Tarifa estándar para ${province} (${canton})`;
      break;
    }

    case "FREE_OVER_AMOUNT": {
      const threshold = Number(settings?.freeShippingThresholdUsd ?? 800.0);
      if (subtotalUsd >= threshold) {
        shippingCostUsd = 0;
        explanationLabel = `Envío gratuito por compras superiores a $${threshold.toFixed(2)} USD`;
      } else {
        shippingCostUsd = flatZoneCost;
        explanationLabel = `Tarifa zonal (Envío gratis desde $${threshold.toFixed(2)} USD)`;
      }
      break;
    }

    case "WEIGHT_VOLUME": {
      const baseDispatch = Number(settings?.baseDispatchFeeUsd ?? 10.0);
      const costPerKg = Number(settings?.costPerKgUsd ?? 0.5);
      const costPerM3 = Number(settings?.costPerCubicMeterUsd ?? 45.0);

      const rawLogisticsCost =
        baseDispatch +
        totalWeightKg * costPerKg +
        totalVolumeCubicMeters * costPerM3;

      shippingCostUsd = rawLogisticsCost * zoneMultiplier;
      explanationLabel = `Logística por volumen (${totalVolumeCubicMeters.toFixed(2)} m³ / ${totalWeightKg.toFixed(1)} kg)`;
      break;
    }
  }

  // 5. Redondeo financiero y cálculo de IVA (Ecuador)
  subtotalUsd = Number(subtotalUsd.toFixed(2));
  shippingCostUsd = Number(shippingCostUsd.toFixed(2));
  const taxableBase = subtotalUsd + shippingCostUsd;
  const ivaAmountUsd = Number(((taxableBase * ivaPercent) / 100).toFixed(2));
  const totalUsd = Number((taxableBase + ivaAmountUsd).toFixed(2));

  return {
    appliedStrategy: activeStrategy,
    subtotalUsd,
    shippingCostUsd,
    ivaPercent,
    ivaAmountUsd,
    totalUsd,
    totalWeightKg: Number(totalWeightKg.toFixed(2)),
    totalVolumeCubicMeters: Number(totalVolumeCubicMeters.toFixed(3)),
    estimatedDaysMin,
    estimatedDaysMax,
    explanationLabel,
  };
}