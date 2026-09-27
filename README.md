# RModulares — Arquitectura Modular & E-Commerce Interactivo 3D/AR

![Next.js](https://img.shields.io/badge/Next.js_14-App_Router-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-React_Three_Fiber-000000?style=for-the-badge&logo=three.js)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Editorial_UI-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-Driver_Adapters-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-Docker_&_Neon-336791?style=for-the-badge&logo=postgresql&logoColor=white)

**RModulares** es una plataforma web full-stack de comercio electrónico y diseño de interiores que fusiona una **experiencia visual estilo revista editorial** con un **configurador de mobiliario en 3D y Realidad Aumentada (WebXR / Quick Look)** en tiempo real, adaptada a la logística y normativa de facturación electrónica del **Ecuador (USD / SRI)**.

---

## ✨ Características Principales

### 1. Experiencia Editorial & UI/UX
* **Sistema de Diseño "Arquitectura Cálida":** Combinación tipográfica *Cormorant Garamond* (Serif editorial), *Plus Jakarta Sans* (UI/Lectura) y *JetBrains Mono* (Cotas técnicas, SKUs y precios).
* **Modo Claro y Modo Oscuro:** Paletas orgánicas personalizadas (*Editorial Lino* `#F7F5F0` y *Galería Nocturna* `#121211`).
* **Microinteracciones en Catálogo:** Efecto *crossfade* de fotografías en hover y previsualización rápida de acabados (*swatches*) con cálculo de recargo en vivo.

### 2. Configurador 3D en Tiempo Real & Realidad Aumentada (AR)
* **Inyección Dinámica sobre un Único `.GLB`:** Modificación en tiempo real de materiales PBR (*Albedo*, *Normal Map*, *Roughness*, *Metalness*) por zonas de malla (`mesh_tapiz`, `mesh_estructura`, etc.) y escalado geométrico por módulos sin recargar el modelo 3D.
* **Geometría Paramétrica de Respaldo:** Incluye un generador procedural en *React Three Fiber* para pruebas locales inmediatas cuando aún no se ha cargado un archivo `.glb` externo.
* **Lanzador AR Nativo:** Integración con **Google Scene Viewer** (Android WebXR) y **Apple Quick Look** (iOS USDZ) para proyectar el mueble a escala `1:1` en el espacio del cliente.

### 3. Motor de Inventario Híbrido (`STOCK_SKU` + `MADE_TO_ORDER`)
* **Evaluación Instantánea de Combinaciones:** Mientras el cliente personaliza el mueble en 3D, el sistema genera un `configurationHash` y verifica si esa combinación exacta cuenta con stock físico para **entrega inmediata (48h)** o si pasa automáticamente a **fabricación a medida (*Made-to-Order*)**, calculando el precio final y los días estimados de taller.

### 4. Lookbooks Interactivos ("Shop the Look")
* **Fotografías de Ambiente con Hotspots:** Puntos interactivos pulsables posicionados mediante coordenadas porcentuales `(X%, Y%)` 100% *responsive* que despliegan tarjetas flotantes con acceso directo al configurador 3D de cada pieza.

### 5. Localización Ecuador: Facturación SRI & Motor Dinámico de Envíos
* **Validador Algorítmico Ecuatoriano:** Verificación en tiempo real de **Cédula (10 dígitos - Módulo 10)**, **RUC (13 dígitos)** y **Pasaporte**, más catálogo de Provincias y Cantones.
* **3 Estrategias de Envío Configurables por el Administrador:**
  1. `FLAT_BY_LOCATION`: Tarifa fija según Provincia/Cantón del Ecuador.
  2. `FREE_OVER_AMOUNT`: Envío gratuito ($0 USD) en compras que superen el monto mínimo `$X` configurado.
  3. `WEIGHT_VOLUME`: Cálculo logístico automático basado en los metros cúbicos ($\text{m}^3$) y peso ($\text{kg}$) total del carrito multiplicado por el factor de distancia provincial.
* **Cálculo de Impuestos:** Desglose automático de **IVA configurable (15% vigente en Ecuador)** en USD.

### 6. Panel de Administración Completo (`RBAC: Role ADMIN`)
* **`/admin`**: Dashboard con KPIs de ingresos, órdenes recientes y alertas de inventario.
* **`/admin/productos`**: CRUD completo de muebles, subida de modelos `.glb` e imágenes (Cloudinary / Local), configuración de zonas de malla 3D y constructor automático de SKUs.
* **`/admin/materiales`**: Biblioteca de materiales y texturas PBR con controles deslizantes de *roughness*, *metalness*, color hex y recargos en USD.
* **`/admin/inventario`**: Control rápido de almacén (`+` / `-` stock por SKU) y ajuste de tiempos de fabricación.
* **`/admin/pedidos`**: Gestión de estados logísticos y **Ficha de Taller 3D** con especificaciones exactas de fabricación y datos de facturación SRI.
* **`/admin/envios`**: Selector en vivo de la regla de cálculo de envío activa e impuestos.
* **`/admin/lookbooks`**: Editor visual *point-and-click* para colocar Hotspots haciendo clic directamente sobre las fotografías.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend & UI** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Next-Themes |
| **Gráficos 3D & AR** | Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`, WebXR / Scene Viewer / Quick Look |
| **Estado & Datos Cliente** | Zustand (con persistencia en `localStorage`), TanStack Query v5 |
| **Backend & ORM** | Next.js Route Handlers (REST API), Prisma ORM v7 (`@prisma/adapter-pg` + `pg`) |
| **Base de Datos** | PostgreSQL 16 (Docker en entorno local / Neon Serverless en producción) |
| **Autenticación & Seguridad** | NextAuth.js (JWT Strategy, Credentials Provider + Google OAuth 2.0, Middleware RBAC por roles) |
| **Almacenamiento & Pagos** | Cloudinary CDN (Imágenes WebP/AVIF + `.glb` raw files + fallback local automático), Stripe (USD) |

---

## 📂 Estructura del Proyecto

```text
rmodulares/
├── docker-compose.yml               # Contenedor PostgreSQL 16 local
├── prisma.config.ts                 # Configuración central de Prisma 7 y Seed
├── prisma/
│   ├── schema.prisma                # Modelo relacional completo
│   └── seed.ts                      # Datos semilla (Ecuador, Materiales PBR, Sofá 3D, Lookbook)
└── src/
    ├── generated/prisma/            # Cliente tipado generado por Prisma 7
    ├── middleware.ts                # Protección de rutas /admin y /perfil (NextAuth RBAC)
    ├── app/
    │   ├── (shop)/                  # Tienda Pública (Home, Catálogo, Visor 3D, Lookbooks, Checkout, Perfil)
    │   ├── (auth)/                  # Autenticación (/login y /registro)
    │   ├── (admin)/admin/           # Panel Administrativo (Productos, Materiales, Stock, Pedidos, Envíos, Lookbooks)
    │   └── api/                     # Endpoints REST (Checkout, Shipping Engine, Upload, Admin CRUDs)
    ├── components/
    │   ├── three/                   # Lienzo R3F (FurnitureCanvas, DynamicModel, ARLauncher)
    │   ├── configurator/            # Controles del configurador híbrido en tiempo real
    │   ├── editorial/               # ProductCard con micro-hover y LookbookHotspotImage
    │   └── layout/                  # Header, Footer y CartDrawer
    ├── lib/
    │   ├── prisma.ts                # Singleton de PrismaClient v7 con Driver Adapter
    │   ├── auth.ts                  # Configuración de NextAuth
    │   ├── shipping-engine.ts       # Motor de las 3 estrategias de cálculo de envío e IVA
    │   └── ecuador-validators.ts    # Validadores algorítmicos de Cédula, RUC y Provincias
    └── store/
        ├── useConfiguratorStore.ts  # Estado reactivo 3D (mallas, materiales, dimensiones, SKU match)
        └── useCartStore.ts          # Carrito persistente con snapshot de personalización 3D
```

---

## 🚀 Instalación y Puesta en Marcha en Local

### 1. Requisitos Previos
* **Node.js** v18.18+ o v20 LTS
* **Docker Desktop** (para levantar PostgreSQL 16 localmente)

### 2. Clonar el repositorio e instalar dependencias
```bash
git clone [https://github.com/tu-usuario/rmodulares.git](https://github.com/tu-usuario/rmodulares.git)
cd rmodulares
npm install
```

### 3. Configurar las Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
# Base de datos Local en Docker
DATABASE_URL="postgresql://rmodulares_user:rmodulares_local_password@localhost:5432/rmodulares_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="super_secreto_desarrollo_local_rmodulares_2026"
GOOGLE_CLIENT_ID="tu_google_client_id"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# Cloudinary (Opcional en local: si se dejan los valores por defecto, usa almacenamiento local en public/uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"

# Stripe (Modo Sandbox USD)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Levantar Base de Datos PostgreSQL en Docker
```bash
docker compose up -d
```

### 5. Generar el Cliente de Prisma 7, Ejecutar Migraciones y Poblar Datos Semilla (`Seed`)
```bash
npx prisma generate
npx prisma migrate dev --name init_rmodulares
npx prisma db seed
```

### 6. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en **`http://localhost:3000`**.

---

## 🔐 Credenciales y Datos de Prueba (Creados por el Seed)

### Acceso Administrador
* **URL de Login:** `http://localhost:3000/login`
* **Correo:** `admin@rmodulares.ec`
* **Contraseña:** `AdminRModulares2026!`

### Datos para Pruebas en Checkout (Ecuador)
* **Cédula Válida (Módulo 10):** `1710034065`
* **RUC Válido:** `1790012345001`
* **Combinación con Stock Inmediato (SKU `AURA-SZ200-LINO-ROBLE`):**
  * Mueble: *Sofá Modular Aura* (`/catalogo/sofa-modular-aura`)
  * Tamaño: *2 Plazas Estándar (200 cm)*
  * Tapizado: *Lino Belga Arena* + Estructura: *Roble Blanco Cepillado*

---

## 🧭 Mapa de Rutas Principales

| Ruta | Acceso | Descripción |
| :--- | :--- | :--- |
| `/` | Público | Home editorial inmersivo con pieza destacada 3D, categorías y escena *Shop the Look*. |
| `/catalogo` | Público | Catálogo general con filtro por ambiente y filtro de *Entrega Inmediata (En Stock)*. |
| `/catalogo/[slug]` | Público | Estudio de configuración 3D interactivo, visor de cotas y lanzador AR. |
| `/lookbooks` | Público | Revista de inspiración y reportajes con puntos interactivos (*Hotspots*). |
| `/checkout` | Público / Cliente | Checkout con validación de Cédula/RUC, cálculo dinámico de envío por provincia e IVA. |
| `/perfil/pedidos` | Cliente / Admin | Historial de órdenes del usuario, estado de taller y recibos de facturación. |
| `/admin` | `ADMIN` | Dashboard general de métricas, ventas e inventario crítico. |
| `/admin/productos` | `ADMIN` | Creación/edición de muebles, subida de archivos `.glb` y generador de SKUs. |
| `/admin/materiales` | `ADMIN` | Gestión de materiales PBR, texturas y recargos en USD. |
| `/admin/inventario` | `ADMIN` | Ajuste rápido de unidades en stock por SKU y días de fabricación. |
| `/admin/pedidos` | `ADMIN` | Gestión de estados de órdenes y ficha de taller 3D + datos SRI. |
| `/admin/envios` | `ADMIN` | Selector de estrategia logística activa (`FLAT_BY_LOCATION`, `FREE_OVER_AMOUNT`, `WEIGHT_VOLUME`). |
| `/admin/lookbooks` | `ADMIN` | Editor visual para posicionar Hotspots haciendo clic sobre fotografías de ambientes. |

---

## 📦 Despliegue a Producción (Neon + Vercel)

Cuando el proyecto esté listo para pasar a la nube:
1. Crea una base de datos PostgreSQL Serverless en **[Neon.tech](https://neon.tech)** y reemplaza `DATABASE_URL` en las variables de entorno de producción.
2. Ejecuta las migraciones productivas con `npx prisma migrate deploy`.
3. Conecta el repositorio de GitHub en **[Vercel](https://vercel.com)**, configura las variables de entorno de **Cloudinary**, **NextAuth** y **Stripe**, y despliega.

---

Desarrollado con ❤️ en Ecuador.