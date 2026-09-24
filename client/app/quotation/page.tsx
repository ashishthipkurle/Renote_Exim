import { prisma } from "@/lib/prisma";
import QuotationClient from "./QuotationClient";
import { getServerAuthContext } from "@/lib/auth-server";
import HomeFooter from "@/components/homepage/HomeFooter";

export const dynamic = "force-dynamic";

export default async function QuotationPage() {
  const auth = await getServerAuthContext();
  const isLoggedIn = !!auth;
  const user = auth?.user ? {
    name: auth.user.name,
    email: auth.user.email,
    businessName: auth.user.businessName,
  } : null;

  const products = (await prisma.product.findMany({
    where: { available: true },
    orderBy: { createdAt: "desc" },
  })) as any[];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow">
        <QuotationClient products={products} isLoggedIn={isLoggedIn} user={user} />
      </main>
      <HomeFooter />
    </div>
  );
}
