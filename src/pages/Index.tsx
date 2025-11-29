import { useEffect } from 'react';
import Navbar from '@/components/ui/navbar';
import Hero from '@/components/ui/hero';
import FeaturedCars from '@/components/ui/featured-cars';
import Carousel from './Carousel';

// ✅ Importar iconos optimizados
import { Instagram, Facebook, Music2, CheckCircle, Handshake, Shield } from 'lucide-react';

// ✅ Redes sociales con componentes reales
const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/autospacemexcar/", icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/autospace.mexcar.5", icon: Facebook },
  { name: "TikTok", href: "https://www.tiktok.com/@autospacemexcar", icon: Music2 },
];

const Index = () => {
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    });

    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FeaturedCars />
      <Carousel />

      {/* Stats */}
      <section className="py-16 bg-secondary/10">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '50+', label: 'Autos Disponibles' },
              { number: '500+', label: 'Clientes Satisfechos' },
              { number: '10+', label: 'Años de Experiencia' },
              { number: '100%', label: 'Recomendación' }
            ].map((stat) => (
              <div key={stat.label} className="fade-in-up">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - ESTRUCTURA FINAL CON MAPA MINIMALISTA */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-700 pb-10">

            {/* Columna 1: Logo y Redes Sociales */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/JPCars_logo.png" 
                  alt="MAROS Logo" 
                  className="h-10 w-auto" 
                />
              </div>

              <p className="text-gray-400 text-sm mt-4">
                Tu destino para encontrar el auto perfecto con la mejor experiencia de compra.
              </p>

              {/* Íconos optimizados y estilizados */}
              <div className="flex items-center gap-4 mt-6">
                {socialLinks.map(({ name, href, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-primary transition-all"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Columna 2: Enfocada en la Venta y Transparencia */}
            <div>
              <h3 className="text-lg font-semibold mb-5 text-white">Transparencia</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Garantía de Documentos
                </li>
                <li className="flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-primary" />
                  Planes de Financiamiento
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Seguro y Asesoría Legal
                </li>
              </ul>

              <div className="mt-8">
              </div>
            </div>

            {/* Columna 3: Información de Contacto */}
            <div>
              <h3 className="text-lg font-semibold mb-5 text-white">Información</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex flex-col">
                  <span className="font-semibold text-gray-300">Sucursal Tlalnepantla</span>
                  <a href="tel:+525529310292" className="hover:text-primary transition-colors">
                    +52 55 2931 0292
                  </a>
                  <span className="text-xs pt-1">
                    Dirección: C. Augustin Melgar 23, Niños Heroes, 54017 Tlalnepantla, Méx.
                  </span>
                </li>
                <li className="flex flex-col pt-3">
                  <span className="font-semibold text-gray-300">Horario</span>
                  <span>Lun - Dom: 10:00 - 18:00</span>
                </li>
              </ul>
            </div>

            {/* Columna 4: Solo Ubicación/Mapa */}
            <div>
              <h3 className="text-lg font-semibold mb-5 text-white">Ubicación</h3>

              <div className="mb-6 h-32 w-full bg-gray-800 rounded overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3759.530060164913!2d-99.1999519247823!3d19.56177918174536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d21d7b10e4288b%3A0xef64360ecc31296c!2sAuto%20Space!5e0!3m2!1ses-419!2smx!4v1757282118142!5m2!1ses-419!2smx"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Sucursal Tlalnepantla"
                />
              </div>
              
              {/* Eliminado el <ul> con las preguntas clave */}
            </div>
          </div>

          {/* Footer final */}
          <div className="mt-10 text-center text-gray-500 text-sm">
            <p>© {currentYear} JPCars. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;