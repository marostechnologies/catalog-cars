import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CarCard from '@/components/ui/car-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Car = Database['public']['Tables']['cars']['Row'] & { image_url?: string };

const FeaturedCars = () => {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRandomCars();
  }, []);

  const fetchRandomCars = async () => {
    try {
      // 1. Obtener IDs de autos activos
      const { data: allCars, error: idsError } = await supabase
        .from('cars')
        .select('id')
        .eq('is_active', true);

      if (idsError) throw idsError;

      if (!allCars || allCars.length === 0) {
        setFeaturedCars([]);
        setLoading(false);
        return;
      }

      // 2. Elegir 3 autos aleatorios
      const shuffled = allCars.sort(() => 0.5 - Math.random());
      const selectedIds = shuffled.slice(0, 3).map(c => c.id);

      // 3. Traer datos completos + imagen primaria
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_images!inner(
            image_url,
            is_primary
          )
        `)
        .in('id', selectedIds);

      if (error) throw error;

      // 4. Mapear para tomar solo la imagen primaria
      const carsWithImages = (data || []).map(car => ({
        ...car,
        image_url: car.car_images?.find((img: any) => img.is_primary)?.image_url || ''
      }));

      setFeaturedCars(carsWithImages);
    } catch (error) {
      console.error('Error fetching random cars:', error);
      toast.error('Error al cargar los autos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <Loader2 className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
            <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="h-6 w-6 text-primary fill-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Algunos de nuestros autos
            </h2>
            <Star className="h-6 w-6 text-primary fill-primary" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre una selección aleatoria de nuestro inventario actual.
          </p>
        </motion.div>

        {featuredCars.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-4">No hay autos disponibles</h3>
            <p className="text-muted-foreground">
              Vuelve a visitarnos pronto para ver nuevos vehículos.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Grid */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {featuredCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CarCard 
                      car={car} 
                      onFavorite={(id) => console.log('Favorite:', id)}
                      onContact={() => navigate(`/car/${car.id}`)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Mobile/Tablet Carousel */}
            <div className="lg:hidden">
              <Carousel className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {featuredCars.map((car, index) => (
                    <CarouselItem key={car.id} className="pl-2 md:pl-4 md:basis-1/2">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CarCard 
                          car={car} 
                          onFavorite={(id) => console.log('Favorite:', id)}
                          onContact={() => navigate(`/car/${car.id}`)}
                        />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" className="glow-effect" onClick={() => navigate('/catalog')}>
            Ver Catálogo Completo
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCars;
