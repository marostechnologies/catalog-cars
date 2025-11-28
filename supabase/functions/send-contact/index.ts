import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactRequest {
  car_id?: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  contact_method: 'formulario' | 'whatsapp' | 'telefono';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { car_id, name, email, phone, message, contact_method }: ContactRequest = await req.json();

    // Validate required fields
    if (!name) {
      return new Response(
        JSON.stringify({ error: 'El nombre es requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!email && !phone) {
      return new Response(
        JSON.stringify({ error: 'Se requiere al menos un método de contacto (email o teléfono)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Insert contact into database
    const { data, error } = await supabaseClient
      .from('contacts')
      .insert([
        {
          car_id: car_id || null,
          name,
          email: email || null,
          phone: phone || null,
          message: message || null,
          contact_method
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting contact:', error);
      return new Response(
        JSON.stringify({ error: 'Error al guardar el contacto' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Contact saved successfully:', data[0]);

    // Here you could add email notification logic using Resend or similar
    // For now, we'll just return success

    return new Response(
      JSON.stringify({ 
        message: 'Contacto guardado exitosamente',
        contact: data[0]
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-contact function:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});