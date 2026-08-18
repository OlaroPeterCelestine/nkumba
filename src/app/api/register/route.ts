import { NextResponse } from "next/server";
import {
  getPrisma,
  isDatabaseConnectionError,
  resetPrisma,
} from "@/lib/prisma";
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

function errorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    return String(error.code);
  }

  return "";
}

function errorTarget(error: unknown) {
  if (error && typeof error === "object" && "meta" in error) {
    const meta = error.meta as { target?: unknown } | undefined;
    return meta?.target;
  }

  return undefined;
}

function duplicateErrors(target: unknown): RegistrationErrors {
  const names: string[] = Array.isArray(target)
    ? target.map((value) => String(value))
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

async function saveRegistration(data: RegistrationInput) {
  const prisma = getPrisma();
  const existing = await prisma.registration.findMany({
    where: {
      OR: [{ email: data.email }, { phone: data.phone }],
    },
    select: { email: true, phone: true },
  });

  if (existing.length > 0) {
    const errors: RegistrationErrors = {};

    if (existing.some((row) => row.email === data.email)) {
      errors.email = DUPLICATE_MESSAGES.email;
    }

    if (existing.some((row) => row.phone === data.phone)) {
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

  const registration = await prisma.registration.create({ data });

  return NextResponse.json(
    {
      message: "Registration saved.",
      registration,
    },
    { status: 201 },
  );
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

  const data = parsed.data;

  try {
    return await saveRegistration(data);
  } catch (error) {
    if (errorCode(error) === "P2002") {
      return NextResponse.json(
        {
          message: "This person is already registered.",
          errors: duplicateErrors(errorTarget(error)),
        },
        { status: 409 },
      );
    }

    if (isDatabaseConnectionError(error)) {
      try {
        await resetPrisma();
        return await saveRegistration(data);
      } catch (retryError) {
        if (errorCode(retryError) === "P2002") {
          return NextResponse.json(
            {
              message: "This person is already registered.",
              errors: duplicateErrors(errorTarget(retryError)),
            },
            { status: 409 },
          );
        }

        console.error("Failed to save registration after retry", retryError);
      }
    } else {
      console.error("Failed to save registration", error);
    }

    return NextResponse.json(
      { message: "Could not save your registration. Please try again." },
      { status: 500 },
    );
  }
}
