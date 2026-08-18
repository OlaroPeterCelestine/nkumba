export type RegistrationInput = {
  fullName: string;
  phone: string;
  email: string;
  institution: string;
};

export type RegistrationErrors = Partial<Record<keyof RegistrationInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{8,15}$/;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizePhone(value: string) {
  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function parseRegistration(body: unknown): {
  data?: RegistrationInput;
  errors?: RegistrationErrors;
} {
  if (typeof body !== "object" || body === null) {
    return {
      errors: {
        fullName: "Please fill in all required fields.",
      },
    };
  }

  const input = body as Record<string, unknown>;
  const data: RegistrationInput = {
    fullName: readString(input.fullName),
    phone: normalizePhone(readString(input.phone)),
    email: readString(input.email).toLowerCase(),
    institution: readString(input.institution),
  };

  const errors: RegistrationErrors = {};

  if (data.fullName.length < 2) {
    errors.fullName = "Enter your full name.";
  }

  if (!PHONE_PATTERN.test(data.phone)) {
    errors.phone = "Enter a valid phone number, for example +254 700 000 000.";
  }

  if (!EMAIL_PATTERN.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (data.institution.length < 2) {
    errors.institution = "Enter your institution.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return { data };
}
