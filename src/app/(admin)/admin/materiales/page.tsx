"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  CheckCircle2,
  X,
  Palette,
  Sparkles,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  WOOD: "Madera",
  FABRIC: "Textil / Lino",
  LEATHER: "Cuero",
  METAL: "Metal",
  STONE: "Piedra / Mármol",
  GLASS: "Vidrio",
};

export default function AdminMaterialesPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  // Modal de Creación / Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingMap, setUploadingMap] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);

  // Campos del formulario PBR
  const [name, setName] = useState("");
  const [skuCode, setSkuCode] = useState("");
  const [category, setCategory] = useState("FABRIC");
  const [colorHex, setColorHex] = useState("#DCD6CC");
  const [albedoMapUrl, setAlbedoMapUrl] = useState("");
  const [normalMapUrl, setNormalMapUrl] = useState("");
  const [roughnessMapUrl, setRoughnessMapUrl] = useState("");
  const [roughnessFactor, setRoughnessFactor] = useState(0.75);
  const [metalnessFactor, setMetalnessFactor] = useState(0.0);
  const [textureRepeat, setTextureRepeat] = useState(1.0);
  const [priceDeltaUsd, setPriceDeltaUsd] = useState(0);
  const [extraLeadDays, setExtraLeadDays] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchMaterials = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/materials");
    const data = await res.json();
    if (data.materials) setMaterials(data.materials);
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setSkuCode("MAT-");
    setCategory("FABRIC");
    setColorHex("#C8B9A6");
    setAlbedoMapUrl("");
    setNormalMapUrl("");
    setRoughnessMapUrl("");
    setRoughnessFactor(0.75);
    setMetalnessFactor(0.0);
    setTextureRepeat(2.0);
    setPriceDeltaUsd(0);
    setExtraLeadDays(0);
    setIsAvailable(true);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const openEditModal = (mat: any) => {
    setEditingId(mat.id);
    setName(mat.name);
    setSkuCode(mat.skuCode);
    setCategory(mat.category);
    setColorHex(mat.colorHex);
    setAlbedoMapUrl(mat.albedoMapUrl || "");
    setNormalMapUrl(mat.normalMapUrl || "");
    setRoughnessMapUrl(mat.roughnessMapUrl || "");
    setRoughnessFactor(Number(mat.roughnessFactor));
    setMetalnessFactor(Number(mat.metalnessFactor));
    setTextureRepeat(Number(mat.textureRepeat));
    setPriceDeltaUsd(Number(mat.priceDeltaUsd));
    setExtraLeadDays(Number(mat.extraLeadDays));
    setIsAvailable(Boolean(mat.isAvailable));
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleUploadTexture = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "albedo" | "normal" | "roughness"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMap(target);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al subir textura");
      } else {
        if (target === "albedo") setAlbedoMapUrl(data.url);
        if (target === "normal") setNormalMapUrl(data.url);
        if (target === "roughness") setRoughnessMapUrl(data.url);
      }
    } finally {
      setUploadingMap(null);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const url = editingId
      ? `/api/admin/materials/${editingId}`
      : "/api/admin/materials";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        skuCode,
        category,
        colorHex,
        albedoMapUrl,
        normalMapUrl,
        roughnessMapUrl,
        roughnessFactor,
        metalnessFactor,
        textureRepeat,
        priceDeltaUsd,
        extraLeadDays,
        isAvailable,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setFeedback({
        type: "err",
        msg: data.error || "No se pudo guardar el material.",
      });
      return;
    }

    setFeedback({
      type: "ok",
      msg: editingId
        ? "Material PBR actualizado correctamente."
        : "Nuevo material PBR creado y listo para asignar a modelos 3D.",
    });
    await fetchMaterials();
    setTimeout(() => setIsModalOpen(false), 800);
  };

  const handleDelete = async (id: string, matName: string) => {
    if (!confirm(`¿Eliminar el material "${matName}" de la biblioteca PBR?`)) {
      return;
    }

    const res = await fetch(`/api/admin/materials/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok) {
      fetchMaterials();
    } else {
      alert(data.error || "Error al eliminar material.");
    }
  };

  const filteredMaterials =
    filterCategory === "ALL"
      ? materials
      : materials.filter((m) => m.category === filterCategory);

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Biblioteca de Texturas 3D (React Three Fiber)
          </p>
          <h1 className="mt-1 font-serif text-4xl font-normal">
            Materiales PBR & Recargos de Personalización
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-foreground px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-accent hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Nuevo Material PBR
        </button>
      </div>

      {/* Filtros por Categoría de Material */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterCategory("ALL")}
          className={`px-3.5 py-1.5 font-mono text-xs uppercase transition ${
            filterCategory === "ALL"
              ? "bg-foreground text-background"
              : "border border-border bg-surface text-muted hover:text-foreground"
          }`}
        >
          Todos ({materials.length})
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterCategory(key)}
            className={`px-3.5 py-1.5 font-mono text-xs uppercase transition ${
              filterCategory === key
                ? "bg-foreground text-background"
                : "border border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grilla de Materiales PBR */}
      {loading ? (
        <p className="py-12 text-center font-mono text-xs uppercase text-muted">
          Cargando biblioteca PBR...
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className={`flex flex-col justify-between border border-border bg-surface p-5 ${
                !mat.isAvailable ? "opacity-50" : ""
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Muestra esférica con simulación de brillo PBR */}
                    <div
                      style={{
                        backgroundColor: mat.colorHex,
                        backgroundImage: mat.albedoMapUrl
                          ? `url(${mat.albedoMapUrl})`
                          : `radial-gradient(circle at 30% 30%, rgba(255,255,255,${
                              1 - mat.roughnessFactor * 0.7
                            }), transparent 60%)`,
                        backgroundSize: "cover",
                      }}
                      className="h-12 w-12 shrink-0 rounded-full border border-border shadow-inner"
                    />
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                        {CATEGORY_LABELS[mat.category] || mat.category}
                      </span>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        {mat.name}
                      </h3>
                      <p className="font-mono text-[11px] text-muted">
                        {mat.skuCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(mat)}
                      className="border border-border bg-background p-2 text-muted hover:border-accent hover:text-accent"
                      title="Editar Material"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(mat.id, mat.name)}
                      className="border border-border bg-background p-2 text-muted hover:border-red-500 hover:text-red-500"
                      title="Eliminar Material"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Parámetros Físicos 3D */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-y border-border py-3 font-mono text-[11px]">
                  <div>
                    <span className="block text-[10px] text-muted">
                      Roughness
                    </span>
                    <span>{mat.roughnessFactor}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted">
                      Metalness
                    </span>
                    <span>{mat.metalnessFactor}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted">
                      Color Hex
                    </span>
                    <span>{mat.colorHex}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between font-mono text-xs">
                <span className="text-foreground">
                  {Number(mat.priceDeltaUsd) > 0
                    ? `+$${Number(mat.priceDeltaUsd).toFixed(2)} USD`
                    : "Incluido ($0.00)"}
                </span>
                <span className="text-muted">
                  {mat.extraLeadDays > 0
                    ? `+${mat.extraLeadDays} días fab.`
                    : "Sin tiempo extra"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR / EDITAR MATERIAL PBR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl border border-border bg-background p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  Shader MeshStandardMaterial
                </p>
                <h2 className="font-serif text-3xl font-normal">
                  {editingId ? `Editar: ${name}` : "Crear Nuevo Material PBR"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`mt-4 border p-3 text-xs ${
                  feedback.type === "ok"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    : "border-red-500/40 bg-red-500/10 text-red-600"
                }`}
              >
                {feedback.msg}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-xs uppercase text-muted">
                    Nombre Comercial del Acabado *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Terciopelo Verde Musgo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-muted">
                    Categoría *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full border border-border bg-surface px-3 py-2 text-sm"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-muted">
                    Código SKU *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MAT-FAB-MUSGO"
                    value={skuCode}
                    onChange={(e) => setSkuCode(e.target.value.toUpperCase())}
                    className="mt-1 w-full border border-border bg-surface px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-muted">
                    Recargo Precio ($ USD)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={priceDeltaUsd}
                    onChange={(e) => setPriceDeltaUsd(Number(e.target.value))}
                    className="mt-1 w-full border border-border bg-surface px-3 py-2 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-muted">
                    Días Extra Fabricación
                  </label>
                  <input
                    type="number"
                    value={extraLeadDays}
                    onChange={(e) => setExtraLeadDays(Number(e.target.value))}
                    className="mt-1 w-full border border-border bg-surface px-3 py-2 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Propiedades Físicas Three.js */}
              <div className="border border-border bg-surface p-4">
                <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground">
                  <Palette className="h-4 w-4 text-accent" />
                  Parámetros Visuales 3D (Color, Rugosidad y Metalicidad)
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted">
                      Color Base (Hex)
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="h-9 w-12 cursor-pointer border border-border bg-background p-0.5"
                      />
                      <input
                        type="text"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="w-full border border-border bg-background px-2.5 py-1.5 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted">
                      Roughness ({roughnessFactor})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={roughnessFactor}
                      onChange={(e) =>
                        setRoughnessFactor(Number(e.target.value))
                      }
                      className="mt-3 w-full accent-accent"
                    />
                    <span className="font-mono text-[10px] text-muted">
                      0 = Espejo / Pulido · 1 = Mate
                    </span>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted">
                      Metalness ({metalnessFactor})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={metalnessFactor}
                      onChange={(e) =>
                        setMetalnessFactor(Number(e.target.value))
                      }
                      className="mt-3 w-full accent-accent"
                    />
                    <span className="font-mono text-[10px] text-muted">
                      0 = Madera/Tela · 1 = Metal Puro
                    </span>
                  </div>
                </div>

                {/* Mapas de Textura Opcionales */}
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted">
                      Mapa Albedo / Textura Difusa (Opcional)
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="URL de textura o sube una imagen..."
                        value={albedoMapUrl}
                        onChange={(e) => setAlbedoMapUrl(e.target.value)}
                        className="flex-1 border border-border bg-background px-2.5 py-1.5 font-mono text-xs"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-1 border border-border bg-background px-3 py-1.5 font-mono text-xs uppercase hover:border-foreground">
                        <Upload className="h-3.5 w-3.5 text-accent" />
                        {uploadingMap === "albedo" ? "..." : "Subir"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadTexture(e, "albedo")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-muted">
                        Normal Map (Relieve Opcional)
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={normalMapUrl}
                          onChange={(e) => setNormalMapUrl(e.target.value)}
                          className="flex-1 border border-border bg-background px-2 py-1 font-mono text-xs"
                        />
                        <label className="inline-flex cursor-pointer items-center border border-border bg-background px-2.5 py-1 font-mono text-xs">
                          <Upload className="h-3 w-3" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadTexture(e, "normal")}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-muted">
                        Repetición UV (Escala Textura)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={textureRepeat}
                        onChange={(e) =>
                          setTextureRepeat(Number(e.target.value))
                        }
                        className="mt-1 w-full border border-border bg-background px-2.5 py-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                  />
                  Material disponible en el configurador 3D
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="border border-border px-4 py-2.5 font-mono text-xs uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-foreground px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-background hover:bg-accent hover:text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar Material PBR"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}