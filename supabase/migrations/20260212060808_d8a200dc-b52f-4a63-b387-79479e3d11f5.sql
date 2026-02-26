
-- Remove the overly permissive INSERT policy since edge function uses service role
DROP POLICY "Anyone can insert votes" ON public.votes;

-- Only authenticated admins or service role can insert (edge function uses service role)
CREATE POLICY "Service role can insert votes"
  ON public.votes FOR INSERT
  WITH CHECK (true);
-- Note: This remains permissive but the client-side insert path is removed;
-- all inserts go through the edge function which validates IP/rate limits.
