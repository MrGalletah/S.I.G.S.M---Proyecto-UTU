
# S.I.G.S.M. — Backend

Backend del **Sistema Integrado de Gestión de Servicios Médicos (S.I.G.S.M.)**, desarrollado por **Empre S.A.S.** como parte del proyecto académico de UTU.

El backend proporciona una API REST encargada de recibir las solicitudes del frontend, validar la información, aplicar las reglas de negocio, controlar la autenticación y gestionar la información almacenada en MariaDB.

El proyecto está desarrollado en PHP y organizado en módulos para facilitar su mantenimiento y ampliación.

---

## 1. Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| PHP 8.2 | Desarrollo de la API |
| MariaDB | Sistema gestor de base de datos |
| PDO | Acceso a MariaDB mediante consultas preparadas |
| Apache | Servidor HTTP |
| XAMPP | Entorno de desarrollo en GNU/Linux |
| Docker | Contenedorización y despliegue |
| Docker Compose | Administración de servicios |
| JSON | Formato principal de intercambio de datos |

La API no utiliza un framework PHP.

Su arquitectura se basa en archivos independientes para configuración, endpoints, servicios, handlers, middleware y utilidades.

---

## 2. Arquitectura del backend

El backend funciona mediante una API REST.

El flujo general de una solicitud es:

```text
              FRONTEND
                 |
                 v
            HTTP / JSON
                 |
                 v
          ENDPOINT PÚBLICO
                 |
                 v
       AUTENTICACIÓN Y ROLES
                 |
                 v
         HANDLER / SERVICIO
                 |
                 v
            PDO / SQL
                 |
                 v
              MARIADB
                 |
                 v
          RESPUESTA JSON
```

No todas las operaciones necesitan atravesar exactamente las mismas capas.

Algunos endpoints realizan operaciones sencillas directamente, mientras que otros delegan en handlers y servicios especializados.

Esta separación permite organizar las responsabilidades de los diferentes módulos.

### 2.1 Responsabilidades principales

**Endpoints**

Reciben las solicitudes HTTP y determinan qué operación debe ejecutarse.

**Handlers**

Coordinan las operaciones asociadas a determinadas solicitudes.

**Servicios**

Contienen lógica de negocio, consultas y validaciones relacionadas con un módulo.

**Middleware**

Comprueba que el usuario esté autenticado y tenga los roles necesarios.

**Utilidades**

Proporcionan funciones reutilizables para validaciones, respuestas JSON y manejo de archivos.

**Configuración**

Gestiona la conexión a MariaDB, las variables de entorno y las sesiones.

---

## 3. Estructura del proyecto

```text
backend/
├── api/
│   ├── config/
│   │   ├── Database.php
│   │   ├── loadEnv.php
│   │   └── session.php
│   │
│   ├── handlers/
│   │   ├── surveys/
│   │   └── transfers/
│   │
│   ├── middleware/
│   │   ├── requireAuth.php
│   │   └── requireRole.php
│   │
│   ├── public/
│   │   ├── access/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── documents/
│   │   ├── surveys/
│   │   ├── transfers/
│   │   ├── users/
│   │   └── vehicles/
│   │
│   ├── services/
│   ├── storage/
│   │   └── documents/
│   ├── tests/
│   ├── utils/
│   │
│   ├── .env.example
│   └── .gitignore
│
├── database/
│   ├── data/
│   │   └── seedDemo.sql
│   │
│   ├── dbSchema_01.sql
│   ├── dbSchema_02.sql
│   ├── dbSchema_03.sql
│   └── dbSchema_04.sql
│
└── README.md
```

### 3.1 config

Incluye los archivos de configuración.

- `Database.php`: conexión con MariaDB mediante PDO.
- `loadEnv.php`: lectura de variables de entorno.
- `session.php`: configuración de sesiones PHP.

### 3.2 public

Contiene los endpoints accesibles mediante HTTP.

Los archivos están organizados según el módulo.

El directorio `public` debe utilizarse como raíz del servidor web para evitar exponer archivos internos de configuración y servicios.

### 3.3 handlers

Contiene funciones que coordinan operaciones HTTP de módulos como encuestas y traslados.

Permite mantener los endpoints más reducidos.

### 3.4 services

Contiene la lógica de negocio.

