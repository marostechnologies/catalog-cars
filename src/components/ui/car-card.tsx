import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, MessageCircle, Phone, Calendar, Gauge, Fuel, Cog, MapPin } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import type { Database } from '@/integrations/supabase/types';

type Car = Database['public']['Tables']['cars']['Row'] & {
  car_images?: { image_url: string; is_primary: boolean }[]; // relación con imágenes
};

interface CarCardProps {
  car: Car;
  onFavorite?: (carId: string) => void;
  onContact?: (carId: string) => void;
  isFavorite?: boolean;
}

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
    if (!mileage) return 'N/A';
    return new Intl.NumberFormat('es-MX').format(mileage) + ' km';
  };

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'nuevo': return 'bg-green-500';
      case 'seminuevo': return 'bg-blue-500';
      case 'usado': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleWhatsApp = () => {
    const message = `Hola, estoy interesado en el ${car.brand} ${car.model} ${car.year} por ${formatPrice(car.price)}. ¿Podrías darme más información?`;
    window.open(`https://wa.me/5215551234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCall = () => {
    window.open('tel:+5215551234567', '_self');
  };

  // Tomar la imagen principal si existe, si no usar la primera
  const mainImage =
    car.car_images?.find(img => img.is_primary)?.image_url ||
    car.car_images?.[0]?.image_url ||
    '/api/placeholder/400/300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card className="overflow-hidden car-hover bg-gradient-card border-0 shadow-subtle hover:shadow-car">
        <div className="relative">
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-muted">
            <img
              src={mainImage}
              alt={`${car.brand} ${car.model}`}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
              } group-hover:scale-105`}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Condition Badge */}
            <div className="absolute top-3 left-3">
              <Badge className={`${getConditionColor(car.condition)} text-white capitalize`}>
                {car.condition || 'usado'}
              </Badge>
            </div>

            {/* Price Badge */}
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-background/90 text-primary font-bold">
                {formatPrice(car.price)}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Title */}
            <div className="mb-3">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {car.brand} {car.model}
              </h3>
              <p className="text-sm text-muted-foreground">{car.year}</p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{car.year}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Gauge className="h-4 w-4 text-primary" />
                <span>{formatMileage(car.mileage)}</span>
              </div>
              {car.fuel_type && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Fuel className="h-4 w-4 text-primary" />
                  <span className="capitalize">{car.fuel_type}</span>
                </div>
              )}
              {car.transmission && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Cog className="h-4 w-4 text-primary" />
                  <span className="capitalize">{car.transmission}</span>
                </div>
              )}
              {car.sucursal && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="capitalize">{car.sucursal}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button className="flex-1 glow-effect" size="sm" onClick={() => navigate(`/car/${car.id}`)}>
                <Eye className="h-4 w-4 mr-1" />
                Ver Detalles
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                className="glow-effect"
                onClick={() => onFavorite?.(car.id)}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button> 
              <Button variant="outline" size="sm" className="glow-effect" onClick={handleWhatsApp}>
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="glow-effect" onClick={handleCall}>
                <Phone className="h-4 w-4" />
              </Button> */}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default CarCard;
