-- Miqaat Table Setup
-- This file contains the complete setup for the miqaat table including schema, indexes, triggers, and RLS policies.

-- Drop existing table and related objects (for clean setup)
DROP TABLE IF EXISTS public.miqaat CASCADE;

-- Create enum types for phase and miqaat type
DO $$ BEGIN
    CREATE TYPE public.phase_enum AS ENUM ('DAY', 'NIGHT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.miqaat_type_enum AS ENUM (
        'URS',
        'MILAD',
        'WASHEQ',
        'PEHLI_RAAT',
        'SHAHADAT',
        'ASHARA',
        'IMPORTANT_NIGHT',
        'EID',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the miqaat table
CREATE TABLE public.miqaat (
    id BIGSERIAL PRIMARY KEY,
    name CHARACTER VARYING(255) NOT NULL,
    description TEXT,
    date INTEGER,
    month INTEGER,
    location CHARACTER VARYING(255),
    type public.miqaat_type_enum,
    date_night INTEGER,
    month_night INTEGER,
    priority INTEGER,
    important BOOLEAN DEFAULT false,
    phase public.phase_enum NOT NULL DEFAULT 'DAY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add comments for documentation
COMMENT ON TABLE public.miqaat IS 'Table storing Islamic calendar dates and events (Miqaats)';
COMMENT ON COLUMN public.miqaat.id IS 'Unique identifier for the miqaat';
COMMENT ON COLUMN public.miqaat.name IS 'Name of the miqaat event';
COMMENT ON COLUMN public.miqaat.description IS 'Description of the miqaat';
COMMENT ON COLUMN public.miqaat.date IS 'Day of the month (1-31)';
COMMENT ON COLUMN public.miqaat.month IS 'Month number (1-12 for Islamic calendar)';
COMMENT ON COLUMN public.miqaat.location IS 'Location associated with the miqaat';
COMMENT ON COLUMN public.miqaat.type IS 'Type of miqaat: URS, MILAD, WASHEQ, PEHLI_RAAT, SHAHADAT, ASHARA, IMPORTANT_NIGHT, EID, OTHER';
COMMENT ON COLUMN public.miqaat.date_night IS 'Night date if applicable';
COMMENT ON COLUMN public.miqaat.month_night IS 'Night month if applicable';
COMMENT ON COLUMN public.miqaat.priority IS 'Priority level for sorting/display';
COMMENT ON COLUMN public.miqaat.important IS 'Flag indicating if this is an important miqaat';
COMMENT ON COLUMN public.miqaat.phase IS 'Phase of the miqaat: DAY or NIGHT';
COMMENT ON COLUMN public.miqaat.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.miqaat.updated_at IS 'Timestamp when the record was last updated';

-- Create indexes for better query performance
CREATE INDEX idx_miqaat_month ON public.miqaat(month);
CREATE INDEX idx_miqaat_date ON public.miqaat(date);
CREATE INDEX idx_miqaat_type ON public.miqaat(type);
CREATE INDEX idx_miqaat_important ON public.miqaat(important);
CREATE INDEX idx_miqaat_phase ON public.miqaat(phase);
CREATE INDEX idx_miqaat_month_date ON public.miqaat(month, date);
CREATE INDEX idx_miqaat_name ON public.miqaat(name);

-- Add check constraints for data validation
ALTER TABLE public.miqaat
    ADD CONSTRAINT chk_miqaat_month_range
    CHECK (month IS NULL OR (month >= 1 AND month <= 12));

ALTER TABLE public.miqaat
    ADD CONSTRAINT chk_miqaat_date_range
    CHECK (date IS NULL OR (date >= 1 AND date <= 31));

ALTER TABLE public.miqaat
    ADD CONSTRAINT chk_miqaat_month_night_range
    CHECK (month_night IS NULL OR (month_night >= 1 AND month_night <= 12));

ALTER TABLE public.miqaat
    ADD CONSTRAINT chk_miqaat_date_night_range
    CHECK (date_night IS NULL OR (date_night >= 1 AND date_night <= 31));

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_miqaat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the update function
DROP TRIGGER IF EXISTS trigger_update_miqaat_updated_at ON public.miqaat;
CREATE TRIGGER trigger_update_miqaat_updated_at
    BEFORE UPDATE ON public.miqaat
    FOR EACH ROW
    EXECUTE FUNCTION public.update_miqaat_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.miqaat ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for SELECT: Allow all authenticated users to read miqaat data
DROP POLICY IF EXISTS "Allow authenticated users to read miqaat" ON public.miqaat;
CREATE POLICY "Allow authenticated users to read miqaat"
    ON public.miqaat
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for INSERT: Allow authenticated users to insert miqaat data
DROP POLICY IF EXISTS "Allow authenticated users to insert miqaat" ON public.miqaat;
CREATE POLICY "Allow authenticated users to insert miqaat"
    ON public.miqaat
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for UPDATE: Allow authenticated users to update miqaat data
DROP POLICY IF EXISTS "Allow authenticated users to update miqaat" ON public.miqaat;
CREATE POLICY "Allow authenticated users to update miqaat"
    ON public.miqaat
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for DELETE: Allow authenticated users to delete miqaat data
DROP POLICY IF EXISTS "Allow authenticated users to delete miqaat" ON public.miqaat;
CREATE POLICY "Allow authenticated users to delete miqaat"
    ON public.miqaat
    FOR DELETE
    TO authenticated
    USING (true);

-- Grant necessary permissions
GRANT ALL ON public.miqaat TO authenticated;
GRANT ALL ON public.miqaat TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.miqaat_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.miqaat_id_seq TO service_role;

-- Optional: Create a view for easier querying of important dates
CREATE OR REPLACE VIEW public.important_miqaats AS
SELECT 
    id,
    name,
    description,
    date,
    month,
    location,
    type,
    phase,
    created_at,
    updated_at
FROM public.miqaat
WHERE important = true
ORDER BY month, date;

COMMENT ON VIEW public.important_miqaats IS 'View showing only important miqaats';

-- Grant access to the view
GRANT SELECT ON public.important_miqaats TO authenticated;
GRANT SELECT ON public.important_miqaats TO service_role;