Por ejemplo, el módulo de traslados utiliza servicios para consultar solicitudes, asignar recursos, controlar la disponibilidad, actualizar estados y gestionar cancelaciones.

### 3.5 middleware

Incluye las comprobaciones de autenticación y autorización utilizadas por los endpoints.

### 3.6 utils

Contiene herramientas compartidas para:

- Generar respuestas JSON.
- Leer cuerpos de peticiones JSON.
- Validar datos.
- Gestionar archivos de documentos.

### 3.7 storage

Almacena los archivos físicos utilizados por la aplicación.

Actualmente incluye el directorio de documentos PDF.

Este almacenamiento debe conservarse junto con la base de datos durante los respaldos.

### 3.8 database

Contiene los scripts SQL necesarios para crear la estructura de MariaDB y cargar datos de demostración.

---

## 4. Requisitos previos

Existen dos modalidades principales de ejecución.

### 4.1 Desarrollo con XAMPP

Se necesita:

- GNU/Linux o una máquina virtual GNU/Linux.
- XAMPP con PHP y MariaDB.
- PHP compatible con la versión utilizada por el proyecto.
- Extensiones PHP necesarias, especialmente PDO MySQL y mbstring.
- Git.
- Acceso de red entre frontend y backend.

El entorno original de desarrollo utiliza una máquina virtual GNU/Linux con XAMPP.

### 4.2 Ejecución mediante Docker

Se necesita:

- Docker Engine o Docker Desktop.
- Docker Compose v2.
- Git.
- Conexión a Internet durante la construcción.

Docker proporciona PHP, Apache y MariaDB sin necesidad de instalarlos directamente en el sistema anfitrión.

La documentación específica se encuentra en:

```text
prototipos/docker/README.md
```

**Se recomienda Docker para instalar el sistema completo en otro equipo.**

---

## 5. Obtener el proyecto

Clonar el repositorio:

```bash
git clone https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU.git
```

Acceder al backend:

```bash
cd S.I.G.S.M---Proyecto-UTU/prototipos/backend
```

Desde esta ubicación se puede acceder tanto a la API como a los esquemas de la base de datos.

El repositorio está disponible en:

https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU

---

## 6. Preparación de MariaDB

Esta sección describe la instalación manual utilizada durante el desarrollo.

Para Docker, la creación de la base de datos es automática durante la inicialización.

### 6.1 Iniciar XAMPP

En la máquina virtual:

```bash
sudo /opt/lampp/lampp start
```

Comprobar su estado:

```bash
sudo /opt/lampp/lampp status
```

Apache y MariaDB deben aparecer disponibles.

### 6.2 Acceder a MariaDB

```bash
/opt/lampp/bin/mysql -u root -p
```

Si el usuario `root` no tiene contraseña, puede utilizarse:

```bash
/opt/lampp/bin/mysql -u root
```

### 6.3 Crear las tablas

Desde `prototipos/backend`, ejecutar los cuatro scripts SQL **en orden**.

```bash
/opt/lampp/bin/mysql -u root -p < database/dbSchema_01.sql
```

```bash
/opt/lampp/bin/mysql -u root -p < database/dbSchema_02.sql
```

```bash
/opt/lampp/bin/mysql -u root -p < database/dbSchema_03.sql
```

```bash
/opt/lampp/bin/mysql -u root -p < database/dbSchema_04.sql
```

El primer esquema crea la base de datos `sigsm`.

Los siguientes incorporan las tablas y relaciones correspondientes a los distintos módulos.

### 6.4 Contenido de los esquemas

| Archivo | Contenido |
|---|---|
| `dbSchema_01.sql` | Funcionarios, roles y asignaciones |
| `dbSchema_02.sql` | Categorías y documentos |
| `dbSchema_03.sql` | Vehículos, traslados, recursos y estados |
| `dbSchema_04.sql` | Encuestas, preguntas y respuestas |

Estos scripts también incorporan claves primarias, claves foráneas, restricciones e índices.

### 6.5 Verificar la base de datos

Acceder a MariaDB y ejecutar:

```sql
SHOW DATABASES;
```

Seleccionar la base:

```sql
USE sigsm;
```

Mostrar las tablas:

```sql
SHOW TABLES;
```

Consultar una estructura concreta:

```sql
DESCRIBE funcionario;
```

