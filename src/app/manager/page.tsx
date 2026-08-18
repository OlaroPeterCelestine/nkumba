import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Manager login",
};

export default function ManagerLoginPage() {
  return (
    <main className="page-shell">
      <section className="card header-card">
        <p className="page-kicker">Manager access</p>
        <h1>Login</h1>
        <p className="lede">
          Sign in with your manager username and password to view registrations.
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
