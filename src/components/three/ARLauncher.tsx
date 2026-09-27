"use client";

import React, { useState } from "react";
import { Smartphone, X, QrCode, Sparkles } from "lucide-react";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";

interface ARLauncherProps {
  productName: string;
  modelGlbUrl: string;
  modelUsdzUrl?: string | null;
}

export function ARLauncher({
  productName,
  modelGlbUrl,
  modelUsdzUrl,
}: ARLauncherProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const selectedSize = useConfiguratorStore((s) => s.selectedSize);
  const meshMaterials = useConfiguratorStore((s) => s.meshMaterials);

  // Construir Intent nativo para Android Scene Viewer e iOS Quick Look
  const handleMobileARLaunch = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS && modelUsdzUrl) {
      const anchor = document.createElement("a");
      anchor.setAttribute("rel", "ar");
      anchor.setAttribute("href", modelUsdzUrl);
      anchor.click();
      return;
    }

    if (isAndroid && modelGlbUrl.startsWith("http")) {
      const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
        modelGlbUrl
      )}&mode=ar_only&title=${encodeURIComponent(
        productName
      )}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`;
      window.location.href = intentUrl;
      return;
    }

    // En Desktop o modo local, abrimos el asistente AR con resumen de escala real
    setModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleMobileARLaunch}
        className="mt-3 flex w-full items-center justify-center gap-2 border border-accent/50 bg-accent/10 py-3 font-mono text-xs uppercase tracking-widest text-accent transition hover:bg-accent hover:text-white"
      >
        <Smartphone className="h-4 w-4" />
        Ver en mi espacio (Realidad Aumentada AR)
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md border border-border bg-background p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              WebXR · Escala Real 1:1
            </div>

            <h3 className="mt-2 font-serif text-2xl text-foreground">
              Proyectar {productName} en tu Sala
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-muted">
              Abre esta página desde la cámara de tu teléfono (iOS Safari para{" "}
              <strong>Apple Quick Look</strong> o Android Chrome para{" "}
              <strong>Google Scene Viewer</strong>) para posicionar el mueble en
              tu piso a escala real sin instalar aplicaciones.
            </p>

            <div className="mt-5 flex flex-col items-center justify-center border border-border bg-surface p-6 text-center">
              <QrCode className="h-24 w-24 text-foreground" />
              <p className="mt-3 font-mono text-xs text-foreground">
                Escala configurada:{" "}
                {selectedSize
                  ? `${selectedSize.widthCm} × ${selectedSize.depthCm} × ${selectedSize.heightCm} cm`
                  : "Estándar"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted">
                Acabados activos:{" "}
                {Object.values(meshMaterials)
                  .map((m) => m.name)
                  .join(" + ")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="mt-5 w-full bg-foreground py-3 font-mono text-xs uppercase tracking-widest text-background"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}