
-- Create artists table
CREATE TABLE public.artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read artists" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Admins can manage artists" ON public.artists FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create cities table
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Admins can manage cities" ON public.cities FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Seed with existing data
INSERT INTO public.artists (name) VALUES
  ('Zeze Kingston'), ('Tay Grin'), ('Patience Namadingo'), ('Gwamba'),
  ('Eli Njuchi'), ('Phyzix'), ('Sangie'), ('Lulu'), ('Martse'), ('Fredokiss');

INSERT INTO public.cities (name) VALUES
  ('Lilongwe'), ('Blantyre'), ('Zomba'), ('Mzuzu'), ('Mangochi'),
  ('Salima'), ('Karonga'), ('Dedza'), ('Nkhotakota'), ('Kasungu');
