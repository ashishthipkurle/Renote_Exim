import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/supabase/server";
import ProductForm from "@/components/dashboard/ProductForm";

export default async function NewProductPage() {
    const auth = await getServerAuth();
    if (!auth) redirect("/login");
    if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
        redirect(`/dashboard/${auth.role.toLowerCase()}`);
    }

    return <ProductForm />;
}
