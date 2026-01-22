import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const marcas: string[] = [
  '/marca1.png',
  '/marca2.png',
  '/marca3.png',
  '/marca4.png',
  '/marca5.png',
  '/marca6.png',
];

const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % marcas.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const variants = {
    enter: { opacity: 0, y: 15, filter: 'blur(12px)', scale: 0.9 },
    center: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      opacity: 0,
      y: -15,
      filter: 'blur(12px)',
      scale: 0.9,
      transition: { duration: 0.4 },
    },
  };

  const currentMarcaSrc = marcas[currentSlide];

  return (
    <section className="relative py-32 bg-[#020617] flex flex-col justify-center items-center overflow-hidden">
      {/* 1. TEXTURA Y LUZ AMBIENTAL (Clave para el modo oscuro) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container relative z-10 px-6 mx-auto flex flex-col items-center">
        
        {/* 2. BADGE SUPERIOR CINÉTICO */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="h-[1px] w-8 bg-blue-500/50" />
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">
            Partners Globales
          </span>
          <span className="h-[1px] w-8 bg-blue-500/50" />
        </motion.div>

        {/* 3. TÍTULO IMPACTANTE */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6"
          >
            INGENIERÍA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-700">
              DE ÉLITE.
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm md:text-lg max-w-lg mx-auto font-medium leading-relaxed opacity-80"
          >
            Curamos una selección de marcas legendarias donde la perfección no es una opción, sino el estándar de cada kilómetro.
          </motion.p>
        </div>

        {/* 4. CONTENEDOR DE MARCAS (Logos en Blanco/Brillantes) */}
        <div className="w-full max-w-3xl relative h-40 flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.img
                    key={currentMarcaSrc}
                    src={currentMarcaSrc}
                    alt={`Marca ${currentSlide + 1}`}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    // Filtro invert para que si los logos son negros se vean blancos, o brillo alto
                    className="absolute object-contain max-h-24 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-500"
                />
            </AnimatePresence>
        </div>

        {/* 5. INDICADORES TIPO "DASHBOARD" */}
        <div className="flex space-x-4 mt-16">
            {marcas.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="group relative h-1.5 transition-all duration-500"
                    style={{ width: currentSlide === index ? '3rem' : '1.5rem' }}
                >
                    <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        currentSlide === index 
                        ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                        : 'bg-white/10 group-hover:bg-white/30'
                    }`} />
                </button>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Carousel;