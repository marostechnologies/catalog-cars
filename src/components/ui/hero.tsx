import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Search, Car, Calendar, DollarSign, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

export const Hero = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Lógica de Scroll para efectos visuales
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Transformaciones coordinadas (Efecto de alejamiento y desaparición)
  const contentScale = useTransform(smoothProgress, [0, 0.4], [1, 0.9]);
  const contentOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0]);
  const videoBlur = useTransform(smoothProgress, [0, 0.4], [0, 10]);

  // --- TU LÓGICA DE ESTADO Y SUPABASE ---
  const [searchData, setSearchData] = useState({ brand: '', model: '', year: '', maxPrice: '' });
  const [brands, setBrands] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('cars').select('brand, year').neq('brand', null);
      if (error) return console.error('Error fetching data:', error);
      setBrands(Array.from(new Set(data.map((item: any) => item.brand))));
      setYears(Array.from(new Set(data.map((item: any) => item.year))).sort((a, b) => b - a));
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.brand) params.set('brand', searchData.brand);
    if (searchData.model) params.set('model', searchData.model);
    if (searchData.year) params.set('year', searchData.year);
    if (searchData.maxPrice) params.set('maxPrice', searchData.maxPrice);
    navigate(`/catalog?${params.toString()}`);
  };

  return (
    <section ref={containerRef} className="relative h-[110vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* VIDEO DE FONDO CON FILTRO DINÁMICO */}
        <motion.div style={{ filter: `blur(${videoBlur}px)` }} className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover brightness-[0.6] contrast-[1.1]">
            <source src="/autospace_video_hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        </motion.div>

        {/* CONTENIDO PRINCIPAL */}
        <motion.div 
          style={{ scale: contentScale, opacity: contentOpacity }}
          className="container relative z-10 px-6 flex flex-col items-center"
        >
          {/* Headline Estilo Apple */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12vw] md:text-[7vw] font-black text-white leading-[0.85] tracking-tighter text-center mb-8"
          >
            ENCUENTRA TU <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">
              AUTO PERFECTO.
            </span>
          </motion.h1>

          {/* BUSCADOR: Mantenemos fondo blanco sólido para contraste */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[2rem] p-4 md:p-8 w-full max-w-5xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Marca */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Marca</label>
                <Select value={searchData.brand} onValueChange={(v) => setSearchData(p => ({...p, brand: v}))}>
                  <SelectTrigger className="h-12 border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-black">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>{brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Modelo</label>
                <Input 
                  placeholder="Ej. 911" 
                  className="h-12 border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-black"
                  value={searchData.model}
                  onChange={(e) => setSearchData(p => ({...p, model: e.target.value}))}
                />
              </div>

              {/* Año */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Año</label>
                <Select value={searchData.year} onValueChange={(v) => setSearchData(p => ({...p, year: v}))}>
                  <SelectTrigger className="h-12 border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-black">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Botón Buscar - Alineado a la rejilla */}
              <div className="flex items-end pb-0.5">
                <Button 
                  onClick={handleSearch}
                  className="w-full h-12 bg-black hover:bg-slate-800 text-white rounded-xl transition-all duration-300 flex gap-2 font-bold"
                >
                  <Search size={18} /> BUSCAR
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;