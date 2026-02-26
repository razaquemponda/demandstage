
-- Create votes table
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist TEXT NOT NULL,
  city TEXT NOT NULL,
  device_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read votes (public results)
CREATE POLICY "Anyone can read votes" ON public.votes FOR SELECT USING (true);

-- Anyone can insert votes (anonymous voting)
CREATE POLICY "Anyone can insert votes" ON public.votes FOR INSERT WITH CHECK (true);

-- Create unique constraint to prevent duplicate votes per device/artist/city
CREATE UNIQUE INDEX idx_votes_unique ON public.votes (device_id, artist, city);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
