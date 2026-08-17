DROP POLICY IF EXISTS "Public read car-images" ON storage.objects;
CREATE POLICY "Public read car-images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'car-images');

DROP POLICY IF EXISTS "Admins write car-images" ON storage.objects;
CREATE POLICY "Admins write car-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update car-images" ON storage.objects;
CREATE POLICY "Admins update car-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete car-images" ON storage.objects;
CREATE POLICY "Admins delete car-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.__tmp_apply_migration(text);