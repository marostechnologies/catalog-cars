import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import CarCard from '@/components/ui/car-card';
import Navbar from '@/components/ui/navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Car = Database['public']['Tables']['cars']['Row'] & {
  car_images?: { id: string; image_url: string; is_primary: boolean }[];
};

const Catalog = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // query params del Hero
  const queryParams = new URLSearchParams(location.search);
  const brandParam = queryParams.get('brand') || '';
  const modelParam = queryParams.get('model') || '';
  const yearParam = queryParams.get('year') || '';
  const maxPriceParam = queryParams.get('maxPrice') || '';

  // filtros del navbar
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMaxPrice, setSelectedMaxPrice] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  const [brands, setBrands] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [fuels] = useState(['Gasolina', 'Diesel', 'Eléctrico', 'Híbrido']);
  const [transmissions] = useState(['Manual', 'Automático']);
  const [conditions] = useState(['Nuevo', 'Usado']);

  useEffect(() => {
    fetchFilterOptions();
    fetchFavorites();

    if (brandParam || modelParam || yearParam || maxPriceParam) {
      handleSearchFromHero();
    } else {
      fetchAllCars();
    }
  }, [location.search, user]);

  const fetchFilterOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('brand,year')
        .eq('is_active', true);

      if (error) throw error;

      const uniqueBrands = Array.from(new Set(data.map((item: any) => item.brand)));
      setBrands(uniqueBrands);

      const uniqueYears = Array.from(new Set(data.map((item: any) => item.year))).sort((a, b) => b - a);
      setYears(uniqueYears);

    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('favorites').select('car_id').eq('user_id', user.id);
      if (error) throw error;
      setFavorites(data?.map(f => f.car_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchAllCars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`*, car_images(id, image_url, is_primary)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error('Error fetching all cars:', error);
      toast.error('Error al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFromHero = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cars')
        .select(`*, car_images(id, image_url, is_primary)`)
        .eq('is_active', true);

      if (brandParam) query = query.ilike('brand', brandParam);
      if (modelParam) query = query.ilike('model', `%${modelParam}%`);
      if (yearParam) query = query.eq('year', parseInt(yearParam));
      if (maxPriceParam) query = query.lte('price', parseInt(maxPriceParam));

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      setCars(data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Error al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cars')
        .select(`*, car_images(id, image_url, is_primary)`)
        .eq('is_active', true);

      if (selectedBrand) query = query.ilike('brand', selectedBrand);
      if (selectedModel) query = query.ilike('model', `%${selectedModel}%`);
      if (selectedYear) query = query.eq('year', parseInt(selectedYear));
      if (selectedMaxPrice) query = query.lte('price', parseInt(selectedMaxPrice));
      if (selectedFuel) query = query.eq('fuel_type', selectedFuel);
      if (selectedTransmission) query = query.eq('transmission', selectedTransmission);
      if (selectedCondition) query = query.eq('condition', selectedCondition);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      setCars(data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Error al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (carId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      navigate('/auth');
      return;
    }
    try {
      const isFavorite = favorites.includes(carId);

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('car_id', carId);

        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== carId));
        toast.success('Eliminado de favoritos');
      } else {
        const { error } = await supabase.from('favorites').insert([{ user_id: user.id, car_id: carId }]);
        if (error) throw error;

        setFavorites(prev => [...prev, carId]);
        toast.success('Agregado a favoritos');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favoritos');
    }
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setSelectedMaxPrice('');
    setSelectedFuel('');
    setSelectedTransmission('');
    setSelectedCondition('');
    navigate('/catalog');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar />

      {/* Header con video */}
      <section className="relative pt-24 pb-16 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/autospace_video_hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="container relative z-10 px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">Catálogo de Autos</h1>
            <p className="text-lg md:text-2xl opacity-90">Explora, filtra y encuentra tu próximo vehículo</p>
          </motion.div>
        </div>
      </section>

      {/* Barra de filtros */}
      <section className="w-full bg-white border-b shadow-md">
        <div className="container px-4 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="rounded-xl shadow-sm"><SelectValue placeholder="Marca" /></SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Modelo"
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="rounded-xl shadow-sm"
          />

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="rounded-xl shadow-sm"><SelectValue placeholder="Año" /></SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Precio máximo"
            type="number"
            value={selectedMaxPrice}
            onChange={e => setSelectedMaxPrice(e.target.value)}
            className="rounded-xl shadow-sm"
          />

          <div className="flex gap-3 sm:col-span-2 lg:col-span-2">
            <Button className="flex-1 rounded-xl shadow-md" onClick={handleSearch}>Buscar</Button>
            <Button variant="outline" className="flex-1 rounded-xl" onClick={clearFilters}>Limpiar</Button>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="py-12">
        <div className="container px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-muted rounded-xl h-80 animate-pulse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
          ) : cars.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-3xl font-bold mb-4">No se encontraron vehículos</h3>
              <p className="text-muted-foreground mb-6">Ajusta los filtros para explorar más opciones</p>
              <Button onClick={clearFilters} className="rounded-xl">Ver todos los autos</Button>
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
            >
              {cars.map(car => (
                <motion.div
                  key={car.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <CarCard
                    car={car as any}
                    isFavorite={favorites.includes(car.id)}
                    onFavorite={() => toggleFavorite(car.id)}
                    onContact={(id) => navigate(`/car/${id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Catalog;
