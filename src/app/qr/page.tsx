import RegistrationQr from "@/components/RegistrationQr";

export const metadata = {
  title: "Registration QR code",
};

export const dynamic = "force-dynamic";

export default function QrPage() {
  return (
    <main className="page-shell">
      <div className="home-stack">
        <RegistrationQr />
      </div>
    </main>
  );
}
