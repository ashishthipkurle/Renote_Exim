import Link from "next/link";

import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      originCountry: true,
      price: true,
      available: true,
      exporter: { select: { companyName: true, name: true } },
    },
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">All Products</h1>
          <p className="text-sm text-muted-foreground">Moderate and monitor marketplace listings.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Product</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Category</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Origin</th>
                  <th className="text-right px-4 py-3 font-black uppercase tracking-widest text-[11px]">Price</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Exporter</th>
                  <th className="text-right px-4 py-3 font-black uppercase tracking-widest text-[11px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">
                      <Link href={`/products/${p.id}`} className="hover:text-primary">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.originCountry}</td>
                    <td className="px-4 py-3 text-right font-bold">${Math.round(p.price)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.exporter.companyName || p.exporter.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          "inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest " +
                          (p.available
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive")
                        }
                      >
                        {p.available ? "active" : "paused"}
                      </span>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-muted-foreground" colSpan={6}>
                      No products yet.
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
