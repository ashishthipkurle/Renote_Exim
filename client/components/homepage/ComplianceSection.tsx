import { useTranslation } from "@/lib/i18n/client";

const CARDS = [
  {
    icon: "description",
    titleKey: "compliance.card1_title",
    titleFallback: "Commercial Documents",
    descKey: "compliance.card1_desc",
    descFallback:
      "Preparation and coordination of commercial invoices, proforma invoices, and purchase orders aligned with buyer and destination country requirements.",
    accentColor: "text-amber-600 dark:text-amber-400",
    bgAccent: "from-amber-500/10 to-transparent",
  },
  {
    icon: "package_2",
    titleKey: "compliance.card2_title",
    titleFallback: "Packing & Shipping Documentation",
    descKey: "compliance.card2_desc",
    descFallback:
      "Packing lists, shipping bills, bills of lading, and airway bills — coordinated with freight partners and customs house agents.",
    accentColor: "text-blue-600 dark:text-blue-400",
    bgAccent: "from-blue-500/10 to-transparent",
  },
  {
    icon: "verified",
    titleKey: "compliance.card3_title",
    titleFallback: "Product & Destination Requirements",
    descKey: "compliance.card3_desc",
    descFallback:
      "Assistance with certificates of origin, phytosanitary certificates, test reports, and other product- or destination-specific documentation as applicable.",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    bgAccent: "from-emerald-500/10 to-transparent",
  },
  {
    icon: "local_shipping",
    titleKey: "compliance.card4_title",
    titleFallback: "Logistics Coordination",
    descKey: "compliance.card4_desc",
    descFallback:
      "Working with trusted freight forwarders, customs brokers, and logistics partners to coordinate shipment from origin to destination.",
    accentColor: "text-violet-600 dark:text-violet-400",
    bgAccent: "from-violet-500/10 to-transparent",
  },
];

export default function ComplianceSection() {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-[url('/assets/pexels-yankrukov-8867376.jpg')] bg-cover bg-top border-t border-border relative z-20">
      <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]"></div>
      <div className="max-w-6xl mx-auto px-6 relative z-10 reveal-on-scroll">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2 block drop-shadow-sm">
            {t("compliance.badge", "Export Documentation")}
          </span>
          <h2 className="text-4xl font-bold text-foreground mb-6 drop-shadow-sm">
            {t("compliance.title_part1", "TRADE DOCUMENTATION")}{" "}
            <br />
            <span className="text-primary">
              {t("compliance.title_part2", "& COMPLIANCE")}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium drop-shadow-sm">
            {t(
              "compliance.subtitle",
              "International trade requires accurate documentation and attention to product, destination, and regulatory requirements. RANOTE EXIM coordinates export documentation and works with relevant professionals and service partners where required to support compliant trade execution."
            )}
          </p>
        </div>

        {/* Cards Grid — 4 cards in 2x2 on md+, single column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className="glass-card bg-background/70 backdrop-blur-md p-8 rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group shadow-xl relative overflow-hidden"
            >
              {/* Subtle gradient accent on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${card.bgAccent} opacity-0 group-hover:opacity-100 transition-opacity rounded-xl`}
              ></div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors shadow-inner">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t(card.titleKey, card.titleFallback)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {t(card.descKey, card.descFallback)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
