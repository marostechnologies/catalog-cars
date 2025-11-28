-- Corregir todas las funciones con search_path mutable

-- Actualizar función update_updated_at_column con search_path fijo
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public;