Comprobar los estados de traslado:

```sql
SELECT
    id_estado,
    nombre,
    orden
FROM estado_traslado
ORDER BY orden;
```

Debe incluir el estado `Cancelado`, además de los estados utilizados durante el seguimiento.

### 6.6 Creación mediante phpMyAdmin

También pueden importarse los esquemas desde phpMyAdmin.

Pasos:

1. Iniciar XAMPP.
2. Acceder a phpMyAdmin.
3. Abrir la pestaña de importación.
4. Seleccionar el archivo SQL.
5. Ejecutarlo.
6. Repetir el procedimiento con los cuatro esquemas en orden.

La URL depende de la configuración de XAMPP.

En el entorno de desarrollo puede ser:

```text
http://192.168.56.10/phpmyadmin
```

El acceso remoto a phpMyAdmin puede estar restringido por razones de seguridad.

No es necesario habilitarlo públicamente para utilizar la API.

---

## 7. Configurar la conexión del backend

### 7.1 Crear el archivo .env

Entrar en el directorio de la API:

```bash
cd api
```

Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

Contenido de referencia:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sigsm
DB_USER=sigsm_app
DB_PASSWORD=REEMPLAZAR_CON_CONTRASENA_SEGURA
```

La contraseña debe coincidir con la configurada para el usuario de MariaDB.

**No debe subirse el archivo `.env` al repositorio.**

### 7.2 Crear un usuario para la API

Es recomendable no utilizar directamente el usuario `root` para las operaciones de la aplicación.

Desde MariaDB, con privilegios administrativos:

```sql
CREATE USER IF NOT EXISTS 'sigsm_app'@'127.0.0.1'
IDENTIFIED BY 'REEMPLAZAR_CON_CONTRASENA_SEGURA';

GRANT SELECT, INSERT, UPDATE, DELETE
ON sigsm.*
TO 'sigsm_app'@'127.0.0.1';
```

Las credenciales deben coincidir con el archivo `.env`.

Estos permisos corresponden a las operaciones habituales de la aplicación. La creación de tablas y otras tareas administrativas deben realizarse con una cuenta con privilegios apropiados.

### 7.3 Funcionamiento de Database.php

La conexión se encuentra centralizada en:

```text
api/config/Database.php
```

Utiliza PDO para establecer una conexión con MariaDB.

La configuración se obtiene a partir de las variables de entorno.

Se utilizan consultas preparadas para separar los parámetros de los comandos SQL.

Esto facilita la validación y reduce el riesgo de inyección SQL cuando las consultas se construyen correctamente.

---

## 8. Administrador inicial

Para utilizar las funcionalidades privadas se necesita al menos un funcionario activo con el rol `Administrador`.

### 8.1 Instalación Docker

El despliegue Docker incorpora el servicio:

```text
admin-init
```

Este servicio crea el administrador inicial utilizando las variables:

```dotenv
ADMIN_NAME=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

La contraseña se almacena mediante un hash generado con `password_hash()`.

No se guarda directamente en texto plano en la base de datos.

### 8.2 Instalación manual

Si se utiliza XAMPP y una base completamente nueva, el administrador debe crearse antes de utilizar la interfaz privada o cargar el seed de demostración.

Para generar un hash mediante PHP:

```bash
/opt/lampp/bin/php -r '$p = trim(fgets(STDIN)); echo password_hash($p, PASSWORD_DEFAULT), PHP_EOL;'
```

Introducir la contraseña cuando el comando solicite entrada por la terminal.

Después, desde MariaDB:

```sql
INSERT INTO funcionario (
    nombre,
    correo,
    pwd_hash,
    activo
)
VALUES (
    'Administrador Inicial',
    'admin@ejemplo.test',
    'PEGAR_HASH_GENERADO',
    TRUE
);
```

Asignar el rol:

```sql
INSERT INTO rol_usuario (
    id_func,
    id_rol
)
SELECT
    f.id_func,
    r.id_rol
FROM funcionario f
JOIN rol r
    ON r.nombre = 'Administrador'
WHERE f.correo = 'admin@ejemplo.test';
```

Este procedimiento está destinado a una instalación nueva de desarrollo.

No debe repetirse si ya existe el administrador.

---

## 9. Ejecutar la API en desarrollo

