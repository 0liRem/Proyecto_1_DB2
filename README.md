# Proyecto 1 - Base de Datos 2

## Sistema de Gestión de Restaurantes con MongoDB, Node.js y Frontend Web

### Integrantes
- Fabián Morales - 23267
- Olivier Viau - 23544

---

## Descripción general

Este proyecto implementa un **Sistema de Gestión de Restaurantes** orientado a entornos con múltiples usuarios, procesamiento de órdenes, administración de menú, reportes analíticos y soporte para visualización por roles.  

La solución fue desarrollada sobre una arquitectura **Node.js + Express + MongoDB**, complementada con un frontend web en **HTML, CSS y JavaScript**, con autenticación basada en **JWT**, control de acceso por roles, carga masiva de datos, reportes exportables y consultas analíticas mediante **Aggregation Pipelines**.

El sistema busca resolver la necesidad de administrar restaurantes, usuarios, menús, órdenes y reseñas usando un modelo documental flexible, escalable y alineado con los requerimientos de MongoDB.

---

## Objetivos del proyecto

- Gestionar restaurantes, usuarios, artículos de menú, órdenes, reseñas, categorías y promociones.
- Implementar autenticación segura con JWT.
- Aplicar autorización basada en roles.
- Incorporar operaciones CRUD sobre múltiples colecciones.
- Implementar consultas avanzadas usando **Aggregation Pipelines**.
- Utilizar índices avanzados para optimizar búsquedas y rendimiento.
- Soportar búsquedas geoespaciales.
- Exportar reportes de ventas.
- Implementar carga masiva de datos para menú.
- Proveer una interfaz frontend amigable y diferenciada según el rol del usuario.

---

## Tecnologías utilizadas

### Backend
- Node.js
- Express.js
- MongoDB Atlas / MongoDB
- JWT (jsonwebtoken)
- bcrypt
- Socket.IO
- node-cron
- ExcelJS
- Morgan
- dotenv

### Frontend
- HTML5
- CSS3
- JavaScript Vanilla
- Chart.js

---

## Arquitectura del proyecto

```text
Proyec
│
├── frontend
│   ├── index.html
│   ├── dashboard.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
│
├── src
│   ├── controller/
│   ├── middlewares/
│   ├── realtime/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── CrDB.js
├── server.js
├── package.json
└── .env
```

---

## Modelo de datos

Las colecciones principales del sistema son:

- `restaurantes`
- `usuarios`
- `menu_items`
- `ordenes`
- `resenas`
- `categorias`
- `promociones`

### Decisiones de modelado

Se utilizó una combinación de:

- **Embedding** para estructuras pequeñas y altamente relacionadas
- **Referencing** para entidades de alto crecimiento o acceso independiente

Ejemplos:
- `horario` embebido en `restaurantes`
- `direcciones` embebidas en `usuarios`
- `menu_items`, `ordenes` y `resenas` referenciados con `ObjectId`

---

## Roles del sistema

El sistema implementa autorización por tipo de usuario.

### Roles definidos
- `administrador`
- `caja`
- `repartidor`
- `usuario`

### Permisos generales

#### Administrador
- Gestión completa de restaurantes
- Gestión completa de menú
- Consulta y actualización de órdenes
- Consulta de usuarios
- Acceso a dashboard analítico
- Exportación de reportes
- Carga masiva de menú

#### Caja
- Crear, leer y actualizar órdenes
- Consultar menú
- Operar dentro de su restaurante asignado

#### Repartidor
- Ver órdenes asignadas
- Actualizar estado de órdenes

#### Usuario
- Crear y consultar sus órdenes
- Explorar restaurantes
- Visualizar restaurantes cercanos

---

## Funcionalidades implementadas

### 1. Autenticación
- Registro de usuarios
- Inicio de sesión con JWT
- Protección de rutas con middleware

### 2. CRUD dinámico
- CRUD genérico para múltiples colecciones
- Soft delete
- Restauración de documentos

### 3. Control multi-tenant
- Restricción de acceso por restaurante o usuario según el rol

### 4. Bulk operations
- Carga masiva de artículos del menú (`bulkCreateMenu`)
- Actualización masiva de menú (`bulkUpdateMenu`)
- Inserción masiva de restaurantes (`bulkCreateRestaurantes`)

### 5. Analytics con Aggregation Pipelines
Se implementaron pipelines analíticas para visualización en dashboard.

### 6. Reportes exportables
- Exportación de reporte de ventas en formato Excel (`.xlsx`)

### 7. Realtime / Change Streams
- Observación de cambios en órdenes, menú, restaurantes y usuarios
- Integración con Socket.IO

### 8. Scheduler
- Cancelación automática de órdenes antes del cierre del restaurante, según horario

### 9. Frontend por rol
- Vista distinta para administrador, repartidor, usuario y caja
- Dashboard amigable y moderno
- Visualización con Chart.js

---

## Índices implementados

### Restaurantes
- Índice geoespacial `2dsphere` sobre `ubicacion`
- Índice por `nombre`

### Usuarios
- Índice único en `email`
- Índice por `tipo`

### Menú
- Índice compuesto en `(restauranteId, categoria, precio)`
- Índice de texto en `nombre` y `descripcion`

### Órdenes
- Índice compuesto `(restauranteId, estado, fechaCreacion)`
- Índice `(usuarioId, fechaCreacion)`
- Índice `(repartidorId, estado)`

