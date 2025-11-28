import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from '@/components/ui/navbar';
import { MapPin, Phone, Clock, Star } from "lucide-react"; 

const sucursales = [
  {
    nombre: "Autospace Tlalnepantla - Estado de México",
    direccion: "Av. Gustavo Baz 123, Tlalnepantla, Edo. de México",
    telefono: "+52 55 2931 0292",
    horario: "Lunes a Sábado: 9:00 AM - 6:00 PM",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3759.530060164913!2d-99.1999519247823!3d19.56177918174536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d21d7b10e4288b%3A0xef64360ecc31296c!2sAuto%20Space!5e0!3m2!1ses-419!2smx!4v1757282118142!5m2!1ses-419!2smx"
  }
];

const StarRating = () => {
  return (
    <div className="flex items-center space-x-0.5"> 
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className="h-5 w-5 fill-yellow-400 text-yellow-400" 
        />
      ))}
    </div>
  );
};

const Sucursales = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sucursales.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />

      <section className="relative min-h-screen">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/autospace_video_hero.mp4"
        />

        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 container mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nuestra Sucursal
            </h1>
            <p className="text-lg text-gray-300">
              Encuentra la sucursal más cercana
            </p>
          </motion.div>

          <div className="flex justify-center"> 
            {sucursales.map((sucursal, index) => (
              <motion.div
                key={sucursal.nombre}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                // CAMBIO: Aumentamos el ancho en pantallas grandes (de lg:w-2/5 a lg:w-1/2)
                className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300 w-full md:w-2/3 lg:w-1/2" 
              >
                {/* CAMBIO: Reducimos la altura fija (de h-80 a h-72) */}
                <div className="w-full h-72"> 
                  <iframe
                    src={sucursal.mapSrc}
                    width="100%"
                    height="100%"
                    className="border-0 rounded-t-2xl"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                <div className="p-6 space-y-4 text-white">
                  <StarRating /> 
                  
                  <h2 className="text-2xl font-bold text-primary">
                    {sucursal.nombre}
                  </h2>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <p>{sucursal.direccion}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <p>{sucursal.telefono}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <p>{sucursal.horario}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Sucursales;