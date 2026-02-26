import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchArtistsWithImages, fetchCities, castVote, hasVoted, type ArtistInfo } from "@/lib/voteData";
import { useToast } from "@/hooks/use-toast";

export default function VotePage() {
  const [artists, setArtists] = useState<ArtistInfo[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [artist, setArtist] = useState("");
  const [city, setCity] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchArtistsWithImages().then(setArtists);
    fetchCities().then(setCities);
  }, []);

  useEffect(() => {
    if (artist && city) {
      hasVoted(artist, city).then(setAlreadyVoted);
    } else {
      setAlreadyVoted(false);
    }
  }, [artist, city]);

  const handleVote = async () => {
    if (!artist || !city) {
      toast({ title: "Please select both an artist and a city", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await castVote(artist, city);
    setLoading(false);
    if (!result.success) {
      toast({ title: result.error || "Vote failed", variant: "destructive" });
      return;
    }
    if (result.flagged) {
      toast({ title: "Vote recorded, but flagged for review due to rapid voting.", variant: "default" });
    }
    setSubmitted(true);
  };

  return (
    <section className="container py-10 md:py-28 px-5">
      <div className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-10">
                <Vote className="h-10 w-10 text-primary mx-auto mb-4" />
                <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Cast Your Vote</h1>
                <p className="text-muted-foreground">
                  Select the artist you want to see perform and the city where you want them.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Artist</label>
                  <Select value={artist} onValueChange={setArtist}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Choose an artist" />
                    </SelectTrigger>
                    <SelectContent>
                      {artists.map((a) => (
                        <SelectItem key={a.name} value={a.name}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              {a.image_url ? <AvatarImage src={a.image_url} alt={a.name} /> : null}
                              <AvatarFallback className="text-[10px] bg-secondary">{a.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {a.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City / District</label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Choose a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {alreadyVoted && (
                  <p className="text-sm text-destructive">You already voted for {artist} in {city}.</p>
                )}

                <Button
                  onClick={handleVote}
                  size="lg"
                  className="w-full gradient-primary text-primary-foreground font-semibold text-base glow-primary"
                  disabled={!artist || !city || alreadyVoted || loading}
                >
                  {loading ? "Submitting..." : "Cast Vote"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <CheckCircle className="h-16 w-16 text-accent mx-auto mb-6" />
              <h2 className="font-heading text-3xl font-bold mb-3">Vote Recorded!</h2>
              <p className="text-muted-foreground mb-2">
                You voted for <span className="text-primary font-semibold">{artist}</span> to perform in{" "}
                <span className="text-accent font-semibold">{city}</span>.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Your voice matters. Share this with friends to amplify the demand!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => { setSubmitted(false); setArtist(""); setCity(""); }} variant="outline" className="border-border">
                  Vote for Another
                </Button>
                <Button asChild className="gradient-primary text-primary-foreground">
                  <a href="/results">View Results</a>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
