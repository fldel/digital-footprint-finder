import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Crown, Building2 } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try our platform with limited searches",
    icon: null,
    features: [
      { text: "3 public profile searches (total)", included: true },
      { text: "Basic digital footprint summary", included: true },
      { text: "Social media discovery basic", included: true },
      { text: "PDF export", included: false },
      { text: "Reverse image search", included: false },
      { text: "Correlation engine pro", included: false },
    ],
    cta: "Get Started",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Premium Basic",
    price: "$5.99",
    period: "/month",
    yearlyPrice: "$59/year",
    description: "For regular users who need routine searches",
    icon: Zap,
    features: [
      { text: "20 profile searches per month", included: true },
      { text: "Social Media Discovery Pro", included: true },
      { text: "Correlation Engine Pro", included: true },
      { text: "Export PDF reports", included: true },
      { text: "Reverse Image Search", included: true },
      { text: "Faster scanning speed", included: true },
    ],
    cta: "Start Basic",
    variant: "default" as const,
    popular: false,
  },
  {
    name: "Premium Pro",
    price: "$14.99",
    period: "/month",
    yearlyPrice: "$149/year",
    description: "For HR freelancers, OSINT researchers, or small businesses",
    icon: Crown,
    features: [
      { text: "100 searches per month", included: true },
      { text: "All Basic features", included: true },
      { text: "Multi-profile comparison", included: true },
      { text: "Reports with user branding", included: true },
      { text: "Search history", included: true },
      { text: "Priority email support", included: true },
    ],
    cta: "Start Pro",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/month",
    description: "For companies with large scanning needs",
    icon: Building2,
    features: [
      { text: "Unlimited searches", included: true },
      { text: "All Pro features + analytics", included: true },
      { text: "API access (public-data only)", included: true },
      { text: "Batch scan (multiple names)", included: true },
      { text: "Team management", included: true },
      { text: "Dedicated support (SLA)", included: true },
    ],
    cta: "Contact Sales",
    variant: "glass" as const,
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="glow" className="mb-4">
            Pricing Plans
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="gradient-text">Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade as you grow. All plans include our core OSINT features.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-primary/50 bg-card/80 shadow-xl shadow-primary/10 scale-105 z-10"
                  : "bg-card/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                {plan.icon && (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="w-6 h-6 text-primary" />
                  </div>
                )}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.yearlyPrice && (
                  <p className="text-sm text-primary mt-1">
                    Or {plan.yearlyPrice} (save ~18%)
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.variant}
                  size="lg"
                  className="w-full mt-8"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credit System Notice */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="glass-card p-6 text-center">
            <h3 className="font-semibold mb-2">How Free Credits Work</h3>
            <p className="text-sm text-muted-foreground">
              Free users receive 3 total search credits. Each search deducts 1 credit. 
              After credits are exhausted, the Search button becomes "Upgrade to Continue". 
              Previous search results remain accessible, but new searches require an upgrade.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
