# Usar la imagen oficial de Node.js como base
FROM node:20-alpine

# Establecer directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar archivos de dependencias primero (mejora la caché de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer el puerto en el que corre Express 
EXPOSE 7777

# Comando para iniciar la aplicación
CMD ["npm", "start"]