### 9.1 Servidor PHP integrado

La API puede ejecutarse utilizando el servidor integrado de PHP.

Desde `prototipos/backend/api`:

```bash
/opt/lampp/bin/php -S 0.0.0.0:8080 -t public
```

Este comando:

- Inicia un servidor HTTP en el puerto `8080`.
- Utiliza `public` como raíz.
- Permite conexiones desde otras interfaces de red de la máquina virtual.

Para ejecutar únicamente desde la computadora local puede utilizarse:

```bash
/opt/lampp/bin/php -S 127.0.0.1:8080 -t public
```

El servidor integrado de PHP está destinado al desarrollo y las pruebas.

**No debe utilizarse como servidor de producción expuesto a Internet.**

### 9.2 Acceder a los endpoints

Desde la máquina que ejecuta PHP:

```text
http://127.0.0.1:8080/auth/login.php
```

Desde el equipo anfitrión, cuando la API está ejecutándose en la máquina virtual:

```text
http://192.168.56.10:8080/auth/login.php
```

La dirección debe adaptarse a la IP real del servidor.

### 9.3 Conexión con Vite

El frontend utiliza un proxy de desarrollo.

Por ejemplo:

```text
Frontend: http://localhost:5173
Backend:  http://192.168.56.10:8080
```

La ruta utilizada en React:

```text
/api/auth/login.php
```

Se redirige a:

```text
http://192.168.56.10:8080/auth/login.php
```

La reescritura se configura en el archivo `vite.config.js` del frontend.

### 9.4 Detener el servidor

Para detener el servidor PHP integrado, utilizar:

```text
Ctrl + C
```

en la terminal donde se está ejecutando.

---

## 10. Autenticación y autorización

### 10.1 Autenticación

El backend utiliza sesiones PHP.

Las operaciones principales son:

| Método | Endpoint | Función |
|---|---|---|
| `POST` | `/auth/login.php` | Iniciar sesión |
| `GET` | `/auth/me.php` | Consultar sesión actual |
| `POST` | `/auth/logout.php` | Cerrar sesión |
| `POST` | `/auth/register.php` | Solicitar registro |

El registro genera inicialmente una cuenta inactiva.

Un administrador debe gestionar la solicitud de acceso y asignar los roles correspondientes antes de permitir su utilización.

### 10.2 Sesiones

La configuración está implementada en:

```text
api/config/session.php
```

La cookie de sesión se denomina:

```text
sigsm_session
```

Se configura con:

- `HttpOnly`.
- `SameSite=Lax`.
- Ruta `/`.
- Duración de sesión.

La configuración de desarrollo utiliza `secure = false`, por lo que debe revisarse antes de publicar la aplicación mediante HTTPS.

### 10.3 Middleware

Los archivos principales son:

```text
middleware/requireAuth.php
middleware/requireRole.php
```

`requireAuth` comprueba que exista una sesión válida.

`requireRole` comprueba que el funcionario tenga alguno de los roles requeridos por la operación.

Los permisos se verifican en el backend, independientemente de las restricciones visuales del frontend.

### 10.4 Roles

El esquema inicial incorpora:

- Administrador.
- Gestor de documentación.
- Solicitante de traslado.
- Gestor de traslados.
- Conductor.
- Enfermero.
- Médico.
- Administrativo.

Un mismo funcionario puede tener varios roles mediante la tabla `rol_usuario`.

---

## 11. Endpoints de la API

Los endpoints se encuentran dentro del directorio:

```text
api/public
```

Las rutas siguientes se indican sin el prefijo `/api`, tal como se utilizan con el servidor PHP integrado.

En el despliegue Docker se accede a ellas mediante `/api/`.

### 11.1 Autenticación

| Método | Ruta | Operación |
|---|---|---|
| POST | `/auth/login.php` | Iniciar sesión |
| GET | `/auth/me.php` | Consultar usuario autenticado |
| POST | `/auth/logout.php` | Cerrar sesión |
| POST | `/auth/register.php` | Registrar solicitud de acceso |

### 11.2 Funcionarios

| Método | Ruta | Operación |
|---|---|---|
| GET | `/users` | Consultar funcionarios |
| GET | `/users?roles=1` | Consultar roles |
| PATCH | `/users?id=ID` | Modificar roles o estado |

