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
      toast.success('¡Bienvenido a MAROS Technology!');
      navigate(redirect);
    } catch (error: any) {
      toast.error(`Error inesperado: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
          <Label htmlFor="email" className="text-gray-100">Correo Electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-xl border border-gray-600 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-100">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 rounded-xl border border-gray-600 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] active:shadow-md"
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
          <Label htmlFor="fullName" className="text-gray-100">Nombre Completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="Juan Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 rounded-xl border border-gray-600 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-100">Teléfono</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+52 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10 rounded-xl border border-gray-600 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-gray-100">Correo Electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="signup-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-xl border border-gray-600 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-gray-100">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 rounded-xl border border-gray-600 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-gray-300">Mínimo 6 caracteres</p>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] active:shadow-md"
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

  if (user) {
    navigate(redirect);
    return null;
  }

  return (
    <>
      <style jsx global>{`
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradient-animation 15s ease infinite;
        }
      `}</style>
      <div className="min-h-screen flex items-center justify-center p-4 animate-gradient">
        <Card className="w-full max-w-md bg-black/70 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-700 overflow-hidden animate-fade-in-up">
          <CardHeader className="text-center p-8 bg-transparent text-white border-b border-gray-700">
            <div className="flex items-center justify-center mb-2">
              <img src="/MAROS_LOGO_SINFONDO.PNG" alt="Autospace Logo" className="h-16 w-auto drop-shadow-md" />
            </div>
            <CardTitle className="text-4xl font-extrabold tracking-tight text-white">Bienvenido</CardTitle>
            <CardDescription className="text-gray-300 mt-2">
              Accede o crea una cuenta para continuar.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-11 bg-gray-800 rounded-full p-1 mb-6 shadow-inner">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:rounded-full data-[state=active]:transition-all data-[state=active]:duration-300 text-gray-300 hover:text-white"
                >Iniciar Sesión</TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:rounded-full data-[state=active]:transition-all data-[state=active]:duration-300 text-gray-300 hover:text-white"
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

          <CardFooter className="flex flex-col space-y-3 text-center p-8 bg-transparent rounded-b-3xl border-t border-gray-700">
            <Link to="/" className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300 font-medium">
              ← Volver al inicio
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Auth;