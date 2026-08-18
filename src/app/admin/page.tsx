import prisma from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Registrations dashboard",
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminPage() {
  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page-shell dashboard-shell">
      <section className="card header-card">
        <p className="page-kicker">Admin</p>
        <h1>Registrations</h1>
        <p className="lede">
          {registrations.length}{" "}
          {registrations.length === 1 ? "person has" : "people have"} registered.
        </p>
      </section>

      <section className="card form-card">
        {registrations.length === 0 ? (
          <p className="lede">No registrations yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Full name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Institution</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((row) => (
                  <tr key={row.id}>
                    <td>{row.fullName}</td>
                    <td>{row.phone}</td>
                    <td>{row.email}</td>
                    <td>{row.institution}</td>
                    <td>{formatDate(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card footer-card">
        <LogoutButton />
      </section>
    </main>
  );
}
