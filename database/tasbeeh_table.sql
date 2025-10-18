-- Tasbeeh Table Setup
-- This table stores tasbeeh (dhikr) entries with Arabic text, audio, and metadata

-- Drop existing table and related objects (for clean setup)
DROP TABLE IF EXISTS public.tasbeeh CASCADE;

-- Create enum type for tasbeeh type
DO $$ BEGIN
    CREATE TYPE public.tasbeeh_type_enum AS ENUM (
        'DHIKR',
        'DUA',
        'SALAWAT',
        'QURAN',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the tasbeeh table
CREATE TABLE public.tasbeeh (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    text VARCHAR(500),
    arabic_text VARCHAR(500),
    image VARCHAR(500),
    audio VARCHAR(500),
    description VARCHAR(1000),
    count INTEGER DEFAULT 0,
    type public.tasbeeh_type_enum NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add comments for documentation
COMMENT ON TABLE public.tasbeeh IS 'Table storing tasbeeh (dhikr) entries with Arabic text, audio, and metadata';
COMMENT ON COLUMN public.tasbeeh.id IS 'Unique identifier for the tasbeeh entry';
COMMENT ON COLUMN public.tasbeeh.name IS 'Name of the tasbeeh entry';
COMMENT ON COLUMN public.tasbeeh.text IS 'English/transliterated text';
COMMENT ON COLUMN public.tasbeeh.arabic_text IS 'Arabic text';
COMMENT ON COLUMN public.tasbeeh.image IS 'Image URL for the tasbeeh';
COMMENT ON COLUMN public.tasbeeh.audio IS 'Audio URL for the tasbeeh';
COMMENT ON COLUMN public.tasbeeh.description IS 'Description of the tasbeeh';
COMMENT ON COLUMN public.tasbeeh.count IS 'Default count for this tasbeeh';
COMMENT ON COLUMN public.tasbeeh.type IS 'Type of tasbeeh: DHIKR, DUA, SALAWAT, QURAN, OTHER';
COMMENT ON COLUMN public.tasbeeh.tags IS 'Array of tags for categorization';

-- Create indexes for optimal query performance
CREATE INDEX idx_tasbeeh_name ON public.tasbeeh(name);
CREATE INDEX idx_tasbeeh_type ON public.tasbeeh(type);
CREATE INDEX idx_tasbeeh_tags ON public.tasbeeh USING GIN(tags);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasbeeh_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tasbeeh_updated_at
    BEFORE UPDATE ON public.tasbeeh
    FOR EACH ROW
    EXECUTE FUNCTION update_tasbeeh_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasbeeh ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read all tasbeeh
CREATE POLICY "Allow authenticated users to read tasbeeh"
    ON public.tasbeeh
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert tasbeeh
CREATE POLICY "Allow authenticated users to insert tasbeeh"
    ON public.tasbeeh
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update tasbeeh
CREATE POLICY "Allow authenticated users to update tasbeeh"
    ON public.tasbeeh
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete tasbeeh
CREATE POLICY "Allow authenticated users to delete tasbeeh"
    ON public.tasbeeh
    FOR DELETE
    TO authenticated
    USING (true);

-- Create a function to search tasbeeh
CREATE OR REPLACE FUNCTION search_tasbeeh(p_query TEXT, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR(255),
    text VARCHAR(500),
    arabic_text VARCHAR(500),
    image VARCHAR(500),
    audio VARCHAR(500),
    description VARCHAR(1000),
    count INTEGER,
    type public.tasbeeh_type_enum,
    tags TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.text,
        t.arabic_text,
        t.image,
        t.audio,
        t.description,
        t.count,
        t.type,
        t.tags,
        t.created_at,
        t.updated_at,
        ts_rank(
            to_tsvector('english', COALESCE(t.name, '') || ' ' || COALESCE(t.text, '') || ' ' || COALESCE(t.description, '')),
            plainto_tsquery('english', p_query)
        ) as rank
    FROM public.tasbeeh t
    WHERE 
        to_tsvector('english', COALESCE(t.name, '') || ' ' || COALESCE(t.text, '') || ' ' || COALESCE(t.description, ''))
        @@ plainto_tsquery('english', p_query)
        OR t.name ILIKE '%' || p_query || '%'
        OR t.text ILIKE '%' || p_query || '%'
        OR t.arabic_text ILIKE '%' || p_query || '%'
    ORDER BY rank DESC, t.name ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION search_tasbeeh(TEXT, INTEGER) TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Tasbeeh table created successfully!';
    RAISE NOTICE 'You can now manage tasbeeh entries with Arabic text, audio, and metadata.';
END $$;
