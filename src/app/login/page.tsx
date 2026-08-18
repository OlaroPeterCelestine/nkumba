import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Admin login",
};

export default function LoginPage() {
  return (
    <main className="page-shell">
      <div className="home-stack">
        <section className="card header-card">
          <p className="page-kicker">Admin</p>
          <h1>Login</h1>
          <p className="lede">
            Sign in to open the registrations dashboard.
          </p>
        </section>
        <section className="card form-card">
          <Suspense>
            <LoginForm />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
