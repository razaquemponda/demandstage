import { supabase } from "@/integrations/supabase/client";

export interface VoteTally {
  artist: string;
  city: string;
  count: number;
}

export interface ArtistInfo {
  name: string;
  image_url: string | null;
}

const DEVICE_ID_KEY = "demandstage_device_id";

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export { getDeviceId };

export async function fetchArtists(): Promise<string[]> {
  const { data } = await supabase.from("artists").select("name").order("name");
  return data?.map((a) => a.name) || [];
}

export async function fetchArtistsWithImages(): Promise<ArtistInfo[]> {
  const { data } = await supabase.from("artists").select("*").order("name");
  return (data as unknown as { name: string; image_url: string | null }[])?.map((a) => ({ name: a.name, image_url: a.image_url })) || [];
}

export async function fetchCities(): Promise<string[]> {
  const { data } = await supabase.from("cities").select("name").order("name");
  return data?.map((c) => c.name) || [];
}

export async function hasVoted(artist: string, city: string): Promise<boolean> {
  const { data } = await supabase
    .from("votes")
    .select("id")
    .eq("device_id", getDeviceId())
    .eq("artist", artist)
    .eq("city", city)
    .maybeSingle();
  return !!data;
}

export async function castVote(artist: string, city: string): Promise<{ success: boolean; error?: string; flagged?: boolean }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(`${supabaseUrl}/functions/v1/cast-vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      artist,
      city,
      device_id: getDeviceId(),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, error: data.error || "Vote failed" };
  }

  return { success: true, flagged: data.flagged };
}

export async function getTallies(): Promise<VoteTally[]> {
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
}

export async function getTrendingCombinations(limit = 5): Promise<VoteTally[]> {
  const tallies = await getTallies();
  return tallies.slice(0, limit);
}

export async function getArtistTotals(): Promise<{ artist: string; total: number }[]> {
  const { data } = await supabase.from("votes").select("artist");
  if (!data) return [];

  const map = new Map<string, number>();
  for (const v of data) {
    map.set(v.artist, (map.get(v.artist) || 0) + 1);
  }
  return [...map.entries()]
    .map(([artist, total]) => ({ artist, total }))
    .sort((a, b) => b.total - a.total);
}

export async function seedDemoVotes() {
  const { count } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true });
  
  if (count && count > 0) return;

  const demoVotes = [
    { artist: "Patience Namadingo", city: "Lilongwe", device_id: "demo-1" },
    { artist: "Patience Namadingo", city: "Lilongwe", device_id: "demo-2" },
    { artist: "Patience Namadingo", city: "Lilongwe", device_id: "demo-3" },
    { artist: "Patience Namadingo", city: "Blantyre", device_id: "demo-4" },
    { artist: "Patience Namadingo", city: "Blantyre", device_id: "demo-5" },
    { artist: "Tay Grin", city: "Lilongwe", device_id: "demo-6" },
    { artist: "Tay Grin", city: "Lilongwe", device_id: "demo-7" },
    { artist: "Tay Grin", city: "Mzuzu", device_id: "demo-8" },
    { artist: "Tay Grin", city: "Mzuzu", device_id: "demo-9" },
    { artist: "Tay Grin", city: "Mzuzu", device_id: "demo-10" },
    { artist: "Zeze Kingston", city: "Blantyre", device_id: "demo-11" },
    { artist: "Zeze Kingston", city: "Blantyre", device_id: "demo-12" },
    { artist: "Zeze Kingston", city: "Blantyre", device_id: "demo-13" },
    { artist: "Zeze Kingston", city: "Zomba", device_id: "demo-14" },
    { artist: "Gwamba", city: "Lilongwe", device_id: "demo-15" },
    { artist: "Gwamba", city: "Lilongwe", device_id: "demo-16" },
    { artist: "Eli Njuchi", city: "Blantyre", device_id: "demo-17" },
    { artist: "Eli Njuchi", city: "Mzuzu", device_id: "demo-18" },
    { artist: "Phyzix", city: "Lilongwe", device_id: "demo-19" },
    { artist: "Sangie", city: "Zomba", device_id: "demo-20" },
    { artist: "Sangie", city: "Zomba", device_id: "demo-21" },
    { artist: "Martse", city: "Mangochi", device_id: "demo-22" },
    { artist: "Fredokiss", city: "Lilongwe", device_id: "demo-23" },
  ];

  await supabase.from("votes").insert(demoVotes);
}
