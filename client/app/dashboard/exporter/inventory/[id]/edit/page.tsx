import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/auth-server";
import ProductForm from "@/components/dashboard/ProductForm";

export default async function EditProductPage({
 params,
}: {
 params: { id: string };
}) {
 const auth = await getServerAuthContext();
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

  // Reverse map for Prisma Enum to Frontend Enum
  const reverseCategoryMap: Record<string, string> = {
    'Chemicals': 'CHEMICALS',
    'Machines': 'MACHINES',
    'Textiles': 'TEXTILES',
    'Medical': 'MEDICAL',
    'Electronics': 'ELECTRONICS',
    'Agri': 'AGRICULTURE',
    'Construction': 'CONSTRUCTION',
    'Handicrafts': 'HANDICRAFTS',
    'Food': 'FOOD',
    'Automotive': 'AUTOMOTIVE',
    'Cosmetics': 'COSMETICS',
    'Plastics': 'PLASTICS',
    'Energy': 'ENERGY',
    'Logistics': 'LOGISTICS',
    'Packaging': 'PACKAGING',
    'Metals': 'METALS',
    'Leather': 'LEATHER',
    'Furniture': 'FURNITURE',
    'Toys': 'TOYS',
    'Sports': 'SPORTS',
    'Other': 'OTHER',
  };

  const productData = {
    id: product.id,
    name: product.name,
    category: reverseCategoryMap[product.category] || "OTHER",
    description: product.description,
    price: product.price,
    regularPrice: product.regularPrice || 0,
    minOrderQty: product.minOrderQty,
    unit: product.unit,
    originCountry: product.originCountry,
    hsCode: product.hsCode || "",
    images: product.images,
    certifications: product.certifications,
    available: product.available,
    quantity: product.stockQty,
  };

  return <ProductForm initialData={productData} isEdit />;
}
