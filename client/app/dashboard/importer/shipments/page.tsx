import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function ImporterShipmentsPage() {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");

  if (auth.role !== "IMPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  redirect("/dashboard/importer/orders");
}
