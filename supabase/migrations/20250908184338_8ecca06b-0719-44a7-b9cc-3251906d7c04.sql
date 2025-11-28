-- Corregir función update_cars_updated_at con search_path

CREATE OR REPLACE FUNCTION public.update_cars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public;