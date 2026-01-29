import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from '@/components/ui/navbar';
import { MapPin, Phone, Clock, Star, ExternalLink } from "lucide-react"; 
import { Button } from "@/components/ui/button";

const sucursales = [
  {
    nombre: "Autospace Tlalnepantla - Estado de México",
    direccion: "Av. Gustavo Baz 123, Tlalnepantla, Edo. de México",
    telefono: "+52 55 2931 0292",
    horario: "Lunes a Sábado: 9:00 AM - 6:00 PM",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3759.5300601649114!2d-99.19995192381113!3d19.56177918174541!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d21d7b10e4288b%3A0xef64360ecc31296c!2sAuto%20Space!5e0!3m2!1ses-419!2smx!4v1769653741140!5m2!1ses-419!2smx"
  }
];

const StarRating = () => {
  return (
    <div className="flex items-center space-x-1 bg-white/5 w-fit px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm"> 
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className="h-3 w-3 fill-blue-500 text-blue-500" 
        />
      ))}
      <span className="text-[10px] font-black text-white/70 ml-2 tracking-widest uppercase">Excelente Servicio</span>
    </div>
  );
};

const Sucursales = () => {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* VIDEO DE FONDO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src="/autospace_video_hero.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black"></div>

        <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
          {/* HEADER TIPO NAVBAR */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-blue-500 text-[10px] md:text-xs font-black uppercase tracking-[0.5em] mb-4 block">Presencia Nacional</span>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase mb-6">
              Nuestra <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">Sucursal.</span>
            </h1>
            <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]"></div>
          </motion.div>

          <div className="flex justify-center"> 
            {sucursales.map((sucursal, index) => (
              <motion.div
                key={sucursal.nombre}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="group relative bg-zinc-950/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl w-full lg:w-3/4 flex flex-col md:flex-row"
              >
                {/* MAPA */}
                <div className="w-full md:w-1/2 h-80 md:h-auto relative overflow-hidden">
                  <iframe
                    src={sucursal.mapSrc}
                    width="100%"
                    height="100%"
                    className="border-0 grayscale contrast-125 opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                  <div className="absolute inset-0 pointer-events-none border-r border-white/10 hidden md:block"></div>
                </div>

                {/* CONTENIDO */}
                <div className="p-8 md:p-12 w-full md:w-1/2 space-y-8 flex flex-col justify-center">
                  <StarRating /> 
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black italic tracking-tighter text-white leading-tight uppercase">
                      {sucursal.nombre.split(' - ')[0]}
                      <span className="block text-sm font-black tracking-[0.2em] text-blue-500 not-italic mt-2">
                         {sucursal.nombre.split(' - ')[1]}
                      </span>
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 group/item">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover/item:bg-blue-600 transition-colors duration-300">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm text-white/60 font-medium leading-relaxed mt-1">
                        {sucursal.direccion}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 group/item">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover/item:bg-blue-600 transition-colors duration-300">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm text-white font-black tracking-widest">{sucursal.telefono}</p>
                    </div>

                    <div className="flex items-center space-x-4 group/item">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover/item:bg-blue-600 transition-colors duration-300">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs text-white/40 uppercase font-black tracking-widest leading-relaxed">
                        {sucursal.horario}
                      </p>
                    </div>
                  </div>

                  {/* BOTÓN ÚNICO FULL WIDTH */}
                  <div className="pt-4">
                    <Button 
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sucursal.direccion)}`, '_blank')}
                      className="bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl px-8 h-16 text-[12px] font-black uppercase tracking-[0.25em] transition-all duration-500 w-full shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
                    >
                      <ExternalLink className="mr-3 h-5 w-5" /> Cómo llegar
                    </Button>
                  </div>
                </div>

                {/* DECORACIÓN */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <MapPin className="h-40 w-40 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-white/5 text-center bg-black">
        <p className="text-[10px] font-black tracking-[0.5em] text-white/20 uppercase">Autospace Mexcar © 2026</p>
      </footer>
    </div>
  );
};

export default Sucursales;