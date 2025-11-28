-- Crear las tablas principales de Autospace con RLS corregidas

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para actualizar updated_at en cars
CREATE TRIGGER update_cars_updated_at
    BEFORE UPDATE ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'cliente')
  );
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Función para verificar si es admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Habilitar RLS en todas las tablas
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cars
CREATE POLICY "Los autos activos son visibles para todos" 
ON public.cars FOR SELECT 
USING (is_active = true);

CREATE POLICY "Solo admins pueden insertar autos" 
ON public.cars FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Solo admins pueden actualizar autos" 
ON public.cars FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Solo admins pueden eliminar autos" 
ON public.cars FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Políticas RLS para car_images
CREATE POLICY "Las imágenes de autos son visibles para todos" 
ON public.car_images FOR SELECT 
USING (true);

CREATE POLICY "Solo admins pueden insertar imágenes" 
ON public.car_images FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Solo admins pueden actualizar imágenes" 
ON public.car_images FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Solo admins pueden eliminar imágenes" 
ON public.car_images FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Políticas RLS para profiles
CREATE POLICY "Los perfiles son visibles para todos los usuarios autenticados" 
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Políticas RLS para contacts
CREATE POLICY "Todos pueden crear contactos" 
ON public.contacts FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Solo admins pueden ver contactos" 
ON public.contacts FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Políticas RLS para favorites
CREATE POLICY "Los usuarios pueden ver sus propios favoritos" 
ON public.favorites FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios favoritos" 
ON public.favorites FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios favoritos" 
ON public.favorites FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Insertar algunos autos de ejemplo
INSERT INTO public.cars (brand, model, year, price, mileage, fuel_type, transmission, color, condition, description, is_active) VALUES
('Toyota', 'Corolla', 2022, 320000.00, 15000, 'Gasolina', 'Automático', 'Blanco', 'seminuevo', 'Toyota Corolla 2022 en excelente estado, único dueño, factura original.', true),
('Honda', 'Civic', 2023, 380000.00, 8000, 'Gasolina', 'Manual', 'Gris', 'seminuevo', 'Honda Civic 2023, equipamiento completo, servicios en agencia.', true),
('Nissan', 'Sentra', 2021, 280000.00, 25000, 'Gasolina', 'CVT', 'Negro', 'usado', 'Nissan Sentra 2021, ideal para ciudad, muy económico.', true),
('Mazda', 'CX-5', 2023, 520000.00, 5000, 'Gasolina', 'Automático', 'Rojo', 'seminuevo', 'Mazda CX-5 2023, SUV premium con tecnología avanzada.', true),
('Volkswagen', 'Jetta', 2022, 350000.00, 18000, 'Gasolina', 'Automático', 'Azul', 'seminuevo', 'Volkswagen Jetta 2022, alemán confiable y elegante.', true),
('Ford', 'Mustang', 2021, 680000.00, 12000, 'Gasolina', 'Manual', 'Amarillo', 'usado', 'Ford Mustang 2021, deportivo auténtico, para entusiastas.', true);