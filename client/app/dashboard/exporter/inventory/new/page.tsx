import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth-server";
import ProductForm from "@/components/dashboard/ProductForm";

export default async function NewProductPage() {
    const auth = await getServerAuthContext();
    if (!auth) redirect("/login");
    if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
        redirect(`/dashboard/${auth.role.toLowerCase()}`);
    }

    return <ProductForm />;
}

