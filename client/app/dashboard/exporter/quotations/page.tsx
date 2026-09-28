import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QuotationsAdminPage() {
  const quotations = await prisma.quotationRequest.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/exporter" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Quotation Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all incoming quotation requests from the website.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold border-b border-border">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Products Requested</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No quotation requests found.
                  </td>
                </tr>
              ) : (
                quotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">
                      {format(new Date(quote.createdAt), "MMM d, yyyy")}
                      <div className="text-xs text-muted-foreground font-normal">
                        {format(new Date(quote.createdAt), "h:mm a")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      <div className="font-semibold">{quote.clientName}</div>
                      {quote.businessName && (
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <span className="material-symbols-outlined text-[14px] mr-1">business</span>
                          {quote.businessName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <a href={`mailto:${quote.clientEmail}`} className="hover:text-primary transition-colors flex items-center mb-1">
                        <span className="material-symbols-outlined text-[14px] mr-1">mail</span>
                        {quote.clientEmail}
                      </a>
                      {(quote as any).clientPhone && (
                        <a href={`tel:${(quote as any).clientPhone}`} className="hover:text-primary transition-colors flex items-center">
                          <span className="material-symbols-outlined text-[14px] mr-1">call</span>
                          {(quote as any).clientPhone}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {quote.items.map((item) => (
                          <div key={item.id} className="flex items-center text-xs bg-muted px-2 py-1 rounded">
                            <span className="font-medium text-foreground max-w-[150px] truncate mr-2" title={item.productName}>
                              {item.productName}
                            </span>
                            <span className="text-primary font-bold ml-auto">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          quote.status === "PENDING" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-500" :
                          quote.status === "RESPONDED" ? "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500" :
                          "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500"
                        }`}>
                          {quote.status === "PENDING" && <Clock className="w-3 h-3 mr-1" />}
                          {quote.status !== "PENDING" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {quote.status}
                        </span>
                        
                        <form action={async (formData) => {
                          "use server";
                          const newStatus = formData.get("status") as string;
                          const { revalidatePath } = require("next/cache");
                          await prisma.quotationRequest.update({
                            where: { id: quote.id },
                            data: { status: newStatus }
                          });
                          revalidatePath("/dashboard/exporter/quotations");
                        }}>
                          <select 
                            name="status"
                            className="hidden"
                          />
                        </form>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <form action={async () => {
                          "use server";
                          const { revalidatePath } = require("next/cache");
                          await prisma.quotationRequest.update({
                            where: { id: quote.id },
                            data: { status: "RESPONDED" }
                          });
                          revalidatePath("/dashboard/exporter/quotations");
                        }}>
                          {quote.status !== "RESPONDED" && (
                            <button type="submit" className="text-[10px] uppercase font-bold text-blue-500 hover:text-blue-700 bg-blue-500/10 px-2 py-1 rounded transition-colors">
                              Mark Responded
                            </button>
                          )}
                        </form>

                        <form action={async () => {
                          "use server";
                          const { revalidatePath } = require("next/cache");
                          await prisma.quotationRequest.update({
                            where: { id: quote.id },
                            data: { status: "CLOSED" }
                          });
                          revalidatePath("/dashboard/exporter/quotations");
                        }}>
                          {quote.status !== "CLOSED" && (
                            <button type="submit" className="text-[10px] uppercase font-bold text-green-500 hover:text-green-700 bg-green-500/10 px-2 py-1 rounded transition-colors">
                              Mark Closed
                            </button>
                          )}
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
