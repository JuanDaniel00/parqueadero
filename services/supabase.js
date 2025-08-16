import { createClient } from "@supabase/supabase-js";

// Estas son las credenciales públicas de Supabase (proyecto demo)
// Para producción, deberías crear tu propio proyecto en https://supabase.com
const supabaseUrl = "https://ksfxhihzjmlrxfpudtsp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZnhoaWh6am1scnhmcHVkdHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjU2MDAsImV4cCI6MjA3MDk0MTYwMH0.ag6swdZqWclt4KUC3LblX61YHfBFTBYYG3YJ7T07Csg";

// Configuración temporal para desarrollo local
// Usaremos localStorage como fallback hasta que configures tu proyecto Supabase
const isDevelopment = false;

let supabase = null;

if (!isDevelopment) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Simulador de Supabase para desarrollo local
const localSupabase = {
  from: (table) => ({
    select: async (columns = "*") => {
      const data = JSON.parse(
        localStorage.getItem(`supabase_${table}`) || "[]"
      );
      return { data, error: null };
    },

    insert: async (record) => {
      const currentData = JSON.parse(
        localStorage.getItem(`supabase_${table}`) || "[]"
      );
      const newRecord = {
        ...record,
        id: Date.now(), // ID simple para desarrollo
        created_at: new Date().toISOString(),
      };
      currentData.push(newRecord);
      localStorage.setItem(`supabase_${table}`, JSON.stringify(currentData));
      return { data: [newRecord], error: null };
    },

    update: async (updates) => ({
      eq: async (column, value) => {
        const currentData = JSON.parse(
          localStorage.getItem(`supabase_${table}`) || "[]"
        );
        const index = currentData.findIndex((item) => item[column] === value);
        if (index !== -1) {
          currentData[index] = { ...currentData[index], ...updates };
          localStorage.setItem(
            `supabase_${table}`,
            JSON.stringify(currentData)
          );
          return { data: [currentData[index]], error: null };
        }
        return { data: null, error: "Record not found" };
      },
    }),

    delete: () => ({
      eq: async (column, value) => {
        const currentData = JSON.parse(
          localStorage.getItem(`supabase_${table}`) || "[]"
        );
        const filteredData = currentData.filter(
          (item) => item[column] !== value
        );
        localStorage.setItem(`supabase_${table}`, JSON.stringify(filteredData));
        return { data: null, error: null };
      },
    }),
  }),
};

export const supabaseClient = isDevelopment ? localSupabase : supabase;

// Instrucciones para configurar Supabase real
export const setupInstructions = `
🔧 CONFIGURACIÓN DE SUPABASE PARA PRODUCCIÓN:

1. Ve a https://supabase.com y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Ve a Settings > API para obtener:
   - Project URL
   - Anon key
4. Ejecuta este SQL en el SQL Editor de Supabase:

CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  placa VARCHAR(10) NOT NULL,
  fecha_entrada DATE NOT NULL,
  hora_entrada TIME NOT NULL,
  numero_estacionamiento VARCHAR(10),
  hotel VARCHAR(100),
  es_noche BOOLEAN DEFAULT FALSE,
  estado VARCHAR(20) DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_pago TIMESTAMP
);

-- Índice para búsquedas rápidas por placa
CREATE INDEX idx_tickets_placa ON tickets(placa);
CREATE INDEX idx_tickets_estado ON tickets(estado);

5. Actualiza las credenciales en este archivo
6. Cambia isDevelopment a false
`;
