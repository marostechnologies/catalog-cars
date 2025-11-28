import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dhnjmqmjbmashqxaozpg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobmptcW1qYm1hc2hxeGFvenBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjQ2NzYsImV4cCI6MjA3MjgwMDY3Nn0.cSZOf05_f36PETyFuPO-NQk09quyQ2a5SQ6gUNE4cos';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  color?: string;
  condition?: 'nuevo' | 'seminuevo' | 'usado';
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  sucursal: string;
}

export interface CarImage {
  id: string;
  car_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  car_id?: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  contact_method?: 'formulario' | 'whatsapp' | 'telefono';
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  role?: 'cliente' | 'admin';
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  car_id: string;
  created_at: string;
}