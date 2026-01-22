import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Phone, MessageCircle, Calendar,
  Gauge, Fuel, Cog, MapPin, ChevronLeft, ChevronRight, X, Droplet, Store, Heart, Info, AlertCircle, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/ui/navbar';
import CarCard from '@/components/ui/car-card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

// =======================================================
// TYPES & CONFIG
// =======================================================
type CarRow = Database['public']['Tables']['cars']['Row'];
type Car = CarRow & {
  agency: string | null;
  agency_phone: string | null;
  car_images?: Database['public']['Tables']['car_images']['Row'][];
};

const agencyNumbers = {
  'Sucursal Tlalnepantla': {
    phone: '+525529310292',
    whatsapp: '525529310292',
  },
};

const BRUTAL_STYLES = {
  title: "font-black italic tracking-tighter uppercase leading-[0.85]",
  label: "font-bold text-[10px] tracking-widest uppercase text-zinc-400",
  container: "rounded-[24px] md:rounded-[32px] bg-zinc-50 border-none",
  input: "h-14 rounded-2xl border-2 border-zinc-100 focus:border-black transition-all font-bold",
};

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const userId = session?.user.id;

  const [car, setCar] = useState<Car | null>(null);
  const [relatedCars, setRelatedCars] = useState<Car[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [simulationOpen, setSimulationOpen] = useState(false);
  
  const [downPayment, setDownPayment] = useState<number | ''>(0);
  const [months, setMonths] = useState<number | ''>(36);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [interestRate, setInterestRate] = useState<number | null>(null);
  
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentViewedImageIndex, setCurrentViewedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCarDetails(id);
      if (userId) checkFavoriteStatus(id);
    }
  }, [id, userId]);

  useEffect(() => {
    if (car && downPayment !== '' && months !== '') {
      calculateMonthlyPayment();
    } else {
      setMonthlyPayment(null);
    }
  }, [downPayment, months, car]);

  const fetchCarDetails = async (carId: string) => {
    try {
      setLoading(true);
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select(`*, car_images:car_images(*)`)
        .eq('id', carId)
        .single();

      if (carError) throw carError;

      if (carData) {
        const formattedCar = {
          ...carData,
          car_images: (carData.car_images as any) || [],
        };
        setCar(formattedCar as unknown as Car);
        fetchRelatedCars(formattedCar.brand);
        setDownPayment(formattedCar.price * 0.3);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el vehículo');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedCars = async (brand: string) => {
    const { data } = await supabase
      .from('cars')
      .select(`*, car_images:car_images(*)`)
      .eq('brand', brand)
      .neq('id', id)
      .limit(3);
    if (data) setRelatedCars(data as unknown as Car[]);
  };

  const checkFavoriteStatus = async (carId: string) => {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('car_id', carId)
      .maybeSingle();
    
    if (data) {
      setIsFavorite(true);
      setFavoriteId(data.id);
    } else {
      setIsFavorite(false);
      setFavoriteId(null);
    }
  };

  const toggleFavorite = async () => {
    if (!userId) {
      toast.error("Inicia sesión para guardar favoritos");
      return navigate('/auth');
    }

    if (isFavorite && favoriteId) {
      const { error } = await supabase.from('favorites').delete().eq('id', favoriteId);
      if (!error) {
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success("Quitado de favoritos");
      }
    } else {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, car_id: id }])
        .select()
        .single();
      if (!error && data) {
        setIsFavorite(true);
        setFavoriteId(data.id);
        toast.success("Añadido a favoritos");
      }
    }
  };

  const formatWithCommas = (value: number | '') => {
    if (value === '') return '';
    return value.toLocaleString('en-US');
  };

  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '') {
      setDownPayment('');
      return;
    }
    if (/^\d*$/.test(rawValue)) {
      setDownPayment(Number(rawValue));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(price);
  };

  const calculateMonthlyPayment = () => {
    if (!car || downPayment === '') return;
    const principal = car.price - Number(downPayment);
    const annualRate = (Number(downPayment) / car.price) >= 0.3 ? 0.1499 : 0.1599;
    setInterestRate(annualRate);
    const mRate = annualRate / 12;
    const payment = (principal * mRate) / (1 - Math.pow(1 + mRate, -Number(months)));
    setMonthlyPayment(payment);
  };

  // NUEVA LÓGICA DE SEGURIDAD PARA EL SIMULADOR
  const handleOpenSimulator = () => {
    if (!session) {
      toast.error("Inicia sesión", {
        description: "Debes estar registrado para poder realizar una cotización.",
        icon: <Lock className="h-4 w-4" />
      });
      navigate('/auth');
      return;
    }
    setSimulationOpen(true);
  };

  const handleRequestFinance = () => {
    if (!car) return;
    const phone = car.agency_phone || (car.agency ? (agencyNumbers as any)[car.agency]?.whatsapp : '525529310292');
    const message = `Hola, me interesa solicitar un plan de financiamiento para este vehículo:
    
🚗 *Vehículo:* ${car.brand} ${car.model} (${car.year})
💰 *Precio:* ${formatPrice(car.price)}
💵 *Enganche propuesto:* ${downPayment ? formatPrice(Number(downPayment)) : 'No definido'}
🗓️ *Plazo:* ${months} meses
📉 *Mensualidad estimada:* ${monthlyPayment ? formatPrice(monthlyPayment) : 'Pendiente de calcular'}

¿Me podrían dar más información sobre los requisitos?`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
  };

  const handleWhatsAppGeneral = () => {
    const num = car?.agency_phone || (car?.agency ? (agencyNumbers as any)[car.agency]?.whatsapp : '525529310292');
    window.open(`https://wa.me/${num.replace(/\D/g, '')}?text=Hola, me interesa el ${car?.brand} ${car?.model}`, '_blank');
  };

  if (loading || !car) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="pt-20 md:pt-28 container px-4 lg:px-12 pb-24 mx-auto">
        {/* NAVEGACIÓN RESPONSIVE */}
        <div className="flex justify-between items-center mb-6 md:mb-10">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full font-bold uppercase tracking-widest text-[9px] md:text-[10px] h-9 px-3 hover:bg-zinc-100">
            <ArrowLeft className="h-3 w-3 mr-1.5" /> Volver
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFavorite}
            className={`rounded-full h-10 w-10 md:h-12 md:w-12 border-2 transition-all ${isFavorite ? 'bg-red-50 border-red-500 text-red-500' : 'border-zinc-200 text-zinc-400 hover:border-black hover:text-black'}`}
          >
            <Heart className={`h-5 w-5 md:h-6 md:w-6 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
          {/* GALERÍA RESPONSIVE */}
          <div className="lg:col-span-7 space-y-4 md:space-y-6">
            <div 
              className="relative aspect-[4/3] md:aspect-[16/10] bg-zinc-100 rounded-[30px] md:rounded-[40px] overflow-hidden group cursor-zoom-in shadow-xl"
              onClick={() => { setCurrentViewedImageIndex(currentImageIndex); setImageViewerOpen(true); }}
            >
              <img src={car.car_images?.[currentImageIndex]?.image_url || '/api/placeholder/800/600'} className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-105" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-5 md:gap-4">
              {car.car_images?.map((img, i) => (
                <button key={i} onClick={() => setCurrentImageIndex(i)} className={`relative flex-shrink-0 w-20 h-20 md:w-full md:h-full md:aspect-square rounded-2xl md:rounded-3xl overflow-hidden border-2 transition-all ${i === currentImageIndex ? 'border-black scale-95 shadow-xl' : 'border-transparent opacity-50'}`}>
                  <img src={img.image_url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* INFO RESPONSIVE */}
          <div className="lg:col-span-5 space-y-8 md:space-y-10">
            <header className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full bg-black text-white px-3 md:px-4 py-1 text-[9px] md:text-[10px] font-bold tracking-widest uppercase">{car.condition}</Badge>
                {car.agency && <Badge variant="outline" className="rounded-full border-zinc-200 text-zinc-500 px-3 md:px-4 py-1 text-[9px] md:text-[10px] font-bold tracking-widest uppercase italic"><Store className="h-3 w-3 mr-1" /> {car.agency}</Badge>}
              </div>
              <h1 className={`${BRUTAL_STYLES.title} text-5xl md:text-8xl`}>{car.brand} <br /><span className="text-zinc-200">{car.model}</span></h1>
              <p className="text-3xl md:text-4xl font-black tracking-tighter italic pt-2">{formatPrice(car.price)}</p>
            </header>

            {/* GRID SPECS MINIMALISTA */}
            <div className="grid grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 rounded-[28px] md:rounded-[32px] overflow-hidden shadow-2xl">
              {[
                { icon: Gauge, label: "KM", val: car.mileage?.toLocaleString() },
                { icon: Calendar, label: "Año", val: car.year },
                { icon: Cog, label: "Transmisión", val: car.transmission },
                { icon: Fuel, label: "Motor", val: car.fuel_type },
              ].map((item, idx) => (
                <div key={idx} className="bg-zinc-50 p-4 md:p-6 hover:bg-white transition-colors">
                  <item.icon className="h-4 w-4 mb-2 text-zinc-400" />
                  <p className={BRUTAL_STYLES.label}>{item.label}</p>
                  <p className="font-black uppercase text-xs md:text-sm italic truncate">{item.val}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 md:space-y-4">
              {/* BOTÓN PROTEGIDO POR handleOpenSimulator */}
              <Button size="lg" onClick={handleOpenSimulator} className="w-full h-16 md:h-20 rounded-[20px] md:rounded-[24px] bg-zinc-900 hover:bg-black text-white text-lg md:text-xl font-black italic uppercase tracking-tighter">Plan de Financiamiento</Button>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleWhatsAppGeneral} className="h-14 md:h-16 rounded-[20px] md:rounded-[24px] bg-[#25D366] text-white hover:opacity-90 font-black italic uppercase tracking-tighter"><MessageCircle className="mr-2 h-5 w-5" /> WhatsApp</Button>
                <Button onClick={() => setIsCallModalOpen(true)} variant="outline" className="h-14 md:h-16 rounded-[20px] md:rounded-[24px] border-2 border-black font-black italic uppercase tracking-tighter hover:bg-zinc-50 text-xs md:text-base">Llamar</Button>
              </div>
            </div>

            <div className={`${BRUTAL_STYLES.container} p-6 md:p-10`}>
              <h3 className={`${BRUTAL_STYLES.label} mb-4 text-black border-b border-zinc-200 pb-2 inline-block`}>Descripción</h3>
              <p className="text-zinc-600 text-sm md:text-base font-medium leading-relaxed first-letter:text-3xl md:first-letter:text-4xl first-letter:font-black first-letter:mr-2 first-letter:float-left first-letter:text-black">{car.description}</p>
            </div>
          </div>
        </div>
      </main>

      {/* SIMULADOR CON AVISO LEGAL */}
      <Dialog open={simulationOpen} onOpenChange={setSimulationOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl rounded-[30px] md:rounded-[40px] border-none bg-white p-0 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 md:p-10 space-y-6">
              <DialogHeader>
                <p className={BRUTAL_STYLES.label}>Simulador Pro</p>
                <DialogTitle className={BRUTAL_STYLES.title + " text-3xl md:text-4xl"}>Tu Crédito</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className={BRUTAL_STYLES.label}>Enganche Personalizado</Label>
                  <Input type="text" inputMode="numeric" placeholder="Monto" className={BRUTAL_STYLES.input} value={formatWithCommas(downPayment)} onChange={handleDownPaymentChange} />
                </div>
                <div className="space-y-2">
                  <Label className={BRUTAL_STYLES.label}>Plazo (Meses)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[24, 36, 48].map(m => (
                      <button key={m} onClick={() => setMonths(m)} className={`h-11 rounded-xl font-bold transition-all ${months === m ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 text-xs'}`}>{m}m</button>
                    ))}
                  </div>
                </div>

                {/* MENSAJE DE COTIZACIÓN APROXIMADA */}
                <div className="flex gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 mt-4">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-tight text-amber-800 font-medium">
                    Las cotizaciones son solo **aproximaciones**. Para conocer una cotización precisa y exacta debe contactar a la agencia.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 p-6 md:p-10 text-white flex flex-col justify-between min-h-[220px]">
              <div>
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-500 mb-1 md:mb-2">Mensualidad Estimada</p>
                <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
                  {monthlyPayment && downPayment !== '' ? formatPrice(monthlyPayment) : '---'}
                </h3>
                <div className="mt-4 flex items-center gap-2 text-zinc-400 text-[9px] font-bold uppercase"><Info className="h-3 w-3" /> Tasa desde {interestRate ? (interestRate * 100).toFixed(2) : '--'}% anual</div>
              </div>
              <Button 
                onClick={handleRequestFinance}
                className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black italic uppercase tracking-tighter mt-6 md:mt-0"
              >
                Solicitar Ahora
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LLAMADA */}
      <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
        <DialogContent className="rounded-[30px] md:rounded-[32px] border-none p-8 md:p-12 text-center max-w-[90vw] md:max-w-sm">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6"><Phone className="h-8 w-8 md:h-10 md:w-10 text-black" /></div>
          <h2 className={BRUTAL_STYLES.title + " text-xl md:text-2xl mb-2"}>¿Llamar ahora?</h2>
          <Button onClick={() => window.location.href = `tel:${car.agency_phone || '5529310292'}`} className="w-full h-14 rounded-2xl bg-black text-white font-black italic uppercase tracking-tighter">Llamar a Agencia</Button>
        </DialogContent>
      </Dialog>

      {/* LIGHTBOX GALERÍA */}
      <AnimatePresence>
        {imageViewerOpen && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
            <Button variant="ghost" onClick={() => setImageViewerOpen(false)} className="absolute top-6 right-6 md:top-10 md:right-10 text-white h-12 w-12 md:h-16 md:w-16 rounded-full hover:bg-white/10"><X className="h-8 w-8 md:h-10 md:w-10" /></Button>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-5xl">
              <img src={car.car_images?.[currentViewedImageIndex]?.image_url} className="w-full max-h-[65vh] md:max-h-[75vh] object-contain rounded-2xl" />
              <div className="absolute inset-y-0 -left-16 -right-16 hidden lg:flex items-center justify-between">
                 <Button variant="ghost" onClick={() => setCurrentViewedImageIndex(prev => prev === 0 ? car.car_images!.length - 1 : prev - 1)} className="text-white hover:bg-white/10 p-2 rounded-full"><ChevronLeft className="h-10 w-10" /></Button>
                 <Button variant="ghost" onClick={() => setCurrentViewedImageIndex(prev => prev === car.car_images!.length - 1 ? 0 : prev + 1)} className="text-white hover:bg-white/10 p-2 rounded-full"><ChevronRight className="h-10 w-10" /></Button>
              </div>
            </motion.div>
            <div className="flex gap-3 mt-8 md:mt-12 overflow-x-auto pb-4 w-full md:max-w-full px-6 md:px-10 no-scrollbar">
              {car.car_images?.map((img, i) => (
                <button key={i} onClick={() => setCurrentViewedImageIndex(i)} className={`h-16 w-24 md:h-20 md:w-32 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === currentViewedImageIndex ? 'border-white scale-105' : 'border-transparent opacity-30'}`}><img src={img.image_url} className="w-full h-full object-cover" /></button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarDetail;