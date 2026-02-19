# RentaCar GT - Sistema de Renta de Vehículos

Sistema completo de gestión de renta de vehículos diseñado para el mercado guatemalteco. Plataforma web moderna con interfaz pública para clientes y panel administrativo protegido.

## Características Principales

### Para Clientes
- **Búsqueda de vehículos disponibles** por fecha y hora
- **Catálogo completo de flota** con categorías (Económico, SUV, Lujo, Van)
- **Sistema de reservas en línea** con cálculo automático de tarifas
- **Confirmación inmediata** con número de referencia
- **Precios transparentes** con desglose de IVA (12%)

### Panel Administrativo
- **Dashboard con estadísticas** en tiempo real
- **Gestión de vehículos** (crear, editar, eliminar)
- **Gestión de reservas** con control de estados
- **Calendario de disponibilidad**
- **Carga de imágenes** a Supabase Storage
- **Autenticación segura** con bcrypt + sesiones encriptadas

## Tecnologías

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM v5
- **Base de datos**: PostgreSQL (Supabase)
- **Almacenamiento**: Supabase Storage
- **Autenticación**: bcrypt + iron-session
- **Testing**: Playwright

## Localización

- Idioma: **Español (Guatemala)**
- Moneda: **GTQ (Quetzal)** con precisión de centavos
- IVA: **12%**
- Formato de fecha: **DD/MM/YYYY**
- Formato de teléfono: **+502 XXXX-XXXX**
- DPI: **13 dígitos**

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/sisuramirez/MVP-car-rental.git
cd MVP-car-rental

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Generar hash de contraseña para admin
npx ts-node scripts/generate-password-hash.ts "tu-contraseña"

# Ejecutar migraciones
npx prisma db push

# Poblar base de datos con datos de ejemplo
npx prisma db seed

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

Consulta `.env.example` para ver todas las variables requeridas:
- `DATABASE_URL`: Conexión a PostgreSQL (usar Session Pooler de Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: API key pública
- `ADMIN_USERNAME`: Usuario administrador
- `ADMIN_PASSWORD_HASH`: Hash bcrypt de la contraseña (escapar `$` con `\$`)
- `SESSION_SECRET`: Secreto para encriptar sesiones

## Acceso Administrativo

- **URL**: `/admin`
- **Usuario por defecto**: `admin`
- **Contraseña por defecto**: `admin123` (cambiar en producción)

## Estructura de Base de Datos

- **Vehicle**: Información de vehículos (marca, modelo, categoría, precios, imágenes)
- **Customer**: Datos de clientes (nombre, DPI, teléfono, email)
- **Booking**: Reservas (fechas, estado, total, IVA)

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter
npx prisma studio    # Explorador de base de datos
npm test             # Tests E2E con Playwright
```

## Notas Técnicas

- Prisma v5 (no v7) para compatibilidad con conexiones directas a PostgreSQL
- Session Pooler de Supabase requerido para redes IPv4
- `prisma.$transaction()` usado para optimizar queries en pooler
- Responsive design con breakpoint en 1024px (lg)

## Licencia

MIT

---


