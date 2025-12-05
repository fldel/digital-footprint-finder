import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  User,
  MapPin,
  Users,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Globe,
  Briefcase,
  AtSign,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePDFReport } from "@/lib/pdfGenerator";

interface SearchResult {
  result_type: string;
  platform: string;
  profile_url: string;
  username: string;
  display_name: string;
  bio: string;
  location: string;
  followers_count: number;
  posts_count: number;
  confidence_score: number;
  metadata: Record<string, any>;
}

interface SearchSummary {
  total_found: number;
  exposure_level: "low" | "medium" | "high";
  platforms_found: string[];
  key_insights: string[];
}

interface SearchData {
  results: SearchResult[];
  summary: SearchSummary;
}

const platformIcons: Record<string, any> = {
  twitter: Globe,
  x: Globe,
  linkedin: Briefcase,
  instagram: User,
  github: FileText,
  facebook: Users,
  default: AtSign,
};

const exposureLevelColors: Record<string, string> = {
  low: "text-green-500",
  medium: "text-yellow-500",
  high: "text-red-500",
};

const SearchResults = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      performSearch();
    }
  }, [user, id]);

  const performSearch = async () => {
    setLoading(true);
    
    try {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke("osint-search", {
        body: { 
          query, 
          searchId: id,
          userId: user?.id 
        },
      });

      if (error) throw error;
      
      if (data.success && data.data) {
        setSearchData(data.data);
        
        // Update search record with results count
        await supabase
          .from("searches")
          .update({ 
            status: "completed",
            results_count: data.data.results?.length || 0 
          })
          .eq("id", id);

        // Store results
        if (data.data.results && data.data.results.length > 0) {
          const resultsToInsert = data.data.results.map((result: SearchResult) => ({
            search_id: id,
            user_id: user?.id,
            result_type: result.result_type,
            platform: result.platform,
            profile_url: result.profile_url,
            username: result.username,
            display_name: result.display_name,
            bio: result.bio,
            location: result.location,
            followers_count: result.followers_count,
            posts_count: result.posts_count,
            confidence_score: result.confidence_score,
            metadata: result.metadata,
          }));

          await supabase.from("search_results").insert(resultsToInsert);
        }
      } else {
        throw new Error(data.error || "Search failed");
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during the search.",
        variant: "destructive",
      });
      
      // Update status to failed
      await supabase
        .from("searches")
        .update({ status: "failed" })
        .eq("id", id);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!searchData) return;
    
    setGeneratingPDF(true);
    try {
      await generatePDFReport(query, searchData);
      toast({
        title: "Report Generated",
        description: "Your PDF report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const Icon = platformIcons[platform.toLowerCase()] || platformIcons.default;
    return Icon;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Search Results</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">{query}</p>
                </div>
              </div>
            </div>

            <Button
              variant="hero"
              onClick={handleGeneratePDF}
              disabled={!searchData || generatingPDF}
            >
              {generatingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <Search className="absolute inset-0 m-auto w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Scanning Public Sources</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Analyzing open-web data, social media profiles, and public records...
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {["Social Media", "Public Records", "Web Mentions", "Username Patterns"].map((source, i) => (
                <Badge key={source} variant="outline" className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        ) : searchData ? (
          <>
            {/* Summary Card */}
            <Card className="mb-8 bg-gradient-to-r from-card to-card/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Digital Footprint Summary
                  </span>
                  <Badge 
                    variant="outline" 
                    className={exposureLevelColors[searchData.summary.exposure_level]}
                  >
                    {searchData.summary.exposure_level === "high" && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {searchData.summary.exposure_level === "low" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {searchData.summary.exposure_level.toUpperCase()} Exposure
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-3xl font-bold gradient-text">{searchData.summary.total_found}</p>
                    <p className="text-sm text-muted-foreground">Profiles Found</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-3xl font-bold gradient-text">{searchData.summary.platforms_found.length}</p>
                    <p className="text-sm text-muted-foreground">Platforms</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-3xl font-bold gradient-text capitalize">{searchData.summary.exposure_level}</p>
                    <p className="text-sm text-muted-foreground">Exposure Level</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Platforms Detected</p>
                    <div className="flex flex-wrap gap-2">
                      {searchData.summary.platforms_found.map((platform) => (
                        <Badge key={platform} variant="glow">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Key Insights</p>
                    <ul className="space-y-2">
                      {searchData.summary.key_insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Grid */}
            <h2 className="text-xl font-semibold mb-4">Found Profiles ({searchData.results.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchData.results.map((result, index) => {
                const PlatformIcon = getPlatformIcon(result.platform);
                return (
                  <Card key={index} className="bg-card/50 hover:bg-card/80 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <PlatformIcon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{result.display_name}</p>
                            <p className="text-sm text-muted-foreground">@{result.username}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(result.confidence_score * 100)}% match
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {result.bio || "No bio available"}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          <span>{result.platform}</span>
                        </div>
                        {result.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{result.location}</span>
                          </div>
                        )}
                        {result.followers_count > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{result.followers_count.toLocaleString()} followers</span>
                          </div>
                        )}
                      </div>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={() => window.open(result.profile_url, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Search Failed</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't complete this search. Please try again.
            </p>
            <Button variant="hero" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
