import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/supabase/server";

export default async function ExporterShipmentsPage({
  searchParams,
}: {
  searchParams?: { search?: string; page?: string } | Promise<{ search?: string; page?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const auth = await getServerAuth();
  if (!auth) redirect("/login");

  if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  const params = new URLSearchParams();
  if (resolvedSearchParams.search) params.set("search", resolvedSearchParams.search);
  if (resolvedSearchParams.page) params.set("page", resolvedSearchParams.page);

  const query = params.toString();
  redirect(query ? `/dashboard/exporter/orders?${query}` : "/dashboard/exporter/orders");
}
