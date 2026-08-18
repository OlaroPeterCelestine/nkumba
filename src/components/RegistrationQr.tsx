import QRCode from "qrcode";
import { APP_URL } from "@/lib/app-url";

export default async function RegistrationQr() {
  const svg = await QRCode.toString(APP_URL, {
    type: "svg",
    margin: 1,
    width: 180,
    color: {
      dark: "#4a3728",
      light: "#ffffff",
    },
  });

  return (
    <section className="card qr-card">
      <div
        className="qr-frame"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div>
        <p className="page-kicker">Scan to register</p>
        <h2>Open the form</h2>
        <p>
          Point a phone camera at this code to open the live registration page.
        </p>
        <a className="qr-link" href={APP_URL}>
          {APP_URL.replace(/^https?:\/\//, "")}
        </a>
      </div>
    </section>
  );
}
