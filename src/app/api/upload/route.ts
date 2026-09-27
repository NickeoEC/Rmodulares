import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se seleccionó ningún archivo." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name.replace(/\s+/g, "-").toLowerCase();
    const is3DModel =
      originalName.endsWith(".glb") ||
      originalName.endsWith(".gltf") ||
      originalName.endsWith(".usdz") ||
      originalName.endsWith(".hdr");

    // Verificar si las credenciales de Cloudinary son reales o son los placeholders del .env
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const hasRealCloudinary =
      cloudName &&
      apiKey &&
      cloudName !== "tu_cloud_name" &&
      apiKey !== "tu_api_key";

    if (hasRealCloudinary) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: is3DModel ? "rmodulares/models3d" : "rmodulares/images",
            resource_type: is3DModel ? "raw" : "image",
            public_id: `${Date.now()}-${originalName}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        storage: "cloudinary",
      });
    }

    // Fallback automático para desarrollo local sin llaves de Cloudinary
    const subFolder = is3DModel ? "models" : "uploads";
    const uploadDir = path.join(process.cwd(), "public", subFolder);
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${originalName}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/${subFolder}/${fileName}`,
      publicId: `local_${fileName}`,
      storage: "local_public",
    });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return NextResponse.json(
      { error: "Error al procesar la subida del archivo." },
      { status: 500 }
    );
  }
}