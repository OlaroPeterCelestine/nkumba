import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Admin login",
};

export default function LoginPage() {
  return (
    <main className="page-shell">
      <section className="card header-card">
        <p className="page-kicker">Secure access</p>
        <h1>Dashboard login</h1>
        <p className="lede">
          Sign in with your admin username and password to view registrations.
        </p>
      </section>
      <section className="card form-card">
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
