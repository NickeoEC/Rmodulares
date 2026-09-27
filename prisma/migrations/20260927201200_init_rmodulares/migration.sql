-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "IdentificationType" AS ENUM ('CEDULA', 'RUC', 'PASAPORTE');

-- CreateEnum
CREATE TYPE "InventoryMode" AS ENUM ('STOCK_SKU', 'MADE_TO_ORDER', 'HYBRID');

-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('WOOD', 'FABRIC', 'LEATHER', 'METAL', 'STONE', 'GLASS');

-- CreateEnum
CREATE TYPE "ShippingStrategy" AS ENUM ('FLAT_BY_LOCATION', 'FREE_OVER_AMOUNT', 'WEIGHT_VOLUME');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'IN_PRODUCTION', 'READY_FOR_DISPATCH', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "identificationType" "IdentificationType",
    "identificationNum" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "canton" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "reference" TEXT,
    "postalCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "basePriceUsd" DECIMAL(10,2) NOT NULL,
    "inventoryMode" "InventoryMode" NOT NULL DEFAULT 'HYBRID',
    "baseLeadTimeDays" INTEGER NOT NULL DEFAULT 15,
    "modelGlbUrl" TEXT NOT NULL,
    "modelUsdzUrl" TEXT,
    "arScaleFixed" BOOLEAN NOT NULL DEFAULT true,
    "defaultCameraOrbit" TEXT,
    "baseWidthCm" DOUBLE PRECISION NOT NULL,
    "baseHeightCm" DOUBLE PRECISION NOT NULL,
    "baseDepthCm" DOUBLE PRECISION NOT NULL,
    "baseWeightKg" DOUBLE PRECISION NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "altText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isHover" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "skuCode" TEXT NOT NULL,
    "category" "MaterialCategory" NOT NULL,
    "colorHex" TEXT NOT NULL DEFAULT '#FFFFFF',
    "swatchImageUrl" TEXT,
    "albedoMapUrl" TEXT,
    "normalMapUrl" TEXT,
    "roughnessMapUrl" TEXT,
    "roughnessFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "metalnessFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "textureRepeat" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "priceDeltaUsd" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "extraLeadDays" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMeshZone" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "zoneLabel" TEXT NOT NULL,
    "meshNodeName" TEXT NOT NULL,
    "defaultMaterialId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductMeshZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSizeOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "widthCm" DOUBLE PRECISION NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "depthCm" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "scaleX" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "scaleY" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "scaleZ" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "priceDeltaUsd" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductSizeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantSku" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "configurationHash" TEXT NOT NULL,
    "configurationJson" JSONB NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "priceOverrideUsd" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductVariantSku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookbook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "editorialMd" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "seasonTag" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LookbookScene" (
    "id" TEXT NOT NULL,
    "lookbookId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LookbookScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LookbookHotspot" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "xPercent" DOUBLE PRECISION NOT NULL,
    "yPercent" DOUBLE PRECISION NOT NULL,
    "presetConfigJson" JSONB,

    CONSTRAINT "LookbookHotspot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL DEFAULT 'global_settings',
    "ivaPercent" DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "activeShippingStrategy" "ShippingStrategy" NOT NULL DEFAULT 'FLAT_BY_LOCATION',
    "freeShippingThresholdUsd" DECIMAL(10,2) NOT NULL DEFAULT 800.00,
    "fallbackBaseShippingUsd" DECIMAL(10,2) NOT NULL DEFAULT 25.00,
    "baseDispatchFeeUsd" DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    "costPerKgUsd" DECIMAL(10,2) NOT NULL DEFAULT 0.50,
    "costPerCubicMeterUsd" DECIMAL(10,2) NOT NULL DEFAULT 45.00,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingZoneRate" (
    "id" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "canton" TEXT NOT NULL DEFAULT '*',
    "flatRateUsd" DECIMAL(10,2) NOT NULL,
    "zoneMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "estimatedDaysMin" INTEGER NOT NULL DEFAULT 2,
    "estimatedDaysMax" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ShippingZoneRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "billingIdType" "IdentificationType" NOT NULL,
    "billingIdNumber" TEXT NOT NULL,
    "billingName" TEXT NOT NULL,
    "billingEmail" TEXT NOT NULL,
    "billingPhone" TEXT NOT NULL,
    "billingAddress" TEXT NOT NULL,
    "shippingProvince" TEXT NOT NULL,
    "shippingCanton" TEXT NOT NULL,
    "shippingStreet" TEXT NOT NULL,
    "shippingReference" TEXT,
    "subtotalUsd" DECIMAL(10,2) NOT NULL,
    "shippingCostUsd" DECIMAL(10,2) NOT NULL,
    "appliedShippingStrategy" "ShippingStrategy" NOT NULL,
    "ivaPercentApplied" DECIMAL(5,2) NOT NULL,
    "ivaAmountUsd" DECIMAL(10,2) NOT NULL,
    "totalUsd" DECIMAL(10,2) NOT NULL,
    "stripePaymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantSkuId" TEXT,
    "productNameSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceUsd" DECIMAL(10,2) NOT NULL,
    "isMadeToOrder" BOOLEAN NOT NULL DEFAULT false,
    "estimatedLeadTimeDays" INTEGER NOT NULL DEFAULT 3,
    "customConfiguration" JSONB NOT NULL,
    "previewImageUrl" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ZoneAllowedMaterials" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ZoneAllowedMaterials_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialOption_skuCode_key" ON "MaterialOption"("skuCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantSku_sku_key" ON "ProductVariantSku"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantSku_productId_configurationHash_key" ON "ProductVariantSku"("productId", "configurationHash");

-- CreateIndex
CREATE UNIQUE INDEX "Lookbook_slug_key" ON "Lookbook"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingZoneRate_province_canton_key" ON "ShippingZoneRate"("province", "canton");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "_ZoneAllowedMaterials_B_index" ON "_ZoneAllowedMaterials"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMeshZone" ADD CONSTRAINT "ProductMeshZone_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSizeOption" ADD CONSTRAINT "ProductSizeOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantSku" ADD CONSTRAINT "ProductVariantSku_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LookbookScene" ADD CONSTRAINT "LookbookScene_lookbookId_fkey" FOREIGN KEY ("lookbookId") REFERENCES "Lookbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LookbookHotspot" ADD CONSTRAINT "LookbookHotspot_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "LookbookScene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LookbookHotspot" ADD CONSTRAINT "LookbookHotspot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantSkuId_fkey" FOREIGN KEY ("variantSkuId") REFERENCES "ProductVariantSku"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ZoneAllowedMaterials" ADD CONSTRAINT "_ZoneAllowedMaterials_A_fkey" FOREIGN KEY ("A") REFERENCES "MaterialOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ZoneAllowedMaterials" ADD CONSTRAINT "_ZoneAllowedMaterials_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductMeshZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
