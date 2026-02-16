import Link from "next/link";

export default function ImporterCategoriesPage() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white tracking-tight">All Categories</h1>
        <p className="text-sm text-slate-400">Client view — browse categories and discovery.</p>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
          <p className="text-slate-300 text-sm">
            This route is wired for the Stitch client sidebar. Use Products for the full discovery flow.
          </p>
          <div className="mt-4">
            <Link href="/products" className="text-primary font-bold hover:underline">
              Go to Product Discovery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
