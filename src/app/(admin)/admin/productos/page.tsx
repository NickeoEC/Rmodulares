"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Box,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Ruler,
  PackageCheck,
  Image as ImageIcon,
} from "lucide-react";

interface MaterialItem {
  id: string;
  name: string;
  skuCode: string;
  colorHex: string;
  category: string;
  priceDeltaUsd: number;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado del Modal de Creación / Edición
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingGlb, setUploadingGlb] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);

  // Campos Principales del Producto
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePriceUsd, setBasePriceUsd] = useState(850);
  const [inventoryMode, setInventoryMode] = useState("HYBRID");
  const [baseLeadTimeDays, setBaseLeadTimeDays] = useState(15);
  const [modelGlbUrl, setModelGlbUrl] = useState("/models/sofa-aura-base.glb");
  const [modelUsdzUrl, setModelUsdzUrl] = useState("");
  const [baseWidthCm, setBaseWidthCm] = useState(200);
  const [baseHeightCm, setBaseHeightCm] = useState(76);
  const [baseDepthCm, setBaseDepthCm] = useState(95);
  const [baseWeightKg, setBaseWeightKg] = useState(65);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Sub-colecciones del Producto
  const [images, setImages] = useState<
    { url: string; isPrimary: boolean; isHover: boolean }[]
  >([]);
  const [sizeOptions, setSizeOptions] = useState<
    {
      label: string;
      code: string;
      widthCm: number;
      heightCm: number;
      depthCm: number;
      weightKg: number;
      scaleX: number;
      scaleY: number;
      scaleZ: number;
      priceDeltaUsd: number;
      isDefault: boolean;
    }[]
  >([]);
  const [meshZones, setMeshZones] = useState<
    {
      zoneLabel: string;
      meshNodeName: string;
      defaultMaterialId: string;
      allowedMaterialIds: string[];
    }[]
  >([]);
  const [stockVariants, setStockVariants] = useState<
    {
      sku: string;
      configurationHash: string;
      configurationJson: any;
      stockQuantity: number;
      priceOverrideUsd?: number | null;
    }[]
  >([]);

  // Estado auxiliar para el generador asistido de SKUs
  const [skuBuilderCode, setSkuBuilderCode] = useState("");
  const [skuBuilderSizeCode, setSkuBuilderSizeCode] = useState("");
  const [skuBuilderZoneMats, setSkuBuilderZoneMats] = useState<
    Record<string, string>
  >({});
  const [skuBuilderQty, setSkuBuilderQty] = useState(3);

  const fetchCatalogData = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (data.products) setProducts(data.products);
    if (data.categories) {
      setCategories(data.categories);
      if (data.categories.length > 0 && !categoryId) {
        setCategoryId(data.categories[0].id);
      }
    }
    if (data.materials) setMaterials(data.materials);
    setLoading(false);
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  // Auto-generador de slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  // Abrir formulario para Nuevo Mueble con valores iniciales listos para usar
  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setSubtitle("");
    setDescription("");
    setCategoryId(categories[0]?.id || "");
    setBasePriceUsd(950);
    setInventoryMode("HYBRID");
    setBaseLeadTimeDays(15);
    setModelGlbUrl("/models/sofa-aura-base.glb");
    setModelUsdzUrl("");
    setBaseWidthCm(200);
    setBaseHeightCm(76);
    setBaseDepthCm(95);
    setBaseWeightKg(65);
    setIsFeatured(false);
    setIsActive(true);

    setImages([
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
        isPrimary: true,
        isHover: false,
      },
    ]);

    setSizeOptions([
      {
        label: "Estándar (200 cm)",
        code: "SZ-200",
        widthCm: 200,
        heightCm: 76,
        depthCm: 95,
        weightKg: 65,
        scaleX: 1.0,
        scaleY: 1.0,
        scaleZ: 1.0,
        priceDeltaUsd: 0,
        isDefault: true,
      },
    ]);

    const defaultMatIds = materials.map((m) => m.id);
    setMeshZones([
      {
        zoneLabel: "Tapizado Principal",
        meshNodeName: "mesh_tapiz",
        defaultMaterialId: materials[0]?.id || "",
        allowedMaterialIds: defaultMatIds,
      },
      {
        zoneLabel: "Estructura de Madera",
        meshNodeName: "mesh_estructura",
        defaultMaterialId: materials[2]?.id || materials[0]?.id || "",
        allowedMaterialIds: defaultMatIds,
      },
    ]);

    setStockVariants([]);
    setFeedback(null);
    setIsFormOpen(true);
  };

  // Abrir formulario cargando todos los datos de un mueble existente
  const openEditModal = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setSubtitle(p.subtitle || "");
    setDescription(p.description || "");
    setCategoryId(p.categoryId);
    setBasePriceUsd(Number(p.basePriceUsd));
    setInventoryMode(p.inventoryMode);
    setBaseLeadTimeDays(p.baseLeadTimeDays);
    setModelGlbUrl(p.modelGlbUrl);
    setModelUsdzUrl(p.modelUsdzUrl || "");
    setBaseWidthCm(p.baseWidthCm);
    setBaseHeightCm(p.baseHeightCm);
    setBaseDepthCm(p.baseDepthCm);
    setBaseWeightKg(p.baseWeightKg);
    setIsFeatured(p.isFeatured);
    setIsActive(p.isActive);

    setImages(
      p.images.map((img: any) => ({
        url: img.url,
        isPrimary: img.isPrimary,
        isHover: img.isHover,
      }))
    );

    setSizeOptions(
      p.sizeOptions.map((s: any) => ({
        label: s.label,
        code: s.code,
        widthCm: s.widthCm,
        heightCm: s.heightCm,
        depthCm: s.depthCm,
        weightKg: s.weightKg,
        scaleX: s.scaleX,
        scaleY: s.scaleY,
        scaleZ: s.scaleZ,
        priceDeltaUsd: Number(s.priceDeltaUsd),
        isDefault: s.isDefault,
      }))
    );

    setMeshZones(
      p.meshZones.map((z: any) => ({
        zoneLabel: z.zoneLabel,
        meshNodeName: z.meshNodeName,
        defaultMaterialId: z.defaultMaterialId,
        allowedMaterialIds: z.allowedMaterials.map((m: any) => m.id),
      }))
    );

    setStockVariants(
      p.stockVariants.map((sv: any) => ({
        sku: sv.sku,
        configurationHash: sv.configurationHash,
        configurationJson: sv.configurationJson,
        stockQuantity: sv.stockQuantity,
        priceOverrideUsd: sv.priceOverrideUsd
          ? Number(sv.priceOverrideUsd)
          : null,
      }))
    );

    setFeedback(null);
    setIsFormOpen(true);
  };

  // Subir archivo .glb o imagen a Cloudinary / Local
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "glb" | "image"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === "glb") setUploadingGlb(true);
    else setUploadingImg(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al subir el archivo");
      } else if (target === "glb") {
        setModelGlbUrl(data.url);
      } else {
        setImages((prev) => [
          ...prev,
          {
            url: data.url,
            isPrimary: prev.length === 0,
            isHover: prev.length === 1,
          },
        ]);
      }
    } finally {
      if (target === "glb") setUploadingGlb(false);
      else setUploadingImg(false);
      e.target.value = "";
    }
  };

  // Alternar un material PBR permitido en una zona de malla
  const toggleAllowedMaterial = (zoneIdx: number, matId: string) => {
    setMeshZones((prev) =>
      prev.map((z, idx) => {
        if (idx !== zoneIdx) return z;
        const exists = z.allowedMaterialIds.includes(matId);
        const updatedIds = exists
          ? z.allowedMaterialIds.filter((id) => id !== matId)
          : [...z.allowedMaterialIds, matId];
        return {
          ...z,
          allowedMaterialIds: updatedIds,
          defaultMaterialId: updatedIds.includes(z.defaultMaterialId)
            ? z.defaultMaterialId
            : updatedIds[0] || "",
        };
      })
    );
  };

  // Añadir SKU al listado construyendo automáticamente el configurationHash exacto
  const handleAddBuiltSku = () => {
    const sizeCode = skuBuilderSizeCode || sizeOptions[0]?.code;
    if (!skuBuilderCode.trim() || !sizeCode) {
      alert("Ingresa un código SKU y asegúrate de tener al menos un tamaño.");
      return;
    }

    const materialParts = meshZones.map((z) => {
      const chosenSkuCode =
        skuBuilderZoneMats[z.meshNodeName] ||
        materials.find((m) => m.id === z.defaultMaterialId)?.skuCode ||
        materials[0]?.skuCode ||
        "";
      return `${z.meshNodeName}:${chosenSkuCode}`;
    });

    const hash = `${sizeCode}__${materialParts.join("__")}`;

    setStockVariants((prev) => [
      ...prev,
      {
        sku: skuBuilderCode.trim().toUpperCase(),
        configurationHash: hash,
        configurationJson: { sizeCode, materials: skuBuilderZoneMats },
        stockQuantity: Number(skuBuilderQty),
      },
    ]);
    setSkuBuilderCode("");
  };

  // Guardar (Crear o Actualizar Producto)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const url = editingId
      ? `/api/admin/products/${editingId}`
      : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
        images,
        sizeOptions,
        meshZones,
        stockVariants,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setFeedback({
        type: "err",
        msg: data.error || "Error al guardar el mueble.",
      });
      return;
    }

    setFeedback({
      type: "ok",
      msg: editingId
        ? "Mueble actualizado correctamente."
        : "Nuevo mueble 3D creado exitosamente.",
    });
    await fetchCatalogData();
    setTimeout(() => setIsFormOpen(false), 900);
  };

  // Eliminar Producto
  const handleDeleteProduct = async (id: string, productName: string) => {
    if (
      !confirm(
        `¿Seguro que deseas eliminar "${productName}" del catálogo?`
      )
    ) {
      return;
    }

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok) {
      if (data.softDeleted) {
        alert(data.message);
      }
      fetchCatalogData();
    } else {
      alert(data.error || "No se pudo eliminar.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Catálogo 3D & Inventario Híbrido
          </p>
          <h1 className="mt-1 font-serif text-4xl font-normal">
            Gestión de Muebles y Modelos .GLB
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-foreground px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-accent hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Crear Nuevo Mueble 3D
        </button>
      </div>

      {/* Tabla de Productos Existentes */}
      <div className="border border-border bg-surface p-6">
        {loading ? (
          <p className="py-8 text-center font-mono text-xs uppercase text-muted">
            Cargando catálogo...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border font-mono uppercase text-muted">
                  <th className="py-3 pr-4">Mueble</th>
                  <th className="py-3 pr-4">Categoría</th>
                  <th className="py-3 pr-4">Precio Base</th>
                  <th className="py-3 pr-4">Modo / Stock</th>
                  <th className="py-3 pr-4">Modelo 3D (.glb)</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const totalStock = p.stockVariants.reduce(
                    (acc: number, s: any) => acc + s.stockQuantity,
                    0
                  );
                  return (
                    <tr key={p.id} className={!p.isActive ? "opacity-50" : ""}>
                      <td className="py-4 pr-4">
                        <p className="font-serif text-lg font-medium text-foreground">
                          {p.name}
                        </p>
                        <p className="font-mono text-[11px] text-muted">
                          /{p.slug} {!p.isActive && "(Inactivo)"}
                        </p>
                      </td>
                      <td className="py-4 pr-4 font-mono">
                        {p.category?.name}
                      </td>
                      <td className="py-4 pr-4 font-mono font-medium">
                        ${Number(p.basePriceUsd).toFixed(2)} USD
                      </td>
                      <td className="py-4 pr-4">
                        <span className="border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase">
                          {p.inventoryMode}
                        </span>
                        <p className="mt-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                          {totalStock} uds. en SKU ({p.meshZones.length} zonas 3D)
                        </p>
                      </td>
                      <td className="py-4 pr-4 font-mono text-[11px] text-muted">
                        <span className="inline-flex items-center gap-1 text-accent">
                          <Box className="h-3.5 w-3.5" />
                          {p.modelGlbUrl.split("/").pop()}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/catalogo/${p.slug}`}
                            target="_blank"
                            className="border border-border bg-background p-2 text-muted hover:border-foreground hover:text-foreground"
                            title="Abrir en Configurador 3D"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="border border-border bg-background p-2 text-muted hover:border-accent hover:text-accent"
                            title="Editar Mueble"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="border border-border bg-background p-2 text-muted hover:border-red-500 hover:text-red-500"
                            title="Eliminar Mueble"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL / FORMULARIO COMPLETO DE CREACIÓN Y EDICIÓN */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 p-4 backdrop-blur-sm sm:p-8">
          <div className="mx-auto max-w-5xl border border-border bg-background p-6 shadow-2xl sm:p-10">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  {editingId ? "Modo Edición" : "Nuevo Registro"}
                </p>
                <h2 className="font-serif text-3xl font-normal">
                  {editingId ? `Editar: ${name}` : "Crear Nuevo Mueble 3D"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-muted hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {feedback && (
              <div
                className={`mt-4 border p-4 text-xs ${
                  feedback.type === "ok"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    : "border-red-500/40 bg-red-500/10 text-red-600"
                }`}
              >
                {feedback.msg}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-10">
              {/* SECCIÓN 1: DATOS GENERALES E INVENTARIO */}
              <section className="space-y-4 border border-border bg-surface p-6">
                <h3 className="font-serif text-xl font-medium">
                  1. Información General, Categoría y Precio Base
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block font-mono text-xs uppercase text-muted">
                      Nombre del Mueble *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ej. Mesa de Comedor Andes"
                      className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-muted">
                      Slug URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-muted">
                      Categoría *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-muted">
                      Precio Base (USD) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={basePriceUsd}
                      onChange={(e) => setBasePriceUsd(Number(e.target.value))}
                      className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-muted">
                      Modo de Inventario
                    </label>
                    <select
                      value={inventoryMode}
                      onChange={(e) => setInventoryMode(e.target.value)}
                      className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="HYBRID">
                        HYBRID (Stock SKU + A Medida)
                      </option>
                      <option value="STOCK_SKU">Solo Stock Físico (SKU)</option>
                      <option value="MADE_TO_ORDER">
                        Solo Fabricación Bajo Pedido
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-muted">
                      Días Fabricación Base
                    </label>
                    <input
                      type="number"
                      value={baseLeadTimeDays}
                      onChange={(e) =>
                        setBaseLeadTimeDays(Number(e.target.value))
                      }
                      className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-mono text-xs uppercase text-muted">
                      Subtítulo Editorial
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Frase corta estilo revista"
                      className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-mono text-xs uppercase text-muted">
                      Descripción Arquitectónica
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Dimensiones Base y Flags */}
                <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-6">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted">
                      Ancho Base (cm)
                    </label>
                    <input
                      type="number"
                      value={baseWidthCm}
                      onChange={(e) => setBaseWidthCm(Number(e.target.value))}
                      className="mt-1 w-full border border-border bg-background px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted">
                      Alto Base (cm)
                    </label>
                    <input
                      type="number"
                      value={baseHeightCm}
                      onChange={(e) => setBaseHeightCm(Number(e.target.value))}
                      className="mt-1 w-full border border-border bg-background px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted">
                      Prof. Base (cm)
                    </label>
                    <input
                      type="number"
                      value={baseDepthCm}
                      onChange={(e) => setBaseDepthCm(Number(e.target.value))}
                      className="mt-1 w-full border border-border bg-background px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted">
                      Peso Base (kg)
                    </label>
                    <input
                      type="number"
                      value={baseWeightKg}
                      onChange={(e) => setBaseWeightKg(Number(e.target.value))}
                      className="mt-1 w-full border border-border bg-background px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 pt-4 text-xs">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    Destacado Home
                  </label>
                  <label className="flex items-center gap-2 pt-4 text-xs">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Visible / Activo
                  </label>
                </div>
              </section>

              {/* SECCIÓN 2: SUBIDA DE MODELO 3D (.GLB) E IMÁGENES */}
              <section className="space-y-4 border border-border bg-surface p-6">
                <h3 className="flex items-center gap-2 font-serif text-xl font-medium">
                  <Box className="h-5 w-5 text-accent" />
                  2. Modelo 3D (.GLB) y Fotografías (Cloudinary / Local)
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono text-xs uppercase text-muted">
                      URL o Ruta del Archivo .GLB *
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        required
                        value={modelGlbUrl}
                        onChange={(e) => setModelGlbUrl(e.target.value)}
                        className="flex-1 border border-border bg-background px-3 py-2 font-mono text-xs"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-1.5 bg-foreground px-3.5 py-2 font-mono text-xs uppercase text-background hover:bg-accent hover:text-white">
                        <Upload className="h-3.5 w-3.5" />
                        {uploadingGlb ? "Subiendo..." : "Subir .GLB"}
                        <input
                          type="file"
                          accept=".glb,.gltf"
                          onChange={(e) => handleFileUpload(e, "glb")}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-muted">
                      Tip: Usa &quot;/models/sofa-aura-base.glb&quot; para usar el modelo
                      paramétrico o sube tu propio archivo .glb.
                    </p>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-muted">
                      Fotografías del Catálogo (Principal y Hover)
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 border border-border bg-background px-3.5 py-2 font-mono text-xs uppercase hover:border-foreground">
                        <ImageIcon className="h-3.5 w-3.5 text-accent" />
                        {uploadingImg
                          ? "Subiendo foto..."
                          : "Subir Imagen desde PC"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "image")}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) => [
                            ...prev,
                            {
                              url: "",
                              isPrimary: prev.length === 0,
                              isHover: prev.length === 1,
                            },
                          ])
                        }
                        className="border border-border bg-background px-3 py-2 font-mono text-xs uppercase"
                      >
                        + Añadir por URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de Imágenes */}
                <div className="space-y-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center gap-3 border border-border bg-background p-2.5 text-xs"
                    >
                      <input
                        type="text"
                        placeholder="https://..."
                        value={img.url}
                        onChange={(e) =>
                          setImages((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, url: e.target.value } : item
                            )
                          )
                        }
                        className="flex-1 border border-border bg-surface px-2.5 py-1.5 font-mono text-xs"
                      />
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={img.isPrimary}
                          onChange={(e) =>
                            setImages((prev) =>
                              prev.map((item, i) => ({
                                ...item,
                                isPrimary:
                                  i === idx ? e.target.checked : false,
                              }))
                            )
                          }
                        />
                        Principal
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={img.isHover}
                          onChange={(e) =>
                            setImages((prev) =>
                              prev.map((item, i) => ({
                                ...item,
                                isHover: i === idx ? e.target.checked : false,
                              }))
                            )
                          }
                        />
                        Hover 2da Foto
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECCIÓN 3: TAMAÑOS Y ESCALAS 3D */}
              <section className="space-y-4 border border-border bg-surface p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-serif text-xl font-medium">
                    <Ruler className="h-5 w-5 text-accent" />
                    3. Opciones de Tamaño y Escala 3D
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSizeOptions((prev) => [
                        ...prev,
                        {
                          label: "Nuevo Tamaño",
                          code: `SZ-${200 + prev.length * 20}`,
                          widthCm: 220,
                          heightCm: 76,
                          depthCm: 95,
                          weightKg: 75,
                          scaleX: 1.1,
                          scaleY: 1.0,
                          scaleZ: 1.0,
                          priceDeltaUsd: 120,
                          isDefault: false,
                        },
                      ])
                    }
                    className="border border-border bg-background px-3 py-1.5 font-mono text-xs uppercase"
                  >
                    + Añadir Tamaño
                  </button>
                </div>

                <div className="space-y-3">
                  {sizeOptions.map((sz, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-2 gap-2 border border-border bg-background p-3 text-xs sm:grid-cols-8"
                    >
                      <div className="sm:col-span-2">
                        <label className="font-mono text-[10px] text-muted">
                          Nombre Tamaño
                        </label>
                        <input
                          type="text"
                          value={sz.label}
                          onChange={(e) =>
                            setSizeOptions((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, label: e.target.value }
                                  : item
                              )
                            )
                          }
                          className="w-full border border-border bg-surface px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-muted">
                          Código
                        </label>
                        <input
                          type="text"
                          value={sz.code}
                          onChange={(e) =>
                            setSizeOptions((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, code: e.target.value }
                                  : item
                              )
                            )
                          }
                          className="w-full border border-border bg-surface px-2 py-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-muted">
                          Ancho (cm)
                        </label>
                        <input
                          type="number"
                          value={sz.widthCm}
                          onChange={(e) =>
                            setSizeOptions((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, widthCm: Number(e.target.value) }
                                  : item
                              )
                            )
                          }
                          className="w-full border border-border bg-surface px-2 py-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-muted">
                          Peso (kg)
                        </label>
                        <input
                          type="number"
                          value={sz.weightKg}
                          onChange={(e) =>
                            setSizeOptions((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      weightKg: Number(e.target.value),
                                    }
                                  : item
                              )
                            )
                          }
                          className="w-full border border-border bg-surface px-2 py-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-muted">
                          Escala 3D X
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          value={sz.scaleX}
                          onChange={(e) =>
                            setSizeOptions((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, scaleX: Number(e.target.value) }
                                  : item
                              )
                            )
                          }
                          className="w-full border border-border bg-surface px-2 py-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-muted">
                          Extra ($ USD)
                        </label>
                        <input
                          type="number"
                          value={sz.priceDeltaUsd}
                          onChange={(e) =>
                            setSizeOptions((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      priceDeltaUsd: Number(e.target.value),
                                    }
                                  : item
                              )
                            )
                          }
                          className="w-full border border-border bg-surface px-2 py-1 font-mono"
                        />
                      </div>
                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setSizeOptions((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="p-1.5 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECCIÓN 4: ZONAS DE MALLA 3D Y ASIGNACIÓN DE MATERIALES PBR */}
              <section className="space-y-4 border border-border bg-surface p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-serif text-xl font-medium">
                    <Layers className="h-5 w-5 text-accent" />
                    4. Zonas de Malla 3D (.glb) y Materiales PBR Permitidos
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setMeshZones((prev) => [
                        ...prev,
                        {
                          zoneLabel: "Nueva Zona",
                          meshNodeName: "mesh_patas",
                          defaultMaterialId: materials[0]?.id || "",
                          allowedMaterialIds: materials.map((m) => m.id),
                        },
                      ])
                    }
                    className="border border-border bg-background px-3 py-1.5 font-mono text-xs uppercase"
                  >
                    + Añadir Zona de Malla
                  </button>
                </div>

                <div className="space-y-4">
                  {meshZones.map((zone, zIdx) => (
                    <div
                      key={zIdx}
                      className="border border-border bg-background p-4"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="font-mono text-[10px] uppercase text-muted">
                            Etiqueta en UI (Ej. Tapizado)
                          </label>
                          <input
                            type="text"
                            value={zone.zoneLabel}
                            onChange={(e) =>
                              setMeshZones((prev) =>
                                prev.map((z, i) =>
                                  i === zIdx
                                    ? { ...z, zoneLabel: e.target.value }
                                    : z
                                )
                              )
                            }
                            className="mt-1 w-full border border-border bg-surface px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-mono text-[10px] uppercase text-muted">
                            Nodo en archivo .GLB (meshNodeName)
                          </label>
                          <input
                            type="text"
                            value={zone.meshNodeName}
                            onChange={(e) =>
                              setMeshZones((prev) =>
                                prev.map((z, i) =>
                                  i === zIdx
                                    ? { ...z, meshNodeName: e.target.value }
                                    : z
                                )
                              )
                            }
                            className="mt-1 w-full border border-border bg-surface px-2.5 py-1.5 font-mono text-xs"
                          />
                        </div>

                        <div className="flex items-end justify-between gap-2">
                          <div className="flex-1">
                            <label className="font-mono text-[10px] uppercase text-muted">
                              Material por Defecto
                            </label>
                            <select
                              value={zone.defaultMaterialId}
                              onChange={(e) =>
                                setMeshZones((prev) =>
                                  prev.map((z, i) =>
                                    i === zIdx
                                      ? {
                                          ...z,
                                          defaultMaterialId: e.target.value,
                                        }
                                      : z
                                  )
                                )
                              }
                              className="mt-1 w-full border border-border bg-surface px-2.5 py-1.5 text-xs"
                            >
                              {materials
                                .filter((m) =>
                                  zone.allowedMaterialIds.includes(m.id)
                                )
                                .map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setMeshZones((prev) =>
                                prev.filter((_, i) => i !== zIdx)
                              )
                            }
                            className="p-2 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 font-mono text-[10px] uppercase text-muted">
                        Selecciona los materiales PBR habilitados para esta malla:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {materials.map((mat) => {
                          const checked = zone.allowedMaterialIds.includes(
                            mat.id
                          );
                          return (
                            <button
                              key={mat.id}
                              type="button"
                              onClick={() =>
                                toggleAllowedMaterial(zIdx, mat.id)
                              }
                              className={`inline-flex items-center gap-2 border px-2.5 py-1 text-xs transition ${
                                checked
                                  ? "border-accent bg-accent/15 font-medium text-foreground"
                                  : "border-border bg-surface text-muted opacity-60"
                              }`}
                            >
                              <span
                                style={{ backgroundColor: mat.colorHex }}
                                className="h-3 w-3 rounded-full border border-border"
                              />
                              {mat.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECCIÓN 5: GENERADOR DE SKUS CON STOCK FÍSICO */}
              <section className="space-y-4 border border-border bg-surface p-6">
                <h3 className="flex items-center gap-2 font-serif text-xl font-medium">
                  <PackageCheck className="h-5 w-5 text-accent" />
                  5. Variantes SKU con Stock Físico (Entrega Inmediata)
                </h3>

                {/* Constructor Automático de Hash */}
                <div className="grid grid-cols-1 gap-3 border border-border bg-background p-4 sm:grid-cols-5">
                  <div>
                    <label className="font-mono text-[10px] uppercase text-muted">
                      Código SKU Único
                    </label>
                    <input
                      type="text"
                      placeholder="EJ. MESA-SZ200-ROBLE"
                      value={skuBuilderCode}
                      onChange={(e) => setSkuBuilderCode(e.target.value)}
                      className="mt-1 w-full border border-border bg-surface px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] uppercase text-muted">
                      Tamaño
                    </label>
                    <select
                      value={skuBuilderSizeCode}
                      onChange={(e) => setSkuBuilderSizeCode(e.target.value)}
                      className="mt-1 w-full border border-border bg-surface px-2.5 py-1.5 text-xs"
                    >
                      {sizeOptions.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.label} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {meshZones.map((z) => (
                    <div key={z.meshNodeName}>
                      <label className="font-mono text-[10px] uppercase text-muted">
                        {z.zoneLabel}
                      </label>
                      <select
                        value={skuBuilderZoneMats[z.meshNodeName] || ""}
                        onChange={(e) =>
                          setSkuBuilderZoneMats((prev) => ({
                            ...prev,
                            [z.meshNodeName]: e.target.value,
                          }))
                        }
                        className="mt-1 w-full border border-border bg-surface px-2.5 py-1.5 text-xs"
                      >
                        {materials
                          .filter((m) => z.allowedMaterialIds.includes(m.id))
                          .map((m) => (
                            <option key={m.skuCode} value={m.skuCode}>
                              {m.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}

                  <div className="flex items-end gap-2">
                    <div className="w-20">
                      <label className="font-mono text-[10px] uppercase text-muted">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={skuBuilderQty}
                        onChange={(e) =>
                          setSkuBuilderQty(Number(e.target.value))
                        }
                        className="mt-1 w-full border border-border bg-surface px-2.5 py-1.5 font-mono text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddBuiltSku}
                      className="bg-foreground px-3 py-2 font-mono text-xs uppercase text-background hover:bg-accent hover:text-white"
                    >
                      + Agregar SKU
                    </button>
                  </div>
                </div>

                {/* Lista de SKUs */}
                <div className="space-y-2">
                  {stockVariants.map((sv, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background px-3.5 py-2 text-xs"
                    >
                      <div>
                        <span className="font-mono font-medium text-foreground">
                          {sv.sku}
                        </span>
                        <p className="font-mono text-[10px] text-muted">
                          Hash 3D: {sv.configurationHash}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="font-mono text-xs">
                          Stock:
                          <input
                            type="number"
                            value={sv.stockQuantity}
                            onChange={(e) =>
                              setStockVariants((prev) =>
                                prev.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        stockQuantity: Number(e.target.value),
                                      }
                                    : item
                                )
                              )
                            }
                            className="ml-2 w-16 border border-border bg-surface px-2 py-1 font-mono"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setStockVariants((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Botones Finales */}
              <div className="flex justify-end gap-4 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="border border-border px-6 py-3 font-mono text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-foreground px-8 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-accent hover:text-white"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {saving
                    ? "Guardando en PostgreSQL..."
                    : editingId
                    ? "Guardar Cambios del Mueble"
                    : "Publicar Nuevo Mueble 3D"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}