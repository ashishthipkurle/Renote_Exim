import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";

export default function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="py-32 relative overflow-hidden bg-muted dark:bg-transparent">
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-muted dark:from-primary/20 dark:via-background/80 dark:to-background" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center reveal-on-scroll">
        <h2 className="text-5xl md:text-7xl font-bold text-primary mb-8 tracking-tight drop-shadow-xl">
          {t("cta.title", "READY TO SCALE?")}
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t("cta.subtitle", "Join over 10,000 global enterprises transforming their supply chain with")} <span className="text-foreground font-semibold">Ranote Exim</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-5 px-12 rounded-xl primary-glow transition-all duration-300 text-lg shadow-xl hover:-translate-y-1 primary-glow-hover"
            href="/register"
          >
            {t("cta.join_btn", "Join the Network")}
          </Link>
          <Link
            className="w-full sm:w-auto text-foreground border border-border hover:bg-background/50 dark:hover:bg-white/5 font-bold py-5 px-12 rounded-xl transition-all duration-300 text-lg hover:-translate-y-1"
            href="/contact"
          >
            {t("cta.contact_btn", "Contact Sales")}
          </Link>
        </div>
      </div>
    </section>
  );
}
