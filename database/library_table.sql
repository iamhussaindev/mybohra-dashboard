-- Library Table Setup with Full-Text Search
-- This script creates the library table with search functionality

-- Drop existing table and related objects (for clean setup)
DROP TABLE IF EXISTS public.library CASCADE;

-- Create the library table
CREATE TABLE public.library (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    audio_url TEXT,
    pdf_url TEXT,
    youtube_url TEXT,
    video_url TEXT,
    album VARCHAR(50),
    metadata JSONB,
    tags TEXT[],
    categories TEXT[],
    arabic_text TEXT,
    transliteration TEXT,
    translation TEXT,
    search_text TEXT GENERATED ALWAYS AS (
        COALESCE(name, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(album, '') || ' ' ||
        COALESCE(array_to_string(tags, ' '), '') || ' ' ||
        COALESCE(array_to_string(categories, ' '), '') || ' ' ||
        COALESCE(arabic_text, '') || ' ' ||
        COALESCE(transliteration, '') || ' ' ||
        COALESCE(translation, '')
    ) STORED,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(album, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(categories, ' '), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(arabic_text, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(transliteration, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(translation, '')), 'D')
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for optimal query performance
CREATE INDEX idx_library_name ON public.library(name);
CREATE INDEX idx_library_album ON public.library(album);
CREATE INDEX idx_library_tags ON public.library USING GIN(tags);
CREATE INDEX idx_library_categories ON public.library USING GIN(categories);
CREATE INDEX idx_library_search_vector ON public.library USING GIN(search_vector);
CREATE INDEX idx_library_created_at ON public.library(created_at DESC);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_library_updated_at
    BEFORE UPDATE ON public.library
    FOR EACH ROW
    EXECUTE FUNCTION update_library_updated_at();

-- Create full-text search function
CREATE OR REPLACE FUNCTION search_library(
    p_query TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR,
    description TEXT,
    album VARCHAR,
    tags TEXT[],
    categories TEXT[],
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.description,
        l.album,
        l.tags,
        l.categories,
        ts_rank(l.search_vector, websearch_to_tsquery('english', p_query)) AS rank
    FROM public.library l
    WHERE l.search_vector @@ websearch_to_tsquery('english', p_query)
       OR l.name ILIKE '%' || p_query || '%'
       OR l.description ILIKE '%' || p_query || '%'
       OR l.album ILIKE '%' || p_query || '%'
       OR EXISTS (
           SELECT 1 FROM unnest(l.tags) AS tag 
           WHERE tag ILIKE '%' || p_query || '%'
       )
       OR EXISTS (
           SELECT 1 FROM unnest(l.categories) AS cat 
           WHERE cat ILIKE '%' || p_query || '%'
       )
       OR l.arabic_text ILIKE '%' || p_query || '%'
       OR l.transliteration ILIKE '%' || p_query || '%'
       OR l.translation ILIKE '%' || p_query || '%'
    ORDER BY 
        CASE 
            WHEN l.name ILIKE p_query || '%' THEN 1
            WHEN l.name ILIKE '%' || p_query || '%' THEN 2
            ELSE 3
        END,
        rank DESC,
        l.name ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable Row Level Security (RLS)
ALTER TABLE public.library ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to read library"
    ON public.library
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert library"
    ON public.library
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update library"
    ON public.library
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete library"
    ON public.library
    FOR DELETE
    TO authenticated
    USING (true);

-- Add helpful comment
COMMENT ON TABLE public.library IS 'Library table for storing duas, manajaats, and other Islamic content with full-text search support';
COMMENT ON FUNCTION search_library(TEXT, INTEGER) IS 'Full-text search function for library items. Searches across name, description, album, tags, categories, and text fields.';

