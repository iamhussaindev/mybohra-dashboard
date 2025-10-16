-- =====================================================
-- QUICK SETUP: Location Table for Supabase
-- =====================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Click RUN to execute
-- =====================================================

-- Step 1: Create sequence
CREATE SEQUENCE IF NOT EXISTS location_id_seq;

-- Step 2: Create table
CREATE TABLE IF NOT EXISTS public.location
(
    id integer NOT NULL DEFAULT nextval('location_id_seq'::regclass),
    type character varying NOT NULL DEFAULT 'city',
    city character varying NOT NULL,
    country character varying NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    timezone character varying NOT NULL,
    state character varying,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY (id),
    CONSTRAINT check_latitude_range CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT check_longitude_range CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT check_type_valid CHECK (type IN ('city', 'state', 'country', 'region', 'other'))
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_location_type ON public.location(type);
CREATE INDEX IF NOT EXISTS idx_location_city ON public.location(city);
CREATE INDEX IF NOT EXISTS idx_location_country ON public.location(country);
CREATE INDEX IF NOT EXISTS idx_location_state ON public.location(state);

-- Step 4: Create auto-update trigger
CREATE OR REPLACE FUNCTION update_location_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_location_updated_at ON public.location;

CREATE TRIGGER trigger_update_location_updated_at
    BEFORE UPDATE ON public.location
    FOR EACH ROW
    EXECUTE FUNCTION update_location_updated_at();

-- Step 5: Enable RLS and create policies
ALTER TABLE public.location ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "location_select_policy" ON public.location;
DROP POLICY IF EXISTS "location_insert_policy" ON public.location;
DROP POLICY IF EXISTS "location_update_policy" ON public.location;
DROP POLICY IF EXISTS "location_delete_policy" ON public.location;

CREATE POLICY "location_select_policy" ON public.location FOR SELECT TO authenticated USING (true);
CREATE POLICY "location_insert_policy" ON public.location FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "location_update_policy" ON public.location FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "location_delete_policy" ON public.location FOR DELETE TO authenticated USING (true);

-- Step 6: Grant permissions
GRANT ALL ON public.location TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE location_id_seq TO authenticated;

-- Step 7: Insert sample data (OPTIONAL - comment out if not needed)
INSERT INTO public.location (type, city, country, latitude, longitude, timezone, state) 
VALUES
    ('city', 'New York', 'United States', 40.7128, -74.0060, 'America/New_York', 'New York'),
    ('city', 'London', 'United Kingdom', 51.5074, -0.1278, 'Europe/London', NULL),
    ('city', 'Dubai', 'United Arab Emirates', 25.2048, 55.2708, 'Asia/Dubai', NULL),
    ('city', 'Mumbai', 'India', 19.0760, 72.8777, 'Asia/Kolkata', 'Maharashtra'),
    ('city', 'Tokyo', 'Japan', 35.6762, 139.6503, 'Asia/Tokyo', NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE! Location table is ready to use.
-- Navigate to /dashboard/location in your app.
-- =====================================================

-- Verify setup (optional):
SELECT 'Location table created successfully!' as status,
       count(*) as sample_locations 
FROM public.location;

