import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTallies, fetchArtists, fetchCities, fetchArtistsWithImages, type VoteTally, type ArtistInfo } from "@/lib/voteData";
import { supabase } from "@/integrations/supabase/client";

export default function ResultsPage() {
  const [tallies, setTallies] = useState<VoteTally[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [filterArtist, setFilterArtist] = useState<string>("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [artistMap, setArtistMap] = useState<Map<string, string | null>>(new Map());

  const loadTallies = async () => {
    setTallies(await getTallies());
  };

  useEffect(() => {
    loadTallies();
    fetchArtists().then(setArtists);
    fetchCities().then(setCities);
    fetchArtistsWithImages().then((infos) => {
      const m = new Map<string, string | null>();
      infos.forEach((a) => m.set(a.name, a.image_url));
      setArtistMap(m);
    });

    const channel = supabase
      .channel("votes-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "votes" }, () => {
        loadTallies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = tallies.filter((t) => {
    if (filterArtist !== "all" && t.artist !== filterArtist) return false;
    if (filterCity !== "all" && t.city !== filterCity) return false;
    return true;
  });

  const maxCount = filtered.length > 0 ? filtered[0].count : 1;

  return (
    <section className="container py-10 md:py-28 px-5">
      <div className="text-center mb-10">
        <BarChart3 className="h-10 w-10 text-primary mx-auto mb-4" />
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Live Results</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          These results represent real public demand. Sponsors and event promoters can use this data to make informed decisions.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-8 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={filterArtist} onValueChange={setFilterArtist}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="All Artists" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Artists</SelectItem>
              {artists.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {filtered.map((t, i) => (
          <motion.div
            key={`${t.artist}-${t.city}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 shadow-card"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  {artistMap.get(t.artist) ? (
                    <AvatarImage src={artistMap.get(t.artist)!} alt={t.artist} />
                  ) : null}
                  <AvatarFallback className="bg-secondary text-muted-foreground text-xs">
                    {t.artist.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span className="font-heading font-semibold">{t.artist}</span>
                  <span className="text-muted-foreground mx-2">in</span>
                  <span className="text-accent font-medium">{t.city}</span>
                </div>
              </div>
              <span className="text-primary font-heading font-bold text-lg shrink-0 ml-4">{t.count} votes</span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(t.count / maxCount) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              />
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No results match your filters.</p>
        )}
      </div>
    </section>
  );
}
