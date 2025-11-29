import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  // --- Lógica de Supabase (sin cambios en funcionalidad) ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) navigate(redirect);
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirect]);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}${redirect}`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName, phone }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este correo ya está registrado. Intenta iniciar sesión.');
        } else {
          toast.error(`Error al registrarse: ${error.message}`);
        }
        return;
      }

      toast.success('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
    } catch (error: any) {
      toast.error(`Error inesperado: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else {
          toast.error(`Error al iniciar sesión: ${error.message}`);
        }
        return;
      }
      toast.success('¡Bienvenido a JPCars!');
      navigate(redirect);
    } catch (error: any) {
      toast.error(`Error inesperado: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Componentes de Formulario (ajustes de clases) ---
  const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
        toast.error('Por favor completa todos los campos');
        return;
      }
      signIn(email, password);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          {/* Eliminamos la clase text-gray-100 para un diseño más limpio */}
          <Label htmlFor="email" className="text-sm font-medium text-gray-200">Correo Electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // Clases minimalistas: fondo gris oscuro plano, bordes sutiles, foco azul
              className="pl-10 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-800 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-200">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // Clases minimalistas: fondo gris oscuro plano, bordes sutiles, foco azul
              className="pl-10 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-800 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          // Botón con color primario, sombra y animación de hover sutil
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>
    );
  };

  const SignUpForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password || !fullName || !phone) {
        toast.error('Por favor completa todos los campos');
        return;
      }
      if (password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      signUp(email, password, fullName, phone);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-200">Nombre Completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="Juan Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-800 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-200">Teléfono</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+52 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-800 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-sm font-medium text-gray-200">Correo Electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="signup-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-800 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-sm font-medium text-gray-200">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-800 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-gray-400">Mínimo 6 caracteres</p>
        </div>

        <Button
          type="submit"
          // Botón con color primario, sombra y animación de hover sutil
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear Cuenta'
          )}
        </Button>
      </form>
    );
  };
  // --- Fin Componentes de Formulario ---
  
  if (user) {
    navigate(redirect);
    return null;
  }

  return (
    // Contenedor principal: Fondo negro/gris oscuro plano y sutil
    // Eliminamos el <style jsx global> y la clase animate-gradient para mejor rendimiento y minimalismo.
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card 
        // Tarjeta: Fondo gris oscuro sólido (no transparente), bordes más sutiles y redondeados
        // Se reduce el redondeo a 'xl' para un aspecto más limpio y moderno.
        className="w-full max-w-sm sm:max-w-md bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
      >
        <CardHeader className="text-center p-6 sm:p-8 bg-gray-800 text-white border-b border-gray-700">
          <div className="flex items-center justify-center mb-2">
            {/* Si el logo es oscuro, un ligero cambio de estilo puede ayudar */}
            <img 
              src="/JPCars_logo.png" 
              alt="JPCars Logo" 
              className="h-12 sm:h-14 w-auto drop-shadow-md filter brightness-125" // Ligero filtro para mejorar visibilidad en fondo oscuro
            />
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Bienvenido</CardTitle>
          <CardDescription className="text-gray-400 mt-2">
            Accede o crea una cuenta para continuar.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <Tabs defaultValue="login" className="w-full">
            {/* Lista de pestañas: Diseño más limpio con fondo gris claro y texto resaltado */}
            <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-700 rounded-lg p-0.5 mb-6 shadow-md">
              <TabsTrigger
                value="login"
                // Estado activo: Color azul primario, con esquinas redondeadas
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-semibold data-[state=active]:rounded-[6px] data-[state=active]:transition-all data-[state=active]:duration-300 text-gray-300 hover:text-white rounded-[6px]"
              >Iniciar Sesión</TabsTrigger>
              <TabsTrigger
                value="signup"
                // Estado activo: Color azul primario, con esquinas redondeadas
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-semibold data-[state=active]:rounded-[6px] data-[state=active]:transition-all data-[state=active]:duration-300 text-gray-300 hover:text-white rounded-[6px]"
              >Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <LoginForm />
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 text-center p-6 sm:p-8 bg-gray-800 rounded-b-xl border-t border-gray-700">
          <Link to="/" className="text-sm text-gray-400 hover:text-blue-500 transition-colors duration-300 font-medium">
            ← Volver al inicio
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;