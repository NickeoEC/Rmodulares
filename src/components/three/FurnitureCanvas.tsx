"use client";

import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  RoundedBox,
  Html,
} from "@react-three/drei";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";
import { DynamicModel } from "./DynamicModel";
import { RotateCcw, Maximize2, Ruler } from "lucide-react";

interface FurnitureCanvasProps {
  modelGlbUrl: string;
  productName: string;
}

/**
 * Modelo 3D Paramétrico para pruebas locales inmediatas cuando aún no se sube un .glb externo
 */
function ProceduralModularSofa() {
  const meshMaterials = useConfiguratorStore((s) => s.meshMaterials);
  const selectedSize = useConfiguratorStore((s) => s.selectedSize);

  const tapiz = meshMaterials["mesh_tapiz"] || {
    colorHex: "#DCD6CC",
    roughnessFactor: 0.85,
    metalnessFactor: 0.0,
  };
  const estructura = meshMaterials["mesh_estructura"] || {
    colorHex: "#B8997A",
    roughnessFactor: 0.65,
    metalnessFactor: 0.0,
  };

  const scaleX = selectedSize?.scaleX ?? 1.0;
  const scaleY = selectedSize?.scaleY ?? 1.0;
  const scaleZ = selectedSize?.scaleZ ?? 1.0;

  return (
    <group scale={[scaleX, scaleY, scaleZ]} position={[0, -0.45, 0]}>
      {/* ESTRUCTURA DE MADERA (mesh_estructura) */}
      <RoundedBox
        args={[2.2, 0.14, 1.0]}
        radius={0.02}
        position={[0, 0.18, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={estructura.colorHex}
          roughness={estructura.roughnessFactor}
          metalness={estructura.metalnessFactor}
        />
      </RoundedBox>

      {/* 4 Patas de Madera */}
      {[
        [-1.0, 0.06, 0.42],
        [1.0, 0.06, 0.42],
        [-1.0, 0.06, -0.42],
        [1.0, 0.06, -0.42],
      ].map((pos, idx) => (
        <mesh
          key={idx}
          position={pos as [number, number, number]}
          castShadow
        >
          <cylinderGeometry args={[0.035, 0.025, 0.22, 24]} />
          <meshStandardMaterial
            color={estructura.colorHex}
            roughness={estructura.roughnessFactor}
          />
        </mesh>
      ))}

      {/* TAPIZADO PRINCIPAL (mesh_tapiz) - Cojines de asiento */}
      <RoundedBox
        args={[1.02, 0.22, 0.88]}
        radius={0.05}
        position={[-0.52, 0.36, 0.02]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={tapiz.colorHex}
          roughness={tapiz.roughnessFactor}
          metalness={tapiz.metalnessFactor}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.02, 0.22, 0.88]}
        radius={0.05}
        position={[0.52, 0.36, 0.02]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={tapiz.colorHex}
          roughness={tapiz.roughnessFactor}
          metalness={tapiz.metalnessFactor}
        />
      </RoundedBox>

      {/* Respaldo Tapizado */}
      <RoundedBox
        args={[2.06, 0.48, 0.22]}
        radius={0.06}
        position={[0, 0.64, -0.36]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={tapiz.colorHex}
          roughness={tapiz.roughnessFactor}
          metalness={tapiz.metalnessFactor}
        />
      </RoundedBox>

      {/* Brazos Laterales Modulares */}
      <RoundedBox
        args={[0.18, 0.42, 0.94]}
        radius={0.04}
        position={[-1.08, 0.46, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={tapiz.colorHex}
          roughness={tapiz.roughnessFactor}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.18, 0.42, 0.94]}
        radius={0.04}
        position={[1.08, 0.46, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={tapiz.colorHex}
          roughness={tapiz.roughnessFactor}
        />
      </RoundedBox>
    </group>
  );
}

export function FurnitureCanvas({
  modelGlbUrl,
  productName,
}: FurnitureCanvasProps) {
  const [showDimensions, setShowDimensions] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const selectedSize = useConfiguratorStore((s) => s.selectedSize);

  // Si la URL es externa (Cloudinary), carga el archivo .glb real; si es la ruta demo local, usa el modelo paramétrico
  const isExternalGlb = modelGlbUrl.startsWith("http");

  return (
    <div className="relative h-[460px] w-full overflow-hidden border border-border bg-surface sm:h-[600px]">
      {/* Etiqueta Superior Izquierda */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-1">
        <span className="inline-block bg-background/90 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-foreground backdrop-blur-md">
          Estudio 3D Interactivo · {productName}
        </span>
        {selectedSize && showDimensions && (
          <span className="inline-block bg-accent/90 px-3 py-1 font-mono text-[11px] text-white backdrop-blur-md">
            Cotas: {selectedSize.widthCm} cm (Ancho) × {selectedSize.depthCm} cm
            (Prof.) × {selectedSize.heightCm} cm (Alto) · {selectedSize.weightKg} kg
          </span>
        )}
      </div>

      {/* Controles Flotantes del Visor */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs uppercase transition ${
            autoRotate
              ? "border-accent bg-accent text-white"
              : "border-border bg-background/90 text-foreground backdrop-blur-md hover:border-foreground"
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Rotación 360°
        </button>

        <button
          type="button"
          onClick={() => setShowDimensions(!showDimensions)}
          className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs uppercase transition ${
            showDimensions
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background/90 text-foreground backdrop-blur-md"
          }`}
        >
          <Ruler className="h-3.5 w-3.5" />
          Cotas (cm)
        </button>
      </div>

      {/* Lienzo WebGL (React Three Fiber) */}
      <Canvas
        shadows
        camera={{ position: [2.6, 1.8, 2.8], fov: 38 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 3, -4]} intensity={0.5} />

        <Suspense
          fallback={
            <Html center>
              <div className="border border-border bg-background px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground shadow-lg">
                Cargando Geometría 3D...
              </div>
            </Html>
          }
        >
          {isExternalGlb ? (
            <DynamicModel modelGlbUrl={modelGlbUrl} />
          ) : (
            <ProceduralModularSofa />
          )}

          <ContactShadows
            position={[0, -0.46, 0]}
            opacity={0.45}
            scale={8}
            blur={2.2}
            far={4}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={1.6}
          maxDistance={5.5}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}