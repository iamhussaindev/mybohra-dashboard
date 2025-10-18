-- Fix for search_library function to return all Library fields
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION search_library(
    p_query TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR,
    description TEXT,
    audio_url TEXT,
    pdf_url TEXT,
    youtube_url TEXT,
    video_url TEXT,
    album VARCHAR,
    metadata JSONB,
    tags TEXT[],
    categories TEXT[],
    arabic_text TEXT,
    transliteration TEXT,
    translation TEXT,
    search_text TEXT,
    search_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.description,
        l.audio_url,
        l.pdf_url,
        l.youtube_url,
        l.video_url,
        l.album,
        l.metadata,
        l.tags,
        l.categories,
        l.arabic_text,
        l.transliteration,
        l.translation,
        l.search_text,
        l.search_vector,
        l.created_at,
        l.updated_at,
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
       OR COALESCE(l.arabic_text, '') ILIKE '%' || p_query || '%'
       OR COALESCE(l.transliteration, '') ILIKE '%' || p_query || '%'
       OR COALESCE(l.translation, '') ILIKE '%' || p_query || '%'
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

