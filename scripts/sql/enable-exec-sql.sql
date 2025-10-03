-- Enable exec_sql function in Supabase
-- Copy and paste this SQL into your Supabase SQL Editor

-- Create the exec_sql function
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    -- Execute the SQL and return results as JSON
    EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || sql || ') t' INTO result;
    
    -- If no results, return empty array
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error information
        RETURN json_build_object(
            'error', true,
            'message', SQLERRM,
            'code', SQLSTATE
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

-- Test the function
SELECT exec_sql('SELECT table_name FROM information_schema.tables WHERE table_schema = ''public'' LIMIT 5');
