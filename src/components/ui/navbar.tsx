import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, User, Search, Phone, Clock, Instagram, Facebook, Music2, LogOut, Settings } from 'lucide-react';
import { Button } from './button';
// Nota: Deberás tener estos componentes y hooks definidos en tu proyecto.
// Simulación del hook de autenticación
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './dropdown-menu';
import { Avatar, AvatarFallback } from './avatar';
// Simulación de sonner
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
  
  // Asumiendo que useAuth proporciona user, isAdmin y signOut
  const { user, isAdmin, signOut } = useAuth(); 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determina si estamos en una página de detalle de auto (ej. /car/123)
  const isCarDetailPage = location.pathname.startsWith('/car/');

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalog' },
    { name: 'Sucursales', href: '/sucursales' },
  ];

  const handleNavigation = (href) => {
    navigate(href);
    setIsOpen(false);
  };
  
  const handleFavorites = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para ver favoritos');
      navigate('/auth');
      return;
    }
    navigate('/favorites');
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
      navigate('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
    setIsOpen(false);
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 text-white ${
          scrolled || isCarDetailPage ? 'bg-black shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img 
                src="/MAROS_LOGO_SINFONDO.PNG" 
                alt="Autospace Logo" 
                className="h-8 md:h-10 w-auto"
              />
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-white hover:text-primary transition-colors duration-300 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </motion.button>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white glow-effect" onClick={() => navigate('/catalog')}>
                <Search className="h-4 w-4" />
              </Button>
              {/*<Button variant="ghost" size="sm" className="text-white glow-effect" onClick={handleFavorites}>
                <Heart className="h-4 w-4" />
              </Button>*/}
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        {/* <AvatarImage src="" alt="Avatar" /> */}
                        <AvatarFallback className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                          {getUserInitials(user.user_metadata?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-black border-border" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none text-white">
                        {user.user_metadata?.full_name && (
                          <p className="font-medium">{user.user_metadata.full_name}</p>
                        )}
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    {/*<DropdownMenuItem onClick={() => navigate('/favorites')} className="text-white hover:bg-gray-800">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Mis Favoritos</span>
                    </DropdownMenuItem>*/}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="text-white hover:bg-gray-800">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Panel Admin</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 hover:bg-gray-800">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" className="text-white glow-effect" onClick={() => navigate('/auth')}>
                  <User className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" className="glow-effect" onClick={() => setShowContact(true)}>
                Contacto
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-black text-white border-t border-border"
              >
                <div className="py-4 space-y-4">
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className="block w-full text-left px-4 py-2 hover:text-primary hover:bg-muted/50 transition-colors"
                    >
                      {item.name}
                    </button>
                  ))}
                  
                  <div className="px-4">
                    {user ? (
                      <>
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Avatar className="h-8 w-8">
                              {/* <AvatarImage src="" alt="Avatar" /> */}
                              <AvatarFallback className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                                {getUserInitials(user.user_metadata?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.user_metadata?.full_name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={handleFavorites}
                              className="w-full justify-start text-white hover:bg-gray-800"
                            >
                              {/*<Heart className="mr-2 h-4 w-4" />
                              Mis Favoritos*/}
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                onClick={() => handleNavigation('/admin')}
                                className="w-full justify-start text-white hover:bg-gray-800"
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Panel Admin
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              onClick={handleSignOut}
                              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Cerrar Sesión
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        onClick={() => handleNavigation('/auth')}
                        className="w-full"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Iniciar Sesión
                      </Button>
                    )}
                    
                    <div className="flex items-center justify-center space-x-4 pt-4 mt-4 border-t border-border">
                      <Button variant="ghost" size="sm" onClick={() => handleNavigation('/catalog')}>
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleFavorites}>
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => setShowContact(true)}>
                        Contacto
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Modal Contacto (sin cambios) */}
      <AnimatePresence>
        {showContact && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setShowContact(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              className="bg-white text-black rounded-xl shadow-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-center">Contacto</h2>
              <div className="space-y-4">
                {sucursales.map((sucursal) => (
                  <div key={sucursal.nombre} className="p-4 border rounded-lg hover:shadow-md transition">
                    <h3 className="font-semibold">{sucursal.nombre}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="h-4 w-4 text-primary" />
                      <a href={`tel:${sucursal.telefono}`} className="text-blue-600 hover:underline">
                        {sucursal.telefono}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-gray-600">
                      <Clock className="h-4 w-4 text-primary" />
                      <p>{sucursal.horario}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-center mb-2">Síguenos</h3>
                <div className="flex justify-center space-x-6">
                  {socialLinks.map((social) => (
                    <a 
                      key={social.name} 
                      href={social.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-primary transition"
                    >
                      <social.icon className="h-6 w-6" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button onClick={() => setShowContact(false)}>Cerrar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
