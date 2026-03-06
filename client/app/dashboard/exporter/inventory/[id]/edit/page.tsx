import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";
import ProductForm from "@/components/dashboard/ProductForm";

export default async function EditProductPage({
    params,
}: {
    params: { id: string };
}) {
    const auth = await getServerAuth();
    if (!auth) redirect("/login");
    if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
        redirect(`/dashboard/${auth.role.toLowerCase()}`);
    }

    const product = await prisma.product.findUnique({
        where: { id: params.id },
    });

    if (!product) notFound();

    // Verify ownership
    if (product.exporterId !== auth.userId && auth.role !== "ADMIN") {
        redirect("/dashboard/exporter/inventory");
    }

    const productData = {
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        minOrderQty: product.minOrderQty,
        unit: product.unit,
        originCountry: product.originCountry,
        hsCode: product.hsCode || "",
        images: product.images,
        certifications: product.certifications,
        available: product.available,
    };

    return <ProductForm initialData={productData} isEdit />;
}
