import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth-server";

/**
 * Dashboard Dispatcher
 * This page handles the logic for a generic "/dashboard" request by
 * checking the user's role and redirecting them to their specific portal.
 */
export default async function DashboardPage() {
  const auth = await getServerAuthContext();

  if (!auth) {
    redirect("/login");
  }

  const role = auth.role;

  console.log(`[Dashboard Dispatcher] Redirecting User ${auth.userId} with role ${role}`);

  switch (role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "EXPORTER":
      redirect("/dashboard/exporter");
    case "SUPPLIER":
      redirect("/dashboard/supplier");
    case "IMPORTER":
      redirect("/dashboard/importer");
    case "CONSUMER":
    default:
      // Fallback for generic users or consumers: 
      // Redirect to marketplace or a default dashboard if one exists
      redirect("/products");
  }
}
