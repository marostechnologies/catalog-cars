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
  sucursal?: string;
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
const sucursales = ["Sucursal Cancún", "Sucursal Tlalnepantla", "Sucursal del Valle"];

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

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("No hay usuario logueado");
        setLoadingUser(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) toast.error("No se pudo obtener rol de usuario");
      else setUserRole(data.role);

      setLoadingUser(false);
    };

    fetchUserRole();
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cars")
      .select("id, brand, model, year, price, sucursal")
      .order("created_at", { ascending: false });

    if (error) toast.error("Error cargando autos");
    else setCars(data || []);
    setLoading(false);
  };

  const fetchCarImages = async (carId: string) => {
    const { data, error } = await supabase
      .from("car_images")
      .select("*")
      .eq("car_id", carId);

    if (error) toast.error("Error cargando imágenes");
    else setImages(data || []);
  };

  const handleEditCar = async (carId: string) => {
    setLoading(true);
    const { data: carData, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", carId)
      .single();

    if (error) {
      toast.error("Error al cargar los detalles del auto");
      setLoading(false);
      return;
    }

    setEditingCar(carData);
    setForm(carData);
    await fetchCarImages(carId);
    setView("form");
    setLoading(false);
  };

  const handleSave = async () => {
    const payload = {
      brand: form.brand || null,
      model: form.model || null,
      year: form.year ? Number(form.year) : null,
      price: form.price ? Number(form.price) : null,
      mileage: form.mileage ? Number(form.mileage) : null,
      fuel_type: form.fuel_type || null,
      transmission: form.transmission || null,
      color: form.color || null,
      condition: form.condition || null,
      description: form.description || null,
      sucursal: form.sucursal || null,
    };

    if (editingCar) {
      const { error } = await supabase
        .from("cars")
        .update(payload)
        .eq("id", editingCar.id);

      if (error) toast.error(`Error al actualizar auto: ${error.message}`);
      else {
        toast.success("Auto actualizado");
        fetchCars();
        setView("list");
      }
    } else {
      const { data: newCar, error } = await supabase
        .from("cars")
        .insert([payload])
        .select()
        .single();

      if (error || !newCar) {
        toast.error(`Error al crear auto: ${error?.message}`);
      } else {
        toast.success("Auto creado");
        setEditingCar(newCar);
        setView("form");
        setImages([]);
      }
    }
  };

  const deleteCar = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este auto?")) return;
    const { error } = await supabase.from("cars").delete().eq("id", id);
    if (error) toast.error("Error eliminando auto");
    else {
      toast.success("Auto eliminado");
      setCars((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!editingCar) return;
      const files = e.target.files;
      if (!files || files.length === 0) return;

      if (images.length + files.length > 15) {
        toast.error("Máximo 15 imágenes por auto");
        return;
      }

      setUploading(true);

      for (const file of files) {
        const fileName = `${editingCar.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("cars")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl: url } } = supabase.storage.from("cars").getPublicUrl(fileName);

        const { error: dbError } = await supabase.from("car_images").insert([
          {
            car_id: editingCar.id,
            image_url: url,
            is_primary: images.length === 0,
          },
        ]);

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
    else {
      toast.success("Imagen eliminada");
      if (editingCar) fetchCarImages(editingCar.id);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);

    // Consulta directa y simple a la tabla de perfiles, ahora que tiene los campos
    const { data: usersData, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, role, created_at");

    if (error) {
      toast.error("Error al cargar usuarios.");
      console.error("Error al cargar usuarios:", error);
    } else {
      setUsers(usersData || []);
    }
    
    setLoadingUsers(false);
  };

  const filteredCars = cars.filter(
    (car) =>
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase()) ||
      car.sucursal?.toLowerCase().includes(search.toLowerCase())
  );

  if (loadingUser) return <p className="p-6">Cargando usuario...</p>;
  if (userRole !== "admin")
    return (
      <p className="p-6 text-red-600 font-bold">
        No tienes permisos para acceder a este panel.
      </p>
    );

  return (
    <div className="px-2 sm:px-4 md:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {view === "list" && (
          <h1 className="text-2xl sm:text-3xl font-bold">Panel de Autos</h1>
        )}
        {view === "users" && (
          <h1 className="text-2xl sm:text-3xl font-bold">Listado de Usuarios</h1>
        )}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button
            variant="secondary"
            onClick={() => {
              if (view === "users") {
                setView("list");
              } else {
                window.location.href = "/";
              }
            }}
            className="w-full sm:w-auto"
          >
            {view === "users" ? "Volver a Autos" : "Volver al Inicio"}
          </Button>

          {view === "list" && (
            <>
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  setForm({});
                  setEditingCar(null);
                  setImages([]);
                  setView("form");
                }}
              >
                + Nuevo Auto
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  setView("users");
                  fetchUsers();
                }}
              >
                Ver usuarios
              </Button>
            </>
          )}

          {view === "users" && (
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setView("list");
              }}
            >
              Ver Autos
            </Button>
          )}
        </div>
      </div>

      {view === "list" && (
        <>
          <Input
            placeholder="Buscar por marca, modelo o sucursal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCars.map((car) => (
                <Card key={car.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      {car.brand} {car.model} ({car.year})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base">
                      <strong>Precio:</strong> ${car.price}
                    </p>
                    <p className="text-sm sm:text-base">
                      <strong>Sucursal:</strong> {car.sucursal || "N/A"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleEditCar(car.id)}
                        className="w-full sm:w-auto"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCar(car.id)}
                        className="w-full sm:w-auto"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {view === "form" && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">
            {editingCar ? "Editar Auto" : "Nuevo Auto"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="brand"
              placeholder="Marca"
              value={form.brand || ""}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full"
            />
            <Input
              name="model"
              placeholder="Modelo"
              value={form.model || ""}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Año"
              value={form.year || ""}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Precio"
              value={form.price || ""}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Kilometraje"
              value={form.mileage || ""}
              onChange={(e) => setForm({ ...form, mileage: e.target.value })}
              className="w-full"
            />
            <Input
              placeholder="Color"
              value={form.color || ""}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full"
            />
          </div>
          <Select
            value={form.sucursal || ""}
            onValueChange={(v) => setForm({ ...form, sucursal: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar Sucursal" />
            </SelectTrigger>
            <SelectContent>
              {sucursales.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.fuel_type || ""}
            onValueChange={(v) => setForm({ ...form, fuel_type: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Combustible" />
            </SelectTrigger>
            <SelectContent>
              {fuelTypes.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.transmission || ""}
            onValueChange={(v) => setForm({ ...form, transmission: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Transmisión" />
            </SelectTrigger>
            <SelectContent>
              {transmissions.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.condition || ""}
            onValueChange={(v) => setForm({ ...form, condition: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Condición" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Descripción"
            value={form.description || ""}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleSave} className="w-full sm:w-auto">
              {editingCar ? "Actualizar" : "Crear y Subir Imágenes"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setView("list");
                setEditingCar(null);
                setImages([]);
              }}
              className="w-full sm:w-auto"
            >
              Volver
            </Button>
          </div>
          {editingCar && (
            <div className="mt-6">
              <h3 className="text-lg sm:text-xl font-bold">Imágenes</h3>
              <input
                type="file"
                multiple
                onChange={handleUploadImage}
                disabled={uploading}
                className="w-full"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {images.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.image_url}
                      alt="car"
                      className="w-full h-28 sm:h-32 object-cover rounded"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1"
                      onClick={() => deleteImage(img.id)}
                    >
                      X
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view === "users" && (
        <div className="space-y-4">
          {loadingUsers ? (
            <p>Cargando usuarios...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Correo Electrónico</TableHead>
                    <TableHead>Número Teléfonico</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.full_name || "N/A"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "N/A"}
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
  );
};

export default AdminCars;