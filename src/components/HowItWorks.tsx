import { Badge } from "@/components/ui/badge";

const steps = [
  {
    number: "01",
    title: "Input Initial Data",
    description: "Enter a name, username, city/country (optional), or any public profile link.",
    color: "primary",
  },
  {
    number: "02",
    title: "AI Data Mapping",
    description: "Our AI system searches various open sources including search engines, public registries, and social networks.",
    color: "secondary",
  },
  {
    number: "03",
    title: "Correlation Engine",
    description: "AI matches patterns between names, usernames, posting styles, public photo metadata, and other sources.",
    color: "primary",
  },
  {
    number: "04",
    title: "Result Filtering",
    description: "The system filters out irrelevant data and only displays truly related information.",
    color: "secondary",
  },
  {
    number: "05",
    title: "Report Generation",
    description: "View search results directly or generate a professional format report for documentation.",
    color: "primary",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="glow" className="mb-4">
            Simple Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            How <span className="gradient-text">It Works</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform uses publicly available data without accessing any information that is not legally available.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-primary opacity-30" />

            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative flex items-start gap-8 mb-12 last:mb-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Number Circle */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-mono font-bold text-lg ${
                    step.color === "primary" 
                      ? "bg-primary/20 text-primary border-2 border-primary/50" 
                      : "bg-secondary/20 text-secondary border-2 border-secondary/50"
                  }`}>
                    {step.number}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${
                  index % 2 === 0 ? "md:pr-8" : "md:pl-8"
                }`}>
                  <div className="glass-card p-6 hover:bg-card/60 transition-all duration-300 group">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:w-[calc(50%-4rem)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            <span className="text-primary font-medium">Important:</span> All processes are conducted using publicly available data without accessing personal information that is not legally available.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
