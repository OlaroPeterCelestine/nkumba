import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { parseRegistration } from "@/lib/registration";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = parseRegistration(body);

  if (parsed.errors || !parsed.data) {
    return NextResponse.json(
      { message: "Please correct the highlighted fields.", errors: parsed.errors },
      { status: 400 },
    );
  }

  try {
    const registration = await prisma.registration.create({
      data: parsed.data,
    });

    return NextResponse.json(
      {
        message: "Registration saved.",
        registration,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "This email is already registered.",
          errors: { email: "This email is already registered." },
        },
        { status: 409 },
      );
    }

    console.error("Failed to save registration", error);
    return NextResponse.json(
      { message: "Could not save your registration. Please try again." },
      { status: 500 },
    );
  }
}
