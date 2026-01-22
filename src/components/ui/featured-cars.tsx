import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CarCard from '@/components/ui/car-card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth'; 
import type { Database } from '@/integrations/supabase/types';

type Car = Database['public']['Tables']['cars']['Row'] & { 
  image_url?: string;
  isFavorite?: boolean; // Agregamos esta propiedad opcional
};

const FeaturedCars = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRandomCars();
  }, [session?.user?.id]); // Re-ejecutar si el usuario cambia para actualizar corazones

  const fetchRandomCars = async () => {
    try {
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

      const shuffled = allCars.sort(() => 0.5 - Math.random());
      const selectedIds = shuffled.slice(0, 3).map(c => c.id);

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

      // --- NUEVA LÓGICA PARA DETECTAR FAVORITOS EXISTENTES ---
      let favoriteIds: string[] = [];
      if (session?.user?.id) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('car_id')
          .eq('user_id', session.user.id)
          .in('car_id', selectedIds);
        
        if (favData) {
          favoriteIds = favData.map(f => f.car_id);
        }
      }

      const carsWithImages = (data || []).map(car => ({
        ...car,
        image_url: car.car_images?.find((img: any) => img.is_primary)?.image_url || '',
        isFavorite: favoriteIds.includes(car.id) // Marcamos si ya es favorito
      }));

      setFeaturedCars(carsWithImages);
    } catch (error) {
      console.error('Error fetching random cars:', error);
      toast.error('Error al cargar los autos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (carId: string) => {
    if (!session) {
      toast.error("Inicia sesión", {
        description: "Debes estar autenticado para guardar favoritos.",
        action: {
          label: "Ir al Login",
          onClick: () => navigate('/auth')
        }
      });
      return;
    }

    // Buscamos si ya es favorito en nuestro estado local
    const isCurrentlyFavorite = featuredCars.find(c => c.id === carId)?.isFavorite;

    try {
      if (isCurrentlyFavorite) {
        // Lógica para quitar de favoritos (Opcional, pero recomendada)
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('car_id', carId);

        if (error) throw error;

        // Actualización optimista del estado (UI instantánea)
        setFeaturedCars(prev => prev.map(car => 
          car.id === carId ? { ...car, isFavorite: false } : car
        ));
        toast.info("Eliminado de favoritos");
      } else {
        // Lógica para agregar
        const { error } = await supabase
          .from('favorites')
          .insert([{ 
            user_id: session.user.id, 
            car_id: carId 
          }]);

        if (error) throw error;

        // Actualización optimista del estado (UI instantánea)
        setFeaturedCars(prev => prev.map(car => 
          car.id === carId ? { ...car, isFavorite: true } : car
        ));

        toast.success("¡Agregado!", {
          description: "Auto guardado correctamente en favoritos.",
          action: {
            label: "Ver Lista",
            onClick: () => navigate('/favorites')
          }
        });
      }
    } catch (error: any) {
      console.error('Error en favoritos:', error);
      toast.error("Error al procesar favoritos");
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-white flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-slate-300 animate-spin" />
      </section>
    );
  }

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      
      <div className="container relative z-10 px-6 mx-auto">
        <div className="mb-16 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center lg:justify-start gap-3 mb-4"
          >
            <span className="h-[2px] w-8 bg-blue-600" />
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
              Selección Exclusiva
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none"
          >
            DESCUBRE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600 italic">
              NUESTRO STOCK.
            </span>
          </motion.h2>
        </div>

        {featuredCars.length === 0 ? (
          <div className="text-center py-20 border border-slate-100 rounded-[2rem] bg-slate-50/50">
            <h3 className="text-xl text-slate-400 font-medium tracking-tight">
              Actualizando inventario... vuelve pronto.
            </h3>
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <CarCard 
                      car={car} 
                      // Aquí pasamos la propiedad isFavorite para que el componente Card sepa cómo pintarse
                      isFavorite={car.isFavorite} 
                      onFavorite={() => handleToggleFavorite(car.id)}
                      onContact={() => navigate(`/car/${car.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:hidden">
              <Carousel className="w-full">
                <CarouselContent className="-ml-4">
                  {featuredCars.map((car) => (
                    <CarouselItem key={car.id} className="pl-4 md:basis-1/2">
                      <div className="py-4 px-1">
                        <CarCard 
                          car={car} 
                          isFavorite={car.isFavorite}
                          onFavorite={() => handleToggleFavorite(car.id)}
                          onContact={() => navigate(`/car/${car.id}`)}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-4 mt-8">
                  <CarouselPrevious className="static translate-y-0 bg-slate-100 border-none text-slate-900" />
                  <CarouselNext className="static translate-y-0 bg-slate-100 border-none text-slate-900" />
                </div>
              </Carousel>
            </div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 flex flex-col items-center"
        >
          <Button 
            size="lg" 
            onClick={() => navigate('/catalog')}
            className="group bg-black text-white hover:bg-slate-800 rounded-full px-12 py-7 h-auto text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
          >
            Ver Catálogo Completo
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCars;