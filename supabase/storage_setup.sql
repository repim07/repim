-- =============================================================================
-- REPIM — Configuration du bucket Supabase Storage pour les photos de biens
-- =============================================================================
--
-- ÉTAPE 1 : Créer le bucket dans le Dashboard Supabase
--   Storage → New bucket → Nom : "property-photos" → Public : OUI → Save
--
-- ÉTAPE 2 : Exécuter ce SQL dans SQL Editor
-- =============================================================================

-- Permettre à tout utilisateur connecté d'uploader dans son dossier
CREATE POLICY "property-photos: upload par l'auteur"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Lecture publique (les photos sont visibles par tous)
CREATE POLICY "property-photos: lecture publique"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-photos');

-- Suppression par le propriétaire du dossier
CREATE POLICY "property-photos: suppression par l'auteur"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
