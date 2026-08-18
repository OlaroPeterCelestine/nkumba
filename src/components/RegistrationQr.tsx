import { APP_URL } from "@/lib/app-url";
import { createRegistrationQrDataUrl } from "@/lib/registration-qr";

export default async function RegistrationQr() {
  const qrImage = await createRegistrationQrDataUrl(APP_URL);

  return (
    <section className="card qr-card">
      <div className="qr-frame">
        <img
          src={qrImage}
          alt="QR code for the Nkumba registration page"
          width={480}
          height={480}
        />
      </div>
      <div>
        <p className="page-kicker">QR code</p>
        <h2>Scan this code</h2>
        <p>
          Point a phone camera at this code to open the live registration page.
        </p>
        <a className="qr-link" href={APP_URL}>
          {APP_URL.replace(/^https?:\/\//, "")}
        </a>
        <a className="qr-download" href={qrImage} download="nkumba-registration-qr.png">
          Download QR image
        </a>
      </div>
    </section>
  );
}
