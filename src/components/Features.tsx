import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Share2, 
  Globe, 
  AtSign, 
  Image, 
  FileText, 
  Building2, 
  FileDown 
} from "lucide-react";

const features = [
  {
    icon: User,
    title: "AI Public Profile Scan",
    description: "Collect and analyze public information from various open-web platforms to build a comprehensive overview of a person.",
  },
  {
    icon: Share2,
    title: "Social Media Discovery",
    description: "Identify public social media accounts based on name, username, or other clues provided by the user.",
  },
  {
    icon: Globe,
    title: "Open-Web Mentions Tracking",
    description: "Find mentions of names or usernames on forums, blogs, public articles, and online media.",
  },
  {
    icon: AtSign,
    title: "Username Pattern Analyzer",
    description: "AI predicts possible usernames used by someone based on common patterns for easier public profile searching.",
  },
  {
    icon: Image,
    title: "Public Photo Reverse Finder",
    description: "Use public image search to find occurrences of someone's photo that are publicly available.",
  },
  {
    icon: FileText,
    title: "Digital Footprint Summary",
    description: "Generate automatic summaries including related public profiles, online activity categories, and digital exposure level.",
  },
  {
    icon: Building2,
    title: "Company & Workplace Lookup",
    description: "Display public information about companies, roles, and professional profiles if available on open-web.",
  },
  {
    icon: FileDown,
    title: "AI Proof Report Generator",
    description: "Generate professional PDF reports for verification, collaboration, or internal documentation purposes.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Powerful <span className="gradient-text">OSINT Features</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to conduct comprehensive public digital investigations, all powered by advanced AI technology.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden bg-card/50 hover:bg-card/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute -inset-px bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 rounded-xl blur-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
