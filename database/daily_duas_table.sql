-- Daily Duas Table Setup
-- Simple version without priority field

-- Drop existing table and related objects (for clean setup)
DROP TABLE IF EXISTS public.daily_duas CASCADE;

-- Create the daily_duas table
CREATE TABLE public.daily_duas (
    id BIGSERIAL PRIMARY KEY,
    library_id BIGINT NOT NULL REFERENCES public.library(id) ON DELETE CASCADE,
    date INTEGER NOT NULL CHECK (date >= 1 AND date <= 30),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure unique library item per date
    UNIQUE(library_id, date, month)
);

-- Create indexes for optimal query performance
CREATE INDEX idx_daily_duas_library_id ON public.daily_duas(library_id);
CREATE INDEX idx_daily_duas_date_month ON public.daily_duas(date, month);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_duas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_daily_duas_updated_at
    BEFORE UPDATE ON public.daily_duas
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_duas_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.daily_duas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to read daily_duas"
    ON public.daily_duas
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert daily_duas"
    ON public.daily_duas
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update daily_duas"
    ON public.daily_duas
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete daily_duas"
    ON public.daily_duas
    FOR DELETE
    TO authenticated
    USING (true);