### Reseñas
- Índice `(restauranteId, calificacion)`
- Índice de texto sobre `comentario`
- Índice único compuesto `(usuarioId, restauranteId)`

### Promociones
- Índice único en `codigo`
- Índice `(restauranteId, vigencia)`

---

## Aggregation Pipelines implementadas

### 1. Top productos vendidos
Obtiene los artículos del menú con mayor cantidad vendida.

### 2. Ventas por restaurante
Agrupa ventas totales y número de órdenes por restaurante.

### 3. Segmentación de clientes
Clasifica clientes como nuevos, ocasionales o frecuentes.

### 4. Rating promedio por restaurante
Calcula promedio de calificaciones y número de reseñas.

### 5. Órdenes por estado
Cuenta cuántas órdenes existen por cada estado.

### 6. Ventas por día
Agrupa ventas y cantidad de órdenes por día.

### 7. Top restaurantes por ventas
Muestra los restaurantes con mayores ingresos.

### 8. Restaurantes cercanos
Consulta geoespacial para mostrar restaurantes cerca de la ubicación del usuario.

---

## Frontend e Interacción Humano-Computadora (HCI)

El frontend fue diseñado para ofrecer una experiencia clara, amigable y visualmente atractiva.  
Incluye:

- Diseño moderno y responsive
- Menú lateral por rol
- Dashboard analítico con gráficas
- Mensajes de retroalimentación visual
- Jerarquía visual clara
- Navegación consistente
- Vistas específicas según el usuario autenticado

### Vistas disponibles por rol

#### Administrador
- Analytics
- Exportación de reporte
- Carga masiva de menú
- Vista de restaurantes

#### Repartidor
- Órdenes asignadas
- Cambio de estado de pedidos

#### Usuario
- Restaurantes
- Restaurantes cercanos por geolocalización
- Consulta de órdenes propias

#### Caja
- Consulta operativa de órdenes

---

## Rutas principales

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### CRUD genérico
- `GET /api/:collection`
- `POST /api/:collection`
- `GET /api/:collection/:id`
- `PATCH /api/:collection/:id`
- `DELETE /api/:collection/:id`

### Analytics
- `GET /api/analytics/top-productos`
- `GET /api/analytics/ventas-restaurantes`
- `GET /api/analytics/segmentacion-clientes`
- `GET /api/analytics/rating-restaurantes`
- `GET /api/analytics/ordenes-estado`
- `GET /api/analytics/ventas-dia`
- `GET /api/analytics/top-restaurantes`
- `GET /api/analytics/restaurantes-cercanos`

### Reports
- `GET /api/reports/ventas`

### Bulk
- `POST /api/bulk/menu-items`
- `PATCH /api/bulk/menu-items`
- `POST /api/bulk/restaurantes`

---

## Variables de entorno

Ejemplo de archivo `.env`:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/restaurantes_db?retryWrites=true&w=majority
DB_NAME=restaurantes_db
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d
PORT=3000
```

---

## Instalación y ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno
Crear archivo `.env` con la configuración correspondiente.

### 3. Ejecutar servidor

```bash
node server.js
```

### 4. Acceder al sistema

Frontend:

```text
http://localhost:3000
```

---

## Carga de datos y pruebas

Para pruebas de rendimiento y visualización de analytics, se pueden cargar documentos masivos en las colecciones del sistema.  
El proyecto soporta:

- Inserciones masivas de `menu_items`
- Inserciones masivas de `restaurantes`
- Seeds de grandes volúmenes para `ordenes`, `usuarios` y `resenas`

Esto permite validar pipelines, dashboards y consultas analíticas sobre decenas de miles de documentos.

---

## Reporte exportable

El sistema incluye una funcionalidad para exportar un reporte de ventas en Excel utilizando **ExcelJS**.  
Desde el frontend, el administrador puede descargar el archivo generado automáticamente por el backend.

---

## Funcionalidad en tiempo real

Se implementaron **Change Streams** sobre MongoDB y Socket.IO para monitorear en tiempo real cambios en:

- órdenes
- menú
- restaurantes
- usuarios

Esto permite notificar eventos como:
- orden nueva
- orden actualizada
- inventario actualizado

---

## Escalabilidad

El proyecto fue diseñado considerando crecimiento futuro en volumen de restaurantes y órdenes.  
Se incorporaron decisiones como:

- uso de índices avanzados
- separación por colecciones especializadas
- operaciones bulk
- soporte a analytics
- propuesta de shard key centrada en `restauranteId`

---

## Estado actual del proyecto

El sistema cuenta con:

- Backend funcional con autenticación y CRUD
- Middleware de autorización y protección
- Dashboard frontend con vistas por rol
- Aggregation Pipelines operativas
- Búsqueda geoespacial
- Exportación de reportes
- Bulk insert/update para menú
- Realtime con Change Streams

---

## Mejoras futuras

- Dashboard de Mongo Charts embebido
- Gestión visual de promociones
- Panel de administración de usuarios
- Mejoras en UX para carga masiva
- Integración más completa de pedidos en tiempo real
- Endpoint dedicado para aceptación de pedidos por repartidor
- Validaciones adicionales en formularios frontend

---

## Conclusión

Este proyecto demuestra la construcción de una solución documental moderna sobre MongoDB, integrando modelado flexible, autenticación, autorización, analytics, operaciones masivas, geolocalización y visualización por roles.  

La propuesta cumple con los objetivos técnicos y funcionales del curso, y evidencia el uso de características avanzadas de MongoDB dentro de un sistema realista de gestión de restaurantes.
