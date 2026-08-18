import RegistrationForm from "@/components/RegistrationForm";
import RegistrationQr from "@/components/RegistrationQr";

export default function Home() {
  return (
    <main className="page-shell">
      <div className="home-stack">
        <RegistrationForm />
        <RegistrationQr />
      </div>
    </main>
  );
}
