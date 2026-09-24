import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";

export default function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="py-32 relative overflow-hidden bg-muted dark:bg-transparent">
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-muted dark:from-primary/20 dark:via-background/80 dark:to-background" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center reveal-on-scroll">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground mb-4 tracking-tighter uppercase drop-shadow-md">
          {t("cta.title", "CAN'T FIND YOUR PRODUCT?")}
        </h2>
        <div className="text-2xl md:text-3xl font-bold text-primary mb-10 tracking-wide uppercase">
          {t("cta.subtitle_1", "WE MAY BE ABLE TO SOURCE IT FROM INDIA.")}
        </div>
        
        <div className="bg-background/80 dark:bg-background/50 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 md:p-10 max-w-4xl mx-auto shadow-2xl">
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            {t("cta.subtitle_2", "Share your product name, specifications and required quantity. Whether you are looking for a specific product, a new supplier, bulk quantities or an export-ready Indian sourcing option, our team will explore suitable options.")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              className="w-full sm:w-auto inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-bold py-5 px-10 rounded-xl primary-glow transition-all duration-300 text-lg shadow-[0_0_40px_-10px_rgba(19,91,236,0.6)] hover:shadow-[0_0_60px_-10px_rgba(19,91,236,0.8)] hover:-translate-y-1"
              href="/contact"
            >
              {t("cta.join_btn", "SUBMIT YOUR REQUIREMENT")}
              <span className="material-icons ml-3 text-xl">arrow_forward</span>
            </Link>
            <Link
              className="w-full sm:w-auto inline-flex items-center justify-center text-foreground border border-border hover:bg-background/50 dark:hover:bg-white/5 font-bold py-5 px-10 rounded-xl transition-all duration-300 text-lg hover:-translate-y-1 shadow-lg"
              href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
            >
              {t("cta.contact_btn", "WHATSAPP RANOTE EXIM")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