Estas operaciones requieren permisos administrativos.

### 11.3 Solicitudes de acceso

| Método | Ruta | Operación |
|---|---|---|
| GET | `/access` | Consultar solicitudes pendientes |
| GET | `/access?roles=1` | Consultar roles disponibles |
| PATCH | `/access?id=ID` | Aprobar una solicitud |
| DELETE | `/access?id=ID` | Rechazar una solicitud |

### 11.4 Categorías

| Método | Ruta | Operación |
|---|---|---|
| GET | `/categories` | Consultar categorías |
| POST | `/categories` | Crear una categoría |
| PATCH | `/categories?id=ID` | Actualizar una categoría |

La consulta pública devuelve las categorías habilitadas.

Las operaciones administrativas requieren los roles correspondientes.

### 11.5 Documentos

| Método | Ruta | Operación |
|---|---|---|
| GET | `/documents` | Consultar documentos |
| POST | `/documents` | Crear un documento |
| POST | `/documents?id=ID` | Actualizar documento con archivo |
| PATCH | `/documents?id=ID` | Actualizar metadatos |
| DELETE | `/documents?id=ID` | Eliminar documento |
| GET | `/documents/view.php` | Visualizar archivo |
| GET | `/documents/download.php` | Descargar archivo |

Las operaciones de creación y modificación de archivos utilizan los formatos y validaciones previstos en sus endpoints.

### 11.6 Encuestas

El módulo utiliza las rutas:

```text
/surveys
/surveys/detail.php
/surveys/questions.php
/surveys/reorder.php
/surveys/responses.php
/surveys/results.php
```

Estas permiten consultar y administrar encuestas, gestionar preguntas y opciones, registrar respuestas y consultar resultados.

Las operaciones y permisos dependen del endpoint y del método HTTP utilizado.

### 11.7 Traslados

| Método | Ruta | Operación |
|---|---|---|
| GET | `/transfers` | Consultar traslados activos |
| POST | `/transfers` | Crear solicitud |
| DELETE | `/transfers?id=ID` | Cancelar solicitud |
| GET | `/transfers/detail.php?id=ID` | Consultar detalle |
| GET | `/transfers/catalogs.php` | Consultar catálogos |
| GET | `/transfers/resources.php` | Consultar recursos disponibles |
| PATCH | `/transfers/assign.php?id=ID` | Asignar recursos |
| PATCH | `/transfers/state.php?id=ID` | Avanzar estado |
| GET | `/transfers/completed.php` | Consultar historial |

Aunque el endpoint del historial se denomina `completed.php`, actualmente incluye tanto traslados completados como cancelados.

Admite el parámetro:

```text
estado=todos
estado=completados
estado=cancelados
```

También admite filtros de búsqueda, fecha y recursos, junto con paginación.

### 11.8 Vehículos

| Método | Ruta | Operación |
|---|---|---|
| GET | `/vehicles` | Consultar vehículos |
| GET | `/vehicles?types=1` | Consultar tipos de vehículo |
| POST | `/vehicles` | Registrar vehículo |
| PATCH | `/vehicles?id=ID` | Modificar vehículo |

Los permisos se comprueban desde el backend.

---

## 12. Gestión de traslados

El módulo de traslados es uno de los componentes principales de la aplicación.

### 12.1 Solicitudes

Cada traslado contiene información como:

- Tipo de traslado.
- Paciente o elemento.
- Origen y destino.
- Prioridad.
- Fecha requerida.
- Funcionario solicitante.
- Observaciones.

### 12.2 Asignación de recursos

Los traslados pueden recibir:

- Vehículo.
- Conductor.
- Enfermero, cuando corresponda.
- Horarios estimados.
- Funcionario gestor.

La disponibilidad se consulta en función del intervalo previsto y de las restricciones establecidas en el sistema.

### 12.3 Estados

El flujo principal de un traslado es:

```text
Registrado
    |
    v
En camino
    |
    v
Llegó al destino
    |
    v
Retornando
    |
    v
Completado
```

Además existe el estado terminal:

```text
Registrado
    |
    v
Cancelado
```

La cancelación se permite únicamente cuando el traslado cumple las condiciones establecidas por el backend.

No se permite cancelar un traslado que ya haya iniciado su recorrido.

### 12.4 Cancelación

