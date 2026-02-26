import { useEffect, useState } from "react";
import { CalendarIcon, Plus, Trash2, CheckCircle, MapPin, Clock, Users as UsersIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getArtistTotals } from "@/lib/voteData";
import { cn } from "@/lib/utils";

interface ArtistCityTally {
  artist: string;
  city: string;
  count: number;
}

interface EventRow {
  id: string;
  artist: string;
  city: string;
  total_votes: number;
  venue: string;
  event_date: string;
  sponsors: string[];
  verified: boolean;
  created_at: string;
}

export default function ManageEvents() {
  const [tallies, setTallies] = useState<ArtistCityTally[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // Form state
  const [selectedCombo, setSelectedCombo] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState<Date>();
  const [eventTime, setEventTime] = useState("19:00");
  const [sponsorsInput, setSponsorInput] = useState("");
  const [sponsors, setSponsors] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [tallyData, eventsData] = await Promise.all([
      fetchTallies(),
      supabase.from("events").select("*").order("event_date", { ascending: true }),
    ]);
    setTallies(tallyData);
    setEvents((eventsData.data as EventRow[]) || []);
    setLoading(false);
  };

  const fetchTallies = async (): Promise<ArtistCityTally[]> => {
    const { data } = await supabase.from("votes").select("artist, city");
    if (!data) return [];
    const map = new Map<string, number>();
    for (const v of data) {
      const key = `${v.artist}::${v.city}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return [...map.entries()]
      .map(([key, count]) => {
        const [artist, city] = key.split("::");
        return { artist, city, count };
      })
      .sort((a, b) => b.count - a.count);
  };

  const addSponsor = () => {
    const trimmed = sponsorsInput.trim();
    if (trimmed && !sponsors.includes(trimmed)) {
      setSponsors([...sponsors, trimmed]);
      setSponsorInput("");
    }
  };

  const removeSponsor = (s: string) => {
    setSponsors(sponsors.filter((sp) => sp !== s));
  };

  const handleCreate = async () => {
    if (!selectedCombo || !venue || !eventDate) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const [artist, city] = selectedCombo.split("::");
    const combo = tallies.find((t) => t.artist === artist && t.city === city);
    if (!combo) return;

    const [hours, minutes] = eventTime.split(":").map(Number);
    const dateTime = new Date(eventDate);
    dateTime.setHours(hours, minutes, 0, 0);

    setCreating(true);

    // Insert event
    const { error } = await supabase.from("events").insert({
      artist,
      city,
      total_votes: combo.count,
      venue,
      event_date: dateTime.toISOString(),
      sponsors,
    });

    if (error) {
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
      setCreating(false);
      return;
    }

    // Reset votes for this artist-city combo
    await supabase.from("votes").delete().eq("artist", artist).eq("city", city);

    toast({ title: "Event verified & created!", description: `Votes for ${artist} → ${city} have been reset.` });

    // Reset form
    setSelectedCombo("");
    setVenue("");
    setEventDate(undefined);
    setEventTime("19:00");
    setSponsors([]);
    setCreating(false);
    loadData();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Event deleted" });
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading...</p>;

  return (
    <div className="space-y-8">
      {/* Create Event Form */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Verify & Create Event
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select a trending artist-city combination, add event details, and verify. Votes for that combo will be reset.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Artist-City selector */}
          <div className="md:col-span-2">
            <Label>Artist → City (by votes)</Label>
            <Select value={selectedCombo} onValueChange={setSelectedCombo}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select artist-city combination" />
              </SelectTrigger>
              <SelectContent>
                {tallies.map((t) => (
                  <SelectItem key={`${t.artist}::${t.city}`} value={`${t.artist}::${t.city}`}>
                    {t.artist} → {t.city} ({t.count} votes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Venue */}
          <div>
            <Label>Specific Venue / Location</Label>
            <Input
              className="mt-1"
              placeholder="e.g. Bingu International Convention Centre"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>

          {/* Date */}
          <div>
            <Label>Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full mt-1 justify-start text-left font-normal", !eventDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div>
            <Label>Event Time</Label>
            <Input
              type="time"
              className="mt-1"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>

          {/* Sponsors */}
          <div>
            <Label>Sponsors</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add sponsor name"
                value={sponsorsInput}
                onChange={(e) => setSponsorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSponsor())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addSponsor}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {sponsors.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sponsors.map((s) => (
                  <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => removeSponsor(s)}>
                    {s} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          className="mt-6 gradient-primary text-primary-foreground"
          onClick={handleCreate}
          disabled={creating || !selectedCombo || !venue || !eventDate}
        >
          {creating ? "Creating..." : "Verify & Create Event"}
        </Button>
      </div>

      {/* Existing Events */}
      <div>
        <h3 className="font-heading text-lg font-bold mb-4">Existing Events ({events.length})</h3>
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No events created yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="bg-card border border-border rounded-xl p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-lg">{event.artist}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-accent font-medium">{event.city}</span>
                      <Badge variant="secondary">{event.total_votes} votes</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {event.venue}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {format(new Date(event.event_date), "PPP 'at' p")}
                      </span>
                    </div>
                    {event.sponsors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {event.sponsors.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
