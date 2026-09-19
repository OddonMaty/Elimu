-- ==========================================
-- 09_school_media_storage.sql
-- ELIMU RDC - Public Storage Bucket & Policies for School Media (Covers & Logos)
-- ==========================================

-- 1. Create the public storage bucket named "school-media"
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-media', 'school-media', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- 2. Allow public access (anon & authenticated) to read/download school media
DROP POLICY IF EXISTS "Allow public read on school-media" ON storage.objects;
CREATE POLICY "Allow public read on school-media"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'school-media'
);

-- 3. Allow authenticated users to upload (INSERT) into school-media
DROP POLICY IF EXISTS "Allow authenticated upload to school-media" ON storage.objects;
CREATE POLICY "Allow authenticated upload to school-media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-media'
);

-- 4. Allow authenticated users to update/overwrite (UPDATE) in school-media
DROP POLICY IF EXISTS "Allow authenticated update on school-media" ON storage.objects;
CREATE POLICY "Allow authenticated update on school-media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-media'
)
WITH CHECK (
  bucket_id = 'school-media'
);

-- 5. Allow authenticated users to delete (DELETE) from school-media
DROP POLICY IF EXISTS "Allow authenticated delete on school-media" ON storage.objects;
CREATE POLICY "Allow authenticated delete on school-media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-media'
);
