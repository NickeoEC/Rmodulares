import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de RModulares (Entorno Local Ecuador)...");

  // 1. Configuración Global de Tienda y Motor de Envíos
  await prisma.storeSettings.upsert({
    where: { id: "global_settings" },
    update: {},
    create: {
      id: "global_settings",
      ivaPercent: 15.0,
      currency: "USD",
      activeShippingStrategy: "FLAT_BY_LOCATION",
      freeShippingThresholdUsd: 800.0,
      fallbackBaseShippingUsd: 35.0,
      baseDispatchFeeUsd: 12.0,
      costPerKgUsd: 0.45,
      costPerCubicMeterUsd: 40.0,
    },
  });

  // 2. Tarifas Zonales por Provincia/Cantón en Ecuador
  const shippingZones = [
    { province: "Pichincha", canton: "Quito", flatRateUsd: 15.0, zoneMultiplier: 1.0, estimatedDaysMin: 1, estimatedDaysMax: 3 },
    { province: "Pichincha", canton: "*", flatRateUsd: 22.0, zoneMultiplier: 1.1, estimatedDaysMin: 2, estimatedDaysMax: 4 },
    { province: "Guayas", canton: "Guayaquil", flatRateUsd: 35.0, zoneMultiplier: 1.35, estimatedDaysMin: 3, estimatedDaysMax: 5 },
    { province: "Guayas", canton: "Samborondón", flatRateUsd: 35.0, zoneMultiplier: 1.35, estimatedDaysMin: 3, estimatedDaysMax: 5 },
    { province: "Azuay", canton: "Cuenca", flatRateUsd: 30.0, zoneMultiplier: 1.25, estimatedDaysMin: 3, estimatedDaysMax: 5 },
    { province: "Tungurahua", canton: "Ambato", flatRateUsd: 25.0, zoneMultiplier: 1.15, estimatedDaysMin: 2, estimatedDaysMax: 4 },
    { province: "Imbabura", canton: "Ibarra", flatRateUsd: 25.0, zoneMultiplier: 1.15, estimatedDaysMin: 2, estimatedDaysMax: 4 },
  ];

  for (const zone of shippingZones) {
    await prisma.shippingZoneRate.upsert({
      where: { province_canton: { province: zone.province, canton: zone.canton } },
      update: zone,
      create: zone,
    });
  }

  // 3. Usuario Administrador y Cliente de Prueba
  const adminPassword = await bcrypt.hash("AdminRModulares2026!", 10);
  await prisma.user.upsert({
    where: { email: "admin@rmodulares.ec" },
    update: {},
    create: {
      name: "Administrador RModulares",
      email: "admin@rmodulares.ec",
      passwordHash: adminPassword,
      role: "ADMIN",
      identificationType: "RUC",
      identificationNum: "1790012345001",
      phone: "0991234567",
    },
  });

  // 4. Categorías Principales
  const categoriesData = [
    { name: "Sala", slug: "sala", description: "Sofás modulares, poltronas y mesas de centro de líneas arquitectónicas.", coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80" },
    { name: "Comedor", slug: "comedor", description: "Mesas en madera sólida y piedra natural para encuentros memorables.", coverImage: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80" },
    { name: "Dormitorio", slug: "dormitorio", description: "Camas tapizadas, veladores y sistemas de descanso minimalistas.", coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80" },
    { name: "Oficina", slug: "oficina", description: "Escritorios ejecutivos y estanterías modulares para estudio.", coverImage: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80" },
    { name: "Exterior", slug: "exterior", description: "Mobiliario resistente a la intemperie para terrazas y jardines.", coverImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80" },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = record.id;
  }

  // 5. Biblioteca de Materiales PBR para el Configurador 3D
  const matLinoArena = await prisma.materialOption.upsert({
    where: { skuCode: "MAT-FAB-LINO-ARENA" },
    update: {},
    create: {
      name: "Lino Belga Arena",
      skuCode: "MAT-FAB-LINO-ARENA",
      category: "FABRIC",
      colorHex: "#DCD6CC",
      roughnessFactor: 0.85,
      metalnessFactor: 0.0,
      priceDeltaUsd: 0.0,
      extraLeadDays: 0,
    },
  });

  const matCueroCognac = await prisma.materialOption.upsert({
    where: { skuCode: "MAT-LEA-COGNAC" },
    update: {},
    create: {
      name: "Cuero Flor Cognac",
      skuCode: "MAT-LEA-COGNAC",
      category: "LEATHER",
      colorHex: "#8C5A3C",
      roughnessFactor: 0.45,
      metalnessFactor: 0.05,
      priceDeltaUsd: 180.0,
      extraLeadDays: 5,
    },
  });

  const matRobleNatural = await prisma.materialOption.upsert({
    where: { skuCode: "MAT-WOD-ROBLE" },
    update: {},
    create: {
      name: "Roble Blanco Cepillado",
      skuCode: "MAT-WOD-ROBLE",
      category: "WOOD",
      colorHex: "#B8997A",
      roughnessFactor: 0.65,
      metalnessFactor: 0.0,
      priceDeltaUsd: 0.0,
      extraLeadDays: 0,
    },
  });

  const matNogalAhumado = await prisma.materialOption.upsert({
    where: { skuCode: "MAT-WOD-NOGAL" },
    update: {},
    create: {
      name: "Nogal Ahumado Oscuro",
      skuCode: "MAT-WOD-NOGAL",
      category: "WOOD",
      colorHex: "#4A3728",
      roughnessFactor: 0.6,
      metalnessFactor: 0.0,
      priceDeltaUsd: 65.0,
      extraLeadDays: 3,
    },
  });

  // 6. Producto Híbrido de Demostración ("Sofá Modular Aura")
  const sofaProduct = await prisma.product.upsert({
    where: { slug: "sofa-modular-aura" },
    update: {},
    create: {
      name: "Sofá Modular Aura",
      slug: "sofa-modular-aura",
      subtitle: "Proporciones bajas y confort envolvente en madera certificada",
      description:
        "Diseñado para adaptarse a espacios contemporáneos. Su estructura vista de madera maciza sostiene cojines de alta densidad personalizables en lino orgánico o cuero flor.",
      categoryId: createdCategories["sala"],
      basePriceUsd: 1250.0,
      inventoryMode: "HYBRID",
      baseLeadTimeDays: 15,
      modelGlbUrl: "/models/sofa-aura-base.glb", // Se reemplaza por URL Cloudinary desde el Admin
      baseWidthCm: 200,
      baseHeightCm: 76,
      baseDepthCm: 95,
      baseWeightKg: 68,
      isFeatured: true,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
            publicId: "sample_sofa_primary",
            altText: "Sofá Modular Aura vista frontal",
            isPrimary: true,
            sortOrder: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
            publicId: "sample_sofa_hover",
            altText: "Sofá Modular Aura detalle en ambiente",
            isHover: true,
            sortOrder: 2,
          },
        ],
      },
      sizeOptions: {
        create: [
          {
            label: "2 Plazas Estándar (200 cm)",
            code: "SZ-200",
            widthCm: 200,
            heightCm: 76,
            depthCm: 95,
            weightKg: 68,
            scaleX: 1.0,
            scaleY: 1.0,
            scaleZ: 1.0,
            priceDeltaUsd: 0.0,
            isDefault: true,
          },
          {
            label: "3 Plazas Gran Formato (240 cm)",
            code: "SZ-240",
            widthCm: 240,
            heightCm: 76,
            depthCm: 95,
            weightKg: 82,
            scaleX: 1.2,
            scaleY: 1.0,
            scaleZ: 1.0,
            priceDeltaUsd: 160.0,
            isDefault: false,
          },
        ],
      },
      meshZones: {
        create: [
          {
            zoneLabel: "Tapizado Principal",
            meshNodeName: "mesh_tapiz",
            defaultMaterialId: matLinoArena.id,
            sortOrder: 1,
            allowedMaterials: {
              connect: [{ id: matLinoArena.id }, { id: matCueroCognac.id }],
            },
          },
          {
            zoneLabel: "Estructura de Madera",
            meshNodeName: "mesh_estructura",
            defaultMaterialId: matRobleNatural.id,
            sortOrder: 2,
            allowedMaterials: {
              connect: [{ id: matRobleNatural.id }, { id: matNogalAhumado.id }],
            },
          },
        ],
      },
    },
  });

  // 7. Crear un SKU con Stock Físico para Entrega Inmediata (Combinación Base)
  await prisma.productVariantSku.upsert({
    where: { sku: "AURA-SZ200-LINO-ROBLE" },
    update: {},
    create: {
      productId: sofaProduct.id,
      sku: "AURA-SZ200-LINO-ROBLE",
      configurationHash: "SZ-200__mesh_tapiz:MAT-FAB-LINO-ARENA__mesh_estructura:MAT-WOD-ROBLE",
      configurationJson: {
        sizeCode: "SZ-200",
        materials: {
          mesh_tapiz: "MAT-FAB-LINO-ARENA",
          mesh_estructura: "MAT-WOD-ROBLE",
        },
      },
      stockQuantity: 4,
    },
  });

  // 8. Crear un Lookbook Editorial con Hotspot Interactivo
  await prisma.lookbook.upsert({
    where: { slug: "calidez-organica-cumbaya" },
    update: {},
    create: {
      title: "Calidez Orgánica: Luz y Materia en los Valles",
      slug: "calidez-organica-cumbaya",
      seasonTag: "Editorial 01 / 2026",
      excerpt: "Exploramos cómo las maderas sin tratar y el lino crudo dialogan con la luz andina.",
      editorialMd:
        "La arquitectura interior contemporánea busca refugio en materiales honestos. El Sofá Modular Aura articula el espacio social sin interrumpir las visuales hacia el jardín.",
      coverImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
      isPublished: true,
      scenes: {
        create: [
          {
            imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80",
            caption: "Escena 01 — Sala principal con iluminación natural de tarde",
            sortOrder: 1,
            hotspots: {
              create: [
                {
                  productId: sofaProduct.id,
                  xPercent: 48.5,
                  yPercent: 62.0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅ Seed completado exitosamente. Credenciales Admin: admin@rmodulares.ec / AdminRModulares2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });