import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Clock, Users, Sparkles, Star, Ticket } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { fetchArtistsWithImages, type ArtistInfo } from "@/lib/voteData";

interface EventRow {
  id: string;
  artist: string;
  city: string;
  total_votes: number;
  venue: string;
  event_date: string;
  sponsors: string[];
  verified: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [artistImages, setArtistImages] = useState<Map<string, string | null>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [eventsRes, artists] = await Promise.all([
        supabase.from("events").select("*").eq("verified", true).order("event_date", { ascending: true }),
        fetchArtistsWithImages(),
      ]);
      setEvents((eventsRes.data as EventRow[]) || []);
      const imgMap = new Map<string, string | null>();
      artists.forEach((a) => imgMap.set(a.name, a.image_url));
      setArtistImages(imgMap);
      setLoading(false);
    };
    load();
  }, []);

  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= new Date());
  const pastEvents = events.filter((e) => new Date(e.event_date) < new Date());

  return (
    <section className="container py-10 md:py-16 px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-4"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Verified Events
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-heading text-3xl md:text-5xl font-bold mb-3"
          >
            Upcoming <span className="text-gradient-primary">Events</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            These events were made possible by your votes. See which artists are coming to perform in your city!
          </motion.p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent"
            />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : upcomingEvents.length === 0 && pastEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <CalendarDays className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No verified events yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Keep voting to bring artists to your city!</p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {upcomingEvents.length > 0 && (
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="font-heading text-xl font-bold mb-6 flex items-center gap-2"
                >
                  <Ticket className="h-5 w-5 text-primary" /> Coming Up
                </motion.h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {upcomingEvents.map((event, i) => (
                    <EventCard key={event.id} event={event} artistImage={artistImages.get(event.artist)} index={i} />
                  ))}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-bold mb-6 text-muted-foreground">Past Events</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {pastEvents.map((event, i) => (
                    <EventCard key={event.id} event={event} artistImage={artistImages.get(event.artist)} index={i} past />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
}

function EventCard({
  event,
  artistImage,
  index,
  past = false,
}: {
  event: EventRow;
  artistImage?: string | null;
  index: number;
  past?: boolean;
}) {
  const eventDate = new Date(event.event_date);

  // Countdown
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 120, damping: 18 }}
      whileHover={!past ? { y: -6, scale: 1.02 } : undefined}
      className={`relative group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 ${
        past ? "opacity-50 grayscale-[30%]" : "hover:border-primary/40 hover:shadow-[0_8px_40px_hsl(18_100%_60%/0.15)]"
      }`}
    >
      {/* Gradient accent bar */}
      {!past && (
        <div className="absolute top-0 left-0 right-0 h-1 gradient-primary opacity-80 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Countdown badge */}
      {!past && daysLeft > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.12 + 0.3 }}
          className="absolute top-4 right-4 z-10"
        >
          <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
            <Star className="h-3 w-3" />
            {daysLeft === 1 ? "Tomorrow!" : `${daysLeft} days`}
          </span>
        </motion.div>
      )}

      <div className="p-6">
        {/* Artist & City */}
        <div className="flex items-center gap-4 mb-5">
          <motion.div
            whileHover={!past ? { scale: 1.1, rotate: 3 } : undefined}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="h-14 w-14 border-2 border-primary/30 ring-2 ring-primary/10 ring-offset-2 ring-offset-card">
              <AvatarImage src={artistImage || undefined} alt={event.artist} />
              <AvatarFallback className="bg-secondary text-base font-bold gradient-primary text-primary-foreground">
                {event.artist.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <div>
            <h3 className="font-heading text-xl font-bold leading-tight group-hover:text-primary transition-colors">
              {event.artist}
            </h3>
            <p className="text-accent font-semibold text-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.city}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 text-sm bg-secondary/50 rounded-xl px-3 py-2.5">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium">{event.venue}</span>
          </div>
          <div className="flex items-center gap-3 text-sm bg-secondary/50 rounded-xl px-3 py-2.5">
            <CalendarDays className="h-4 w-4 text-primary flex-shrink-0" />
            <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-3 text-sm bg-secondary/50 rounded-xl px-3 py-2.5">
            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
            <span>{format(eventDate, "h:mm a")}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-primary flex-shrink-0" />
            <span>
              <strong className="text-primary">{event.total_votes.toLocaleString()}</strong> people voted for this
            </span>
          </div>
        </div>

        {/* Sponsors */}
        {event.sponsors.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Sponsored by</p>
            <div className="flex flex-wrap gap-2">
              {event.sponsors.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="text-xs border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
