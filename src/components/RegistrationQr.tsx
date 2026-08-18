import { REGISTRATION_URL } from "@/lib/app-url";
import { createRegistrationQrDataUrl } from "@/lib/registration-qr";

const DISPLAY_URL = REGISTRATION_URL.replace(/^https?:\/\//, "");

export default async function RegistrationQr() {
  const qrImage = await createRegistrationQrDataUrl(REGISTRATION_URL);

  return (
    <section className="card qr-card">
      <div className="qr-frame">
        <img
          src={qrImage}
          alt={`QR code that opens ${REGISTRATION_URL}`}
          width={480}
          height={480}
        />
      </div>
      <div>
        <p className="page-kicker">QR code</p>
        <h2>Scan this code</h2>
        <p>
          Point a phone camera at this code to open {DISPLAY_URL}.
        </p>
        <a className="qr-link" href={REGISTRATION_URL}>
          {DISPLAY_URL}
        </a>
        <a
          className="qr-download"
          href="/nkumba-registration-qr.png"
          download="nkumba-registration-qr.png"
        >
          Download QR image
        </a>
      </div>
    </section>
  );
}
