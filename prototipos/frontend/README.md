# Instrucciones de uso de los prototipos

En este README se detallan los pasos necesarios para poder ver los prototipos del proyecto en un navegador web.

Los prototipos fueron desarrollados utilizando Vite, una herramienta que permite ejecutar el frontend de forma rápida en un entorno de desarrollo local.

## Requisitos previos

Antes de comenzar, es necesario contar con:

- Un IDE o editor de código instalado, por ejemplo Visual Studio Code.
- Node.js instalado.
- npm o un administrador de paquetes similar, como pnpm, bun o deno.
- Git instalado para poder clonar el repositorio.

## Instalación

1. Clonar el repositorio

Primero se debe clonar el repositorio del proyecto desde GitHub:

git clone https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU/tree/main

Luego se ingresa a la carpeta del proyecto:

cd Proyecto/prottipos/frontend

2. Instalar las dependencias

Una vez dentro de la carpeta del proyecto, se deben instalar los paquetes necesarios para su funcionamiento:

npm install

En caso de utilizar otro administrador de paquetes, se puede usar el comando correspondiente:

pnpm install

o

bun install

3. Ejecutar el entorno de desarrollo

Para iniciar el proyecto en modo desarrollo, se debe ejecutar:

npm run dev

Luego de ejecutar el comando, Vite mostrará en la terminal una dirección local similar a la siguiente:

http://localhost:5173/

Se debe abrir esa dirección en el navegador web para visualizar los prototipos.

## Comandos útiles

npm install

Instala todas las dependencias necesarias del proyecto.

npm run dev

Inicia el servidor de desarrollo local.

npm run build

Genera una versión optimizada del proyecto para producción.

npm run preview

Permite previsualizar la versión generada para producción.

