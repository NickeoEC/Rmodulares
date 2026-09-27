"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  ExternalLink,
  X,
  Crosshair,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface ProductSimple {
  id: string;
  name: string;
  slug: string;
  basePriceUsd: number;
}

interface EditableHotspot {
  productId: string;
  xPercent: number;
  yPercent: number;
}

interface EditableScene {
  imageUrl: string;
  caption: string;
  hotspots: EditableHotspot[];
}

export default function AdminLookbooksPage() {
  const [lookbooks, setLookbooks] = useState<any[]>([]);
  const [products, setProducts] = useState<ProductSimple[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado del Modal Editor Visual
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Campos del Lookbook
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [seasonTag, setSeasonTag] = useState("Editorial 02 / 2026");
  const [excerpt, setExcerpt] = useState("");
  const [editorialMd, setEditorialMd] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [scenes, setScenes] = useState<EditableScene[]>([]);

  // Producto activo para colocar pines al hacer clic en la imagen
  const [selectedProductForPin, setSelectedProductForPin] =
    useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/lookbooks");
    const data = await res.json();
    if (data.lookbooks) setLookbooks(data.lookbooks);
    if (data.products) {
      setProducts(data.products);
      if (data.products.length > 0 && !selectedProductForPin) {
        setSelectedProductForPin(data.products[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const openCreateEditor = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSeasonTag("Editorial 02 / 2026");
    setExcerpt("");
    setEditorialMd("");
    setCoverImage(
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80"
    );
    setIsPublished(true);
    setScenes([
      {
        imageUrl:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80",
        caption: "Escena Principal — Haz clic sobre la foto para añadir pines",
        hotspots: [],
      },
    ]);
    setIsEditorOpen(true);
  };

  const openEditEditor = (lb: any) => {
    setEditingId(lb.id);
    setTitle(lb.title);
    setSlug(lb.slug);
    setSeasonTag(lb.seasonTag || "");
    setExcerpt(lb.excerpt || "");
    setEditorialMd(lb.editorialMd || "");
    setCoverImage(lb.coverImage);
    setIsPublished(Boolean(lb.isPublished));
    setScenes(
      (lb.scenes || []).map((sc: any) => ({
        imageUrl: sc.imageUrl,
        caption: sc.caption || "",
        hotspots: (sc.hotspots || []).map((h: any) => ({
          productId: h.productId,
          xPercent: h.xPercent,
          yPercent: h.yPercent,
        })),
      }))
    );
    setIsEditorOpen(true);
  };

  // Subida de fotografía de portada o escena
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "cover" | number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (target === "cover") {
          setCoverImage(data.url);
        } else {
          setScenes((prev) =>
            prev.map((sc, idx) =>
              idx === target ? { ...sc, imageUrl: data.url } : sc
            )
          );
        }
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Posicionador interactivo: Calcula X% e Y% al hacer clic sobre la imagen de la escena
  const handleSceneImageClick = (
    e: React.MouseEvent<HTMLDivElement>,
    sceneIndex: number
  ) => {
    if (!selectedProductForPin) {
      alert("Selecciona primero un mueble del catálogo para colocar el pin.");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    setScenes((prev) =>
      prev.map((sc, idx) => {
        if (idx !== sceneIndex) return sc;
        return {
          ...sc,
          hotspots: [
            ...sc.hotspots,
            {
              productId: selectedProductForPin,
              xPercent: Number(xPercent.toFixed(1)),
              yPercent: Number(yPercent.toFixed(1)),
            },
          ],
        };
      })
    );
  };

  const removeHotspot = (sceneIndex: number, hotspotIndex: number) => {
    setScenes((prev) =>
      prev.map((sc, idx) => {
        if (idx !== sceneIndex) return sc;
        return {
          ...sc,
          hotspots: sc.hotspots.filter((_, hIdx) => hIdx !== hotspotIndex),
        };
      })
    );
  };

  const handleSaveLookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = editingId
      ? `/api/admin/lookbooks/${editingId}`
      : "/api/admin/lookbooks";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        seasonTag,
        excerpt,
        editorialMd,
        coverImage,
        isPublished,
        scenes,
      }),
    });

    setSaving(false);
    if (res.ok) {
      await fetchData();
      setIsEditorOpen(false);
    } else {
      const err = await res.json();
      alert(err.error || "Error al guardar el Lookbook.");
    }
  };

  const handleDeleteLookbook = async (id: string, lbTitle: string) => {
    if (!confirm(`¿Eliminar el Lookbook "${lbTitle}"?`)) return;
    const res = await fetch(`/api/admin/lookbooks/${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchData();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Inspiración Editorial & Shop the Look
          </p>
          <h1 className="mt-1 font-serif text-4xl font-normal">
            Editor Visual de Lookbooks y Hotspots
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateEditor}
          className="inline-flex items-center gap-2 bg-foreground px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-accent hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Crear Nuevo Lookbook
        </button>
      </div>

      {/* Grilla de Lookbooks */}
      {loading ? (
        <p className="py-12 text-center font-mono text-xs uppercase text-muted">
          Cargando lookbooks...
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {lookbooks.map((lb) => {
            const totalPins = (lb.scenes || []).reduce(
              (acc: number, s: any) => acc + (s.hotspots?.length || 0),
              0
            );
            return (
              <div
                key={lb.id}
                className="flex flex-col justify-between border border-border bg-surface p-5"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden border border-border bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lb.coverImage}
                      alt={lb.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 bg-background/90 px-2.5 py-1 font-mono text-[10px] uppercase">
                      {lb.seasonTag} · {lb.scenes?.length || 0} escenas ·{" "}
                      {totalPins} hotspots
                    </span>
                  </div>

                  <h2 className="mt-4 font-serif text-2xl font-medium">
                    {lb.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {lb.excerpt}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span
                    className={`font-mono text-[10px] uppercase ${
                      lb.isPublished ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {lb.isPublished ? "● Publicado" : "○ Borrador"}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/lookbooks/${lb.slug}`}
                      target="_blank"
                      className="border border-border bg-background p-2 text-muted hover:text-foreground"
                      title="Ver Lookbook Público"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditEditor(lb)}
                      className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 font-mono text-xs uppercase hover:border-accent hover:text-accent"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar Hotspots
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLookbook(lb.id, lb.title)}
                      className="border border-border bg-background p-2 text-muted hover:border-red-500 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL EDITOR VISUAL DE HOTSPOTS */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8">
          <div className="mx-auto max-w-5xl border border-border bg-background p-6 shadow-2xl sm:p-10">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  Editor Interactivo Shop-The-Look
                </p>
                <h2 className="font-serif text-3xl font-normal">
                  {editingId ? `Editar: ${title}` : "Nuevo Reportaje Lookbook"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-muted hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveLookbook} className="mt-6 space-y-8">
              {/* Datos Editoriales */}
              <div className="grid grid-cols-1 gap-4 border border-border bg-surface p-5 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-xs uppercase text-muted">
                    Título Editorial *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
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
                    className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-muted">
                    Etiqueta de Temporada
                  </label>
                  <input
                    type="text"
                    value={seasonTag}
                    onChange={(e) => setSeasonTag(e.target.value)}
                    className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-xs uppercase text-muted">
                    Imagen de Portada *
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      required
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="flex-1 border border-border bg-background px-3 py-2 font-mono text-xs"
                    />
                    <label className="inline-flex cursor-pointer items-center gap-1 bg-foreground px-3 py-2 font-mono text-xs uppercase text-background">
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "..." : "Subir"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "cover")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-mono text-xs uppercase text-muted">
                    Resumen Corto (Excerpt)
                  </label>
                  <input
                    type="text"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-mono text-xs uppercase text-muted">
                    Cuerpo del Artículo Editorial
                  </label>
                  <textarea
                    rows={3}
                    value={editorialMd}
                    onChange={(e) => setEditorialMd(e.target.value)}
                    className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* BARRA DE HERRAMIENTAS PARA COLOCAR HOTSPOTS */}
              <div className="border border-accent/40 bg-accent/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Crosshair className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-mono text-xs font-medium uppercase text-foreground">
                        Posicionador Visual de Hotspots
                      </p>
                      <p className="text-xs text-muted">
                        1. Elige un mueble a la derecha · 2. Haz clic sobre el
                        mueble dentro de la fotografía de abajo para fijar el
                        punto (+).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase text-muted">
                      Mueble a vincular:
                    </span>
                    <select
                      value={selectedProductForPin}
                      onChange={(e) => setSelectedProductForPin(e.target.value)}
                      className="border border-border bg-background px-3 py-2 text-xs font-medium text-foreground"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${Number(p.basePriceUsd).toFixed(2)} USD)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ESCENAS FOTOGRÁFICAS INTERACTIVAS */}
              <div className="space-y-6">
                {scenes.map((scene, sIdx) => (
                  <div
                    key={sIdx}
                    className="border border-border bg-surface p-5"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-serif text-xl font-medium">
                        Escena Fotográfica #{sIdx + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setScenes((prev) =>
                            prev.filter((_, i) => i !== sIdx)
                          )
                        }
                        className="font-mono text-xs uppercase text-red-500"
                      >
                        Eliminar Escena
                      </button>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="font-mono text-[10px] uppercase text-muted">
                          URL de la Fotografía de Ambiente
                        </label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="text"
                            value={scene.imageUrl}
                            onChange={(e) =>
                              setScenes((prev) =>
                                prev.map((sc, i) =>
                                  i === sIdx
                                    ? { ...sc, imageUrl: e.target.value }
                                    : sc
                                )
                              )
                            }
                            className="flex-1 border border-border bg-background px-2.5 py-1.5 font-mono text-xs"
                          />
                          <label className="inline-flex cursor-pointer items-center border border-border bg-background px-3 py-1.5 font-mono text-xs uppercase">
                            <Upload className="mr-1 h-3.5 w-3.5" />
                            Subir Foto
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, sIdx)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="font-mono text-[10px] uppercase text-muted">
                          Pie de Foto (Caption)
                        </label>
                        <input
                          type="text"
                          value={scene.caption}
                          onChange={(e) =>
                            setScenes((prev) =>
                              prev.map((sc, i) =>
                                i === sIdx
                                  ? { ...sc, caption: e.target.value }
                                  : sc
                              )
                            )
                          }
                          className="mt-1 w-full border border-border bg-background px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>

                    {/* LIENZO CLICABLE PARA COLOCAR HOTSPOTS */}
                    <div
                      onClick={(e) => handleSceneImageClick(e, sIdx)}
                      className="relative aspect-[16/10] w-full cursor-crosshair overflow-hidden border border-border bg-background"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={scene.imageUrl}
                        alt={scene.caption}
                        className="h-full w-full select-none object-cover"
                      />

                      {scene.hotspots.map((spot, hIdx) => {
                        const prodName =
                          products.find((p) => p.id === spot.productId)?.name ||
                          "Mueble";
                        return (
                          <div
                            key={hIdx}
                            style={{
                              left: `${spot.xPercent}%`,
                              top: `${spot.yPercent}%`,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                          >
                            <div className="flex items-center gap-1 rounded-full border border-accent bg-background/95 px-2.5 py-1 font-mono text-[10px] text-foreground shadow-lg">
                              <span className="font-bold text-accent">
                                #{hIdx + 1}
                              </span>
                              <span>{prodName}</span>
                              <button
                                type="button"
                                onClick={() => removeHotspot(sIdx, hIdx)}
                                className="ml-1 text-red-500 hover:text-red-700"
                                title="Quitar pin"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setScenes((prev) => [
                      ...prev,
                      {
                        imageUrl:
                          "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1600&q=80",
                        caption: `Escena #${prev.length + 1}`,
                        hotspots: [],
                      },
                    ])
                  }
                  className="border border-border bg-surface px-4 py-2.5 font-mono text-xs uppercase hover:border-foreground"
                >
                  + Añadir Otra Escena Fotográfica
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-6">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  Publicar inmediatamente en /lookbooks
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="border border-border px-5 py-2.5 font-mono text-xs uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-foreground px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-background hover:bg-accent hover:text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar Lookbook y Hotspots"}
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