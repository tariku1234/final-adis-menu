-- Supabase Storage Buckets Setup
-- Run this in your Supabase SQL Editor

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('menu-images', 'menu-images', true),
  ('restaurant-logos', 'restaurant-logos', true),
  ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for menu-images bucket
CREATE POLICY "Anyone can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their menu images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their menu images"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- Set up storage policies for restaurant-logos bucket
CREATE POLICY "Anyone can view restaurant logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-logos');

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated');

-- Set up storage policies for qr-codes bucket
CREATE POLICY "Anyone can view QR codes"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-codes');

CREATE POLICY "Authenticated users can upload QR codes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update QR codes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete QR codes"
ON storage.objects FOR DELETE
USING (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');