La cancelación se implementa como una baja lógica.

No elimina físicamente la información del traslado.

El backend:

1. Comprueba que el traslado exista.
2. Valida su estado y versión.
3. Comprueba que todavía no haya salido.
4. Cambia el estado a `Cancelado`.
5. Marca el traslado como inactivo.
6. Registra la fecha de baja.
7. Añade el movimiento al historial.

La operación utiliza una transacción para mantener consistentes los cambios.

Los cancelados dejan de aparecer en Seguimiento, pero permanecen disponibles desde el Historial.

### 12.5 Control de concurrencia

La tabla `traslado` incorpora el campo:

```text
version
```

El backend utiliza este valor para detectar si otro usuario modificó el traslado antes de que se complete una operación.

Si se produce un conflicto, la API puede devolver un código HTTP `409`.

### 12.6 Historial de estados

Los cambios se registran en:

```text
historial_estado_traslado
```

Esto permite consultar:

- Estado registrado.
- Fecha y hora.
- Funcionario responsable.
- Observación asociada.

El historial facilita la trazabilidad de las operaciones realizadas.

---

## 13. Gestión de documentos y encuestas

### 13.1 Documentos

El backend administra tanto los registros de la base de datos como los archivos almacenados.

La base de datos contiene información como:

- Título.
- Descripción.
- Categoría.
- Ruta del archivo.
- Estado del documento.

Los PDF se almacenan físicamente dentro de `storage/documents`.

Para conservar íntegramente la documentación es necesario respaldar ambos elementos: los registros SQL y los archivos.

### 13.2 Encuestas

El módulo de encuestas utiliza tablas relacionadas para almacenar:

- Encuestas.
- Preguntas.
- Opciones de respuesta.
- Formularios respondidos.
- Detalles de las respuestas.

Incluye controles para asegurar que las respuestas sean compatibles con el tipo de pregunta y que se respeten las restricciones establecidas.

Las respuestas pueden consultarse mediante los endpoints de resultados.

---

## 14. Datos de demostración

El repositorio incluye:

```text
database/data/seedDemo.sql
```

Este archivo permite generar información ficticia para probar la aplicación.

### 14.1 Requisitos

El seed está diseñado para una base de datos nueva que ya contiene:

- Los cuatro esquemas SQL.
- El administrador inicial.
- Su correspondiente asignación de rol.

No debe ejecutarse sobre una base que ya contiene información de producción o un seed anterior.

### 14.2 Ejecutar manualmente

Desde `prototipos/backend`:

```bash
/opt/lampp/bin/mysql -u root -p sigsm < database/data/seedDemo.sql
```

### 14.3 Ejecutar con Docker

Desde `prototipos/docker`:

```bash
docker compose --profile demo up -d --build
```

El servicio `seed-demo` ejecuta automáticamente el archivo después de la inicialización de MariaDB y del administrador.

### 14.4 Datos incluidos

El seed genera, entre otros:

- 80 funcionarios, incluyendo el administrador.
- 150 asignaciones de roles.
- 35 vehículos.
- 20 categorías.
- 2000 traslados.
- 30 encuestas.
- 200 preguntas.
- 600 opciones de respuesta.
- 5000 formularios respondidos.

De los 2000 traslados, 20 están cancelados.

Se utilizan datos sintéticos para evitar incorporar información personal real durante las pruebas.

### 14.5 Verificar los traslados

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

La consulta permite comprobar que existen traslados en los diferentes estados definidos.

---

## 15. Respuestas y errores HTTP

La API utiliza JSON como formato principal de respuesta.

Una respuesta correcta puede tener una estructura como:

```json
{
  "ok": true,
  "mensaje": "Operación realizada correctamente."
}
```

Una respuesta de error puede tener:

```json
{
  "ok": false,
  "mensaje": "No tiene permisos para realizar esta operación."
}
```

Los códigos utilizados dependen de la operación.

| Código | Significado |
|---|---|
| 200 | Consulta u operación correcta |
| 201 | Recurso creado |
| 400 | Petición incorrecta |
| 401 | Falta autenticación |
| 403 | Permisos insuficientes |
| 404 | Recurso no encontrado |
| 405 | Método HTTP no permitido |
| 409 | Conflicto |
| 422 | Error de validación |
| 500 | Error interno |

