import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ImporterShipmentsPage() {
  const auth = await getServerAuth();
  if (!auth) redirect("/login");

  if (auth.role !== "IMPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  redirect("/dashboard/importer/orders");
}
