-- ==========================================
-- 08_storage_documents.sql
-- ELIMU RDC - Storage Bucket & Policies for Application Documents
-- ==========================================

-- 1. Create the private storage bucket named "application-documents" (public: false)
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO UPDATE SET
  public = false;

-- 2. Allow anon and authenticated roles to UPLOAD (INSERT) files into this bucket
DROP POLICY IF EXISTS "Allow anon and authenticated upload to application-documents" ON storage.objects;
CREATE POLICY "Allow anon and authenticated upload to application-documents"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'application-documents'
);

-- 3. Allow anon and authenticated to read/create signed URLs for application-documents
DROP POLICY IF EXISTS "Allow authenticated read on application-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow read on application-documents" ON storage.objects;
CREATE POLICY "Allow read on application-documents"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'application-documents'
);
