
# S.I.G.S.M. — Despliegue con Docker

Guía de instalación, configuración, ejecución y mantenimiento de **S.I.G.S.M.** mediante Docker Compose.

Este sistema permite desplegar la aplicación en otra computadora o servidor sin instalar manualmente PHP, Apache, Node.js, Nginx ni MariaDB.

La configuración actual está orientada a entornos locales, académicos y de demostración. Para publicar la aplicación en Internet es necesario incorporar medidas adicionales de seguridad, especialmente HTTPS.

---

## Índice

1. [Arquitectura del despliegue](#1-arquitectura-del-despliegue)
2. [Requisitos previos](#2-requisitos-previos)
3. [Obtener el proyecto](#3-obtener-el-proyecto)
4. [Configurar las variables de entorno](#4-configurar-las-variables-de-entorno)
5. [Instalación inicial](#5-instalación-inicial)
6. [Verificar la instalación](#6-verificar-la-instalación)
7. [Comandos de administración](#7-comandos-de-administración)
8. [Actualización de la aplicación](#8-actualización-de-la-aplicación)
9. [Persistencia y respaldos](#9-persistencia-y-respaldos)
10. [Acceso desde otros equipos](#10-acceso-desde-otros-equipos)
11. [Resolución de problemas](#11-resolución-de-problemas)
12. [Referencia rápida de comandos](#12-referencia-rápida-de-comandos)

---

## 1. Arquitectura del despliegue

La aplicación utiliza Docker Compose para gestionar los servicios necesarios para su funcionamiento.

### 1.1 Servicios

| Servicio | Tecnología | Función |
|---|---|---|
| `frontend` | React, Vite y Nginx | Interfaz web y proxy de la API |
| `backend` | PHP 8.2 y Apache | API REST y lógica de negocio |
| `db` | MariaDB 11.4 | Almacenamiento de información |
| `admin-init` | PHP | Creación del administrador inicial |
| `seed-demo` | MariaDB | Carga opcional de datos ficticios |

Los servicios `frontend`, `backend` y `db` permanecen ejecutándose para mantener disponible la aplicación.

Los servicios `admin-init` y `seed-demo` son tareas puntuales. Se ejecutan, realizan su trabajo y finalizan.

### 1.2 Comunicación entre servicios

El funcionamiento general es:

```text
                  USUARIO
                     |
                     v
              Navegador web
                     |
                     v
          FRONTEND - NGINX
               Puerto 80
                     |
             Peticiones /api
                     |
                     v
           BACKEND - APACHE
                  PHP
                     |
                     v
               MARIADB
                sigsm
```

El frontend es el único servicio publicado en un puerto del equipo anfitrión.

Nginx se encarga de servir la aplicación React y redirigir las peticiones `/api/` hacia el backend.

Apache ejecuta los endpoints PHP y se comunica con MariaDB mediante la red interna de Docker.

No es necesario publicar directamente los puertos de Apache ni de MariaDB.

### 1.3 Volúmenes persistentes

La aplicación utiliza dos volúmenes:

| Volumen | Ruta dentro del contenedor | Contenido |
|---|---|---|
| `db_data` | `/var/lib/mysql` | Base de datos MariaDB |
| `docs_data` | `/var/www/api/storage` | Documentos y archivos de la aplicación |

Estos volúmenes permiten conservar los datos aunque los contenedores se detengan o se reconstruyan.

Como el proyecto se denomina `sigsm`, Docker normalmente crea los volúmenes con los nombres `sigsm_db_data` y `sigsm_docs_data`.

**Importante:** los volúmenes no deben eliminarse durante una actualización normal.

### 1.4 Estructura de archivos

La configuración de Docker se encuentra en:

```text
prototipos/
└── docker/
    ├── compose.yaml
    ├── .env.example
    ├── .env
    ├── .gitignore
    ├── README.md
    │
    ├── backend/
    │   ├── Dockerfile
    │   ├── apache.conf
    │   ├── bootstrap-admin.php
    │   └── php.ini
    │
    ├── database/
    │   └── Dockerfile
    │
    └── frontend/
        ├── Dockerfile
        └── nginx.conf
```

El archivo `.env` debe crearse durante la instalación y no debe subirse al repositorio.

---

## 2. Requisitos previos

Para instalar S.I.G.S.M. en otro equipo se necesita:

- Docker Engine o Docker Desktop.
- Docker Compose v2.
- Git.
- Conexión a Internet durante la construcción de las imágenes.
- Un puerto disponible para acceder a la aplicación.
- Espacio suficiente para imágenes, base de datos y documentos.

No es necesario instalar localmente:

- PHP.
- Apache.
- Node.js.
- Nginx.
- MariaDB.
- XAMPP.

Estas herramientas se ejecutan dentro de los contenedores correspondientes.

### 2.1 Comprobar Docker

Ejecutar:

```bash
docker --version
```

Comprobar Docker Compose:

```bash
docker compose version
```

Comprobar que el motor de Docker funciona:

```bash
docker info
```

Si Docker está instalado correctamente, los comandos mostrarán información sobre sus versiones y configuración.

En Windows es necesario que Docker Desktop esté iniciado.

En Linux, el usuario debe tener permisos para utilizar el servicio Docker.

### 2.2 Comprobar Git

```bash
git --version
```

Git se utiliza para descargar y actualizar los archivos de configuración del repositorio.

---

## 3. Obtener el proyecto

El código de S.I.G.S.M. está disponible en:

https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU

### 3.1 Clonar el repositorio

Desde una terminal:

```bash
git clone https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU.git
```

Entrar en el directorio de Docker:

```bash
cd S.I.G.S.M---Proyecto-UTU/prototipos/docker
```

A partir de este momento, salvo que se indique lo contrario, **todos los comandos deben ejecutarse desde `prototipos/docker`**.

### 3.2 Código utilizado durante la construcción

Los Dockerfiles actuales descargan el código directamente desde la rama `main` de GitHub.

Por tanto:

- Las imágenes contienen el código que estaba publicado en `main` durante su construcción.
- Los cambios locales no se incorporan automáticamente a las imágenes.
- Es necesario publicar los cambios en GitHub y reconstruir la imagen correspondiente.
- Reiniciar un contenedor no descarga código nuevo.

El frontend, el backend y la base de datos pueden reconstruirse por separado.

---

## 4. Configurar las variables de entorno

Antes de ejecutar la aplicación debe crearse un archivo `.env`.

### 4.1 Crear el archivo

En Linux o macOS:

```bash
cp .env.example .env
```

En Windows, utilizando PowerShell:

```powershell
Copy-Item .env.example .env
```

También puede copiarse manualmente `.env.example` y renombrar la copia a `.env`.

### 4.2 Contenido del archivo

Ejemplo:

```dotenv
WEB_PORT=8080

DB_USER=sigsm_app
DB_PASSWORD=reemplazar_con_una_contrasena_segura

MARIADB_ROOT_PASSWORD=reemplazar_con_otra_contrasena_segura

ADMIN_NAME="Administrador Inicial"
ADMIN_EMAIL=administrador@ejemplo.com
ADMIN_PASSWORD=reemplazar_con_una_contrasena_de_12_caracteres_o_mas
```

**Estas credenciales son ejemplos y deben sustituirse antes de iniciar la instalación.**

### 4.3 Descripción de las variables

| Variable | Descripción |
|---|---|
| `WEB_PORT` | Puerto utilizado para acceder al frontend |
| `DB_USER` | Usuario de MariaDB utilizado por la API |
| `DB_PASSWORD` | Contraseña del usuario de la base de datos |
| `MARIADB_ROOT_PASSWORD` | Contraseña del administrador de MariaDB |
| `ADMIN_NAME` | Nombre del administrador inicial |
| `ADMIN_EMAIL` | Correo utilizado para iniciar sesión |
| `ADMIN_PASSWORD` | Contraseña inicial del administrador |

El puerto predeterminado es `8080`.

La contraseña del administrador inicial debe tener **al menos 12 caracteres**, según la validación de `bootstrap-admin.php`.

### 4.4 Diferencia entre las credenciales

Existen dos tipos de usuarios:

**Usuario de MariaDB**

Se utiliza internamente para conectar la API con la base de datos.

Se configura mediante:

```dotenv
DB_USER=sigsm_app
DB_PASSWORD=...
```

**Administrador de S.I.G.S.M.**

Es el usuario que inicia sesión desde la aplicación web.

Se configura mediante:

```dotenv
ADMIN_NAME=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Las credenciales de MariaDB no deben utilizarse para iniciar sesión en la aplicación.

### 4.5 Seguridad de las variables

El archivo `.env` contiene contraseñas y no debe compartirse.

Está excluido del control de versiones mediante `.gitignore`.

Se recomienda:

- Utilizar contraseñas largas y distintas.
- Evitar credenciales predeterminadas.
- No subir `.env` a GitHub.
- No compartir capturas que muestren las contraseñas.
- Mantener una copia segura de las credenciales de administración.

Modificar `ADMIN_PASSWORD` después de crear el administrador **no cambia su contraseña en la base de datos**.

De igual forma, modificar las credenciales de MariaDB en `.env` no actualiza automáticamente las de una base ya inicializada.

### 4.6 Validar la configuración

Antes de iniciar:

```bash
docker compose config --quiet
```

Este comando comprueba la configuración de Docker Compose y la presencia de las variables necesarias.

No muestra los valores de las contraseñas cuando se utiliza con `--quiet`.

---

## 5. Instalación inicial

Existen dos formas de instalar la aplicación:

1. Instalación normal, sin datos de demostración.
2. Instalación de demostración, con información ficticia.

Ambas utilizan los mismos contenedores principales.

### 5.1 Instalación normal

Para instalar S.I.G.S.M. sin datos ficticios:

```bash
docker compose up -d --build
```

Este comando:

1. Construye las imágenes necesarias.
2. Crea la red interna del proyecto.
3. Inicializa MariaDB.
4. Ejecuta los scripts de creación de tablas.
5. Crea el administrador inicial.
6. Inicia Apache y PHP.
7. Inicia Nginx y el frontend.

La opción `-d` ejecuta los servicios en segundo plano.

La opción `--build` permite construir las imágenes antes de iniciar los contenedores.

### 5.2 Inicialización de la base de datos

En una instalación nueva, MariaDB ejecuta automáticamente los siguientes archivos:

```text
dbSchema_01.sql
dbSchema_02.sql
dbSchema_03.sql
dbSchema_04.sql
```

Estos archivos se obtienen del repositorio durante la construcción de la imagen de la base de datos.

Se ejecutan en el orden indicado y crean las tablas, relaciones, restricciones y catálogos necesarios.

**Los scripts de inicialización solo se ejecutan automáticamente cuando el volumen de MariaDB está vacío.**

Si la base de datos ya existe, reconstruir su imagen no vuelve a crear las tablas.

### 5.3 Creación del administrador

El servicio `admin-init` se ejecuta después de que MariaDB esté disponible.

Su función es:

- Comprobar que existe el rol `Administrador`.
- Comprobar si ya existe un funcionario con el correo configurado.
- Crear el funcionario inicial si todavía no existe.
- Generar el hash seguro de su contraseña.
- Asignarle el rol de administrador.

Si el administrador ya existe con el rol correspondiente, el servicio no modifica su contraseña.

Una vez terminado, `admin-init` finaliza correctamente.

### 5.4 Instalación con datos de demostración

Para instalar S.I.G.S.M. con datos ficticios:

```bash
docker compose --profile demo up -d --build
```

La opción `--profile demo` activa el servicio adicional `seed-demo`.

Este servicio espera a que:

1. MariaDB esté disponible.
2. El administrador inicial se haya creado correctamente.

Después ejecuta:

```text
prototipos/backend/database/data/seedDemo.sql
```

### 5.5 Datos generados por el seed

El seed crea información sintética para probar los diferentes módulos de la aplicación.

| Entidad | Cantidad |
|---|---:|
| Funcionarios, incluido el administrador inicial | 80 |
| Asignaciones de roles | 150 |
| Vehículos | 35 |
| Categorías | 20 |
| Traslados | 2000 |
| Encuestas | 30 |
| Preguntas | 200 |
| Opciones de respuesta | 600 |
| Formularios respondidos | 5000 |

#### Distribución de los traslados

| Estado | Cantidad |
|---|---:|
| Completado | 1800 |
| En camino | 5 |
| Llegó al destino | 5 |
| Retornando | 5 |
| Registrado | 165 |
| Cancelado | 20 |
| **Total** | **2000** |

De los 20 traslados cancelados:

- 10 tienen recursos previamente asignados.
- 10 no tienen recursos asignados.

Esto permite comprobar el funcionamiento de Seguimiento e Historial con diferentes situaciones.

El seed no genera documentos PDF, ya que estos deben almacenarse como archivos reales.

### 5.6 Verificar la ejecución del seed

```bash
docker compose --profile demo logs seed-demo
```

Si el proceso terminó correctamente, debe aparecer el mensaje:

```text
Seed de demostracion cargado correctamente.
```

También puede consultarse:

```bash
docker compose --profile demo ps -a
```

Es normal que `seed-demo` y `admin-init` aparezcan como `Exited (0)`.

Son procesos diseñados para ejecutarse una sola vez y finalizar.

### 5.7 Advertencia sobre el seed

El seed está diseñado para una instalación limpia.

Comprueba que:

- Solo exista el administrador inicial.
- No existan traslados anteriores.
- No existan encuestas anteriores.
- No existan categorías añadidas.
- No existan documentos previos.
- No existan otros datos que puedan interferir.

Si ya existe información, el seed interrumpe su ejecución para evitar mezclar datos.

**No debe ejecutarse repetidamente sobre una instalación en uso.**

Para posteriores arranques de una instalación que ya tiene datos, utilizar:

```bash
docker compose up -d
```

Sin activar el perfil `demo`.

---

## 6. Verificar la instalación

### 6.1 Consultar los contenedores

```bash
docker compose ps
```

Para incluir los contenedores que ya finalizaron:

```bash
docker compose ps -a
```

Los servicios principales deben encontrarse en ejecución.

MariaDB debe indicar un estado saludable cuando su comprobación de disponibilidad termine satisfactoriamente.

### 6.2 Consultar los logs

Logs generales:

```bash
docker compose logs
```

Logs en tiempo real:

```bash
docker compose logs -f
```

Logs del frontend:

```bash
docker compose logs -f frontend
```

Logs del backend:

```bash
docker compose logs -f backend
```

Logs de MariaDB:

```bash
docker compose logs -f db
```

Logs del administrador inicial:

```bash
docker compose logs admin-init
```

Logs del seed:

```bash
docker compose --profile demo logs seed-demo
```

Para salir de la visualización en tiempo real:

```text
Ctrl + C
```

Esto interrumpe la visualización de los logs, pero no detiene los contenedores.

### 6.3 Acceder a la aplicación

Abrir en el navegador:

```text
http://localhost:8080
```

Si se configuró otro valor de `WEB_PORT`, utilizar el puerto correspondiente.

Ejemplo:

```dotenv
WEB_PORT=8090
```

La dirección será:

```text
http://localhost:8090
```

### 6.4 Iniciar sesión

Utilizar el correo y la contraseña definidos previamente:

```dotenv
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

El administrador tiene acceso a las funcionalidades correspondientes a su rol.

### 6.5 Comprobar los datos de demostración

Para abrir una terminal SQL dentro de MariaDB:

```bash
docker compose exec db sh -c 'MYSQL_PWD="$MARIADB_PASSWORD" mariadb -u"$MARIADB_USER" "$MARIADB_DATABASE"'
```

Consultar los traslados agrupados por estado:

```sql
SELECT
    e.nombre AS estado,
    COUNT(*) AS cantidad
FROM traslado t
INNER JOIN estado_traslado e
    ON e.id_estado = t.id_estado
GROUP BY
    e.id_estado,
    e.nombre
ORDER BY e.orden;
```

Para salir:

```sql
exit;
```

En la aplicación pueden utilizarse los filtros del Historial para comprobar los traslados completados y cancelados.

En una instalación demo limpia, los códigos `TR-01981` y `TR-01995` corresponden a ejemplos de traslados cancelados con y sin recursos asignados, respectivamente.

### 6.6 Comprobar la versión desplegada

Las imágenes incluyen el identificador del commit de GitHub utilizado durante su construcción.

Frontend:

```bash
docker compose exec frontend cat /etc/sigsm-commit
```

Backend:

```bash
docker compose exec backend cat /etc/sigsm-commit
```

Base de datos:

```bash
docker compose exec db cat /etc/sigsm-commit
```

Esto permite verificar qué versión del código contiene cada imagen.

Es posible que las imágenes muestren commits diferentes si fueron actualizadas en distintos momentos.

---

## 7. Comandos de administración

Los siguientes comandos permiten administrar los servicios de Docker durante el uso habitual.

### 7.1 Iniciar la aplicación

```bash
docker compose up -d
```

Inicia los servicios utilizando las imágenes existentes.

### 7.2 Detener los servicios

```bash
docker compose stop
```

Detiene los contenedores sin eliminarlos.

### 7.3 Volver a iniciarlos

```bash
docker compose start
```

Inicia los contenedores que estaban detenidos.

### 7.4 Reiniciar todos los servicios

```bash
docker compose restart
```

### 7.5 Reiniciar un servicio

Frontend:

```bash
docker compose restart frontend
```

Backend:

```bash
docker compose restart backend
```

Base de datos:

```bash
docker compose restart db
```

**Importante:** reiniciar no incorpora cambios nuevos del repositorio.

Para actualizar el código es necesario reconstruir la imagen.

### 7.6 Consultar el estado

```bash
docker compose ps
```

### 7.7 Consultar procesos y recursos

Mostrar los contenedores activos:

```bash
docker ps
```

Mostrar todos los contenedores:

```bash
docker ps -a
```

Consultar consumo de CPU y memoria:

```bash
docker stats
```

### 7.8 Abrir una terminal en un contenedor

Backend:

```bash
docker compose exec backend bash
```

Frontend:

```bash
docker compose exec frontend sh
```

MariaDB:

```bash
docker compose exec db sh
```

Para salir de la terminal:

```bash
exit
```

### 7.9 Eliminar los contenedores sin perder datos

```bash
docker compose down
```

Este comando detiene y elimina los contenedores y la red creada por Compose.

Los volúmenes de MariaDB y documentos se conservan.

Para volver a iniciar:

```bash
docker compose up -d
```

---

## 8. Actualización de la aplicación

Las imágenes obtienen su código desde `main` durante la construcción.

Después de subir los cambios a GitHub, es necesario reconstruir los servicios afectados.

### 8.1 Actualizar solamente el frontend

Si únicamente se modificó React, Material UI, estilos o traducciones:

```bash
docker compose build --no-cache frontend
```

Después recrear el contenedor:

```bash
docker compose up -d --no-deps frontend
```

El parámetro `--no-deps` evita iniciar o recrear intencionadamente las dependencias del servicio.

De esta manera no es necesario reconstruir el backend ni MariaDB.

### 8.2 Actualizar solamente el backend

Si únicamente se modificaron endpoints, servicios o lógica PHP:

```bash
docker compose build --no-cache backend
```

Recrear el contenedor:

```bash
docker compose up -d --no-deps backend
```

Los datos de MariaDB y los documentos persistentes se conservan.

### 8.3 Actualizar frontend y backend

```bash
docker compose build --no-cache frontend backend
```

Después:

```bash
docker compose up -d --no-deps frontend backend
```

### 8.4 Actualizar la configuración local de Docker

Si se modificaron los archivos de Compose o los Dockerfiles en GitHub:

```bash
git pull origin main
```

Después:

```bash
docker compose build --no-cache
```

Y finalmente:

```bash
docker compose up -d
```

Esto reconstruye las imágenes y recrea los contenedores que lo necesiten.

### 8.5 Actualizar la imagen de MariaDB

```bash
docker compose build --no-cache db
```

Después:

```bash
docker compose up -d --no-deps db
```

**Atención:** reconstruir la imagen de MariaDB no vuelve a ejecutar los scripts de creación de tablas sobre una base existente.

Los scripts `dbSchema_XX.sql` solo se ejecutan automáticamente durante la inicialización de un volumen vacío.

### 8.6 Cambios en la estructura de la base de datos

Si se modifican tablas, columnas, restricciones o índices, hay que distinguir dos situaciones.

**Instalación nueva**

Los archivos SQL actualizados se ejecutarán durante la inicialización de MariaDB.

**Instalación existente**

Los cambios deben aplicarse mediante scripts de migración SQL apropiados para la versión existente.

Se recomienda:

1. Crear un respaldo de la base de datos.
2. Preparar la migración.
3. Probarla sobre una copia.
4. Aplicarla a la instalación correspondiente.
5. Verificar los resultados.

No se deben ejecutar directamente todos los scripts de creación sobre una base ya poblada.

### 8.7 Reconstrucción completa

Para reconstruir todas las imágenes desde cero:

```bash
docker compose build --no-cache
```

Después:

```bash
docker compose up -d
```

Los volúmenes persistentes se conservan.

### 8.8 Diferencia entre reiniciar y reconstruir

| Comando | Descarga código nuevo | Recrea imagen |
|---|---|---|
| `docker compose restart frontend` | No | No |
| `docker compose up -d` | No necesariamente | No |
| `docker compose build frontend` | Puede utilizar caché | Sí |
| `docker compose build --no-cache frontend` | Sí, desde `main` | Sí |

Después de reconstruir una imagen es necesario recrear el contenedor para utilizarla.

---

## 9. Persistencia y respaldos

### 9.1 Información persistente

La información más importante de la aplicación se encuentra en:

**MariaDB**

Contiene:

- Funcionarios.
- Roles.
- Categorías.
- Documentos registrados.
- Encuestas.
- Respuestas.
- Vehículos.
- Traslados.
- Historial de traslados.

**Almacenamiento de documentos**

Contiene los archivos físicos almacenados por la aplicación, como los documentos PDF.

Para recuperar completamente el sistema es necesario conservar tanto la base de datos como los archivos físicos.

### 9.2 Consultar los volúmenes

```bash
docker volume ls
```

Los volúmenes del proyecto normalmente aparecen como:

```text
sigsm_db_data
sigsm_docs_data
```

### 9.3 Crear un respaldo de MariaDB

El siguiente procedimiento funciona sin necesidad de tener instalado MariaDB en el equipo anfitrión.

Primero se crea el volcado SQL dentro del contenedor:

```bash
docker compose exec db sh -c 'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" mariadb-dump -uroot --single-transaction --quick --routines --triggers sigsm > /tmp/sigsm_backup.sql'
```

Después se copia al equipo anfitrión:

```bash
docker compose cp db:/tmp/sigsm_backup.sql ./sigsm_backup.sql
```

Finalmente se elimina el archivo temporal:

```bash
docker compose exec db rm /tmp/sigsm_backup.sql
```

El resultado es:

```text
sigsm_backup.sql
```

Este archivo contiene un respaldo lógico de la base de datos.

Se recomienda almacenarlo fuera del directorio de despliegue y utilizar una carpeta protegida.

### 9.4 Respaldar documentos

Crear una carpeta:

```bash
mkdir storage_backup
```

Copiar los archivos del backend:

```bash
docker compose cp backend:/var/www/api/storage/. ./storage_backup/
```

La carpeta `storage_backup` contendrá los archivos persistentes almacenados por la aplicación.

### 9.5 Restaurar la base de datos

**Advertencia:** restaurar un SQL puede sobrescribir información de la base de datos de destino.

Este procedimiento debe realizarse únicamente sobre un entorno preparado para restauración, con copia previa de cualquier información que sea necesario conservar.

Primero copiar el respaldo al contenedor:

```bash
docker compose cp ./sigsm_backup.sql db:/tmp/sigsm_backup.sql
```

Después importar el respaldo:

```bash
docker compose exec db sh -c 'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" mariadb -uroot sigsm < /tmp/sigsm_backup.sql'
```

Finalmente eliminar el archivo temporal:

```bash
docker compose exec db rm /tmp/sigsm_backup.sql
```

La base `sigsm` debe existir antes de importar el archivo.

Para una restauración completa es preferible trabajar sobre una instalación nueva o una base preparada para recibir el respaldo, no sobre una instalación activa con datos diferentes.

### 9.6 Restaurar documentos

Copiar los archivos al contenedor:

```bash
docker compose cp ./storage_backup/. backend:/var/www/api/storage/
```

Corregir los permisos para Apache:

```bash
docker compose exec -u root backend chown -R www-data:www-data /var/www/api/storage
```

Después comprobar desde la aplicación que los documentos pueden visualizarse y descargarse correctamente.

### 9.7 Política recomendada de respaldos

Se recomienda:

- Realizar respaldos periódicos.
- Mantener copias fuera del equipo principal.
- Conservar varias versiones.
- Proteger los archivos de respaldo.
- Verificar periódicamente que pueden restaurarse.
- Respaldar la base de datos y los documentos conjuntamente.

Los comandos anteriores son manuales.

El despliegue actual de Docker no incorpora un servicio que programe respaldos automáticamente.

### 9.8 Reiniciar la instalación desde cero

Para eliminar los contenedores y la red, conservando los datos:

```bash
docker compose down
```

Para eliminar los contenedores y también los volúmenes:

```bash
docker compose down -v
```

**ADVERTENCIA: `down -v` elimina la base de datos y los documentos persistentes del proyecto.**

Solo debe utilizarse cuando se quiere descartar completamente una instalación de pruebas o cuando existe un respaldo verificado.

Para crear una nueva demo después de eliminar los volúmenes:

```bash
docker compose --profile demo up -d --build
```

No es necesario eliminar los volúmenes para actualizar el frontend o el backend.

---

## 10. Acceso desde otros equipos

### 10.1 Acceso desde la misma computadora

Por defecto:

```text
http://localhost:8080
```

### 10.2 Acceso desde la red local

Docker publica el frontend mediante la configuración:

```yaml
ports:
  - "${WEB_PORT:-8080}:80"
```

Esto permite acceder desde otro equipo utilizando la IP del servidor, siempre que el firewall y la red permitan la conexión.

Ejemplo:

```text
http://192.168.1.100:8080
```

La dirección IP debe sustituirse por la IP real del equipo donde se ejecuta Docker.

### 10.3 Cambiar el puerto

Editar `.env`:

```dotenv
WEB_PORT=8090
```

Después recrear el frontend:

```bash
docker compose up -d --no-deps frontend
```

La nueva dirección será:

```text
http://localhost:8090
```

### 10.4 Firewall

Para permitir conexiones desde otros equipos de la red es necesario que el firewall autorice el puerto configurado.

Por seguridad, conviene limitar el acceso a las redes o dispositivos que realmente necesitan utilizar la aplicación.

No es necesario publicar el puerto `3306` de MariaDB.

Tampoco es necesario publicar Apache directamente, ya que Nginx redirige las peticiones a la API.

### 10.5 Acceso desde Internet

La configuración actual utiliza HTTP.

Por tanto, no debe exponerse directamente a Internet para utilizar cuentas reales o información sensible.

Para un despliegue remoto se recomienda utilizar:

- HTTPS.
- Un proxy inverso o túnel seguro.
- Restricciones de acceso.
- Contraseñas robustas.
- Firewall configurado.
- Copias de seguridad.
- Actualizaciones periódicas.

La incorporación de HTTPS y la publicación segura de la aplicación requieren configuración adicional.

### 10.6 Acceso únicamente desde el equipo anfitrión

Si no se desea permitir conexiones desde otros equipos, puede restringirse la publicación del frontend a `localhost`.

En `compose.yaml`:

```yaml
ports:
  - "127.0.0.1:${WEB_PORT:-8080}:80"
```

Con esta configuración, el puerto no quedará publicado directamente en todas las interfaces de red del equipo.

---

## 11. Resolución de problemas

### 11.1 Docker no inicia

Comprobar:

```bash
docker info
```

En Windows, verificar que Docker Desktop está ejecutándose.

En Linux, verificar el estado del servicio Docker y los permisos del usuario.

### 11.2 El puerto 8080 está ocupado

Puede aparecer un error indicando que el puerto ya está en uso.

Solución:

Cambiar el valor en `.env`:

```dotenv
WEB_PORT=8090
```

Después recrear el frontend:

```bash
docker compose up -d --no-deps frontend
```

### 11.3 La aplicación no abre

Consultar:

```bash
docker compose ps
```

Verificar los logs:

```bash
docker compose logs --tail=100 frontend
```

```bash
docker compose logs --tail=100 backend
```

Comprobar que el puerto configurado coincide con la URL utilizada en el navegador.

### 11.4 La API devuelve un error 502

Un error `502 Bad Gateway` puede indicar que Nginx no consigue comunicarse correctamente con Apache.

Comprobar:

```bash
docker compose ps
```

```bash
docker compose logs -f backend
```

Verificar que el backend está en ejecución y conectado a la red interna del proyecto.

### 11.5 No se puede iniciar sesión

Comprobar:

- Correo configurado.
- Contraseña del administrador.
- Estado del backend.
- Conexión a MariaDB.
- Resultado de `admin-init`.

Consultar:

```bash
docker compose logs admin-init
```

Si el administrador ya existe, modificar `ADMIN_PASSWORD` en `.env` no actualizará automáticamente su contraseña.

### 11.6 El administrador inicial no se crea

Comprobar los logs:

```bash
docker compose logs admin-init
```

Verificar:

- Que el correo sea válido.
- Que la contraseña tenga al menos 12 caracteres.
- Que MariaDB esté disponible.
- Que exista el rol `Administrador`.

Si el correo ya pertenece a un funcionario que no tiene el rol correspondiente, el proceso no creará una cuenta alternativa con ese mismo correo.

### 11.7 MariaDB no está saludable

Consultar:

```bash
docker compose logs db
```

Comprobar:

- Variables del `.env`.
- Espacio en disco.
- Permisos de los volúmenes.
- Inicialización de los archivos SQL.
- Estado del contenedor.

Si se modificaron contraseñas después de crear el volumen, recordar que los valores internos de la base de datos no se actualizan automáticamente.

### 11.8 El seed falla

Consultar:

```bash
docker compose --profile demo logs seed-demo
```

El seed está diseñado para una instalación limpia.

Si ya existen datos, puede finalizar con un error de validación.

No debe ejecutarse repetidamente sobre la misma instalación.

### 11.9 Los cambios de GitHub no aparecen

Primero comprobar que los cambios se encuentran realmente publicados en `main`.

Después reconstruir el servicio correspondiente.

Para frontend:

```bash
docker compose build --no-cache frontend
docker compose up -d --no-deps frontend
```

Para backend:

```bash
docker compose build --no-cache backend
docker compose up -d --no-deps backend
```

Si siguen apareciendo recursos antiguos, actualizar el navegador con:

```text
Ctrl + Shift + R
```

También puede verificarse el commit incorporado en cada imagen utilizando `/etc/sigsm-commit`.

### 11.10 Cambié el esquema SQL, pero las tablas siguen iguales

Este comportamiento es normal si MariaDB ya tiene un volumen inicializado.

Los archivos de creación de tablas no se ejecutan nuevamente al reconstruir la imagen.

Para conservar los datos existentes es necesario utilizar migraciones SQL.

Para comenzar desde cero debe utilizarse una instalación nueva con volúmenes vacíos.

No debe ejecutarse `down -v` si se necesita conservar la información.

### 11.11 No aparecen los documentos PDF

Verificar:

- Que el volumen de documentos exista.
- Que esté montado correctamente.
- Que los archivos físicos estén presentes.
- Que Apache tenga permisos de lectura.
- Que las rutas registradas en la base de datos sean correctas.

Puede inspeccionarse el almacenamiento:

```bash
docker compose exec backend ls -la /var/www/api/storage
```

Si los documentos desaparecieron tras eliminar los volúmenes, será necesario restaurar el respaldo correspondiente.

### 11.12 Falló la descarga del repositorio durante el build

Los Dockerfiles necesitan conexión con GitHub.

Comprobar:

- Conexión a Internet.
- Disponibilidad del repositorio.
- Existencia de la rama `main`.
- Que los archivos necesarios estén publicados.

Volver a construir sin caché:

```bash
docker compose build --no-cache
```

---

## 12. Referencia rápida de comandos

Todos los comandos se ejecutan desde:

```text
prototipos/docker
```

### Instalación

```bash
# Instalación normal
docker compose up -d --build

# Instalación con datos de demostración
docker compose --profile demo up -d --build
```

### Estado y logs

```bash
# Ver servicios
docker compose ps

# Ver también contenedores finalizados
docker compose ps -a

# Ver logs generales
docker compose logs -f

# Ver logs del frontend
docker compose logs -f frontend

# Ver logs del backend
docker compose logs -f backend

# Ver logs de MariaDB
docker compose logs -f db

# Ver resultado del seed
docker compose --profile demo logs seed-demo
```

### Actualización desde GitHub

```bash
# Actualizar frontend
docker compose build --no-cache frontend
docker compose up -d --no-deps frontend

# Actualizar backend
docker compose build --no-cache backend
docker compose up -d --no-deps backend

# Actualizar frontend y backend
docker compose build --no-cache frontend backend
docker compose up -d --no-deps frontend backend

# Actualizar configuración local de Docker
git pull origin main

# Reconstruir todas las imágenes
docker compose build --no-cache

# Aplicar imágenes reconstruidas
docker compose up -d
```

### Administración

```bash
# Iniciar servicios existentes
docker compose up -d

# Detener servicios
docker compose stop

# Volver a iniciar
docker compose start

# Reiniciar todos
docker compose restart

# Reiniciar frontend
docker compose restart frontend

# Reiniciar backend
docker compose restart backend

# Detener y eliminar contenedores, conservando volúmenes
docker compose down
```

### Terminales

```bash
# Terminal del backend
docker compose exec backend bash

# Terminal del frontend
docker compose exec frontend sh

# Terminal de MariaDB
docker compose exec db sh
```

### Verificar commits

```bash
# Frontend
docker compose exec frontend cat /etc/sigsm-commit

# Backend
docker compose exec backend cat /etc/sigsm-commit

# Base de datos
docker compose exec db cat /etc/sigsm-commit
```

### Eliminar completamente una instalación de pruebas

**ADVERTENCIA: este comando borra los volúmenes persistentes del proyecto, incluidos los datos de MariaDB y los documentos.**

```bash
docker compose down -v
```

Utilizarlo únicamente cuando se quiera descartar toda la información y empezar desde cero.

---

## Información del proyecto

**Proyecto:** S.I.G.S.M. — Sistema Integrado de Gestión de Servicios Médicos.

**Empresa:** Empre S.A.S.

**Institución:** UTU.

**Repositorio:** https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU

**Directorio del despliegue:** `prototipos/docker`

**Tecnologías:**

- React.
- Vite.
- Material UI.
- PHP 8.2.
- Apache.
- MariaDB 11.4.
- Nginx.
- Docker.
- Docker Compose.

La configuración de Docker permite desplegar los componentes de S.I.G.S.M. de forma reproducible, manteniendo separados el frontend, el backend y la base de datos.

Para actualizar el sistema se recomienda reconstruir únicamente los servicios modificados, conservando los volúmenes persistentes y realizando respaldos antes de cualquier operación sobre la información almacenada.
