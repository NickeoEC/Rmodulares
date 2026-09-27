import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [lookbooks, products] = await Promise.all([
    prisma.lookbook.findMany({
      include: {
        scenes: {
          orderBy: { sortOrder: "asc" },
          include: {
            hotspots: {
              include: {
                product: {
                  select: { id: true, name: true, slug: true, basePriceUsd: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, basePriceUsd: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ lookbooks, products });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      seasonTag,
      excerpt,
      editorialMd,
      coverImage,
      isPublished,
      scenes = [],
    } = body;

    if (!title || !slug || !coverImage) {
      return NextResponse.json(
        { error: "Título, slug e imagen de portada son obligatorios." },
        { status: 400 }
      );
    }

    const created = await prisma.lookbook.create({
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        seasonTag: seasonTag?.trim() || "Editorial 2026",
        excerpt: excerpt?.trim() || "",
        editorialMd: editorialMd?.trim() || "",
        coverImage: coverImage.trim(),
        isPublished: Boolean(isPublished),
        scenes: {
          create: scenes.map((sc: any, idx: number) => ({
            imageUrl: sc.imageUrl,
            caption: sc.caption || null,
            sortOrder: idx + 1,
            hotspots: {
              create: (sc.hotspots || []).map((h: any) => ({
                productId: h.productId,
                xPercent: Number(Number(h.xPercent).toFixed(2)),
                yPercent: Number(Number(h.yPercent).toFixed(2)),
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json({ success: true, lookbook: created });
  } catch (error: any) {
    console.error("Error creando lookbook:", error);
    return NextResponse.json(
      { error: error?.message || "No se pudo crear el lookbook." },
      { status: 500 }
    );
  }
}