Las utilidades compartidas centralizan parte del formato de las respuestas.

### 15.1 Consultar una ruta pública

Con el servidor PHP iniciado:

```bash
curl -i http://127.0.0.1:8080/categories
```

### 15.2 Comprobar autenticación

```bash
curl -i http://127.0.0.1:8080/auth/me.php
```

Si no existe una sesión válida, es esperable recibir una respuesta de autenticación fallida.

Esto no implica necesariamente que el servidor esté funcionando incorrectamente.

### 15.3 Consultar errores

En desarrollo con PHP integrado, los errores pueden consultarse desde la terminal que ejecuta el servidor.

En Docker:

```bash
docker compose logs -f backend
```

---

## 16. Despliegue mediante Docker

El despliegue integrado se encuentra documentado en:

```text
prototipos/docker/README.md
```

Se utiliza:

- Nginx para el frontend.
- Apache y PHP para la API.
- MariaDB para la base de datos.
- Docker Compose para gestionar los servicios.

### 16.1 Despliegue completo

Desde `prototipos/docker`:

```bash
docker compose up -d --build
```

### 16.2 Actualizar únicamente el backend

Después de publicar los cambios en la rama `main`:

```bash
docker compose build --no-cache backend
```

Recrear el contenedor:

```bash
docker compose up -d --no-deps backend
```

Esto actualiza la API sin reconstruir el frontend ni MariaDB.

### 16.3 Comprobar la versión

```bash
docker compose exec backend cat /etc/sigsm-commit
```

El archivo contiene el identificador del commit utilizado durante la construcción.

### 16.4 Consultar los logs

```bash
docker compose logs -f backend
```

### 16.5 Acceder al contenedor

```bash
docker compose exec backend bash
```

### 16.6 Persistencia de documentos

La configuración Docker utiliza el volumen:

```text
docs_data
```

Este volumen se monta en:

```text
/var/www/api/storage
```

De esta manera, los documentos persisten aunque se reconstruya el contenedor de PHP.

La base de datos utiliza otro volumen independiente.

---

## 17. Comprobaciones y mantenimiento

### 17.1 Validar la sintaxis de un archivo PHP

Desde `prototipos/backend`:

```bash
/opt/lampp/bin/php -l api/public/auth/login.php
```

Este comando permite detectar errores de sintaxis en un archivo PHP.

### 17.2 Validar todos los archivos PHP

En GNU/Linux:

```bash
find api -name "*.php" -print0 | xargs -0 -n1 /opt/lampp/bin/php -l
```

Esto realiza una comprobación de sintaxis sobre los archivos PHP encontrados.

No sustituye las pruebas funcionales contra MariaDB.

### 17.3 Consultar las tablas

```sql
USE sigsm;
SHOW TABLES;
```

### 17.4 Consultar los funcionarios

```sql
SELECT
    id_func,
    nombre,
    correo,
    activo
FROM funcionario;
```

### 17.5 Consultar los roles

```sql
SELECT
    f.nombre AS funcionario,
    r.nombre AS rol
FROM rol_usuario ru
INNER JOIN funcionario f
    ON f.id_func = ru.id_func
INNER JOIN rol r
    ON r.id_rol = ru.id_rol
ORDER BY f.nombre;
```

### 17.6 Respaldos

La información persistente se divide en:

1. Base de datos MariaDB.
2. Archivos físicos de documentos.

La documentación de Docker incluye comandos para realizar copias y restauraciones de ambos elementos.

Antes de modificar el esquema de una base existente se recomienda generar un respaldo y comprobar su restauración en un entorno de pruebas.

---

## 18. Comandos útiles

### XAMPP

```bash
# Iniciar
sudo /opt/lampp/lampp start

# Detener
sudo /opt/lampp/lampp stop

# Reiniciar
sudo /opt/lampp/lampp restart

# Consultar estado
sudo /opt/lampp/lampp status
```

### MariaDB

```bash
# Acceder como administrador
/opt/lampp/bin/mysql -u root -p

# Importar el esquema 01
/opt/lampp/bin/mysql -u root -p < database/dbSchema_01.sql

# Importar el esquema 02
/opt/lampp/bin/mysql -u root -p < database/dbSchema_02.sql

# Importar el esquema 03
/opt/lampp/bin/mysql -u root -p < database/dbSchema_03.sql

# Importar el esquema 04
/opt/lampp/bin/mysql -u root -p < database/dbSchema_04.sql

# Cargar datos de demostración
/opt/lampp/bin/mysql -u root -p sigsm < database/data/seedDemo.sql
```

