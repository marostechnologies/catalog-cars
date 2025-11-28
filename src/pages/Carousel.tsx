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
      // Avanza al siguiente slide
      setCurrentSlide((prev) => (prev + 1) % marcas.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Animación simplificada: solo fundido (opacity) y escala sutil (scale)
  const variants = {
    enter: { opacity: 0, scale: 0.95 },
    center: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  };

  const currentMarcaSrc = marcas[currentSlide];

  return (
    // Minimalismo en el padding y color
    <section className="py-10 bg-gray-950 flex flex-col justify-center items-center text-white relative">
      
      {/* Título: fuente limpia, margen reducido */}
      <div className="text-center mb-4 px-4">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-normal">
          Nuestras <span className="text-primary/90">marcas</span>
        </h2>
        {/* Texto del seminuevo */}
        <p className="text-sm text-gray-500 mt-1 max-w-lg">
          Nuestros vehículos son elegidos con experiencia y respaldados por nuestro compromiso con la excelencia.
        </p>
      </div>

      {/* Carrusel: contenedor sin sombras ni adornos, altura compacta */}
      <div
        className="w-full max-w-4xl relative overflow-hidden flex items-center justify-center p-2"
        style={{
          height: '8rem', // Altura reducida a 8rem (h-32)
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentMarcaSrc}
            src={currentMarcaSrc}
            alt={`Marca ${currentSlide + 1}`}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            // Clases minimalistas: sin sombras, sin filtro de brillo
            className="absolute object-contain w-full max-w-xs md:max-w-md max-h-full z-10 opacity-80" 
            style={{
              maxWidth: '70%', // Más enfoque en el centro
              maxHeight: '70%',
            }}
          />
        </AnimatePresence>
      </div>

      {/* Indicadores: más pequeños y juntos */}
      <div className="flex space-x-2 mt-4">
        {marcas.map((_, index) => (
          <button
            key={index}
            // Indicadores más pequeños (w-2 h-2)
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === index
                // Fondo neutro pero visible
                ? 'bg-gray-200 scale-125'
                : 'bg-gray-700 hover:bg-gray-500'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default Carousel;