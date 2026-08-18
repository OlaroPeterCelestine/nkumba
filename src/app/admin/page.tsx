import prisma from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import { requireAdminSession } from "@/lib/require-admin";

export const metadata = {
  title: "Registrations dashboard",
};

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminPage() {
  await requireAdminSession();

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page-shell dashboard-shell">
      <section className="card dashboard-card">
        <header className="dashboard-header">
          <div>
            <p className="page-kicker">Manager</p>
            <h1>Registrations</h1>
            <p className="lede">
              {registrations.length}{" "}
              {registrations.length === 1 ? "record" : "records"}
            </p>
          </div>
          <LogoutButton />
        </header>

        {registrations.length === 0 ? (
          <p className="empty-state">No registrations yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="col-num">#</th>
                  <th>Full name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Institution</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((row, index) => (
                  <tr key={row.id}>
                    <td className="col-num">{index + 1}</td>
                    <td className="col-wrap">{row.fullName}</td>
                    <td className="col-wrap">{row.phone}</td>
                    <td className="col-wrap">{row.email}</td>
                    <td className="col-wrap">{row.institution}</td>
                    <td className="col-date">{formatDate(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
