
# S.I.G.S.M. — Sistema Integral de Gestión de Servicios Médicos

**Proyecto académico UTU 2026 | Empre S.A.S.**

S.I.G.S.M. es una plataforma web modular desarrollada como parte del proyecto académico de UTU, tomando como caso de aplicación diferentes necesidades administrativas del **Hospital de Clínicas de Montevideo, Uruguay**.

Su objetivo es digitalizar, centralizar y facilitar la gestión de información y procesos institucionales mediante una solución informática accesible, organizada y extensible.

El sistema integra funcionalidades de gestión documental, encuestas, solicitudes y seguimiento de traslados, administración de vehículos y control de acceso de funcionarios.

> **Nota:** S.I.G.S.M. es un proyecto académico en desarrollo. Su inclusión en este repositorio no implica que se encuentre desplegado oficialmente en el Hospital de Clínicas ni habilitado para gestionar información real de pacientes.

---

## Índice

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Objetivos](#2-objetivos)
3. [Módulos del sistema](#3-módulos-del-sistema)
4. [Tecnologías utilizadas](#4-tecnologías-utilizadas)
5. [Arquitectura](#5-arquitectura)
6. [Estructura del repositorio](#6-estructura-del-repositorio)
7. [Instalación y ejecución](#7-instalación-y-ejecución)
8. [Autenticación y seguridad](#8-autenticación-y-seguridad)
9. [Documentación del proyecto](#9-documentación-del-proyecto)
10. [Desarrollo y contribuciones](#10-desarrollo-y-contribuciones)
11. [Estado del proyecto](#11-estado-del-proyecto)
12. [Información y contacto](#12-información-y-contacto)

---

## 1. Descripción del proyecto

S.I.G.S.M. nace de la necesidad de modernizar y simplificar procesos administrativos que tradicionalmente requieren diferentes herramientas, documentos físicos o procedimientos manuales.

La propuesta consiste en desarrollar una plataforma centralizada en la que los funcionarios puedan acceder a las funcionalidades correspondientes a sus responsabilidades mediante una interfaz web.

El sistema se organiza en módulos independientes, lo que permite incorporar nuevas funcionalidades sin necesidad de modificar completamente su estructura.

Entre los principales aspectos del proyecto se encuentran:

- Centralización de información institucional.
- Digitalización de documentos y procesos administrativos.
- Gestión de usuarios mediante roles y permisos.
- Registro y seguimiento de solicitudes.
- Consulta de información histórica.
- Acceso público controlado a determinados contenidos.
- Organización modular para facilitar futuras ampliaciones.

El desarrollo contempla tanto la aplicación web como la base de datos, la API, la infraestructura de ejecución y la documentación necesaria para su instalación y mantenimiento.

---

## 2. Objetivos

### Objetivo general

Desarrollar un sistema informático modular que permita digitalizar y optimizar distintos procesos administrativos, facilitando el acceso, la organización y la gestión de la información.

### Objetivos específicos

- Reducir la dependencia de procedimientos manuales y documentación física.
- Centralizar la información utilizada por los diferentes módulos.
- Facilitar la consulta y administración de documentos institucionales.
- Registrar solicitudes de traslado y realizar su seguimiento.
- Mejorar la organización y asignación de recursos.
- Conservar un historial de operaciones relevantes.
- Implementar autenticación y control de permisos.
- Proporcionar una interfaz clara y adaptable a distintos dispositivos.
- Facilitar la instalación y actualización mediante contenedores.
- Establecer una base técnica que permita ampliar el sistema.

---

## 3. Módulos del sistema

### 3.1 Autenticación y administración de funcionarios

El sistema dispone de autenticación mediante sesiones PHP y un modelo de autorización basado en roles.

Permite:

- Iniciar y cerrar sesión.
- Consultar los datos del funcionario autenticado.
- Solicitar el registro de nuevos funcionarios.
- Gestionar solicitudes de acceso.
- Activar o desactivar cuentas.
- Consultar y modificar los roles asignados.
- Restringir funcionalidades según los permisos del usuario.

Un funcionario puede disponer de varios roles, permitiendo adaptar su acceso a las responsabilidades que desempeña.

### 3.2 Gestión documental

Permite organizar y administrar documentos institucionales mediante categorías.

Sus funcionalidades incluyen:

- Crear y modificar categorías.
- Consultar documentos agrupados.
- Subir documentos PDF.
- Modificar metadatos y archivos.
- Activar o desactivar documentos.
- Eliminar documentos.
- Visualizar y descargar archivos.
- Consultar contenido público habilitado.

Los archivos se almacenan físicamente en el servidor, mientras que sus metadatos se administran desde MariaDB.

### 3.3 Encuestas

El módulo de encuestas permite diseñar formularios y recopilar respuestas.

Incluye:

- Creación y modificación de encuestas.
- Asociación opcional con categorías.
- Gestión de preguntas.
- Configuración de preguntas obligatorias.
- Preguntas abiertas y con opciones.
- Ordenación de preguntas.
- Registro de respuestas.
- Encuestas anónimas o identificadas.
- Consulta de resultados.

Las encuestas habilitadas pueden responderse desde las vistas públicas correspondientes.

### 3.4 Solicitudes y seguimiento de traslados

Permite registrar y gestionar traslados dentro de los procesos contemplados por el sistema.

Se organiza en tres funcionalidades principales.

**Nueva solicitud**

Registro de solicitudes con información como:

- Tipo de traslado.
- Paciente o elemento.
- Origen y destino.
- Prioridad.
- Fecha requerida.
- Observaciones.

**Seguimiento**

Administración de las solicitudes que todavía se encuentran activas.

Incluye:

- Consulta y filtrado de traslados.
- Visualización de información detallada.
- Asignación de vehículos y funcionarios.
- Consulta de disponibilidad de recursos.
- Registro de horarios estimados.
- Actualización de estados.
- Cancelación de solicitudes permitidas.

**Historial**

Consulta de los traslados finalizados o cancelados.

Dispone de:

- Búsqueda y filtros.
- Filtros por fechas.
- Filtros por recursos.
- Separación entre completados y cancelados.
- Paginación.
- Consulta de detalles e historial de estados.

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

Además, un traslado en estado `Registrado` puede pasar a `Cancelado` cuando cumple las condiciones establecidas.

Los cambios se conservan en un historial para facilitar su trazabilidad.

### 3.5 Gestión de vehículos

El sistema incorpora funcionalidades para administrar los vehículos utilizados por el módulo de traslados.

Permite consultar los vehículos registrados, incorporar nuevos recursos y modificar su información.

También se utilizan catálogos de tipos de vehículo y compatibilidades con los elementos transportados.

### 3.6 Interfaz multilingüe

La aplicación dispone de traducciones al:

- Español.
- Inglés.

La internacionalización se implementa mediante i18next y permite cambiar el idioma de la interfaz.

---

## 4. Tecnologías utilizadas

S.I.G.S.M. utiliza una arquitectura web con frontend, backend y base de datos independientes.

### 4.1 Frontend

| Tecnología | Función |
|---|---|
| React 19 | Construcción de interfaces mediante componentes |
| JavaScript y JSX | Desarrollo de la lógica del frontend |
| Vite 8 | Entorno de desarrollo y compilación |
| Material UI 9 | Componentes y diseño de la interfaz |
| React Router 7 | Navegación y rutas protegidas |
| i18next | Internacionalización |
| React i18next | Integración de traducciones |
| dnd-kit | Interacciones de arrastrar y soltar |

La aplicación utiliza componentes funcionales y hooks de React.

### 4.2 Backend

| Tecnología | Función |
|---|---|
| PHP 8.2 | Desarrollo de la API REST |
| Apache | Servidor HTTP |
| PDO | Conexión y consultas a MariaDB |
| JSON | Intercambio de información |
| Sesiones PHP | Autenticación de funcionarios |

El backend no utiliza un framework PHP.

Su organización se basa en endpoints, handlers, servicios, middleware y utilidades.

### 4.3 Base de datos

| Tecnología | Función |
|---|---|
| MariaDB 11.4 | Sistema gestor de base de datos |
| SQL | Definición y manipulación de datos |
| InnoDB | Motor de almacenamiento |
| utf8mb4 | Codificación de caracteres |

La base de datos utiliza claves primarias, claves foráneas, índices y restricciones para mantener la integridad de la información.

### 4.4 Infraestructura y despliegue

| Tecnología | Función |
|---|---|
| Docker | Ejecución mediante contenedores |
| Docker Compose | Administración de servicios |
| Nginx | Servidor del frontend y proxy de la API |
| XAMPP | Entorno de desarrollo del backend |
| GNU/Linux | Sistema utilizado en el entorno de servidor |
| Git | Control de versiones |
| GitHub | Repositorio y colaboración |

### 4.5 Herramientas de desarrollo

- Visual Studio Code.
- Git y GitHub.
- npm.
- ESLint.
- Vitest.
- phpMyAdmin.
- Herramientas de desarrollo del navegador.

---

## 5. Arquitectura

El sistema utiliza una arquitectura cliente-servidor.

El frontend y el backend se comunican mediante peticiones HTTP a una API REST, mientras que MariaDB almacena la información persistente.

### 5.1 Esquema general

```text
                  USUARIO
                     |
                     v
               NAVEGADOR
                     |
                     v
             FRONTEND REACT
            Vite / Material UI
                     |
                     | HTTP / JSON
                     v
                API REST
              PHP / Apache
                     |
             +-------+-------+
             |               |
             v               v
          MARIADB       ALMACENAMIENTO
         Base de datos     DOCUMENTOS
                              PDF
```

### 5.2 Frontend

Es responsable de mostrar las interfaces, gestionar la navegación, realizar solicitudes a la API y representar los resultados.

Organiza sus funcionalidades mediante componentes reutilizables y módulos.

### 5.3 Backend

Es responsable de:

- Procesar solicitudes HTTP.
- Validar la información recibida.
- Comprobar autenticación y permisos.
- Aplicar reglas de negocio.
- Consultar y modificar la base de datos.
- Administrar archivos.
- Devolver respuestas JSON.

### 5.4 Base de datos

Almacena la información de funcionarios, documentación, encuestas, vehículos, traslados y sus relaciones.

### 5.5 Despliegue con Docker

La aplicación puede ejecutarse mediante Docker Compose utilizando tres servicios principales:

- `frontend`: React compilado y servido mediante Nginx.
- `backend`: API PHP ejecutada mediante Apache.
- `db`: MariaDB.

Además, incorpora servicios auxiliares para crear el administrador inicial y cargar datos ficticios.

Los datos persistentes se conservan mediante volúmenes de Docker.

---

## 6. Estructura del repositorio

El repositorio incluye tanto el código fuente como la documentación académica elaborada durante el desarrollo.

```text
S.I.G.S.M---Proyecto-UTU/
│
├── Primera Entrega/
│   ├── Emprendedurismo/
│   ├── Full Stack/
│   ├── Ingeniería/
│   ├── Sistemas/
│   ├── Sociología/
│   └── Utu-lab/
│
├── Segunda Entrega/
│   ├── Emprendedurismo/
│   ├── Full Stack/
│   ├── Ingeniería/
│   ├── Sistemas/
│   ├── Sociología/
│   └── Utu-lab/
│
├── Tercera Entrega/
│   ├── Emprendedurismo/
│   ├── Full Stack/
│   ├── Ingeniería/
│   ├── Sistemas/
│   ├── Sociología/
│   └── Utu-lab/
│
├── prototipos/
│   │
│   ├── frontend/
│   │   ├── public/
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── backend/
│   │   ├── api/
│   │   ├── database/
│   │   └── README.md
│   │
│   └── docker/
│       ├── backend/
│       ├── database/
│       ├── frontend/
│       ├── compose.yaml
│       ├── .env.example
│       └── README.md
│
└── README.md
```

### Directorios principales

**Primera Entrega y Segunda Entrega**

Contienen la documentación académica del proyecto correspondiente a las diferentes asignaturas y etapas de desarrollo.

**prototipos/frontend**

Contiene la interfaz desarrollada con React, sus componentes, páginas, traducciones y funciones de comunicación con la API.

**prototipos/backend**

Contiene la API PHP, los servicios, middleware, archivos de configuración y scripts SQL.

**prototipos/docker**

Contiene la configuración de Docker Compose para instalar y ejecutar el sistema completo.

---

## 7. Instalación y ejecución

Existen dos formas principales de ejecutar la aplicación:

- Mediante Docker Compose, recomendada para instalar el sistema completo.
- Mediante los entornos de desarrollo independientes de frontend y backend.

### 7.1 Instalación mediante Docker

**Requisitos:**

- Docker.
- Docker Compose v2.
- Git.
- Conexión a Internet.

Clonar el repositorio:

```bash
git clone https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU.git
```

Acceder a la carpeta de Docker:

```bash
cd S.I.G.S.M---Proyecto-UTU/prototipos/docker
```

Crear el archivo de configuración:

En Linux o macOS:

```bash
cp .env.example .env
```

En Windows con PowerShell:

```powershell
Copy-Item .env.example .env
```

Editar `.env` y configurar las contraseñas, el administrador inicial y el puerto de acceso.

Iniciar la aplicación:

```bash
docker compose up -d --build
```

Una vez levantados los servicios, acceder desde el navegador:

```text
http://localhost:8080
```

El puerto puede modificarse mediante `WEB_PORT` en el archivo `.env`.

### 7.2 Instalación con datos de demostración

El proyecto incorpora un seed SQL con datos ficticios para probar los diferentes módulos.

En una instalación nueva:

```bash
docker compose --profile demo up -d --build
```

El seed permite comprobar las funcionalidades utilizando información sintética, incluyendo traslados completados, activos y cancelados.

**Importante:** el seed está diseñado para instalaciones limpias y no debe ejecutarse repetidamente sobre una base de datos en uso.

### 7.3 Instalación para desarrollo

También es posible ejecutar el frontend y el backend por separado.

**Frontend**

Desde `prototipos/frontend`:

```bash
npm ci
npm run dev
```

Por defecto, Vite utiliza una dirección similar a:

```text
http://localhost:5173
```

**Backend**

El entorno de desarrollo utiliza PHP y MariaDB mediante XAMPP en GNU/Linux.

La API puede ejecutarse desde `prototipos/backend/api`:

```bash
/opt/lampp/bin/php -S 0.0.0.0:8080 -t public
```

El frontend utiliza un proxy de Vite para comunicarse con el backend.

La dirección del servidor debe adaptarse a cada instalación.

### 7.4 Guías completas

Para instrucciones detalladas, consultar los README de cada componente:

| Componente | Documentación |
|---|---|
| Frontend | [README del Frontend](prototipos/frontend/README.md) |
| Backend | [README del Backend](prototipos/backend/README.md) |
| Docker | [README de Docker](prototipos/docker/README.md) |

Estas guías incluyen la instalación, configuración, comandos y resolución de problemas correspondientes a cada entorno.

---

## 8. Autenticación y seguridad

El sistema implementa mecanismos de autenticación y autorización para controlar el acceso a las funcionalidades privadas.

### 8.1 Autenticación

Se utiliza un sistema de sesiones PHP.

Las contraseñas se almacenan mediante hashes generados por `password_hash()`.

### 8.2 Autorización

El acceso a los diferentes módulos depende de los roles asociados al funcionario.

El frontend utiliza rutas protegidas para controlar la navegación, mientras que el backend comprueba los permisos en los endpoints.

### 8.3 Integridad de datos

El backend utiliza consultas preparadas con PDO y validaciones de los datos recibidos.

La base de datos incluye restricciones para mantener la consistencia de la información.

En el módulo de traslados también se utiliza control de versiones para detectar modificaciones concurrentes y evitar conflictos durante determinadas operaciones.

### 8.4 Consideraciones para producción

La configuración actual está orientada al desarrollo y demostración académica.

Antes de utilizar la aplicación con información real se requiere revisar aspectos como HTTPS, configuración segura de sesiones, protección de datos, permisos, gestión de credenciales, respaldos y pruebas de seguridad.

---

## 9. Documentación del proyecto

El repositorio reúne la documentación generada durante el desarrollo académico de S.I.G.S.M.

Se encuentra organizada por entregas y asignaturas.

| Área | Contenido general |
|---|---|
| Full Stack | Desarrollo de frontend, backend y funcionalidades |
| Ingeniería | Análisis, diseño y documentación de software |
| Sistemas | Configuración de infraestructura y servicios |
| Emprendedurismo | Desarrollo de la propuesta empresarial |
| Sociología | Análisis y aspectos sociales del proyecto |
| UTU-Lab | Actividades y entregables correspondientes al área |

### Entregas

- [Primera Entrega](Primera%20Entrega/)
- [Segunda Entrega](Segunda%20Entrega/)
- [Tercera Entrega](Tercera%20Entrega/)

La documentación refleja la evolución del proyecto durante sus distintas etapas.

---

## 10. Desarrollo y contribuciones

El proyecto utiliza Git y GitHub para gestionar las modificaciones del código y la documentación.

### 10.1 Rama principal

La rama principal del repositorio es:

```text
main
```

Contiene las versiones publicadas del proyecto.

Los Dockerfiles actuales obtienen el código de esta rama durante la construcción de las imágenes.

### 10.2 Convención de commits

Para mantener un historial organizado se utilizan los siguientes prefijos:

| Prefijo | Descripción | Ejemplo |
|---|---|---|
| `DOCS:` | Cambios en documentación | `DOCS: actualiza README` |
| `CODE:` | Incorporación o modificación general de código | `CODE: implementa login` |
| `FEAT:` | Nueva funcionalidad | `FEAT: completa módulo de encuestas` |
| `FIX:` | Corrección de errores | `FIX: corrige validación de traslado` |
| `STYLE:` | Cambios visuales | `STYLE: mejora dashboard` |
| `REFACTOR:` | Reorganización interna del código | `REFACTOR: reorganiza componentes` |

### 10.3 Recomendaciones para el desarrollo

Antes de incorporar modificaciones se recomienda:

- Comprobar que los cambios no afectan otras funcionalidades.
- Mantener la organización modular existente.
- Reutilizar componentes y utilidades.
- Validar los datos en el backend.
- Utilizar nombres descriptivos.
- Documentar los cambios importantes.
- Evitar subir contraseñas o archivos `.env`.
- Probar las funcionalidades modificadas.

### 10.4 Pruebas del frontend

El frontend incorpora ESLint y Vitest.

Desde `prototipos/frontend`:

```bash
npm run lint
npm run test:run
npm run build
```

Estos comandos permiten realizar comprobaciones estáticas, ejecutar pruebas automatizadas y verificar la compilación.

---

## 11. Estado del proyecto

S.I.G.S.M. se encuentra en desarrollo académico, con una implementación funcional de sus principales módulos.

Entre los avances realizados se encuentran:

- Autenticación y gestión de sesiones.
- Control de acceso mediante roles.
- Gestión de funcionarios y solicitudes de acceso.
- Administración de categorías y documentos.
- Creación y gestión de encuestas.
- Registro de respuestas y consulta de resultados.
- Registro de solicitudes de traslado.
- Asignación y consulta de disponibilidad de recursos.
- Seguimiento y actualización de estados.
- Cancelación e historial de traslados.
- Gestión de vehículos.
- Interfaz en español e inglés.
- Despliegue mediante Docker Compose.
- Base de datos con información ficticia para demostraciones.

El proyecto continúa sujeto a pruebas, mejoras y ajustes de acuerdo con las necesidades identificadas durante su desarrollo.

La arquitectura modular busca facilitar la incorporación de nuevas funcionalidades en futuras versiones.

---

## 12. Información y contacto

**Proyecto:** S.I.G.S.M. — Sistema Integral de Gestión de Servicios Médicos.

**Empresa desarrolladora:** Empre S.A.S.

**Institución educativa:** UTU.

**Año:** 2026.

**Caso de aplicación:** Hospital de Clínicas, Montevideo, Uruguay.

**Correo de contacto:** empre.sa.utu.isbo@gmail.com

**Repositorio:** https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU

---

Desarrollado como proyecto académico por **Empre S.A.S.**, con el objetivo de aplicar conocimientos de desarrollo de software, bases de datos, infraestructura, análisis y gestión de proyectos a una solución informática integral.
