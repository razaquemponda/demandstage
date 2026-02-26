
-- Add image_url column to artists table
ALTER TABLE public.artists ADD COLUMN image_url text;

-- Create storage bucket for artist images
INSERT INTO storage.buckets (id, name, public) VALUES ('artist-images', 'artist-images', true);

-- Allow anyone to view artist images
CREATE POLICY "Anyone can view artist images"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-images');

-- Allow admins to upload artist images
CREATE POLICY "Admins can upload artist images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'artist-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update artist images
CREATE POLICY "Admins can update artist images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'artist-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete artist images
CREATE POLICY "Admins can delete artist images"
ON storage.objects FOR DELETE
USING (bucket_id = 'artist-images' AND public.has_role(auth.uid(), 'admin'));
