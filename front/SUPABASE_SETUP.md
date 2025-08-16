# 🚀 Instrucciones para Configurar Supabase

## � Solución Rápida al Error RLS

Si ya creaste la tabla y tienes el error de RLS, ejecuta esto en el SQL Editor:

```sql
-- Eliminar políticas existentes que puedan estar mal configuradas
DROP POLICY IF EXISTS "Permitir acceso público a tickets" ON tickets;

-- Crear políticas específicas para cada operación
CREATE POLICY "tickets_insert_policy" ON tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "tickets_select_policy" ON tickets
  FOR SELECT USING (true);

CREATE POLICY "tickets_update_policy" ON tickets
  FOR UPDATE USING (true);

CREATE POLICY "tickets_delete_policy" ON tickets
  FOR DELETE USING (true);

-- O si prefieres desactivar RLS completamente:
-- ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
```

## �📋 Pasos para Configuración en Producción

### 1. Crear Cuenta en Supabase

- Ve a [https://supabase.com](https://supabase.com)
- Crea una cuenta gratuita
- Crea un nuevo proyecto

### 2. Obtener Credenciales

En tu proyecto de Supabase:

- Ve a **Settings** → **API**
- Copia:
  - **Project URL** (ej: `https://ksfxhihzjmlrxfpudtsp.supabase.co`)
  - **Anon public** key

### 3. Crear la Tabla de Tickets

En el **SQL Editor** de Supabase, ejecuta este código:

```sql
-- Crear tabla de tickets
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

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_tickets_placa ON tickets(placa);
CREATE INDEX idx_tickets_estado ON tickets(estado);
CREATE INDEX idx_tickets_fecha_entrada ON tickets(fecha_entrada);

-- OPCIÓN A: Sin seguridad (más fácil para desarrollo)
-- No habilites RLS si quieres acceso público completo

-- OPCIÓN B: Con seguridad básica (si ya creaste la tabla con RLS)
-- Ejecuta estos comandos para permitir acceso público:

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Política para permitir insertar tickets
CREATE POLICY "Permitir insertar tickets" ON tickets
  FOR INSERT WITH CHECK (true);

-- Política para permitir leer tickets
CREATE POLICY "Permitir leer tickets" ON tickets
  FOR SELECT USING (true);

-- Política para permitir actualizar tickets
CREATE POLICY "Permitir actualizar tickets" ON tickets
  FOR UPDATE USING (true);

-- Política para permitir eliminar tickets (opcional)
CREATE POLICY "Permitir eliminar tickets" ON tickets
  FOR DELETE USING (true);
```

### 4. Actualizar Configuración en el Código

En el archivo `services/supabase.js`:

1. Cambia `isDevelopment = true` a `isDevelopment = false`
2. Actualiza las credenciales:

```javascript
const supabaseUrl = "TU_PROJECT_URL_AQUI";
const supabaseKey = "TU_ANON_KEY_AQUI";
```

### 5. Desplegar en Render/Vercel/Netlify

#### Para Render:

1. Conecta tu repositorio de GitHub
2. Configura:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Añade variables de entorno (opcional):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

#### Para Vercel:

1. Importa desde GitHub
2. Framework: Vite
3. Configura variables de entorno

## 🔒 Seguridad

**Para uso público** (como tu caso), la configuración actual es suficiente.

**Para uso privado**, deberías implementar:

- Autenticación de usuarios
- Políticas RLS más restrictivas
- Validación de permisos

## 🎯 Estado Actual

✅ **Modo Desarrollo**: Los datos se guardan en localStorage  
✅ **Persistencia Local**: Funciona sin configuración  
🔄 **Modo Producción**: Requiere configurar Supabase

## 🚨 Importante

- El modo desarrollo funciona **perfectamente** para probar
- Los datos se mantienen en el navegador local
- Para desplegar en producción, sigue los pasos arriba
- El plan gratuito de Supabase es suficiente para tu uso

## 💰 Costos

- **Supabase**: Gratuito hasta 500MB y 2GB de transferencia
- **Render/Vercel/Netlify**: Gratuito para proyectos estáticos
- **Total**: $0 COP 🎉
