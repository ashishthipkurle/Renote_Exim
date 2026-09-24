import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";

export default function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="py-32 relative overflow-hidden bg-muted dark:bg-transparent">
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-muted dark:from-primary/20 dark:via-background/80 dark:to-background" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center reveal-on-scroll">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-8 tracking-tight drop-shadow-xl">
          {t("cta.title", "LOOKING TO SOURCE FROM INDIA?")}
        </h2>
        <div className="text-xl md:text-2xl font-semibold text-foreground mb-4">
          {t("cta.subtitle_1", "Tell us what you need.")}
        </div>
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          {t("cta.subtitle_2", "Whether you are looking for a specific product, a new supplier, bulk quantities or an export-ready Indian sourcing option, share your requirement with us.")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl primary-glow transition-all duration-300 text-lg shadow-xl hover:-translate-y-1 primary-glow-hover"
            href="/contact"
          >
            {t("cta.join_btn", "SEND YOUR REQUIREMENT")}
          </Link>
          <Link
            className="w-full sm:w-auto text-foreground border border-border hover:bg-background/50 dark:hover:bg-white/5 font-bold py-4 px-8 rounded-xl transition-all duration-300 text-lg hover:-translate-y-1"
            href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
          >
            {t("cta.contact_btn", "WHATSAPP RANOTE EXIM")}
          </Link>
        </div>
      </div>
    </section>
  );
}
