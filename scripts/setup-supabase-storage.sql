-- Setup Supabase Storage for vehicle images
-- Run this in Supabase SQL Editor

-- Create the bucket if it doesn't exist (public bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Policy 1: Allow anyone to upload to vehicle-images bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'vehicle-images');

-- Policy 2: Allow anyone to read from vehicle-images bucket
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vehicle-images');

-- Policy 3: Allow anyone to delete from vehicle-images bucket
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'vehicle-images');
