# EventMol 

EventMol es un Sistema de Gestión de Eventos con Planificación Automática, diseñado para simplificar la organización de eventos de cualquier tipo.  
El sistema permite crear, administrar y automatizar la programación de eventos, asignación de recursos, registro de participantes y generación de reportes.

## 🚀 Características

- 📅 **Planificación Automática** de eventos y recursos.
- 👥 **Gestión de Participantes** (registro, confirmación y asistencia).
- 🛠️ **Administración de Recursos** (comida, transporte, espacios).
- 🔔 **Sistema de Notificaciones** para usuarios y organizadores.
- 📊 **Reportes y Facturación** por evento.
- 🔒 **Autenticación Segura** con JWT y manejo de sesiones.
- 🌐 API RESTful desarrollada en **Express.js**.

---

## 🛠️ Tecnologías Utilizadas

- **Node.js (v.22)** + **Express.js** (Backend)
- **PostgreSQL** (Base de datos)
- **JWT** para autenticación
- **Axios** (en frontend)
- **Docker** (opcional, para despliegue)

---

## 📂 Estructura del Proyecto

```bash
eventmol/
├── src/
│   ├── controllers/      # Controladores de rutas
│   ├── middlewares/      # Middlewares de autenticación y validación
│   ├── models/           # Modelos de base de datos
│   ├── routes/           # Definición de endpoints
│   ├── services/         # Lógica de negocio
│   └── app.js            # Configuración principal de Express
├── .env.example          # Variables de entorno de ejemplo
├── package.json
├── README.md
└── Dockerfile            # (Opcional) para despliegue en contenedores

```

---

### Instrucciones 
1. **Clonar o descargar** el repositorio del proyecto.  
2. **Establecer variables de entorno.**  
   - Copiar `.env.example` y renombrar como `.env`
   - Remplazar el valor de cada variable de acuerdo a su informacion (base de datos, clave secreta, etc) 

3. **Instalar Dependencias**  
   Abrir una terminal en el directorio raíz del proyecto y ejecute:  
   ```bash
   npm install
4. **Levantar servidor**  
   ```bash
   npm run dev
---


---
## 🚀 Credenciales

- **Correo:** `admin@example.com`  
- **Contraseña:** `123456#` 
---
