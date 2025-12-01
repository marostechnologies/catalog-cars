import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Phone, MessageCircle, Calendar,
  Gauge, Fuel, Cog, MapPin, ChevronLeft, ChevronRight, X, Droplet, Store, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/ui/navbar';
import CarCard from '@/components/ui/car-card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// =======================================================
// 1. ACTUALIZACIÓN DEL TIPO CAR (Añadir 'agency' y 'agency_phone')
// =======================================================
type CarRow = Database['public']['Tables']['cars']['Row'];
type Car = CarRow & {
  agency: string | null; // Renombrado de 'sucursal' a 'agency'
  agency_phone: string | null; // Nueva columna
  car_images?: Database['public']['Tables']['car_images']['Row'][];
};

// =======================================================
// 2. RENOMBRAR MAPA DE CONTACTO (de sucursalNumbers a agencyNumbers)
// =======================================================
const agencyNumbers = {
  'Sucursal Tlalnepantla': {
    phone: '+525529310292',
    whatsapp: '525529310292',
  },
  // Agrega más agencias aquí si es necesario
};

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [relatedCars, setRelatedCars] = useState<Car[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [downPayment, setDownPayment] = useState<number | ''>(0);
  const [months, setMonths] = useState<number | ''>(0);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [interestRate, setInterestRate] = useState<number | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentViewedImageIndex, setCurrentViewedImageIndex] = useState(0);

  // ESTADO ELIMINADO: Ya no es necesario
  // const [isFavorite, setIsFavorite] = useState(false); 
  const [userContact, setUserContact] = useState({ name: '', email: '', phone: '', message: '' });


  useEffect(() => {
    if (id) {
      fetchCarDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (car && downPayment !== '' && months !== '') {
      calculateMonthlyPayment();
    } else {
      setMonthlyPayment(null);
      setInterestRate(null);
    }
  }, [downPayment, months, car]);


  const fetchCarDetails = async (carId: string) => {
    try {
      setLoading(true);
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select(`
          *,
          car_images:car_images(*)
        `)
        .eq('id', carId)
        .single();

      if (carError) {
        throw carError;
      }

      if (carData) {
        // La consulta trae agency y agency_phone automáticamente debido al '*'
        const formattedCar = {
          ...carData,
          car_images: (carData.car_images as any) || [],
        };
        setCar(formattedCar as unknown as Car);
        fetchRelatedCars(formattedCar.brand);
        setDownPayment(formattedCar.price * 0.3); // Enganche inicial del 30%
        setMonths(36); // Plazo inicial
      }
    } catch (error) {
      console.error('Error al cargar los detalles del vehículo:', error);
      toast.error('Error al cargar los detalles del vehículo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedCars = async (brand: string) => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_images:car_images(*)
        `)
        .eq('brand', brand)
        .neq('id', id)
        .limit(3);

      if (error) {
        throw error;
      }

      setRelatedCars(data as unknown as Car[]);
    } catch (error) {
      console.error('Error al cargar vehículos relacionados:', error);
    }
  };


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

  const handleContact = () => {
    setContactOpen(true);
  };

  const handleSimulation = async () => {
    if (car) {
      setDownPayment(car.price * 0.3); // Establecer el enganche inicial al 30%
      setMonths(36); // Establecer el plazo inicial
      setSimulationOpen(true);
    }
  };

  // LÓGICA ELIMINADA: Ya no es necesaria
  // const handleFavoriteToggle = () => {
  //   setIsFavorite(!isFavorite);
  //   toast.success(isFavorite ? 'Quitado de favoritos' : 'Añadido a favoritos');
  // };
  
  const calculateMonthlyPayment = () => {
    if (!car) return;
    const price = car.price;
    const down = Number(downPayment);
    const numMonths = Number(months);
    
    // Validación de valores
    if (down <= 0 || down >= price || numMonths <= 0) {
      setMonthlyPayment(null);
      setInterestRate(null);
      return;
    }
  
    // Lógica de la tasa de interés según el porcentaje de enganche
    const downPaymentPercentage = (down / price);
    let annualInterestRate;
    
    // Asignación de tasa: 14.99% para 30% o más, 15.99% para menos de 30%
    if (downPaymentPercentage >= 0.3) {
      annualInterestRate = 0.1499; // 14.99% anual
    } else {
      annualInterestRate = 0.1599; // 15.99% anual
    }
    
    setInterestRate(annualInterestRate);

    const principal = price - down;
    const monthlyInterestRate = annualInterestRate / 12;

    // Fórmula de anualidad para el pago mensual
    // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
    const payment = (principal * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numMonths));
    
    setMonthlyPayment(payment);
  };
  

  const handleImageClick = (index: number) => {
    if (car && car.car_images) {
      setCurrentViewedImageIndex(index);
      setImageViewerOpen(true);
    }
  };

  const showNextImage = () => {
    if (car && car.car_images && car.car_images.length > 0) {
      setCurrentViewedImageIndex((prevIndex) =>
        prevIndex === car.car_images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const showPrevImage = () => {
    if (car && car.car_images && car.car_images.length > 0) {
      setCurrentViewedImageIndex((prevIndex) =>
        prevIndex === 0 ? car.car_images.length - 1 : prevIndex - 1
      );
    }
  };

  // ==================== FUNCIONES PARA BOTONES DE CONTACTO - INICIO ====================
  
  /**
   * Función de utilidad para obtener y limpiar el número de WhatsApp.
   */
  const getCleanWhatsappNumber = () => {
    let whatsappNumber = null;
    
    if (car?.agency_phone) {
      whatsappNumber = car.agency_phone; 
    }

    if (!whatsappNumber && car?.agency && agencyNumbers[car.agency]?.whatsapp) {
      whatsappNumber = agencyNumbers[car.agency].whatsapp;
    }
    
    if (!whatsappNumber) {
      return null;
    }

    return whatsappNumber.replace(/\D/g, ''); 
  };

  /**
   * Maneja el clic en el botón de WhatsApp.
   */
  const handleWhatsApp = () => {
    const cleanNumber = getCleanWhatsappNumber();

    if (!cleanNumber) {
      toast.error('Número de WhatsApp no disponible para esta agencia o formato incorrecto.');
      return;
    }
    
    const message = `Hola, estoy interesado en el auto ${car?.brand} ${car?.model} (${car?.year}) que vi en su sitio web.`;
    
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  /**
   * Maneja el clic en el botón de Llamar. (Lógica original)
   */
  const handleCall = () => {
    const phoneNumber = car?.agency_phone || (car?.agency ? agencyNumbers[car.agency]?.phone : null);

    if (!phoneNumber) {
      toast.error('Número de teléfono no disponible para esta agencia.');
      return;
    }
    setIsCallModalOpen(true); // Abre el modal de confirmación
  };

  const confirmCall = () => {
    const phoneNumber = car?.agency_phone || (car?.agency ? agencyNumbers[car.agency]?.phone : null);
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
      setIsCallModalOpen(false); // Cierra el modal después de iniciar la llamada
    }
  };

  /**
   * Maneja el clic en el botón de Cotización por WhatsApp.
   */
  const handleWhatsappQuote = () => {
    if (!car || !monthlyPayment || downPayment === '' || months === '') {
      toast.error('Información incompleta para generar la cotización.');
      return;
    }

    const cleanNumber = getCleanWhatsappNumber();

    if (!cleanNumber) {
      toast.error('Número de WhatsApp no disponible para esta agencia o formato incorrecto.');
      return;
    }

    const message = `Hola, estoy interesado en el auto ${car.brand} ${car.model} (${car.year}).
Me gustaría una cotización formal.
---
**Detalles de la simulación:**
- Enganche: ${formatPrice(Number(downPayment))}
- Plazo: ${months} meses
- Pago mensual estimado: ${formatPrice(monthlyPayment)}
---
¡Espero su respuesta!`;
    
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSendContactForm = () => {
    // Lógica simulada para enviar el formulario de contacto
    if (!userContact.name || !userContact.email || !userContact.phone) {
      toast.error('Por favor, completa los campos de nombre, email y teléfono.');
      return;
    }

    // Aquí iría la lógica real de envío a la API o base de datos.
    console.log('Formulario de contacto enviado:', userContact);
    toast.success('Solicitud de información enviada correctamente.');

    // Limpiar formulario y cerrar modal si fuera el caso
    setUserContact({ name: '', email: '', phone: '', message: '' });
  };
  // ==================== FIN FUNCIONES PARA BOTONES DE CONTACTO ====================


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Vehículo no encontrado</h1>
          <Button onClick={() => navigate('/catalog')}>Volver al catálogo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 container px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => navigate(-1)} className="glow-effect">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div
              className="relative overflow-hidden rounded-lg bg-muted cursor-pointer"
              onClick={() => handleImageClick(currentImageIndex)}
            >
              <img
                src={car.car_images?.[currentImageIndex]?.image_url || '/api/placeholder/800/600'}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-96 object-cover"
              />

              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev =>
                  car.car_images && prev === 0 ? car.car_images.length - 1 : prev - 1
                )}}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev =>
                  car.car_images && prev === car.car_images.length - 1 ? 0 : prev + 1
                )}}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {car.car_images?.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-primary w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {car.car_images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative overflow-hidden rounded border-2 transition-all ${
                    index === currentImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`Vista ${index + 1}`}
                    className="w-full h-16 object-cover hover:scale-105 transition-transform"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {car.brand} {car.model}
                </h1>
                <p className="text-lg text-muted-foreground">{car.year}</p>
              </div>
              
              {/* === BOTÓN DE FAVORITO ELIMINADO === */}
              {/* Se eliminó el siguiente bloque de código:
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                onClick={handleFavoriteToggle}
              >
                <Heart 
                  className={`h-6 w-6 transition-colors ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'
                  }`} 
                />
              </Button>
              */}
              {/* === FIN BOTÓN DE FAVORITO ELIMINADO === */}
              
            </div> 

            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(car.price)}
              </div>
              <Badge className="capitalize">
                {car.condition}
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Especificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">Año: {car.year}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    <span className="text-sm">Kilometraje: {formatMileage(car.mileage)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Fuel className="h-4 w-4 text-primary" />
                    <span className="text-sm capitalize">Combustible: {car.fuel_type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Cog className="h-4 w-4 text-primary" />
                    <span className="text-sm capitalize">Transmisión: {car.transmission}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplet className="h-4 w-4 text-primary" />
                    <span className="text-sm capitalize">Color: {car.color}</span>
                  </div>
                  
                  {/* ============================================== */}
                  {/* INSERCIÓN DE AGENCY Y AGENCY_PHONE */}
                  {/* ============================================== */}
                  {car.agency && (
                    <div className="flex items-center space-x-2">
                      <Store className="h-4 w-4 text-primary" /> {/* Icono de tienda/agencia */}
                      <span className="text-sm">Agencia: {car.agency}</span>
                    </div>
                  )}

                  {car.agency_phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm">Tel. Agencia: <a href={`tel:${car.agency_phone}`} className="hover:underline">{car.agency_phone}</a></span>
                    </div>
                  )}
                  {/* Fin de inserción */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {car.description}
                </p>
              </CardContent>
            </Card>

            {/* BOTÓN DE COTIZADOR - GRIS */}
            <Button
              size="lg"
              className="w-full glow-effect bg-gray-500 hover:bg-gray-600 text-white"
              onClick={handleSimulation}
            >
              Cotizador de Crédito a Meses
            </Button>

            <div className="grid grid-cols-2 gap-4">
              {/* BOTÓN DE WHATSAPP - VERDE */}
              <Button size="lg" className="glow-effect bg-green-500 hover:bg-green-600 text-white" onClick={handleWhatsApp}>
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
              </Button>
              {/* BOTÓN DE LLAMAR - ROJO */}
              <Button size="lg" className="glow-effect bg-red-500 hover:bg-red-600 text-white" onClick={handleCall}>
                <Phone className="h-5 w-5 mr-2" />
                Llamar
              </Button>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                {/*<Button variant="secondary" size="lg" className="w-full glow-effect">
                  Solicitar Información
                </Button>*/}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar Información</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input 
                        id="name" 
                        placeholder="Tu nombre" 
                        value={userContact.name}
                        onChange={(e) => setUserContact(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="tu@email.com" 
                        value={userContact.email}
                        onChange={(e) => setUserContact(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input 
                        id="phone" 
                        placeholder="555-123-4567" 
                        value={userContact.phone}
                        onChange={(e) => setUserContact(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      placeholder={`Estoy interesado en el ${car.brand} ${car.model} (${car.year})...`}
                      rows={4}
                      value={userContact.message}
                      onChange={(e) => setUserContact(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSendContactForm}>Enviar Solicitud</Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        {/* Modal de Contacto (Actualizado para usar Agencia) */}
        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contacto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Agencias:</h3>
                <ul className="list-disc list-inside">
                  <li>Tlalnepantla: {agencyNumbers['Sucursal Tlalnepantla'].phone}</li>
                  {/*<li>Cancún: {agencyNumbers['Sucursal Cancún'].phone}</li>*/}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Horarios:</h3>
                <ul className="list-disc list-inside">
                  <li>Tlalnepantla: Lun - Dom: 10:00 - 18:00</li>
                  {/*<li>Cancún: Lun - Dom: 10:00 - 18:00</li>*/}
                </ul>
              </div>
              <Button className="w-full" onClick={() => setContactOpen(false)}>Cerrar</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Simulación de Compra */}
        <Dialog open={simulationOpen} onOpenChange={setSimulationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Simular Compra a Meses</DialogTitle>
              <DialogDescription>
                Calcula tu pago mensual para este auto.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Precio del Auto:</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(car.price)}</p>
                </div>
                <div>
                  {/* Espacio para información adicional */}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="downPayment">Enganche (monto)</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    placeholder="Ej. 50000"
                  />
                </div>
                <div>
                  <Label htmlFor="months">Plazo (meses)</Label>
                  <Input
                    id="months"
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    placeholder="Ej. 12, 24, 36"
                  />
                </div>
              </div>
              {monthlyPayment !== null && (
                <div className="p-4 bg-muted rounded-lg mt-4 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Pago mensual estimado:</h3>
                    {interestRate && (
                      <Badge variant="secondary">
                        Tasa Anual: {(interestRate * 100).toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(monthlyPayment)}
                  </p>

                  {/* Resumen adicional */}
                  {(() => {
                    const financed = car.price - Number(downPayment);
                    const totalPay = monthlyPayment * Number(months);
                    const totalInterest = totalPay - financed;
                    const downPaymentPercentage = (Number(downPayment) / car.price) * 100;

                    return (
                      <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-semibold">Porcentaje de enganche:</span> {downPaymentPercentage.toFixed(2)}%</p>
                        <p><span className="font-semibold">Capital financiado:</span> {formatPrice(financed)}</p>
                        <p><span className="font-semibold">Intereses estimados:</span> {formatPrice(totalInterest)}</p>
                        <p><span className="font-semibold">Monto total a pagar:</span> {formatPrice(totalPay + Number(downPayment))}</p>
                      </div>
                    );
                  })()}

                  <p className="text-xs text-muted-foreground mt-3">
                    Este cálculo es una estimación. Los términos finales pueden variar.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              size="lg"
              className="w-full sm:w-auto glow-effect bg-green-500 hover:bg-green-600 text-white"
              onClick={handleWhatsappQuote}
              disabled={!monthlyPayment || downPayment === '' || months === ''}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Cotización personalizada
            </Button>
            <Button
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => setSimulationOpen(false)}
              variant="secondary"
            >
              Cerrar
            </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* === MODAL DE CONFIRMACIÓN DE LLAMADA (Actualizado para usar Agency) === */}
        <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Seguro que quieres llamar?</DialogTitle>
              <DialogDescription>
                Vas a llamar a la agencia {car?.agency || car?.agency_phone}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <Button onClick={confirmCall}>Sí, llamar</Button>
              <Button variant="secondary" onClick={() => setIsCallModalOpen(false)}>Cancelar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Visor de Imágenes (Lightbox) */}
        {car && car.car_images && car.car_images.length > 0 && (
          <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
            <DialogContent className="max-w-full h-full p-0 flex justify-center items-center bg-transparent backdrop-blur-md">
              <div className="relative w-full h-full flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                  onClick={() => setImageViewerOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>

                <motion.img
                  key={currentViewedImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  src={car.car_images[currentViewedImageIndex]?.image_url}
                  alt={`Imagen ${currentViewedImageIndex + 1} de ${car.brand} ${car.model}`}
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 text-white hover:bg-white/20"
                  onClick={showPrevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 text-white hover:bg-white/20"
                  onClick={showNextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-40">
                  {car.car_images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentViewedImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentViewedImageIndex ? 'bg-primary w-8' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default CarDetail;