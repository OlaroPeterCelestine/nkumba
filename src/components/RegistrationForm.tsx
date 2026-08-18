"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  parseRegistration,
  type RegistrationErrors,
  type RegistrationInput,
} from "@/lib/registration";

const fields: {
  name: keyof RegistrationInput;
  number: number;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  hint: string;
}[] = [
  {
    name: "fullName",
    number: 1,
    label: "Full name",
    type: "text",
    autoComplete: "name",
    placeholder: "Jane Doe",
    hint: "First and last name",
  },
  {
    name: "phone",
    number: 2,
    label: "Phone",
    type: "tel",
    autoComplete: "tel",
    placeholder: "+254 700 000 000",
    hint: "Include your country code",
  },
  {
    name: "email",
    number: 3,
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "name@institution.edu",
    hint: "Use your institution email if you have one",
  },
  {
    name: "institution",
    number: 4,
    label: "Institution",
    type: "text",
    autoComplete: "organization",
    placeholder: "Nkumba University",
    hint: "School, university, or organisation",
  },
];

const emptyForm: RegistrationInput = {
  fullName: "",
  phone: "",
  email: "",
  institution: "",
};

function Logo() {
  return (
    <div className="brand">
      <svg className="brand-mark" viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r="34" fill="#4a3728" />
        <circle cx="36" cy="36" r="27" fill="#f7f3ec" />
        <text
          x="36"
          y="43"
          textAnchor="middle"
          fill="#4a3728"
          fontSize="18"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          NU
        </text>
      </svg>
      <p className="brand-name">Nkumba University</p>
    </div>
  );
}

export default function RegistrationForm() {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [successName, setSuccessName] = useState("");

  function resetForm() {
    setValues(emptyForm);
    setErrors({});
    setFormError("");
    setSuccessName("");
  }

  useEffect(() => {
    if (!successName) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        resetForm();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [successName]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) {
      return;
    }

    setFormError("");

    const parsed = parseRegistration(values);

    if (parsed.errors || !parsed.data) {
      setErrors(parsed.errors ?? {});
      return;
    }

    setErrors({});
    setPending(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json()) as {
        message?: string;
        errors?: RegistrationErrors;
      };

      if (!response.ok) {
        setErrors(result.errors ?? {});
        setFormError(result.message ?? "Could not save your registration.");
        return;
      }

      setSuccessName(parsed.data.fullName);
      setValues(emptyForm);
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
    <form className="form-stack" onSubmit={handleSubmit} noValidate>
      <section className="card header-card">
        <Logo />
        <h1>Registration</h1>
        <p className="lede">
          Fill in your details below. Fields marked * are required.
        </p>
      </section>

      <section className="card form-card">
        <div className="section-heading">
          <h2>Your details</h2>
          <p>Enter your name, phone, email, and institution.</p>
        </div>

        <div className="field-grid">
          {fields.map((field) => {
            const error = errors[field.name];

            return (
              <label key={field.name} className="field">
                <span className="field-label">
                  {field.number}. {field.label}{" "}
                  <span className="required" aria-hidden="true">
                    *
                  </span>
                </span>
                <input
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    error ? `${field.name}-error` : `${field.name}-hint`
                  }
                  onChange={(event) => {
                    setValues((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }));
                    setErrors((current) => ({
                      ...current,
                      [field.name]: undefined,
                    }));
                    setFormError("");
                  }}
                />
                {error ? (
                  <em id={`${field.name}-error`} className="field-error">
                    {error}
                  </em>
                ) : (
                  <span id={`${field.name}-hint`} className="field-hint">
                    {field.hint}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </section>

      {formError ? <p className="form-error card">{formError}</p> : null}

      <section className="card footer-card">
        <button type="submit" className="submit-button" disabled={pending}>
          {pending ? "Saving…" : "Submit registration"}
        </button>
      </section>
    </form>

    {successName ? (
      <div
        className="modal-backdrop"
        onClick={resetForm}
        role="presentation"
      >
        <div
          className="modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
          aria-describedby="success-copy"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="page-kicker">Registered</p>
          <h2 id="success-title">Thank you, {successName}.</h2>
          <p id="success-copy">
            Your registration has been saved. We will use the email and phone
            number you provided if we need to follow up.
          </p>
          <button type="button" className="submit-button" onClick={resetForm}>
            Close
          </button>
        </div>
      </div>
    ) : null}
    </>
  );
}
