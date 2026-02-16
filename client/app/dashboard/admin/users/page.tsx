import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyName: true,
      country: true,
      verified: true,
      createdAt: true,
    },
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Account oversight and verification status.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Name</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Email</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Role</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Company</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Country</th>
                  <th className="text-right px-4 py-3 font-black uppercase tracking-widest text-[11px]">Verified</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.companyName || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.country || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          "inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest " +
                          (u.verified
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        {u.verified ? "yes" : "no"}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-muted-foreground" colSpan={6}>
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
