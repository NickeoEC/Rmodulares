import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const lookbookId = params.id;
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

    const updated = await prisma.$transaction(async (tx) => {
      // Reemplazar escenas y sus hotspots con la configuración visual actual
      await tx.lookbookScene.deleteMany({ where: { lookbookId } });

      return tx.lookbook.update({
        where: { id: lookbookId },
        data: {
          title: title.trim(),
          slug: slug.trim().toLowerCase(),
          seasonTag: seasonTag?.trim() || null,
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
    });

    return NextResponse.json({ success: true, lookbook: updated });
  } catch (error: any) {
    console.error("Error actualizando lookbook:", error);
    return NextResponse.json(
      { error: error?.message || "No se pudo actualizar el lookbook." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.lookbook.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando lookbook:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el lookbook." },
      { status: 500 }
    );
  }
}