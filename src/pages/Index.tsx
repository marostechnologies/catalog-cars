import { motion } from 'framer-motion';
import Navbar from '@/components/ui/navbar';
import Hero from '@/components/ui/hero';
import FeaturedCars from '@/components/ui/featured-cars';
import Carousel from './Carousel';

// ✅ Iconos optimizados
import { 
  Instagram, 
  Facebook, 
  Music2, 
  CheckCircle, 
  Handshake, 
  Shield, 
  MapPin, 
  Phone, 
  Clock 
} from 'lucide-react';

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/autospacemexcar/", icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/autospace.mexcar.5", icon: Facebook },
  { name: "TikTok", href: "https://www.tiktok.com/@autospacemexcar", icon: Music2 },
];

const stats = [
  { number: '50+', label: 'Autos Disponibles' },
  { number: '500+', label: 'Clientes Satisfechos' },
  { number: '10+', label: 'Años de Experiencia' },
  { number: '100%', label: 'Recomendación' }
];

const Index = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navegación y Secciones Principales */}
      <Navbar />
      <Hero />
      <FeaturedCars />
      
      {/* Carrusel de Marcas (Fondo Negro) */}
      <Carousel />

      {/* --- STATS SECTION (ULTRA-RESPONSIVE: 2x2 en Móvil) --- */}
      <section className="relative py-12 md:py-28 bg-white overflow-hidden">
        {/* Textura de ruido sutil */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          {/* grid-cols-2 forzado para móvil, lg:grid-cols-4 para desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-10">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="
                  flex flex-col justify-center items-center
                  p-4 sm:p-6 md:p-14 
                  aspect-square sm:aspect-auto
                  min-h-[140px] sm:min-h-[180px] md:min-h-[280px]
                  rounded-[1.5rem] md:rounded-[3rem] 
                  bg-white border border-slate-100 
                  shadow-[0_10px_30px_rgba(0,0,0,0.03)] 
                  text-center group transition-all duration-500
                  hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]
                  hover:-translate-y-2
                "
              >
                <div className="text-3xl sm:text-4xl md:text-7xl font-black text-slate-950 mb-1 md:mb-3 tracking-tighter leading-none transition-transform duration-500 group-hover:scale-105">
                  {stat.number}
                </div>
                <div className="text-[8px] sm:text-[10px] md:text-[12px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] text-blue-600 leading-tight">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER (RESPONSIVE OPTIMIZED) --- */}
      <footer className="bg-black text-white pt-20 pb-10 border-t border-white/5 font-sans">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">

            {/* Columna 1: Branding */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-6">
              <img src="/JPCars_logo.png" alt="Logo" className="h-10 w-auto brightness-200" />
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
                Redefiniendo la adquisición de vehículos seminuevos bajo estándares de excelencia.
              </p>
              <div className="flex gap-3">
                {socialLinks.map(({ name, href, icon: Icon }) => (
                  <a 
                    key={name} 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-all group"
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Columna 2: Confianza */}
            <div className="lg:col-span-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Confianza</h3>
              <ul className="space-y-4">
                {[
                  { icon: CheckCircle, text: "Garantía Legal" },
                  { icon: Handshake, text: "Finanzas" },
                  { icon: Shield, text: "Seguridad" }
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                    <item.icon className="w-4 h-4 text-blue-500 shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 3: Contacto */}
            <div className="lg:col-span-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Contacto</h3>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-sm text-slate-400 leading-snug">
                    C. Augustin Melgar 23, Niños Heroes, Tlalnepantla, Méx.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                  <a href="tel:+525529310292" className="text-sm text-slate-400 hover:text-white transition-colors">
                    +52 55 2931 0292
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                  <span className="text-sm text-slate-400 font-medium italic">Lun - Dom: 10:00 - 18:00</span>
                </div>
              </div>
            </div>

            {/* Columna 4: Ubicación */}
            <div className="sm:col-span-2 lg:col-span-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Ubicación</h3>
              <div className="rounded-[2rem] overflow-hidden h-40 border border-white/10 grayscale opacity-60 hover:grayscale-0 transition-all duration-700">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3760.360123456789!2d-99.2081234!3d19.5371234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDMyJzEzLjYiTiA5OcKwMTInMjkuMiJX!5e0!3m2!1ses!2smx!4v1234567890" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Copyright Final */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
              © {currentYear} JPCars. All Rights Reserved.
            </p>
            <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;