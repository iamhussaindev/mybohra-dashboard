# Supabase Storage Setup Guide

This guide will help you set up the required storage buckets for the library management system.

## Required Storage Buckets

You need to create two storage buckets in your Supabase project:

### 1. Audio Bucket

- **Bucket Name**: `audio`
- **Public**: Yes (so audio files can be accessed directly)
- **File Size Limit**: 100MB (recommended)
- **Allowed MIME Types**: `audio/*`

### 2. PDF Bucket

- **Bucket Name**: `pdf`
- **Public**: Yes (so PDF files can be accessed directly)
- **File Size Limit**: 50MB (recommended)
- **Allowed MIME Types**: `application/pdf`

## Setup Steps

### 1. Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar

### 2. Create Audio Bucket

1. Click **New Bucket**
2. Set bucket name to `audio`
3. Check **Public bucket** (important!)
4. Click **Create Bucket**
5. Go to **Settings** → **File Size Limit** → Set to 100MB
6. Go to **Settings** → **Allowed MIME Types** → Add `audio/*`

### 3. Create PDF Bucket

1. Click **New Bucket**
2. Set bucket name to `pdf`
3. Check **Public bucket** (important!)
4. Click **Create Bucket**
5. Go to **Settings** → **File Size Limit** → Set to 50MB
6. Go to **Settings** → **Allowed MIME Types** → Add `application/pdf`

### 4. Set Up Row Level Security (RLS)

For each bucket, you need to set up RLS policies:

#### Audio Bucket Policies

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'audio');

-- Allow public access to read files
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'audio');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'audio');
```

#### PDF Bucket Policies

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pdf');

-- Allow public access to read files
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'pdf');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'pdf');
```

## Testing the Setup

1. Go to your library management page
2. Try uploading an audio file (drag and drop or click to select)
3. Try uploading a PDF file
4. Check that the files appear in your Supabase storage buckets
5. Verify that the audio player works with uploaded files
6. Test the file existence checker

## Troubleshooting

### Common Issues

1. **Files not uploading**: Check RLS policies and bucket permissions
2. **Audio not playing**: Ensure bucket is public and CORS is configured
3. **PDF not opening**: Verify bucket is public and file is properly uploaded
4. **File checker showing "Missing"**: Check file path extraction logic

### Environment Variables

Make sure these are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Organization

Files are organized in buckets as follows:

- Audio files: `/audio/{filename}`
- PDF files: `/pdf/{filename}`

The system automatically generates unique filenames to prevent conflicts.
