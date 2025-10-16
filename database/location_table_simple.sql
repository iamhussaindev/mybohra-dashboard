-- =====================================================
-- Simple Location Table Setup (Minimal Version)
-- =====================================================
-- Quick setup script for location table
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create sequence
CREATE SEQUENCE IF NOT EXISTS location_id_seq;

-- Create table
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
    PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX idx_location_city ON public.location(city);
CREATE INDEX idx_location_country ON public.location(country);

-- Enable RLS
ALTER TABLE public.location ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access"
    ON public.location
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.location TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE location_id_seq TO authenticated;

