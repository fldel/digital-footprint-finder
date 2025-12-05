import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  LogOut, 
  Zap, 
  Clock, 
  TrendingUp,
  User,
  Loader2,
  Crown,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchHistory {
  id: string;
  query: string;
  query_type: string;
  status: string;
  results_count: number;
  created_at: string;
}

const Dashboard = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSearchHistory();
    }
  }, [user]);

  const fetchSearchHistory = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data && !error) {
      setSearchHistory(data as SearchHistory[]);
    }
    setLoadingHistory(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a search query",
        description: "Please enter a name, username, or profile URL to search.",
        variant: "destructive",
      });
      return;
    }

    if (!profile || profile.credits_remaining <= 0) {
      toast({
        title: "No credits remaining",
        description: "Please upgrade your plan to continue searching.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      // Deduct credit
      const { error: creditError } = await supabase.rpc("decrement_credits", {
        p_user_id: user!.id,
      });

      if (creditError) throw creditError;

      // Create search record
      const { data: searchData, error: searchError } = await supabase
        .from("searches")
        .insert({
          user_id: user!.id,
          query: searchQuery,
          query_type: "name",
          status: "processing",
        })
        .select()
        .single();

      if (searchError) throw searchError;

      // Navigate to results page with search ID
      navigate(`/search/${searchData.id}?q=${encodeURIComponent(searchQuery)}`);
      
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "An error occurred while searching.",
        variant: "destructive",
      });
      setIsSearching(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const creditsPercentage = (profile.credits_remaining / 3) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">Headhunter</span>
                <span className="text-foreground"> Trace</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant={profile.plan === "free" ? "outline" : "glow"} className="hidden sm:flex">
                {profile.plan === "free" ? "Free Plan" : profile.plan}
              </Badge>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="hidden sm:inline text-muted-foreground">{profile.email}</span>
              </div>

              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Credits Card */}
        <Card className="mb-8 bg-gradient-to-r from-card to-card/50 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">Search Credits</h2>
                <p className="text-muted-foreground text-sm">
                  {profile.credits_remaining} of {profile.plan === "free" ? 3 : "∞"} searches remaining
                </p>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex-1 md:w-48">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full gradient-cta transition-all duration-500"
                      style={{ width: `${creditsPercentage}%` }}
                    />
                  </div>
                </div>
                
                {profile.credits_remaining === 0 && (
                  <Button variant="hero" size="sm" onClick={() => navigate("/#pricing")}>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              New Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch}>
              <div className={`glass-card p-2 rounded-2xl transition-all duration-500 ${isSearching ? "glow-primary scan-line" : ""}`}>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter name, username, or profile URL..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 bg-background/50 border-0"
                      disabled={isSearching || profile.credits_remaining === 0}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant={profile.credits_remaining === 0 ? "outline" : "hero"}
                    size="xl"
                    disabled={isSearching || profile.credits_remaining === 0}
                    className="w-full sm:w-auto min-w-[140px]"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Scanning...
                      </>
                    ) : profile.credits_remaining === 0 ? (
                      "Upgrade to Continue"
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Trace
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Searches</p>
                  <p className="text-2xl font-bold">{searchHistory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Used</p>
                  <p className="text-2xl font-bold">{3 - profile.credits_remaining}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-2xl font-bold capitalize">{profile.plan}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No searches yet. Start your first investigation above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchHistory.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/search/${search.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{search.query}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(search.created_at).toLocaleDateString()} • {search.results_count} results
                        </p>
                      </div>
                    </div>
                    <Badge variant={search.status === "completed" ? "glow" : "outline"}>
                      {search.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
