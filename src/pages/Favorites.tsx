// src/pages/Favorites.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
// Se mantienen los iconos
import { HeartCrack, X, ArrowRight, Heart, Gauge, Calendar } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 
// Se mantiene el Navbar (asume modo oscuro)
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
  agency: string | null;      
  agency_phone: string | null; 
};

export type FavoriteCar = {
  id: string;
  car: Car; 
};

// VARIANTES DE ANIMACIÓN
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, 
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};
// =======================================================

// Nota: Puedes crear un componente de Esqueleto para mejor UX:
// const SkeletonCard = () => (
//     <div className="bg-white rounded-xl shadow-lg h-80 animate-pulse border border-gray-100"></div>
// );


const Favorites = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const navigate = useNavigate();

  const { data: favorites, isLoading, isError, refetch } = useQuery<FavoriteCar[]>({
    queryKey: ['userFavorites', userId],
    enabled: !!userId,
    // ===================================================
    // ✨ OPTIMIZACIÓN UX: CARGA INSTANTÁNEA DESDE CACHÉ
    // ===================================================
    staleTime: 1000 * 60 * 5, // Muestra datos de caché durante 5 minutos
    placeholderData: (previousData) => previousData, // Evita que la pantalla se quede en blanco
    // ===================================================

    queryFn: async () => {
      if (!userId) throw new Error("El usuario no está autenticado.");

      const { data, error } = await supabase
        .from('favorites')
        // ===================================================
        // 🚀 OPTIMIZACIÓN DE RENDIMIENTO: CONSULTA LIGERA
        // ===================================================
        // SOLO seleccionamos los campos necesarios para la tarjeta
        .select(`
            id, 
            car:car_id (
                id, 
                brand, 
                model, 
                year, 
                mileage, 
                price,
                car_images (
                    image_url 
                )
            )
        `)
        // ===================================================
        .eq('user_id', userId)
        .order('created_at', { ascending: false }); 

      if (error) throw error;

      return data
        .filter(item => item.car !== null)
        .map(item => ({ id: item.id, car: item.car as Car }));
    },
    onError: () => {
      toast.error("Error al cargar favoritos", { 
        description: "No se pudieron obtener los datos. Verifique su conexión." 
      });
    }
  });

  const removeFavorite = async (favoriteId: string) => {
    const { error } = await supabase.from('favorites').delete().eq('id', favoriteId);
    if (error) toast.error("Error al quitar de favoritos", { description: error.message });
    else { toast.success("Auto quitado de favoritos"); refetch(); }
  };

  const formatPrice = (price: number) => price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });

  const primaryColor = '#199dcc'; // Azul
  const hoverColor = '#1583b3'; // Un poco más oscuro para el hover
  
  return (
    // Fondo negro sólido inicial para evitar "flash"
    <div className="min-h-screen relative bg-black"> 
      
      {/* Navbar: Sin prop de tema, asume modo oscuro/texto blanco por el fondo */}
      <Navbar /> 

      {/* 1. VIDEO DE FONDO - Fijo y responsivo */}
      <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden">
        <video
          // Opacidad 20% para que no opaque el contenido
          className="w-full h-full object-cover opacity-20 bg-gray-900" 
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/autospace_video_hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 2. CAPA OSCURA SEMI-TRANSPARENTE (para asegurar el contraste del texto) */}
      <div className="absolute inset-0 bg-black/60 -z-10"></div>


      {/* CONTENEDOR PRINCIPAL */}
      <div className="container mx-auto py-12 md:py-16 relative z-10">
        
        {/* ENCABEZADO: Título BLANCO para contrastar con el fondo */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-10 md:mb-12 pt-10"
        >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                Mis Favoritos
            </h1>
            <p className="text-gray-300 text-lg flex items-center">
                Vehículos guardados para revisión <Heart className="h-5 w-5 ml-2" style={{ color: primaryColor }} />
            </p>
            <div className="w-20 h-1 mt-4 rounded-full" style={{ backgroundColor: primaryColor }}></div>
        </motion.div>

        {/* --- MANEJO DE ESTADOS --- */}
        {(!userId || isLoading || isError || favorites?.length === 0) && (
            <div className="flex justify-center items-center min-h-[40vh] py-10">
                
                <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-center p-10 bg-white shadow-2xl rounded-xl border border-gray-200 w-full max-w-lg"
                >
                    {/* Contenido de estados (se mantiene legible sobre el fondo blanco) */}
                    {!userId && !isLoading && (
                        <>
                            <p className="text-xl font-semibold mb-4 text-gray-700">Por favor, inicie sesión para acceder a su lista de favoritos.</p>
                            <Button 
                                onClick={() => navigate('/auth')} 
                                className="text-white"
                                style={{ backgroundColor: primaryColor }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverColor}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                            >
                                Iniciar Sesión
                            </Button>
                        </>
                    )}

                    {/* Mostrar Esqueletos aquí si tienes el componente SkeletonCard: */}
                    {isLoading && userId && (
                        <p className="text-xl text-gray-600">Cargando la lista de vehículos...</p>
                        /* Opcional: Reemplazar el párrafo de arriba con el grid de esqueletos: */
                        /* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                        */
                    )}
                    
                    {isError && userId && (
                        <p className="text-xl text-red-600">No se pudo cargar su información. Por favor, intente de nuevo.</p>
                    )}
                    {!isLoading && !isError && favorites?.length === 0 && userId && (
                        <>
                            <HeartCrack className="h-16 w-16 mx-auto mb-4" style={{ color: primaryColor }} />
                            <p className="text-xl font-semibold mb-3 text-gray-700">No tiene vehículos guardados.</p>
                            <Button 
                                onClick={() => navigate('/catalog')} 
                                variant="default"
                                className="text-white"
                                style={{ backgroundColor: primaryColor }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverColor}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                            >
                                Explorar Catálogo <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </>
                    )}
                </motion.div>
            </div>
        )}
        {/* --- FIN MANEJO DE ESTADOS --- */}


        {/* GRID DE AUTOS FAVORITOS */}
        {favorites && favorites.length > 0 && (
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {favorites.map((fav) => (
                    <motion.div 
                        key={fav.car.id}
                        variants={itemVariants}
                        // Tarjeta: Fondo BLANCO sólido para legibilidad
                        className="relative bg-white rounded-xl shadow-xl border border-gray-100 transition duration-300 hover:shadow-2xl hover:translate-y-[-4px] cursor-pointer flex flex-col overflow-hidden"
                        onClick={() => navigate(`/car/${fav.car.id}`)} 
                    >
                        
                        {/* Botón de Quitar */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation(); 
                                removeFavorite(fav.id);
                            }}
                            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 border border-gray-300 text-gray-600 hover:bg-red-500 hover:text-white transition-colors duration-200"
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        {/* IMAGEN: Ahora en color */}
                        {fav.car.car_images?.[0]?.image_url && (
                            <div className="mb-0 overflow-hidden">
                                <img 
                                    src={fav.car.car_images[0].image_url}
                                    alt={`${fav.car.brand} ${fav.car.model}`}
                                    className="w-full h-48 object-cover transition-transform duration-500 hover:scale-[1.08] group-hover:scale-[1.08]" 
                                />
                                <div className="absolute inset-0 h-48 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                            </div>
                        )}

                        {/* DETALLES */}
                        <div className="flex flex-col flex-grow p-5">
                            {/* Título y Modelo más destacado - Texto oscuro sobre fondo blanco */}
                            <h2 
                                className="text-2xl font-extrabold tracking-tight text-gray-900 truncate"
                            >
                                {fav.car.brand} {fav.car.model}
                            </h2>
                            <p className="text-base font-semibold text-gray-500 mb-4">
                                {fav.car.year}
                            </p>
                            
                            {/* Detalles con iconos */}
                            <div className="space-y-2 text-gray-700">
                                <div className="flex items-center text-sm">
                                    <Gauge className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                                    <span>{fav.car.mileage?.toLocaleString('es-MX')} km</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Calendar className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                                    <span>Modelo: {fav.car.year}</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                                <p 
                                    className="text-3xl font-extrabold"
                                    style={{ color: primaryColor }} // Precio en azul
                                >
                                    {formatPrice(fav.car.price)}
                                </p>

                                {/* Botón de Detalles con ícono */}
                                <div className="">
                                    <Button 
                                        variant="ghost"
                                        className="text-white flex items-center font-semibold"
                                        style={{ color: primaryColor }}
                                    >
                                        Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        )}
      </div>
    </div>
  );
};

export default Favorites;