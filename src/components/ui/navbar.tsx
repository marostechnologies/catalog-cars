import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, User, Search, Phone, Clock, Instagram, Facebook, Music2, LogOut, Settings, ShieldCheck } from 'lucide-react'; // Añadí ShieldCheck para el estilo
import { Button } from './button';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './dropdown-menu';
import { Avatar, AvatarFallback } from './avatar';
import { toast } from 'sonner';

const sucursales = [
  {
    nombre: "Autospace Tlalnepantla - Estado de México",
    telefono: "+52 55 2931 0292",
    horario: "Lunes a Sábado: 9:00 AM - 6:00 PM",
  }
];

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/autospacemexcar/", icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/autospace.mexcar.5", icon: Facebook },
  { name: "TikTok", href: "https://www.tiktok.com/@autospacemexcar", icon: Music2 },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showContact, setShowContact] = useState(false);
  
  const { user, isAdmin, signOut } = useAuth(); 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isCarDetailPage = location.pathname.startsWith('/car/');

  const navItems = [
    { name: 'INICIO', href: '/' },
    { name: 'CATÁLOGO', href: '/catalog' },
    { name: 'SUCURSALES', href: '/sucursales' },
    { name: 'NOSOTROS', href: '/nosotros' },
    /*{ name: 'VENDER AUTO', href: '/sell' },*/
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };
  
  const handleFavorites = () => {
    if (!user) {
      toast.error('Inicia sesión para ver favoritos');
      navigate('/auth');
      return;
    }
    navigate('/favorites');
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada');
      navigate('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
    setIsOpen(false);
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled || isCarDetailPage || isOpen 
            ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-10 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <img 
                src="/JPCars_logo.png" 
                alt="JPCars Logo" 
                className="h-10 md:h-12 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
              />
            </motion.div>

            <div className="hidden md:flex items-center space-x-10">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-[11px] font-black tracking-[0.25em] text-white/70 hover:text-white transition-all duration-300 relative group"
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 h-[2px] bg-blue-600 transition-all duration-300 ${location.pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => navigate('/catalog')}>
                <Search className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={handleFavorites}>
                <Heart className={`h-4 w-4 ${location.pathname === '/favorites' ? 'fill-blue-600 text-blue-600' : ''}`} />
              </Button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center ml-2 p-1 rounded-full hover:bg-white/10 transition-colors">
                      <Avatar className="h-8 w-8 border border-white/20">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-[10px] font-bold">
                          {getUserInitials(user.user_metadata?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#0a0a0a]/95 backdrop-blur-2xl border-white/10 text-white" align="end">
                    <div className="p-4 border-b border-white/5">
                      <p className="text-xs font-black tracking-widest uppercase text-blue-500 mb-1">Usuario</p>
                      <p className="text-sm font-bold truncate">{user.user_metadata?.full_name || 'Mi Perfil'}</p>
                      <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="focus:bg-white/10 p-3 cursor-pointer">
                        <Settings className="mr-3 h-4 w-4 text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">Panel Admin</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="focus:bg-red-500/20 text-red-500 p-3 cursor-pointer">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => navigate('/auth')}>
                  <User className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                onClick={() => setShowContact(true)}
                className="ml-4 bg-white text-black hover:bg-slate-200 rounded-full px-6 h-9 text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
              >
                Contacto
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white relative z-50"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '100vh' }}
              exit={{ opacity: 0, height: 0 }}
              className="fixed inset-0 top-0 bg-black/95 backdrop-blur-2xl md:hidden z-[40] flex flex-col p-8 pt-24"
            >
              <div className="flex flex-col space-y-8 mt-10">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className="text-3xl font-black text-white tracking-tighter text-left"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              
              <div className="mt-auto space-y-6 pb-12">
                <div className="h-[1px] bg-white/10 w-full" />
                <div className="flex flex-col gap-4">
                  
                  {!user ? (
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate('/auth')} 
                      className="text-white border border-white/10 rounded-full w-full py-6 flex justify-start px-6"
                    >
                      <User className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Iniciar Sesión</span>
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center gap-4 px-2 mb-2">
                        <Avatar className="h-12 w-12 border border-white/20">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold">
                            {getUserInitials(user.user_metadata?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-white text-sm font-black uppercase tracking-widest">
                            {user.user_metadata?.full_name || 'Mi Perfil'}
                          </p>
                          <p className="text-white/40 text-[10px]">{user.email}</p>
                          <button onClick={handleSignOut} className="text-red-500 text-[9px] font-black uppercase mt-1 text-left">
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>

                      {/* ARREGLO: PANEL ADMIN EN MÓVIL */}
                      {isAdmin && (
                        <Button 
                          onClick={() => navigate('/admin')} 
                          className="bg-zinc-900 border border-blue-600/50 text-white rounded-full w-full py-6 h-auto flex justify-start px-6 transition-all active:scale-95"
                        >
                          <ShieldCheck className="h-5 w-5 mr-3 text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Panel de Administración</span>
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button variant="ghost" size="icon" onClick={handleFavorites} className="text-white border border-white/10 rounded-full w-12 h-12">
                      <Heart className={`h-5 w-5 ${location.pathname === '/favorites' ? 'fill-blue-600 text-blue-600' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate('/catalog')} className="text-white border border-white/10 rounded-full w-12 h-12">
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button 
                    onClick={() => { setShowContact(true); setIsOpen(false); }}
                    className="bg-blue-600 text-white rounded-full w-full py-6 h-auto text-[10px] font-black uppercase tracking-widest"
                  >
                    Hablar con un asesor
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* MODAL DE CONTACTO (Sin cambios) */}
      <AnimatePresence>
        {showContact && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowContact(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0a0a0a] border border-white/10 text-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowContact(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="text-center mb-10">
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Asistencia</span>
                <h2 className="text-4xl font-black tracking-tighter italic">CONTACTO.</h2>
              </div>

              <div className="space-y-4">
                {sucursales.map((sucursal) => (
                  <div key={sucursal.nombre} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4 transition-all hover:bg-white/[0.05]">
                    <h3 className="text-sm font-bold text-white/90">{sucursal.nombre}</h3>
                    <div className="flex flex-col gap-3">
                      <a href={`tel:${sucursal.telefono}`} className="flex items-center gap-4 text-blue-400 hover:text-blue-300 transition-colors">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm font-bold tracking-tight">{sucursal.telefono}</span>
                      </a>
                      <div className="flex items-center gap-4 text-white/40">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-medium">{sucursal.horario}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex justify-center gap-6">
                {socialLinks.map((social) => (
                  <a 
                    key={social.name} 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-blue-600 transition-all duration-500"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;