### Servidor PHP

Desde `prototipos/backend/api`:

```bash
/opt/lampp/bin/php -S 0.0.0.0:8080 -t public
```

### Docker

Desde `prototipos/docker`:

```bash
# Iniciar sistema
docker compose up -d

# Consultar servicios
docker compose ps

# Consultar logs del backend
docker compose logs -f backend

# Actualizar solo el backend
docker compose build --no-cache backend
docker compose up -d --no-deps backend

# Detener sin eliminar datos
docker compose down
```

---

## 19. Resolución de problemas

### 19.1 La API no responde

Comprobar:

- Que el servidor PHP esté ejecutándose.
- Que el puerto utilizado sea correcto.
- Que la máquina virtual esté encendida.
- Que la red permita la conexión.
- Que la raíz del servidor sea `api/public`.

### 19.2 Error de conexión a MariaDB

Comprobar:

- Que MariaDB esté iniciado.
- Que exista la base `sigsm`.
- Que las credenciales del archivo `.env` sean correctas.
- Que el usuario tenga los permisos necesarios.
- Que el host y el puerto correspondan con la instalación.

### 19.3 Error 401

Indica que la operación requiere una sesión autenticada.

Comprobar el inicio de sesión y el envío de la cookie correspondiente.

### 19.4 Error 403

Indica que el funcionario autenticado no tiene permisos suficientes.

Comprobar sus roles y las restricciones del endpoint.

### 19.5 Error 409

Puede indicar:

- Recurso duplicado.
- Conflicto de versiones.
- Traslado modificado por otro funcionario.
- Operación no permitida por el estado actual.

La respuesta JSON suele incluir un mensaje con información adicional.

### 19.6 El frontend no se conecta

Verificar que el proxy de Vite apunte a la dirección correcta del backend.

En el entorno de desarrollo actual se utiliza:

```text
192.168.56.10:8080
```

Esta dirección puede cambiar en otras instalaciones.

### 19.7 Los cambios PHP no aparecen en Docker

Confirmar que los archivos estén publicados en `main`.

Después:

```bash
docker compose build --no-cache backend
docker compose up -d --no-deps backend
```

Reconstruir la imagen es necesario porque los Dockerfiles actuales descargan el código desde GitHub durante su construcción.

### 19.8 Las tablas no se actualizan en Docker

Reconstruir la imagen de MariaDB no ejecuta nuevamente los esquemas sobre una base ya inicializada.

Para modificar una base existente deben aplicarse migraciones SQL.

No debe eliminarse el volumen de MariaDB si contiene información que se necesita conservar.

---

## 20. Consideraciones de seguridad

La configuración actual está destinada principalmente al desarrollo, las pruebas y la demostración académica.

Para un despliegue con información real se recomienda revisar especialmente:

- HTTPS y cookies seguras.
- Restricciones de acceso.
- Configuración de sesiones.
- Validación de archivos.
- Protección frente a solicitudes maliciosas.
- Permisos de usuarios y roles.
- Gestión de credenciales.
- Registro y supervisión de errores.
- Respaldos periódicos.
- Actualización de las dependencias y servicios.

Las restricciones del frontend no sustituyen los controles de autorización del backend.

La base de datos y los archivos de documentos deben mantenerse protegidos y fuera del acceso público directo.

---

## 21. Información del proyecto

**Proyecto:** S.I.G.S.M. — Sistema Integrado de Gestión de Servicios Médicos.

**Empresa:** Empre S.A.S.

**Institución:** UTU.

**Repositorio:** https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU

**Directorio del backend:** `prototipos/backend`

**API:** `prototipos/backend/api`

**Base de datos:** `prototipos/backend/database`

**Despliegue Docker:** `prototipos/docker`

El backend constituye la capa encargada de garantizar el procesamiento, la validación y la persistencia de la información utilizada por los diferentes módulos de S.I.G.S.M.

Su organización modular permite ampliar el sistema e incorporar nuevas funcionalidades manteniendo separadas las responsabilidades de cada componente.
