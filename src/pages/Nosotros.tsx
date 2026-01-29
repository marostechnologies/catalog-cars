import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Star, ChevronDown, ArrowUpRight, CheckCircle2, 
  Instagram, Facebook, MessageCircle, Smartphone, Target, Eye,
  Music2, CheckCircle, Handshake, Shield, MapPin, Phone, Clock 
} from 'lucide-react';
import Navbar from '@/components/ui/navbar';

const RevealText = ({ children, className }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: 0 } : { y: "100%" }}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const Nosotros = () => {
  const containerRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const { scrollYProgress } = useScroll({ target: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 1.3]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const floatingY = useTransform(smoothProgress, [0, 1], [0, -100]);

  // Estado para el carrusel de fotos de la agencia
  const [imgIndex, setImgIndex] = useState(0);
  const agencyImages = [
    "/JPCarsPhotos/JPCarsAgency2.JPG",
    "/JPCarsPhotos/JPCarsAgency3.JPG",
    "/JPCarsPhotos/JPCarsAgency4.JPG",
    "/JPCarsPhotos/JPCarsAgency5.JPG"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % agencyImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/autospacemexcar/', color: 'hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7]', handle: '@autospacemexcar' },
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/autospace.mexcar.5', color: 'hover:bg-[#1877F2]', handle: 'JPCars Agency' },
    { name: 'TikTok', icon: Music2, href: 'https://www.tiktok.com/@autospacemexcar', color: 'hover:bg-[#000000] hover:border-pink-500', handle: '@autospacemexcar' }
  ];

  return (
    <div ref={containerRef} className="bg-[#050505] text-white selection:bg-blue-600 selection:text-white antialiased overflow-hidden">
      <Navbar />

      {/* --- HERO --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#050505] z-[5]" />
          <img 
            src="/JPCarsPhotos/JPCarsAgency1.jpg" 
            className="w-full h-full object-cover" 
            alt="Hero"
          />
        </motion.div>

        <div className="relative z-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div className="flex justify-center mb-6">
                <img src="/JPCars_logo.png" className="h-32 md:h-48 w-auto object-contain" alt="JPCars Logo" />
            </div>
            <div className="mt-4 flex flex-col items-center">
                <RevealText className="text-4xl md:text-7xl font-light italic text-white/90">
                    EXCELENCIA <span className="font-black not-italic text-outline-white">SIN LÍMITES</span>
                </RevealText>
            </div>
          </motion.div>
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          <div className="w-[1px] h-20 bg-gradient-to-b from-blue-600 to-transparent" />
          <span className="text-[8px] tracking-[0.4em] uppercase text-white/40">Desliza para explorar</span>
        </motion.div>
      </section>

      {/* --- NARRATIVA: BENTO GRID --- */}
      <section className="relative py-32 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-8xl font-black italic leading-none tracking-tighter uppercase">
                  MÁS QUE <br /> <span className="text-blue-600">UN INVENTARIO.</span>
                </h2>
                <p className="text-xl md:text-2xl text-white/60 font-light max-w-xl leading-relaxed">
                  Somos una <span className="text-white font-medium italic">marca independiente</span> que colabora estratégicamente con las mejores agencias de seminuevos del país.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { 
                    icon: <ShieldCheck />, 
                    title: "Selección Curada", 
                    desc: "Cada unidad es sometida a un proceso de curaduría estética y mecánica." 
                  },
                  { 
                    icon: <Zap />, 
                    title: "Ecosistema Premium", 
                    desc: "Conexión directa con coleccionistas y las agencias de seminuevos más exclusivas de la CDMX." 
                  }
                ].map((item, i) => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={i} 
                    className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] backdrop-blur-sm hover:bg-white/10 transition-all"
                  >
                    <div className="text-blue-500 mb-4">{item.icon}</div>
                    <h3 className="text-xs md:text-lg font-bold uppercase tracking-tight mb-2">{item.title}</h3>
                    <p className="text-[10px] md:text-sm text-white/40 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div style={{ y: floatingY }} className="lg:col-span-5 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
              <div className="relative rounded-[3rem] overflow-hidden h-full min-h-[500px] border border-white/20 w-full">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={imgIndex}
                    src={agencyImages[imgIndex]} 
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Agencia JPCars"
                  />
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- EL RESTO DEL CÓDIGO PERMANECE IGUAL --- */}
      {/* ... (Misión, Marquee, Galería, Redes y Footer) */}

      {/* --- MISIÓN Y VISIÓN --- */}
      <section className="py-32 px-6 bg-gradient-to-b from-transparent to-blue-900/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4 md:gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group p-6 md:p-10 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[3rem] hover:border-blue-500/50 transition-all duration-500"
          >
            <div className="w-10 h-10 md:w-16 md:h-16 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8 group-hover:rotate-12 transition-transform">
              <Target className="w-5 h-5 md:w-8 md:h-8" />
            </div>
            <h3 className="text-lg md:text-4xl font-black italic mb-2 md:mb-6 uppercase tracking-tighter text-blue-500">Misión</h3>
            <p className="text-[10px] md:text-lg text-white/70 leading-relaxed font-light">
              Transformar la adquisición con <span className="text-white font-bold">transparencia y pasión</span>.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group p-6 md:p-10 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[3rem] hover:border-blue-500/50 transition-all duration-500"
          >
            <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8 group-hover:rotate-12 transition-transform text-black">
              <Eye className="w-5 h-5 md:w-8 md:h-8" />
            </div>
            <h3 className="text-lg md:text-4xl font-black italic mb-2 md:mb-6 uppercase tracking-tighter">Visión</h3>
            <p className="text-[10px] md:text-lg text-white/70 leading-relaxed font-light">
              Ser el <span className="text-white font-bold">referente independiente</span> más exclusivo.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="py-20 rotate-[-2deg] scale-105 bg-blue-600 overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.3)]">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 items-center whitespace-nowrap"
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-20">
              <Star fill="black" size={40} className="text-black" />
              <span className="text-6xl md:text-8xl font-black italic text-outline-black text-white tracking-tighter">
                JPCARS
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <section className="py-40 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <h2 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase">EL CLUB<br/><span className="text-blue-600">JPCARS</span></h2>
            <div className="text-right">
                <p className="text-white/40 max-w-[200px] text-xs font-bold tracking-[0.3em] uppercase mb-4">Testimonios vivos de nuestra pasión.</p>
                <div className="flex gap-4 justify-end">
                    {socialLinks.map(({ name, href, icon: Icon }) => (
                        <a key={name} href={href} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-blue-600 transition-all group">
                            <Icon size={20} className="text-white/60 group-hover:text-white transition-colors" />
                        </a>
                    ))}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {["JPCarsClients1.jpg", "JPCarsClients2.jpg", "JPCarsClients3.JPG", "JPCarsClients4.JPG"].map((img, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -20, rotate: idx % 2 === 0 ? 1 : -1 }}
              className="relative aspect-[3/4] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group cursor-none"
            >
              <img src={`/JPCarsPhotos/${img}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 md:p-8">
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <CheckCircle2 size={16} className="md:w-5 md:h-5" />
                    </div>
                    <span className="text-[8px] md:text-xs font-bold tracking-widest uppercase">Verified Owner</span>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-32 px-6 relative border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">Comunidad <span className="text-blue-600">Digital</span></h2>
            <p className="text-white/40 tracking-[0.3em] uppercase text-[10px] md:text-xs font-bold">Contenido exclusivo</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {socialLinks.map((social, idx) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative p-[1px] rounded-[1.5rem] md:rounded-[2rem] transition-all duration-500 overflow-hidden ${social.color} ${idx === 2 ? 'col-span-2 md:col-span-1' : 'col-span-1'}`}
              >
                <div className="bg-[#0a0a0a] p-5 md:p-8 rounded-[1.45rem] md:rounded-[1.9rem] flex flex-col sm:flex-row items-center justify-between group-hover:bg-transparent transition-colors duration-500 h-full">
                  <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                      <social.icon size={24} className="md:w-[28px]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base md:text-xl uppercase tracking-tighter">{social.name}</h3>
                      <p className="text-white/40 text-[10px] md:text-sm font-medium group-hover:text-white/80">{social.handle}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="hidden sm:block text-white/20 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={24} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-black text-white pt-20 pb-10 border-t border-white/5 font-sans">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
            <div className="sm:col-span-2 lg:col-span-4 space-y-6">
              <img src="/JPCars_logo.png" alt="Logo" className="h-14 w-auto" />
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
                Redefiniendo la adquisición de vehículos seminuevos bajo estándares de excelencia.
              </p>
              <div className="flex gap-3">
                {socialLinks.map(({ name, href, icon: Icon }) => (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-all group">
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Confianza</h3>
              <ul className="space-y-4">
                {[
                  { icon: CheckCircle, text: "Garantía Legal" },
                  { icon: Handshake, text: "Alianzas" },
                  { icon: Shield, text: "Independencia" }
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                    <item.icon className="w-4 h-4 text-blue-500 shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Contacto</h3>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-sm text-slate-400 leading-snug">C. Augustin Melgar 23, Niños Heroes, Tlalnepantla, Méx.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                  <a href="tel:+525529310292" className="text-sm text-slate-400 hover:text-white transition-colors">+52 55 2931 0292</a>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Ubicación</h3>
              <div className="rounded-[2rem] overflow-hidden h-40 border border-white/10 grayscale opacity-60 hover:grayscale-0 transition-all duration-700">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3759.5300601649114!2d-99.19995192381113!3d19.56177918174541!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d21d7b10e4288b%3A0xef64360ecc31296c!2sAuto%20Space!5e0!3m2!1ses-419!2smx!4v1769653741140!5m2!1ses-419!2smx" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">© {currentYear} JPCars. All Rights Reserved.</p>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-white shadow-lg">
                <div className="text-right leading-none">
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Powered by</p>
                    <p className="text-[10px] text-blue-600 font-black italic">MAROS TECHNOLOGY</p>
                </div>
                <img src="/MAROS_LOGO_SINFONDO.PNG" alt="Maros Logo" className="h-7 w-auto object-contain" />
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .text-outline-white { -webkit-text-stroke: 1px rgba(255,255,255,0.3); color: transparent; }
        .text-outline-black { -webkit-text-stroke: 2px black; }
        .italic-shadow { text-shadow: 20px 20px 0px rgba(37,99,235,0.1); }
        @media (max-width: 768px) { .italic-shadow { text-shadow: 10px 10px 0px rgba(37,99,235,0.1); } }
      `}</style>
    </div>
  );
};

export default Nosotros;