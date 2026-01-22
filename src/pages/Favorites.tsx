import React, { useEffect } from 'react'; // Agregamos useEffect
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HeartCrack, X, ArrowRight, Heart, Gauge, Calendar, Loader2 } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import Navbar from '@/components/ui/navbar'; 
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth'; 

// TIPOS
type CarImageRow = Database['public']['Tables']['car_images']['Row'];
type CarRow = Database['public']['Tables']['cars']['Row'];

export type Car = CarRow & {
  car_images: CarImageRow[] | null;
};

export type FavoriteCar = {
  id: string;
  car: Car; 
};

const Favorites = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const primaryColor = '#199dcc';
  const hoverColor = '#1583b3';

  // --- ARREGLO PARA CARGA INSTANTÁNEA AL ENTRAR ---
  useEffect(() => {
    if (userId) {
      // Esto borra la versión "vieja" y pide la nueva a Supabase al momento de entrar
      queryClient.invalidateQueries({ queryKey: ['userFavorites', userId] });
    }
  }, [userId, queryClient]);
  // -----------------------------------------------

  // 1. QUERY DE FAVORITOS
  const { data: favorites, isLoading, isError } = useQuery<FavoriteCar[]>({
    queryKey: ['userFavorites', userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, 
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
            id, 
            car:car_id (
                id, brand, model, year, mileage, price,
                car_images (image_url)
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }); 

      if (error) throw error;
      return data
        .filter(item => item.car !== null)
        .map(item => ({ id: item.id, car: item.car as unknown as Car }));
    }
  });

  // 2. FUNCIÓN DE ELIMINACIÓN OPTIMISTA
  const removeFavorite = async (favoriteId: string) => {
    const previousFavorites = queryClient.getQueryData<FavoriteCar[]>(['userFavorites', userId]);

    queryClient.setQueryData<FavoriteCar[]>(['userFavorites', userId], (old) => 
      old?.filter(fav => fav.id !== favoriteId)
    );

    toast.success("Eliminado de favoritos");

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      queryClient.setQueryData(['userFavorites', userId], previousFavorites);
      toast.error("No se pudo eliminar", { description: error.message });
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });

  return (
    <div className="min-h-screen relative bg-black text-white"> 
      <Navbar /> 

      <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden">
        <video className="w-full h-full object-cover opacity-30" autoPlay loop muted playsInline>
          <source src="/autospace_video_hero.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-black/60 -z-10"></div>

      <div className="container mx-auto py-12 md:py-16 relative z-10 px-6">
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12 pt-10">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">
                Mis <span className="text-blue-500">Favoritos.</span>
            </h1>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest flex items-center">
                Tu selección premium <Heart className="h-4 w-4 ml-2 fill-blue-500 text-blue-500" />
            </p>
        </motion.div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="font-bold tracking-widest text-xs uppercase text-gray-500">Cargando inventario...</p>
          </div>
        )}

        {!isLoading && favorites?.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] max-w-2xl mx-auto">
                <HeartCrack className="h-16 w-16 mx-auto mb-6 text-zinc-700" />
                <h2 className="text-2xl font-black uppercase mb-4">Tu lista está vacía</h2>
                <Button onClick={() => navigate('/catalog')} className="bg-white text-black hover:bg-blue-600 hover:text-white rounded-full px-10 py-6 font-black uppercase tracking-widest text-[10px]">
                    Explorar Catálogo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode='popLayout'>
                {favorites?.map((fav) => (
                    <motion.div 
                        key={fav.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        className="group relative bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); removeFavorite(fav.id); }}
                            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-red-600 transition-all duration-300"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => navigate(`/car/${fav.car.id}`)}>
                            <img 
                                src={fav.car.car_images?.[0]?.image_url || '/placeholder.png'}
                                alt={fav.car.model}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <div className="p-6 flex flex-col flex-grow text-gray-900">
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic truncate">
                                {fav.car.brand} {fav.car.model}
                            </h2>
                            <span className="text-blue-600 font-bold text-xs tracking-[0.2em] mb-4">{fav.car.year}</span>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center text-[10px] font-black uppercase text-gray-400">
                                    <Gauge className="h-3 w-3 mr-2 text-blue-500" />
                                    {fav.car.mileage?.toLocaleString()} KM
                                </div>
                                <div className="flex items-center text-[10px] font-black uppercase text-gray-400">
                                    <Calendar className="h-3 w-3 mr-2 text-blue-500" />
                                    {fav.car.year}
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-2xl font-black tracking-tighter">
                                    {formatPrice(fav.car.price)}
                                </p>
                                <Button 
                                    onClick={() => navigate(`/car/${fav.car.id}`)}
                                    variant="ghost"
                                    className="p-0 hover:bg-transparent text-blue-600 font-black uppercase text-[10px] tracking-widest group/btn"
                                >
                                    Detalles <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Favorites;