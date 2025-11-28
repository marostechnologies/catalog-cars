import { useEffect } from 'react';
import Navbar from '@/components/ui/navbar';
import Hero from '@/components/ui/hero';
import FeaturedCars from '@/components/ui/featured-cars';

const Index = () => {
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Add fade-in animation to elements on scroll
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
      
      {/* Stats Section */}
      <section className="py-16 bg-secondary/10">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="fade-in-up">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Autos Disponibles</div>
            </div>
            <div className="fade-in-up">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Clientes Satisfechos</div>
            </div>
            <div className="fade-in-up">
              <div className="text-4xl font-bold text-primary mb-2">10+</div>
              <div className="text-muted-foreground">Años de Experiencia</div>
            </div>
            <div className="fade-in-up">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Recomendación</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/MAROS_LOGO_SINFONDO.PNG" 
                  alt="Autospace Logo" 
                  className="h-8 md:h-10 w-auto" 
                />
              </div>
              <p className="text-muted-foreground">
                Tu destino para encontrar el auto perfecto con la mejor experiencia de compra.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/catalog" className="hover:text-white transition-colors">Catálogo</a></li>
                <li><a href="/Sucursales" className="hover:text-white transition-colors">Sucursales</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <span className="font-bold">Sucursal Tlalnepantla:</span> +52 55 2931 0292
                </li>
                <li>
                  <span className="font-bold">Sucursal Cancún:</span> +52 998 234 5678
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Horarios</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><span className="font-bold">Tlalnepantla:</span> Lun - Dom: 10:00 - 18:00</li>
                <li><span className="font-bold">Cancún:</span> Lun - Dom: 10:00 - 18:00</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-muted mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {currentYear} MAROS Technology. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;