-- =====================================================
-- Location Table Setup for Supabase
-- =====================================================
-- This script creates the location table with sequence, 
-- indexes, triggers, and Row Level Security (RLS) policies
-- =====================================================

-- 1. Create sequence for location ID
CREATE SEQUENCE IF NOT EXISTS location_id_seq;

-- 2. Create location table
CREATE TABLE IF NOT EXISTS public.location
(
    id integer NOT NULL DEFAULT nextval('location_id_seq'::regclass),
    type character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'city'::character varying,
    city character varying COLLATE pg_catalog."default" NOT NULL,
    country character varying COLLATE pg_catalog."default" NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    timezone character varying COLLATE pg_catalog."default" NOT NULL,
    state character varying COLLATE pg_catalog."default",
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY (id)
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_location_type ON public.location(type);
CREATE INDEX IF NOT EXISTS idx_location_city ON public.location(city);
CREATE INDEX IF NOT EXISTS idx_location_country ON public.location(country);
CREATE INDEX IF NOT EXISTS idx_location_state ON public.location(state);
CREATE INDEX IF NOT EXISTS idx_location_created_at ON public.location(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_location_city_country ON public.location(city, country);

-- GiST index for geographical queries (if you plan to use PostGIS in the future)
-- Uncomment if you install PostGIS extension
-- CREATE INDEX IF NOT EXISTS idx_location_coordinates ON public.location 
-- USING gist (ll_to_earth(latitude, longitude));

-- 4. Create trigger to auto-update updated_at timestamp
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

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.location ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies

-- Policy: Allow authenticated users to read all locations
DROP POLICY IF EXISTS "Allow authenticated users to read locations" ON public.location;
CREATE POLICY "Allow authenticated users to read locations"
    ON public.location
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert locations
DROP POLICY IF EXISTS "Allow authenticated users to insert locations" ON public.location;
CREATE POLICY "Allow authenticated users to insert locations"
    ON public.location
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update locations
DROP POLICY IF EXISTS "Allow authenticated users to update locations" ON public.location;
CREATE POLICY "Allow authenticated users to update locations"
    ON public.location
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to delete locations
DROP POLICY IF EXISTS "Allow authenticated users to delete locations" ON public.location;
CREATE POLICY "Allow authenticated users to delete locations"
    ON public.location
    FOR DELETE
    TO authenticated
    USING (true);

-- Optional: Public read access (uncomment if you want anonymous users to read)
-- DROP POLICY IF EXISTS "Allow public read access" ON public.location;
-- CREATE POLICY "Allow public read access"
--     ON public.location
--     FOR SELECT
--     TO public
--     USING (true);

-- 7. Grant permissions
GRANT ALL ON public.location TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE location_id_seq TO authenticated;

-- Optional: Grant public read access (uncomment if needed)
-- GRANT SELECT ON public.location TO anon;

-- 8. Add comments for documentation
COMMENT ON TABLE public.location IS 'Stores geographical location data including cities, states, countries with coordinates and timezone information';
COMMENT ON COLUMN public.location.id IS 'Primary key, auto-incremented';
COMMENT ON COLUMN public.location.type IS 'Type of location: city, state, country, region, spot, or other';
COMMENT ON COLUMN public.location.city IS 'City name (required)';
COMMENT ON COLUMN public.location.country IS 'Country name (required)';
COMMENT ON COLUMN public.location.latitude IS 'Latitude coordinate in decimal degrees';
COMMENT ON COLUMN public.location.longitude IS 'Longitude coordinate in decimal degrees';
COMMENT ON COLUMN public.location.timezone IS 'IANA timezone identifier (e.g., America/New_York)';
COMMENT ON COLUMN public.location.state IS 'State or province name (optional)';
COMMENT ON COLUMN public.location.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.location.updated_at IS 'Timestamp when the record was last updated';

-- 9. Create check constraints for data validation
ALTER TABLE public.location 
    ADD CONSTRAINT check_latitude_range 
    CHECK (latitude >= -90 AND latitude <= 90);

ALTER TABLE public.location 
    ADD CONSTRAINT check_longitude_range 
    CHECK (longitude >= -180 AND longitude <= 180);

ALTER TABLE public.location 
    ADD CONSTRAINT check_type_valid 
    CHECK (type IN ('city', 'state', 'country', 'region', 'spot', 'other'));

-- 10. Insert sample data (optional - uncomment to use)
/*
INSERT INTO public.location (type, city, country, latitude, longitude, timezone, state) VALUES
    ('city', 'New York', 'United States', 40.7128, -74.0060, 'America/New_York', 'New York'),
    ('city', 'London', 'United Kingdom', 51.5074, -0.1278, 'Europe/London', NULL),
    ('city', 'Tokyo', 'Japan', 35.6762, 139.6503, 'Asia/Tokyo', NULL),
    ('city', 'Dubai', 'United Arab Emirates', 25.2048, 55.2708, 'Asia/Dubai', NULL),
    ('city', 'Mumbai', 'India', 19.0760, 72.8777, 'Asia/Kolkata', 'Maharashtra'),
    ('city', 'Sydney', 'Australia', -33.8688, 151.2093, 'Australia/Sydney', 'New South Wales'),
    ('city', 'Paris', 'France', 48.8566, 2.3522, 'Europe/Paris', NULL),
    ('city', 'Singapore', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore', NULL),
    ('city', 'Los Angeles', 'United States', 34.0522, -118.2437, 'America/Los_Angeles', 'California'),
    ('city', 'Chicago', 'United States', 41.8781, -87.6298, 'America/Chicago', 'Illinois');
*/

-- =====================================================
-- Migration Complete!
-- =====================================================
-- You can now use the location table with:
-- - Automatic ID generation
-- - Auto-updated timestamps
-- - Row Level Security enabled
-- - Performance indexes
-- - Data validation constraints
-- =====================================================

-- Verification queries (optional - run to verify setup):
/*
-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'location'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'location' AND schemaname = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'location';

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.location'::regclass;
*/

