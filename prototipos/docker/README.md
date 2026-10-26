# S.I.G.S.M. - Docker

Entorno de despliegue local mediante Docker Compose.

## Servicios

- Frontend: React compilado y servido por Nginx.
- Backend: Apache con PHP 8.2.
- Base de datos: MariaDB 11.4.

## Requisitos

- Docker Engine o Docker Desktop.
- Docker Compose.
- Acceso a GitHub durante la construcción.

## Configuración

Crear el archivo de variables de entorno:

```bash
cp .env.example .env
```

Editar las contraseñas antes de iniciar los servicios.

## Iniciar

```bash
docker compose up -d --build
```

La aplicación estará disponible en:

http://localhost:8080

## Consultar el estado

```bash
docker compose ps
```

## Consultar los logs

```bash
docker compose logs -f
```

## Detener

```bash
docker compose down
```

Este comando no elimina los volúmenes persistentes.

## Base de datos

Los cuatro archivos dbSchema_XX.sql se importan
en orden durante la primera inicialización.

No se incluyen datos de demostración adicionales.

## Código fuente

Las imágenes descargan la rama main del repositorio:

https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU

El código se descarga durante la construcción,
no durante cada arranque de los contenedores.
