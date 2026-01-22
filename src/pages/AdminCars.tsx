import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Users, ArrowLeft, Car as CarIcon, Image as ImageIcon, Loader2 } from "lucide-react";

// --- Tipos e interfaces ---
type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  color?: string;
  condition?: string;
  description?: string;
  agency?: string;
  agency_phone?: string;
};

type CarImage = {
  id: string;
  image_url: string;
  is_primary: boolean;
};

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
};

const fuelTypes = ["Gasolina", "Diesel", "Eléctrico", "Híbrido"];
const transmissions = ["Manual", "Automático"];
const conditions = ["nuevo", "seminuevo", "usado"];

const AdminCars = () => {
  const [userRole, setUserRole] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "form" | "users">("list");
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [form, setForm] = useState<any>({});
  const [images, setImages] = useState<CarImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ESTADOS PARA AUTOCOMPLETADO DE MARCAS
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // FUNCIÓN PARA FORMATEAR CON COMAS
  const formatNumber = (value: string) => {
    if (!value) return "";
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingUser(false);
        return;
      }
      const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (error) toast.error("No se pudo obtener rol de usuario");
      else setUserRole(data.role);
      setLoadingUser(false);
    };
    fetchUserRole();
    fetchCars();
    fetchUniqueBrands(); // Cargar marcas al iniciar
  }, []);

  // Obtener marcas únicas de la base de datos
  const fetchUniqueBrands = async () => {
    const { data, error } = await supabase.from("cars").select("brand");
    if (!error && data) {
      const unique = Array.from(new Set(data.map(c => c.brand))).filter(Boolean);
      setAllBrands(unique);
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("cars").select("id, brand, model, year, price, agency, agency_phone").order("created_at", { ascending: false });
    if (error) toast.error("Error cargando autos");
    else setCars(data || []);
    setLoading(false);
  };

  const fetchCarImages = async (carId: string) => {
    const { data, error } = await supabase.from("car_images").select("*").eq("car_id", carId);
    if (error) toast.error("Error cargando imágenes");
    else setImages(data || []);
  };

  const handleEditCar = async (carId: string) => {
    setLoading(true);
    const { data: carData, error } = await supabase.from("cars").select("*").eq("id", carId).single();
    if (error) { toast.error("Error al cargar los detalles del auto"); setLoading(false); return; }
    setEditingCar(carData);
    setForm({
      ...carData,
      price: formatNumber(carData.price.toString()),
      mileage: carData.mileage ? formatNumber(carData.mileage.toString()) : ""
    });
    await fetchCarImages(carId);
    setView("form");
    setLoading(false);
  };

  const handleSave = async () => {
    const payload = {
      brand: form.brand || null,
      model: form.model || null,
      year: form.year ? Number(form.year) : null,
      price: form.price ? Number(form.price.toString().replace(/,/g, '')) : null,
      mileage: form.mileage ? Number(form.mileage.toString().replace(/,/g, '')) : null,
      fuel_type: form.fuel_type || null,
      transmission: form.transmission || null,
      color: form.color || null,
      condition: form.condition || null,
      description: form.description || null,
      agency: form.agency || null,
      agency_phone: form.agency_phone || null,
    };

    if (editingCar) {
      const { error } = await supabase.from("cars").update(payload).eq("id", editingCar.id);
      if (error) toast.error(`Error al actualizar auto: ${error.message}`);
      else { toast.success("Auto actualizado"); fetchCars(); setView("list"); }
    } else {
      const { data: newCar, error } = await supabase.from("cars").insert([payload]).select().single();
      if (error || !newCar) toast.error(`Error al crear auto: ${error?.message}`);
      else { 
        toast.success("Auto creado"); 
        setEditingCar(newCar as Car); 
        setView("form"); 
        setImages([]); 
        fetchUniqueBrands(); // Actualizar lista de marcas sugeridas
      }
    }
  };

  const deleteCar = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este auto?")) return;
    const { error } = await supabase.from("cars").delete().eq("id", id);
    if (error) toast.error("Error eliminando auto");
    else { toast.success("Auto eliminado"); setCars((prev) => prev.filter((c) => c.id !== id)); }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!editingCar) return;
      const files = e.target.files;
      if (!files || files.length === 0) return;
      setUploading(true);
      for (const file of files) {
        const fileName = `${editingCar.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("cars").upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl: url } } = supabase.storage.from("cars").getPublicUrl(fileName);
        const { error: dbError } = await supabase.from("car_images").insert([{ car_id: editingCar.id, image_url: url, is_primary: images.length === 0 }]);
        if (dbError) throw dbError;
      }
      toast.success("Imágenes subidas");
      fetchCarImages(editingCar.id);
    } catch (err: any) {
      toast.error(`Error subiendo imagen: ${err.message}`);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const deleteImage = async (id: string) => {
    const { error } = await supabase.from("car_images").delete().eq("id", id);
    if (error) toast.error("Error eliminando imagen");
    else { toast.success("Imagen eliminada"); if (editingCar) fetchCarImages(editingCar.id); }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data: usersData, error } = await supabase.from("profiles").select("id, full_name, email, phone, role, created_at");
    if (error) toast.error("Error al cargar usuarios.");
    else setUsers(usersData || []);
    setLoadingUsers(false);
  };

  const handleBrandChange = (value: string) => {
    setForm({ ...form, brand: value });
    if (value.length > 1) {
      const filtered = allBrands.filter(b => 
        b.toLowerCase().startsWith(value.toLowerCase())
      );
      setBrandSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectBrand = (brand: string) => {
    setForm({ ...form, brand: brand });
    setShowSuggestions(false);
  };

  const filteredCars = cars.filter(
    (car) =>
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase()) ||
      car.agency?.toLowerCase().includes(search.toLowerCase())
  );

  if (loadingUser) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  );
  
  if (userRole !== "admin")
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <div className="bg-zinc-900 border border-red-900/50 p-8 rounded-2xl max-w-md">
          <h1 className="text-2xl font-black text-red-500 uppercase tracking-tighter mb-2">Acceso Restringido</h1>
          <p className="text-zinc-400 font-medium">No tienes permisos para acceder a este panel administrativo.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase">
              {view === "list" && "Gestión de Stock"}
              {view === "users" && "Directorio de Usuarios"}
              {view === "form" && (editingCar ? "Editar Vehículo" : "Nuevo Ingreso")}
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">Panel Administrativo JPCars</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (view === "users") setView("list");
                else window.location.href = "/";
              }}
              className="bg-transparent border-white/10 hover:bg-white/5 text-zinc-300 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {view === "users" ? "Volver a Autos" : "Salir al Inicio"}
            </Button>

            {view === "list" && (
              <>
                <Button
                  onClick={() => { setForm({}); setEditingCar(null); setImages([]); setView("form"); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  <Plus className="mr-2 h-4 w-4" /> Nuevo Auto
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { setView("users"); fetchUsers(); }}
                  className="bg-white text-black hover:bg-zinc-200 rounded-xl font-bold"
                >
                  <Users className="mr-2 h-4 w-4" /> Usuarios
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Vista: Lista de Autos */}
        {view === "list" && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                placeholder="Buscar por marca, modelo o agencia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-12 bg-zinc-900 border-white/10 rounded-2xl text-lg focus:ring-blue-600 transition-all"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">Sincronizando inventario...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <Card key={car.id} className="bg-zinc-900 border-white/5 rounded-3xl overflow-hidden hover:border-blue-600/50 transition-all group">
                    <CardHeader className="p-6 pb-0">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">{car.year}</p>
                          <CardTitle className="text-xl font-black italic uppercase tracking-tighter text-white">
                            {car.brand} {car.model}
                          </CardTitle>
                        </div>
                        <CarIcon className="text-zinc-800 h-8 w-8 group-hover:text-blue-600/20 transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Precio</span>
                          <span className="font-black text-white">${car.price.toLocaleString()}</span>
                        </div>
                        {car.agency && (
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Agencia</span>
                            <span className="font-bold text-blue-400 text-sm italic">{car.agency}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-6">
                        <Button
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-all"
                          onClick={() => handleEditCar(car.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          className="bg-red-950/30 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-900/30 transition-all"
                          onClick={() => deleteCar(car.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista: Formulario (Edición/Creación) */}
        {view === "form" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                
                {/* CAMPO MARCA CON AUTOCOMPLETADO */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Marca</label>
                  <Input 
                    value={form.brand || ""} 
                    onChange={(e) => handleBrandChange(e.target.value)} 
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay para permitir click en sugerencia
                    className="bg-zinc-950 border-white/10 h-12 rounded-xl" 
                    placeholder="Ej: Mercedes Benz" 
                  />
                  {showSuggestions && brandSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                      {brandSuggestions.map((b) => (
                        <div 
                          key={b} 
                          onClick={() => selectBrand(b)}
                          className="px-4 py-2 hover:bg-blue-600 cursor-pointer text-sm font-bold uppercase transition-colors"
                        >
                          {b}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Modelo</label>
                  <Input value={form.model || ""} onChange={(e) => setForm({ ...form, model: e.target.value })} className="bg-zinc-950 border-white/10 h-12 rounded-xl" placeholder="Ej: M4" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Año</label>
                  <Input type="number" value={form.year || ""} onChange={(e) => setForm({ ...form, year: e.target.value })} className="bg-zinc-950 border-white/10 h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Precio</label>
                  <Input 
                    type="text" 
                    value={form.price || ""} 
                    onChange={(e) => setForm({ ...form, price: formatNumber(e.target.value) })} 
                    className="bg-zinc-950 border-white/10 h-12 rounded-xl" 
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Kilometraje</label>
                  <Input 
                    type="text" 
                    value={form.mileage || ""} 
                    onChange={(e) => setForm({ ...form, mileage: formatNumber(e.target.value) })} 
                    className="bg-zinc-950 border-white/10 h-12 rounded-xl" 
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Color</label>
                  <Input value={form.color || ""} onChange={(e) => setForm({ ...form, color: e.target.value })} className="bg-zinc-950 border-white/10 h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Agencia</label>
                  <Input value={form.agency || ""} onChange={(e) => setForm({ ...form, agency: e.target.value })} className="bg-zinc-950 border-white/10 h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Teléfono Agencia</label>
                  <Input value={form.agency_phone || ""} onChange={(e) => setForm({ ...form, agency_phone: e.target.value })} className="bg-zinc-950 border-white/10 h-12 rounded-xl" placeholder="+52 ..." />
                  <p className="text-[9px] text-blue-500 font-bold ml-1">Empieza por la lada de tu país como México que es +52</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <Select value={form.fuel_type || ""} onValueChange={(v) => setForm({ ...form, fuel_type: v })}>
                  <SelectTrigger className="bg-zinc-950 border-white/10 h-12 rounded-xl"><SelectValue placeholder="Combustible" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">{fuelTypes.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.transmission || ""} onValueChange={(v) => setForm({ ...form, transmission: v })}>
                  <SelectTrigger className="bg-zinc-950 border-white/10 h-12 rounded-xl"><SelectValue placeholder="Transmisión" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">{transmissions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.condition || ""} onValueChange={(v) => setForm({ ...form, condition: v })}>
                  <SelectTrigger className="bg-zinc-950 border-white/10 h-12 rounded-xl capitalize"><SelectValue placeholder="Condición" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">{conditions.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Descripción</label>
                <Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-zinc-950 border-white/10 h-12 rounded-xl" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black uppercase tracking-widest text-xs">
                  {editingCar ? "Actualizar Vehículo" : "Crear y Subir Imágenes"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { setView("list"); setEditingCar(null); setImages([]); }}
                  className="bg-white/5 hover:bg-white/10 text-white h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </Button>
              </div>

              {editingCar && (
                <div className="mt-12 pt-10 border-t border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Galería de Imágenes</h3>
                    <label className="bg-white text-black px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-zinc-200 transition-colors">
                      + Añadir Fotos
                      <input type="file" multiple onChange={handleUploadImage} disabled={uploading} className="hidden" />
                    </label>
                  </div>
                  
                  {uploading && <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase animate-pulse"><Loader2 className="h-4 w-4 animate-spin" /> Subiendo archivos...</div>}
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                        <img src={img.image_url} alt="car" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteImage(img.id)}
                        >
                          X
                        </Button>
                        {img.is_primary && <div className="absolute bottom-2 left-2 bg-blue-600 text-[8px] font-black uppercase px-2 py-1 rounded">Principal</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista: Usuarios (Sin cambios) */}
        {view === "users" && (
          <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in">
            {loadingUsers ? (
              <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="py-5 font-black uppercase tracking-widest text-zinc-400 text-[10px]">Nombre Completo</TableHead>
                      <TableHead className="py-5 font-black uppercase tracking-widest text-zinc-400 text-[10px]">Correo</TableHead>
                      <TableHead className="py-5 font-black uppercase tracking-widest text-zinc-400 text-[10px]">Teléfono</TableHead>
                      <TableHead className="py-5 font-black uppercase tracking-widest text-zinc-400 text-[10px]">Rol</TableHead>
                      <TableHead className="py-5 font-black uppercase tracking-widest text-zinc-400 text-[10px]">Registro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                        <TableCell className="py-5 font-bold text-white">{user.full_name || "---"}</TableCell>
                        <TableCell className="py-5 text-zinc-400">{user.email}</TableCell>
                        <TableCell className="py-5 text-zinc-400">{user.phone || "---"}</TableCell>
                        <TableCell className="py-5">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-blue-600/20 text-blue-500 border border-blue-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="py-5 text-zinc-500 text-xs">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "---"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCars;