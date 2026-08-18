import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import {
  parseRegistration,
  type RegistrationErrors,
  type RegistrationInput,
} from "@/lib/registration";

const DUPLICATE_MESSAGES: Record<keyof RegistrationInput, string> = {
  fullName: "This name is already registered.",
  phone: "This phone number is already registered.",
  email: "This email is already registered.",
  institution: "This institution is already registered.",
};

function duplicateErrors(
  error: Prisma.PrismaClientKnownRequestError,
): RegistrationErrors {
  const target = error.meta?.target;
  const names = Array.isArray(target)
    ? target
    : typeof target === "string"
      ? [target]
      : ["email"];

  const errors: RegistrationErrors = {};

  for (const name of names) {
    if (name === "email" || name === "phone") {
      errors[name] = DUPLICATE_MESSAGES[name];
    }
  }

  if (!errors.email && !errors.phone) {
    errors.email = DUPLICATE_MESSAGES.email;
  }

  return errors;
}

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
      {
        message: "Please correct the highlighted fields.",
        errors: parsed.errors,
      },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.registration.findMany({
      where: {
        OR: [{ email: parsed.data.email }, { phone: parsed.data.phone }],
      },
      select: { email: true, phone: true },
    });

    if (existing.length > 0) {
      const errors: RegistrationErrors = {};

      if (existing.some((row) => row.email === parsed.data.email)) {
        errors.email = DUPLICATE_MESSAGES.email;
      }

      if (existing.some((row) => row.phone === parsed.data.phone)) {
        errors.phone = DUPLICATE_MESSAGES.phone;
      }

      return NextResponse.json(
        {
          message: "This person is already registered.",
          errors,
        },
        { status: 409 },
      );
    }

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
      const errors = duplicateErrors(error);
      return NextResponse.json(
        {
          message: "This person is already registered.",
          errors,
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
