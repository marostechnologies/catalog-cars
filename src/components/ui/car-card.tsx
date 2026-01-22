import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, Calendar, Gauge, Fuel, Cog } from 'lucide-react'; 
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import type { Database } from '@/integrations/supabase/types';

type Car = Database['public']['Tables']['cars']['Row'] & {
  car_images?: { image_url: string; is_primary: boolean }[];
};

interface CarCardProps {
  car: Car;
  onFavorite?: (carId: string) => void; 
  onContact?: (carId: string) => void;
  isFavorite?: boolean;
}

// Estilos de texto Brutalistas optimizados para responsive
const BRUTAL_STYLES = {
  // En móvil el texto es ligeramente más pequeño para evitar saltos de línea feos
  title: "font-black italic tracking-tighter uppercase leading-[0.9] text-[15px] sm:text-lg md:text-xl",
  label: "font-bold text-[9px] md:text-[10px] tracking-widest uppercase text-muted-foreground",
  price: "font-black italic tracking-tighter text-sm sm:text-base md:text-xl text-primary",
};

const CarCard = ({ car, onFavorite, onContact, isFavorite = false }: CarCardProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage && mileage !== 0) return 'N/A';
    // Abreviar km en móvil para ganar espacio
    const value = new Intl.NumberFormat('es-MX').format(mileage);
    return `${value} km`;
  };

  const getConditionColor = (condition?: string) => {
    switch (condition?.toLowerCase()) {
      case 'nuevo': return 'bg-green-500';
      case 'seminuevo': return 'bg-blue-500';
      case 'usado': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const mainImage =
    car.car_images?.find(img => img.is_primary)?.image_url ||
    car.car_images?.[0]?.image_url ||
    '/api/placeholder/400/300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group h-full"
    >
      <Card className="overflow-hidden border-0 shadow-subtle hover:shadow-car bg-gradient-card rounded-[24px] md:rounded-[32px] transition-all duration-500 h-full flex flex-col">
        <div className="relative flex-1 flex flex-col">
          {/* Image Section - Altura reducida en móvil (h-32) para no ocupar toda la pantalla */}
          <div className="relative h-32 sm:h-40 md:h-52 overflow-hidden bg-muted">
            <img
              src={mainImage}
              alt={`${car.brand} ${car.model}`}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
              } group-hover:scale-105`}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Condition Badge - Más pequeño en móvil */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4">
              <Badge className={`${getConditionColor(car.condition)} text-white capitalize font-bold rounded-full border-none px-2 md:px-3 text-[8px] md:text-xs`}>
                {car.condition || 'usado'}
              </Badge>
            </div>

            {/* Price Badge - Ajustado para pantallas pequeñas */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4">
              <Badge variant="secondary" className="bg-background/90 text-primary font-black italic tracking-tighter text-[10px] sm:text-xs md:text-sm px-2 py-0.5 md:px-3 md:py-1 rounded-lg md:rounded-xl shadow-lg border-none">
                {formatPrice(car.price)}
              </Badge>
            </div>
          </div>

          <CardContent className="p-3 md:p-5 flex flex-col flex-1">
            {/* Title & Year */}
            <div className="mb-2 md:mb-4 h-10 md:h-12 flex flex-col justify-center">
              <h3 className={`${BRUTAL_STYLES.title} text-foreground group-hover:text-primary transition-colors line-clamp-2`}>
                {car.brand} {car.model}
              </h3>
              <p className="text-[9px] md:text-xs font-bold text-muted-foreground mt-0.5 uppercase tracking-widest">
                {car.year}
              </p>
            </div>

            {/* Specs Grid - Optimizado 2x2 */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-1 md:gap-y-3 md:gap-x-2 mb-4 md:mb-5">
              <div className="flex items-center space-x-1 md:space-x-2 text-[9px] md:text-[11px] font-bold uppercase tracking-tight text-muted-foreground">
                <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{car.year}</span>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2 text-[9px] md:text-[11px] font-bold uppercase tracking-tight text-muted-foreground">
                <Gauge className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{formatMileage(car.mileage)}</span>
              </div>
              {car.fuel_type && (
                <div className="flex items-center space-x-1 md:space-x-2 text-[9px] md:text-[11px] font-bold uppercase tracking-tight text-muted-foreground">
                  <Fuel className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{car.fuel_type}</span>
                </div>
              )}
              {car.transmission && (
                <div className="flex items-center space-x-1 md:space-x-2 text-[9px] md:text-[11px] font-bold uppercase tracking-tight text-muted-foreground">
                  <Cog className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{car.transmission === 'Automático' ? 'Auto' : car.transmission}</span>
                </div>
              )}
            </div>

            {/* Actions - Botones más compactos en móvil */}
            <div className="mt-auto flex space-x-1.5 md:space-x-2">
              <Button 
                className="flex-1 glow-effect rounded-xl md:rounded-2xl font-black italic uppercase tracking-tighter h-9 md:h-11 text-[10px] md:text-sm" 
                size="sm" 
                onClick={() => navigate(`/car/${car.id}`)}
              >
                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-1.5" />
                Detalles
              </Button>
              
              {onFavorite && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 h-9 md:w-11 md:h-11 p-0 flex-shrink-0 rounded-xl md:rounded-2xl border-2 hover:bg-red-50 hover:border-red-200 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(car.id);
                  }}
                >
                  <Heart 
                    className={`h-4 w-4 md:h-5 md:w-5 transition-colors ${
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                    }`} 
                  />
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default CarCard;