import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const Hero = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    brand: '',
    model: '',
    year: '',
    maxPrice: '',
    sucursal: ''
  });

  const [brands, setBrands] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [sucursales, setSucursales] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('brand, year, sucursal')
        .neq('brand', null);

      if (error) {
        console.error('Error fetching data:', error);
        return;
      }

      setBrands(Array.from(new Set(data.map((item: any) => item.brand))));
      setYears(Array.from(new Set(data.map((item: any) => item.year))).sort((a, b) => b - a));
      setSucursales(
        Array.from(
          new Set(
            data
              .map((item: any) => (item.sucursal ? item.sucursal.trim() : null))
              .filter(Boolean)
          )
        ).sort()
      );
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.brand) params.set('brand', searchData.brand);
    if (searchData.model) params.set('model', searchData.model);
    if (searchData.year) params.set('year', searchData.year);
    if (searchData.maxPrice) params.set('maxPrice', searchData.maxPrice);
    if (searchData.sucursal) params.set('sucursal', searchData.sucursal);

    navigate(`/catalog?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Video de fondo estilo Apple: opaco y elegante */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover brightness-75 contrast-110"
        >
          <source src="/autospace_video_hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Contenido central */}
      <div className="container relative z-10 px-4 text-center flex flex-col items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight max-w-3xl drop-shadow-md"
        >
          Encuentra tu auto perfecto
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-sm"
        >
          Descubre la mejor selección de vehículos nuevos y usados
        </motion.p>

        {/* Sección de búsqueda estilo Apple: minimalista y elegante */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-5xl w-full shadow-md"
        >
          <h3 className="text-lg md:text-xl text-white mb-4 font-medium">Busca tu auto ideal</h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <Select
              value={searchData.brand}
              onValueChange={(value) => setSearchData((prev) => ({ ...prev, brand: value }))}
            >
              <SelectTrigger className="bg-white/20 text-white placeholder-white/70 border-none hover:bg-white/25 transition">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Modelo"
              className="bg-white/20 text-white placeholder-white/70 border-none focus:ring-1 focus:ring-white transition"
              value={searchData.model}
              onChange={(e) => setSearchData((prev) => ({ ...prev, model: e.target.value }))}
            />

            <Select
              value={searchData.year}
              onValueChange={(value) => setSearchData((prev) => ({ ...prev, year: value }))}
            >
              <SelectTrigger className="bg-white/20 text-white placeholder-white/70 border-none hover:bg-white/25 transition">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchData.sucursal}
              onValueChange={(value) => setSearchData((prev) => ({ ...prev, sucursal: value }))}
            >
              <SelectTrigger className="bg-white/20 text-white placeholder-white/70 border-none hover:bg-white/25 transition">
                <SelectValue placeholder="Sucursal" />
              </SelectTrigger>
              <SelectContent>
                {sucursales.map((sucursal) => (
                  <SelectItem key={sucursal} value={sucursal}>
                    {sucursal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Precio máx."
              type="number"
              className="bg-white/20 text-white placeholder-white/70 border-none focus:ring-1 focus:ring-white transition"
              value={searchData.maxPrice}
              onChange={(e) => setSearchData((prev) => ({ ...prev, maxPrice: e.target.value }))}
            />
          </div>

          <Button
            size="lg"
            className="w-full md:w-auto bg-white text-black font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
            onClick={handleSearch}
          >
            <Search className="h-5 w-5 text-black" />
            Buscar Autos
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
