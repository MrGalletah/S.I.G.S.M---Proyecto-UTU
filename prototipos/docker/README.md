
# S.I.G.S.M. — Despliegue con Docker

Guía de instalación, configuración, ejecución y mantenimiento del **Sistema Integrado de Gestión de Servicios Médicos (S.I.G.S.M.)**, desarrollado por **Empre S.A.S.** como parte del proyecto académico de UTU.

Docker Compose permite desplegar la aplicación en otra computadora o servidor sin instalar manualmente PHP, Apache, Node.js, Nginx ni MariaDB.

> **Importante:** la configuración actual está orientada a entornos locales, académicos y de demostración. Para exponer la aplicación en Internet es necesario incorporar HTTPS y otras medidas de seguridad.

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
12. [Referencia rápida](#12-referencia-rápida)

---

## 1. Arquitectura del despliegue

La aplicación utiliza Docker Compose para administrar los servicios necesarios para su funcionamiento.

### 1.1 Servicios

| Servicio | Tecnología | Función |
|---|---|---|
| `frontend` | React, Vite y Nginx | Interfaz web y proxy de la API |
| `backend` | PHP 8.2 y Apache | API REST y lógica de negocio |
| `db` | MariaDB 11.4 | Base de datos |
| `admin-init` | PHP | Creación del administrador inicial |
| `seed-demo` | MariaDB | Carga opcional de datos ficticios |

Los servicios `frontend`, `backend` y `db` permanecen ejecutándose para mantener disponible la aplicación.

Los servicios `admin-init` y `seed-demo` son tareas puntuales que finalizan después de realizar sus operaciones.

### 1.2 Comunicación entre servicios

```text
                 USUARIO
                    |
                    v
              Navegador web
                    |
                    v
           FRONTEND - NGINX
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

Nginx sirve la aplicación React y redirige las peticiones `/api/` hacia el backend.

Apache ejecuta los endpoints PHP y se comunica con MariaDB mediante la red interna de Docker.

No es necesario publicar directamente los puertos de Apache ni MariaDB.

### 1.3 Volúmenes persistentes

La aplicación utiliza dos volúmenes:

| Volumen | Ruta en el contenedor | Contenido |
|---|---|---|
| `db_data` | `/var/lib/mysql` | Base de datos MariaDB |
| `docs_data` | `/var/www/api/storage` | Documentos y archivos |

Estos volúmenes permiten conservar los datos aunque los contenedores se detengan o reconstruyan.

Como el proyecto se denomina `sigsm`, Docker normalmente crea los volúmenes:

```text
sigsm_db_data
sigsm_docs_data
```

**Importante:** los volúmenes no deben eliminarse durante una actualización normal.

### 1.4 Estructura de archivos

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

Para instalar S.I.G.S.M. se necesita:

- Docker Engine o Docker Desktop.
- Docker Compose v2.
- Git.
- Conexión a Internet durante la construcción de las imágenes.
- Un puerto disponible para acceder a la aplicación.
- Espacio suficiente para imágenes, base de datos y documentos.

No es necesario instalar localmente PHP, Apache, Node.js, Nginx, MariaDB ni XAMPP.

### 2.1 Comprobar Docker

```bash
docker --version
```

Comprobar Docker Compose:

```bash
docker compose version
```

Comprobar que el motor funciona:

```bash
docker info
```

En Windows es necesario que Docker Desktop esté iniciado.

En Linux, el usuario debe tener permisos para utilizar Docker.

### 2.2 Comprobar Git

```bash
git --version
```

---

## 3. Obtener el proyecto

El código de S.I.G.S.M. está disponible en:

https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU

Existen dos alternativas para obtener los archivos necesarios.

### 3.1 Clonar el repositorio completo

Desde una terminal:

```bash
git clone https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU.git
```

Acceder a la carpeta Docker:

```bash
cd S.I.G.S.M---Proyecto-UTU/prototipos/docker
```

Este procedimiento descarga el repositorio completo, incluyendo frontend, backend, base de datos y documentación.

### 3.2 Clonar únicamente la carpeta Docker

Si solamente se desea instalar y ejecutar S.I.G.S.M., no es necesario descargar todo el código fuente del proyecto.

Git permite utilizar `sparse-checkout` para obtener únicamente los archivos necesarios para el despliegue.

**1. Clonar el repositorio en modo parcial:**

```bash
git clone --depth 1 --filter=blob:none --sparse --branch main https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU.git
```

**2. Entrar al repositorio:**

```bash
cd S.I.G.S.M---Proyecto-UTU
```

**3. Seleccionar únicamente la carpeta Docker:**

```bash
git sparse-checkout set prototipos/docker
```

**4. Acceder al directorio de despliegue:**

```bash
cd prototipos/docker
```

De esta manera, solamente se materializa la carpeta `prototipos/docker`, además de los archivos necesarios para el funcionamiento de Git.

No es necesario descargar localmente el frontend, el backend ni los esquemas SQL, ya que los Dockerfiles los obtienen automáticamente desde la rama `main` de GitHub durante la construcción.

Para actualizar posteriormente los archivos de configuración:

```bash
git pull origin main
```

Esta opción resulta especialmente útil para instalar S.I.G.S.M. en servidores destinados únicamente a ejecutar la aplicación.

### 3.3 Código utilizado durante la construcción

Los Dockerfiles descargan el código directamente desde `main`.

Por tanto:

- Las imágenes contienen el código publicado en GitHub durante su construcción.
- Los cambios locales no se incorporan automáticamente.
- Para actualizar el código es necesario publicarlo en `main` y reconstruir las imágenes afectadas.
- Reiniciar un contenedor no descarga código nuevo.

**A partir de este momento, todos los comandos de Docker Compose deben ejecutarse desde `prototipos/docker`, salvo que se indique lo contrario.**

---

## 4. Configurar las variables de entorno

Antes de ejecutar la aplicación debe crearse un archivo `.env`.

### 4.1 Crear el archivo

En Linux o macOS:

```bash
cp .env.example .env
```

En Windows con PowerShell:

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
| `DB_PASSWORD` | Contraseña del usuario de la base |
| `MARIADB_ROOT_PASSWORD` | Contraseña del administrador de MariaDB |
| `ADMIN_NAME` | Nombre del administrador inicial |
| `ADMIN_EMAIL` | Correo utilizado para iniciar sesión |
| `ADMIN_PASSWORD` | Contraseña inicial del administrador |

El puerto predeterminado es `8080`.

La contraseña del administrador inicial debe tener **al menos 12 caracteres**.

### 4.4 Diferencia entre credenciales

**Usuario de MariaDB**

Se utiliza internamente para conectar la API con la base de datos.

```dotenv
DB_USER=sigsm_app
DB_PASSWORD=...
```

**Administrador de S.I.G.S.M.**

Es el usuario que inicia sesión desde la aplicación web.

```dotenv
ADMIN_NAME=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Las credenciales de MariaDB no deben utilizarse para iniciar sesión en la aplicación.

### 4.5 Seguridad

El archivo `.env` contiene contraseñas y no debe compartirse.

Se recomienda:

- Utilizar contraseñas largas y diferentes.
- No subir `.env` a GitHub.
- No compartir capturas con credenciales.
- Mantener una copia segura de las contraseñas.
- Evitar utilizar credenciales predeterminadas.

Modificar `ADMIN_PASSWORD` después de crear el administrador **no cambia automáticamente su contraseña en la base de datos**.

De igual forma, modificar las credenciales de MariaDB en `.env` no actualiza automáticamente las de una base ya inicializada.

### 4.6 Validar la configuración

```bash
docker compose config --quiet
```

Este comando comprueba la configuración de Docker Compose y las variables necesarias sin imprimir sus valores.

---

## 5. Instalación inicial

Existen dos modalidades:

1. Instalación normal, sin datos de demostración.
2. Instalación con información ficticia para pruebas.

### 5.1 Instalación normal

```bash
docker compose up -d --build
```

Este comando:

1. Construye las imágenes necesarias.
2. Crea la red interna del proyecto.
3. Inicializa MariaDB.
4. Ejecuta los scripts SQL.
5. Crea el administrador inicial.
6. Inicia Apache y PHP.
7. Inicia Nginx y el frontend.

La opción `-d` ejecuta los servicios en segundo plano.

La opción `--build` construye las imágenes antes de iniciar los contenedores.

### 5.2 Inicialización de la base de datos

En una instalación nueva, MariaDB ejecuta automáticamente:

```text
dbSchema_01.sql
dbSchema_02.sql
dbSchema_03.sql
dbSchema_04.sql
```

Los archivos se obtienen de GitHub durante la construcción.

Se ejecutan en orden y crean las tablas, relaciones, restricciones y catálogos necesarios.

**Los scripts solamente se ejecutan automáticamente cuando el volumen de MariaDB está vacío.**

Si la base ya existe, reconstruir su imagen no vuelve a crear las tablas.

### 5.3 Creación del administrador

El servicio `admin-init` se ejecuta después de que MariaDB esté disponible.

Su función es:

- Comprobar que existe el rol `Administrador`.
- Comprobar si el funcionario ya existe.
- Crear el administrador inicial si todavía no existe.
- Generar el hash de su contraseña.
- Asignarle el rol de administrador.

Si ya existe un administrador con el mismo correo y rol, el servicio no modifica su contraseña.

Una vez terminado, `admin-init` finaliza.

### 5.4 Instalación con datos de demostración

Para una instalación nueva con datos ficticios:

```bash
docker compose --profile demo up -d --build
```

El perfil `demo` activa el servicio adicional `seed-demo`.

Este servicio espera a que MariaDB esté disponible y que el administrador inicial se haya creado correctamente.

Después ejecuta el archivo:

```text
prototipos/backend/database/data/seedDemo.sql
```

### 5.5 Datos generados por el seed

| Entidad | Cantidad |
|---|---:|
| Funcionarios, incluido el administrador | 80 |
| Asignaciones de roles | 150 |
| Vehículos | 35 |
| Categorías | 20 |
| Traslados | 2000 |
| Encuestas | 30 |
| Preguntas | 200 |
| Opciones de respuesta | 600 |
| Formularios respondidos | 5000 |

**Distribución de traslados:**

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

### 5.6 Verificar el seed

```bash
docker compose --profile demo logs seed-demo
```

Si terminó correctamente debe aparecer:

```text
Seed de demostracion cargado correctamente.
```

También puede consultarse:

```bash
docker compose --profile demo ps -a
```

Es normal que `seed-demo` y `admin-init` aparezcan con estado `Exited (0)`.

Son procesos diseñados para ejecutarse una vez y finalizar.

### 5.7 Advertencia sobre el seed

El seed está diseñado para una instalación limpia.

Comprueba que:

- Solo exista el administrador inicial.
- No existan traslados anteriores.
- No existan encuestas anteriores.
- No existan categorías añadidas.
- No existan documentos previos.

Si ya existe información, interrumpe su ejecución para evitar mezclar datos.

**No debe ejecutarse repetidamente sobre una instalación en uso.**

Para arrancar normalmente una instalación que ya tiene datos:

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

Para incluir los contenedores que finalizaron:

```bash
docker compose ps -a
```

Los servicios principales deben encontrarse en ejecución.

MariaDB debe indicar un estado saludable cuando complete correctamente su comprobación de disponibilidad.

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

Para salir de los logs en tiempo real, utilizar `Ctrl + C`.

Esto no detiene los contenedores.

### 6.3 Acceder a la aplicación

Abrir en el navegador:

```text
http://localhost:8080
```

Si se configuró otro `WEB_PORT`, utilizar el puerto correspondiente.

Por ejemplo:

```dotenv
WEB_PORT=8090
```

La dirección será:

```text
http://localhost:8090
```

### 6.4 Iniciar sesión

Utilizar el correo y la contraseña definidos en `.env`:

```dotenv
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

El administrador tiene acceso a las funcionalidades correspondientes a su rol.

### 6.5 Comprobar los datos de demostración

Abrir una terminal SQL dentro de MariaDB:

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

En una instalación demo limpia, los códigos `TR-01981` y `TR-01995` corresponden a ejemplos de cancelaciones con y sin recursos asignados, respectivamente, siempre que los identificadores comiencen en 1.

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

---

## 7. Comandos de administración

Los siguientes comandos permiten administrar los servicios de Docker durante el uso habitual.

### 7.1 Iniciar la aplicación

```bash
docker compose up -d
```

### 7.2 Detener los servicios

```bash
docker compose stop
```

Detiene los contenedores sin eliminarlos.

### 7.3 Volver a iniciarlos

```bash
docker compose start
```

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

Contenedores activos:

```bash
docker ps
```

Todos los contenedores:

```bash
docker ps -a
```

Consumo de recursos:

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

Para salir:

```bash
exit
```

### 7.9 Eliminar contenedores sin perder datos

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

Después de publicar cambios en GitHub, es necesario reconstruir los servicios afectados.

### 8.1 Actualizar solamente el frontend

Si se modificó React, Material UI, estilos o traducciones:

```bash
docker compose build --no-cache frontend
```

Recrear el contenedor:

```bash
docker compose up -d --no-deps frontend
```

El parámetro `--no-deps` evita iniciar o recrear deliberadamente las dependencias del servicio.

No es necesario reconstruir el backend ni MariaDB.

### 8.2 Actualizar solamente el backend

Si se modificaron endpoints, servicios o lógica PHP:

```bash
docker compose build --no-cache backend
```

Recrear el contenedor:

```bash
docker compose up -d --no-deps backend
```

Los datos persistentes se conservan.

### 8.3 Actualizar frontend y backend

```bash
docker compose build --no-cache frontend backend
```

Después:

```bash
docker compose up -d --no-deps frontend backend
```

### 8.4 Actualizar la configuración de Docker

Si se modificaron `compose.yaml`, los Dockerfiles o sus archivos auxiliares:

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

**Atención:** reconstruir la imagen de MariaDB no vuelve a ejecutar los scripts SQL sobre una base existente.

### 8.6 Cambios en la estructura de la base de datos

Si se modifican tablas, columnas, restricciones o índices, hay que distinguir dos situaciones.

**Instalación nueva**

Los archivos SQL actualizados se ejecutan durante la inicialización.

**Instalación existente**

Los cambios deben aplicarse mediante scripts de migración apropiados.

Se recomienda:

1. Crear un respaldo.
2. Preparar la migración.
3. Probarla sobre una copia.
4. Aplicarla a la instalación correspondiente.
5. Verificar los resultados.

No deben ejecutarse todos los scripts de creación directamente sobre una base ya poblada.

### 8.7 Reconstrucción completa

```bash
docker compose build --no-cache
```

Después:

```bash
docker compose up -d
```

Los volúmenes persistentes se conservan.

### 8.8 Diferencia entre reiniciar y reconstruir

| Comando | Incorpora código nuevo |
|---|---|
| `docker compose restart frontend` | No |
| `docker compose up -d` | No, salvo que cambie la imagen utilizada |
| `docker compose build frontend` | Reconstruye, pero puede utilizar caché |
| `docker compose build --no-cache frontend` | Reconstruye desde el código actual de `main` |

Después de reconstruir una imagen es necesario recrear su contenedor para utilizarla.

---

## 9. Persistencia y respaldos

### 9.1 Información persistente

La información más importante se encuentra en dos ubicaciones.

**MariaDB**

Contiene:

- Funcionarios y roles.
- Categorías.
- Documentos registrados.
- Encuestas y respuestas.
- Vehículos.
- Traslados.
- Historial de estados.

**Almacenamiento de documentos**

Contiene los archivos físicos almacenados por la aplicación, especialmente los PDF.

Para recuperar completamente el sistema es necesario conservar ambos elementos.

### 9.2 Consultar los volúmenes

```bash
docker volume ls
```

Normalmente aparecen:

```text
sigsm_db_data
sigsm_docs_data
```

### 9.3 Crear un respaldo de MariaDB

El respaldo se genera dentro del contenedor y después se copia al equipo anfitrión.

**1. Crear el volcado SQL:**

```bash
docker compose exec db sh -c 'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" mariadb-dump -uroot --single-transaction --quick --routines --triggers sigsm > /tmp/sigsm_backup.sql'
```

**2. Copiarlo al equipo anfitrión:**

```bash
docker compose cp db:/tmp/sigsm_backup.sql ./sigsm_backup.sql
```

**3. Eliminar el temporal:**

```bash
docker compose exec db rm /tmp/sigsm_backup.sql
```

El resultado será:

```text
sigsm_backup.sql
```

Se recomienda almacenar el archivo fuera del directorio de despliegue y protegerlo adecuadamente.

### 9.4 Respaldar documentos

Crear una carpeta:

```bash
mkdir storage_backup
```

Copiar los documentos:

```bash
docker compose cp backend:/var/www/api/storage/. ./storage_backup/
```

La carpeta contendrá los archivos persistentes de la aplicación.

### 9.5 Restaurar la base de datos

**Advertencia:** restaurar un archivo SQL puede sobrescribir información de la base de destino.

Debe realizarse sobre un entorno preparado para restauración y con una copia previa de cualquier información que se necesite conservar.

Copiar el respaldo al contenedor:

```bash
docker compose cp ./sigsm_backup.sql db:/tmp/sigsm_backup.sql
```

Importarlo:

```bash
docker compose exec db sh -c 'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" mariadb -uroot sigsm < /tmp/sigsm_backup.sql'
```

Eliminar el temporal:

```bash
docker compose exec db rm /tmp/sigsm_backup.sql
```

La base `sigsm` debe existir antes de importar.

### 9.6 Restaurar documentos

Copiar los archivos:

```bash
docker compose cp ./storage_backup/. backend:/var/www/api/storage/
```

Corregir permisos:

```bash
docker compose exec -u root backend chown -R www-data:www-data /var/www/api/storage
```

Después comprobar desde la aplicación que los PDF pueden visualizarse y descargarse.

### 9.7 Política recomendada de respaldos

Se recomienda:

- Realizar respaldos periódicos.
- Mantener copias fuera del servidor.
- Conservar varias versiones.
- Proteger los archivos.
- Verificar que pueden restaurarse.
- Respaldar conjuntamente la base de datos y los documentos.

Los comandos anteriores son manuales.

El despliegue actual de Docker no incorpora un servicio que programe respaldos automáticamente.

### 9.8 Reiniciar la instalación desde cero

Para eliminar los contenedores conservando los datos:

```bash
docker compose down
```

Para eliminar también los volúmenes:

```bash
docker compose down -v
```

**ADVERTENCIA: `down -v` elimina la base de datos y los documentos persistentes del proyecto.**

Solo debe utilizarse cuando se quiera descartar completamente una instalación de pruebas o cuando exista un respaldo verificado.

Para crear una demo nueva después de eliminar los volúmenes:

```bash
docker compose --profile demo up -d --build
```

No es necesario eliminar los volúmenes para actualizar frontend o backend.

---

## 10. Acceso desde otros equipos

### 10.1 Acceso local

Por defecto:

```text
http://localhost:8080
```

### 10.2 Acceso desde la red local

Docker publica el frontend mediante:

```yaml
ports:
  - "${WEB_PORT:-8080}:80"
```

Esto permite acceder desde otro equipo utilizando la IP del servidor, siempre que el firewall y la red permitan la conexión.

Ejemplo:

```text
http://192.168.1.100:8080
```

Sustituir la IP por la dirección real del equipo donde se ejecuta Docker.

### 10.3 Cambiar el puerto

Editar `.env`:

```dotenv
WEB_PORT=8090
```

Recrear el frontend:

```bash
docker compose up -d --no-deps frontend
```

La nueva dirección será:

```text
http://localhost:8090
```

### 10.4 Firewall

Para permitir conexiones desde otros equipos es necesario que el firewall autorice el puerto configurado.

Por seguridad, conviene limitar el acceso a las redes o dispositivos autorizados.

No es necesario publicar el puerto `3306` de MariaDB.

Tampoco es necesario publicar Apache directamente.

### 10.5 Acceso desde Internet

La configuración actual utiliza HTTP.

Por tanto, no debe exponerse directamente a Internet para utilizar cuentas reales o información sensible.

Para un despliegue remoto se recomienda:

- HTTPS.
- Un proxy inverso o túnel seguro.
- Restricciones de acceso.
- Contraseñas robustas.
- Firewall configurado.
- Copias de seguridad.
- Actualizaciones periódicas.

El despliegue público seguro requiere configuración adicional.

### 10.6 Restringir acceso al equipo anfitrión

Si solo se desea utilizar la aplicación desde el servidor, puede cambiarse `compose.yaml`:

```yaml
ports:
  - "127.0.0.1:${WEB_PORT:-8080}:80"
```

Así el puerto se publica únicamente en la interfaz local.

---

## 11. Resolución de problemas

### 11.1 Docker no inicia

Comprobar:

```bash
docker info
```

En Windows, verificar que Docker Desktop esté ejecutándose.

En Linux, verificar el servicio Docker y los permisos del usuario.

### 11.2 El puerto 8080 está ocupado

Cambiar el valor en `.env`:

```dotenv
WEB_PORT=8090
```

Después:

```bash
docker compose up -d --no-deps frontend
```

### 11.3 La aplicación no abre

Consultar:

```bash
docker compose ps
```

Revisar logs:

```bash
docker compose logs --tail=100 frontend
```

```bash
docker compose logs --tail=100 backend
```

Comprobar que el puerto coincide con la URL utilizada.

### 11.4 La API devuelve un error 502

Un error `502 Bad Gateway` puede indicar que Nginx no consigue comunicarse con Apache.

Comprobar:

```bash
docker compose ps
```

```bash
docker compose logs -f backend
```

Verificar que el backend está ejecutándose y conectado a la red interna.

### 11.5 No se puede iniciar sesión

Comprobar:

- Correo y contraseña.
- Estado del backend.
- Conexión a MariaDB.
- Resultado de `admin-init`.

```bash
docker compose logs admin-init
```

Modificar `ADMIN_PASSWORD` en `.env` no actualiza automáticamente una cuenta existente.

### 11.6 El administrador inicial no se crea

Consultar:

```bash
docker compose logs admin-init
```

Verificar que:

- El correo sea válido.
- La contraseña tenga al menos 12 caracteres.
- MariaDB esté disponible.
- Exista el rol `Administrador`.

### 11.7 MariaDB no está saludable

Consultar:

```bash
docker compose logs db
```

Comprobar variables de entorno, espacio en disco, permisos de volúmenes e inicialización de los archivos SQL.

Si se cambiaron contraseñas después de crear el volumen, recordar que no se actualizan automáticamente.

### 11.8 El seed falla

```bash
docker compose --profile demo logs seed-demo
```

El seed está diseñado para una instalación limpia.

Si ya existen datos, puede finalizar con un error de validación.

No debe ejecutarse repetidamente sobre la misma instalación.

### 11.9 Los cambios de GitHub no aparecen

Comprobar que los cambios estén publicados en `main`.

Para el frontend:

```bash
docker compose build --no-cache frontend
docker compose up -d --no-deps frontend
```

Para el backend:

```bash
docker compose build --no-cache backend
docker compose up -d --no-deps backend
```

Si persisten recursos antiguos, actualizar el navegador con `Ctrl + Shift + R`.

También puede verificarse el commit incorporado mediante `/etc/sigsm-commit`.

### 11.10 Cambié el esquema SQL, pero las tablas siguen iguales

Este comportamiento es normal si MariaDB ya tiene un volumen inicializado.

Los scripts de creación no vuelven a ejecutarse al reconstruir la imagen.

Para modificar una base existente deben utilizarse migraciones SQL.

No debe ejecutarse `down -v` si es necesario conservar la información.

### 11.11 No aparecen los documentos PDF

Verificar:

- Que el volumen de documentos exista.
- Que esté montado correctamente.
- Que los archivos físicos estén presentes.
- Que Apache tenga permisos adecuados.
- Que las rutas registradas en MariaDB sean correctas.

Inspeccionar el almacenamiento:

```bash
docker compose exec backend ls -la /var/www/api/storage
```

Si los documentos desaparecieron por eliminar los volúmenes, será necesario restaurar el respaldo.

### 11.12 Falló la descarga de GitHub durante el build

Los Dockerfiles necesitan conexión con GitHub.

Comprobar:

- Conexión a Internet.
- Disponibilidad del repositorio.
- Existencia de `main`.
- Que los archivos necesarios estén publicados.

Volver a construir sin caché:

```bash
docker compose build --no-cache
```

---

## 12. Referencia rápida

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

# Logs generales
docker compose logs -f

# Logs del frontend
docker compose logs -f frontend

# Logs del backend
docker compose logs -f backend

# Logs de MariaDB
docker compose logs -f db

# Resultado del seed
docker compose --profile demo logs seed-demo
```

### Actualización

```bash
# Actualizar solamente frontend
docker compose build --no-cache frontend
docker compose up -d --no-deps frontend

# Actualizar solamente backend
docker compose build --no-cache backend
docker compose up -d --no-deps backend

# Actualizar frontend y backend
docker compose build --no-cache frontend backend
docker compose up -d --no-deps frontend backend

# Actualizar configuración local
git pull origin main

# Reconstruir todas las imágenes
docker compose build --no-cache

# Aplicar imágenes reconstruidas
docker compose up -d
```

### Administración

```bash
# Iniciar
docker compose up -d

# Detener
docker compose stop

# Volver a iniciar
docker compose start

# Reiniciar
docker compose restart

# Reiniciar frontend
docker compose restart frontend

# Reiniciar backend
docker compose restart backend

# Eliminar contenedores conservando datos
docker compose down
```

### Terminales

```bash
# Backend
docker compose exec backend bash

# Frontend
docker compose exec frontend sh

# MariaDB
docker compose exec db sh
```

### Verificar versiones

```bash
# Frontend
docker compose exec frontend cat /etc/sigsm-commit

# Backend
docker compose exec backend cat /etc/sigsm-commit

# Base de datos
docker compose exec db cat /etc/sigsm-commit
```

### Eliminar completamente una instalación de pruebas

**ADVERTENCIA: el siguiente comando elimina los volúmenes persistentes del proyecto, incluidos MariaDB y los documentos.**

```bash
docker compose down -v
```

Utilizarlo únicamente cuando se quiera descartar toda la información.

---

## Información del proyecto

**Proyecto:** S.I.G.S.M. — Sistema Integrado de Gestión de Servicios Médicos.

**Empresa:** Empre S.A.S.

**Institución:** UTU.

**Repositorio:** https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU

**Directorio del despliegue:** `prototipos/docker`

**Tecnologías utilizadas:**

- React y Vite.
- Material UI.
- PHP 8.2.
- Apache.
- MariaDB 11.4.
- Nginx.
- Docker.
- Docker Compose.

La configuración permite desplegar los componentes de S.I.G.S.M. de forma reproducible, manteniendo separados el frontend, el backend y la base de datos.

Para actualizar el sistema se recomienda reconstruir únicamente los servicios modificados, conservar los volúmenes persistentes y realizar respaldos antes de cualquier operación importante sobre la información almacenada.
