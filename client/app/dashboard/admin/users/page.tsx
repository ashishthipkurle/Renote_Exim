import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Users</h1>
            <p className="text-sm text-muted-foreground">Account oversight and verification status.</p>
          </div>
          <span className="text-sm text-muted-foreground">{total} total</span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/dashboard/admin/users?page=${page - 1}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                  >
                    ← Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/dashboard/admin/users?page=${page + 1}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
