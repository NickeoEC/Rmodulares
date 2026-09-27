"use client";

import React, { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";

interface DynamicModelProps {
  modelGlbUrl: string;
}

export function DynamicModel({ modelGlbUrl }: DynamicModelProps) {
  const { scene } = useGLTF(modelGlbUrl);
  const meshMaterials = useConfiguratorStore((s) => s.meshMaterials);
  const selectedSize = useConfiguratorStore((s) => s.selectedSize);

  // Clonamos la escena para no mutar la caché global de useGLTF
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const selectedMat = meshMaterials[mesh.name];
        if (selectedMat) {
          const pbrMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(selectedMat.colorHex),
            roughness: selectedMat.roughnessFactor,
            metalness: selectedMat.metalnessFactor,
          });

          // Si el material tiene textura Albedo en Cloudinary, la aplicamos con repetición UV
          if (selectedMat.albedoMapUrl) {
            const map = textureLoader.load(selectedMat.albedoMapUrl);
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(selectedMat.textureRepeat, selectedMat.textureRepeat);
            map.colorSpace = THREE.SRGBColorSpace;
            pbrMaterial.map = map;
          }

          if (selectedMat.normalMapUrl) {
            const normalMap = textureLoader.load(selectedMat.normalMapUrl);
            normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
            normalMap.repeat.set(selectedMat.textureRepeat, selectedMat.textureRepeat);
            pbrMaterial.normalMap = normalMap;
          }

          mesh.material = pbrMaterial;
        }
      }
    });
  }, [clonedScene, meshMaterials, textureLoader]);

  const scale: [number, number, number] = selectedSize
    ? [selectedSize.scaleX, selectedSize.scaleY, selectedSize.scaleZ]
    : [1, 1, 1];

  return <primitive object={clonedScene} scale={scale} />;
}