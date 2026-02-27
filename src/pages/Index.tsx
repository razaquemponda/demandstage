import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Users, BarChart3, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import heroBg from "@/assets/hero-bg.jpg";
import { getTrendingCombinations, seedDemoVotes, fetchArtistsWithImages, type VoteTally, type ArtistInfo } from "@/lib/voteData";

export default function Index() {
  const [trending, setTrending] = useState<VoteTally[]>([]);
  const [artistImages, setArtistImages] = useState<Map<string, string | null>>(new Map());

  useEffect(() => {
    const load = async () => {
      await seedDemoVotes();
      const [trendingData, artists] = await Promise.all([
        getTrendingCombinations(5),
        fetchArtistsWithImages(),
      ]);
      setTrending(trendingData);
      const imgMap = new Map<string, string | null>();
      artists.forEach((a) => imgMap.set(a.name, a.image_url));
      setArtistImages(imgMap);
    };
    load();
  }, []);

  const maxCount = trending.length > 0 ? trending[0].count : 1;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/70" />
        </div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/30 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/20 blur-[100px]" />
        </div>

        <div className="container relative py-16 md:py-40 text-center px-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Mic2 className="h-3.5 w-3.5" /> Live Voting Platform
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-5">
              Vote the artist you want{" "}
              <span className="text-gradient-primary">in your city</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Where fans decide the next stage. Cast your vote, show real demand, and help bring your favorite artist to perform live near you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground font-semibold text-base px-8 glow-primary animate-pulse-glow">
                <Link to="/vote">
                  Vote Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 border-border hover:bg-secondary">
                <Link to="/results">View Results</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats cards */}
      <section className="container py-12 md:py-16 px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Users, label: "Active Voters", value: "1,200+", gradient: "from-primary to-[hsl(340_80%_55%)]" },
            { icon: Mic2, label: "Artists", value: "10+", gradient: "from-accent to-[hsl(210_90%_55%)]" },
            { icon: BarChart3, label: "Cities", value: "10+", gradient: "from-[hsl(270_70%_60%)] to-[hsl(300_60%_50%)]" },
            { icon: TrendingUp, label: "Votes Cast", value: "5,000+", gradient: "from-[hsl(45_100%_55%)] to-primary" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative group bg-card border border-border rounded-2xl p-5 md:p-6 text-center shadow-card overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} mb-3`}>
                <s.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <motion.span
                className="block font-heading text-3xl md:text-4xl font-bold mb-1"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
              >
                {s.value}
              </motion.span>
              <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="container py-12 md:py-20 px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            <TrendingUp className="inline h-8 w-8 text-primary mr-2 -mt-1" />
            Trending Now
          </h2>
          <p className="text-muted-foreground">Top artist-city combinations by vote count</p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-4">
          {trending.map((t, i) => (
            <motion.div
              key={`${t.artist}-${t.city}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-5 shadow-card"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={artistImages.get(t.artist) || undefined} alt={t.artist} />
                    <AvatarFallback className="text-xs bg-secondary">{t.artist.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-heading font-semibold text-lg leading-tight">{t.artist}</span>
                    <span className="text-muted-foreground mx-2">→</span>
                    <span className="text-accent font-medium">{t.city}</span>
                  </div>
                </div>
                <span className="text-primary font-heading font-bold text-lg">{t.count}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full gradient-primary"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(t.count / maxCount) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
          {trending.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No votes yet. Be the first to vote!</p>
          )}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="border-border">
            <Link to="/results">See All Results <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="container py-12 md:py-20 text-center px-5">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to make your voice heard?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Your vote helps artists and sponsors know where the real demand is. It takes just 10 seconds.
          </p>
          <Button asChild size="lg" className="gradient-primary text-primary-foreground font-semibold px-10 glow-primary">
            <Link to="/vote">Cast Your Vote <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
