import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, IdentificationType } from "@/lib/prisma";
import {
  validateBillingIdentification,
  IdType,
} from "@/lib/ecuador-validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      identificationType,
      identificationNum,
      phone,
    } = body;

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Completa tu nombre, correo y una contraseña de al menos 6 caracteres.",
        },
        { status: 400 }
      );
    }

    if (identificationType && identificationNum) {
      const check = validateBillingIdentification(
        identificationType as IdType,
        identificationNum
      );
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con este correo." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "CUSTOMER",
        identificationType: identificationType
          ? (identificationType as IdentificationType)
          : null,
        identificationNum: identificationNum?.trim() || null,
        phone: phone?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    console.error("Error registrando usuario:", error);
    return NextResponse.json(
      { error: "No se pudo completar el registro." },
      { status: 500 }
    );
  }
}