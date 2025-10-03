-- Create data table for Supabase
CREATE TABLE IF NOT EXISTS public.data (
    id SERIAL PRIMARY KEY,
    key VARCHAR UNIQUE NOT NULL,
    value VARCHAR,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on key for better performance
CREATE INDEX IF NOT EXISTS idx_data_key ON public.data (key);

-- Enable Row Level Security
ALTER TABLE public.data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.data
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.data
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.data
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.data
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_data_updated_at
    BEFORE UPDATE ON public.data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
