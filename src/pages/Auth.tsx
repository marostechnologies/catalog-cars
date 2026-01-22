import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion'; // Añadido para el efecto de entrada
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
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
          toast.error('Este correo ya está registrado.');
        } else {
          toast.error(`Error: ${error.message}`);
        }
        return;
      }
      toast.success('¡Registro exitoso! Confirma tu correo.');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error('Credenciales incorrectas.');
        return;
      }
      toast.success('¡Bienvenido de nuevo!');
      navigate(redirect);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Estilos compartidos para Inputs "Mamalones" ---
  const inputClass = "pl-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-12";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1";

  const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) { toast.error('Completa los campos'); return; }
      signIn(email, password);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>Email de acceso</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
            <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} disabled={isLoading} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className={labelClass}>Contraseña</Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} disabled={isLoading} />
          </div>
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[11px] h-14 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar al Garaje'}
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
      if (!email || !password || !fullName || !phone) { toast.error('Completa todo'); return; }
      signUp(email, password, fullName, phone);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className={labelClass}>Nombre</Label>
          <div className="relative group">
            <User className="absolute left-4 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 top-4" />
            <Input placeholder="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className={labelClass}>NÚMERO TELEFONICO</Label>
          <div className="relative group">
            <Phone className="absolute left-4 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 top-4" />
            <Input placeholder="Tu número" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className={labelClass}>Email</Label>
          <div className="relative group">
            <Mail className="absolute left-4 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 top-4" />
            <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className={labelClass}>Contraseña</Label>
          <div className="relative group">
            <Lock className="absolute left-4 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 top-4" />
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </div>
        </div>
        <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-[11px] h-14 rounded-2xl mt-2 transition-all" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Crear Perfil'}
        </Button>
      </form>
    );
  };

  if (user) { navigate(redirect); return null; }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
        <Card className="bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-white/5 overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="flex justify-center mb-6">
              <img src="/JPCars_logo.png" alt="JPCars" className="h-14 w-auto brightness-150 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
            <CardTitle className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
              Bienvenido.
            </CardTitle>
            <CardDescription className="text-zinc-500 font-bold tracking-[0.2em] text-[10px] uppercase mt-2">
              Selección de stock exclusiva
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 bg-white/5 rounded-2xl p-1 mb-8 border border-white/5">
                <TabsTrigger value="login" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                  Acceso
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                  Registro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                <SignUpForm />
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 text-center p-10 mt-2 bg-white/[0.02]">
            <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-500 flex items-center justify-center transition-colors">
              <ArrowLeft className="mr-2 h-3 w-3" /> Volver al Inicio
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;