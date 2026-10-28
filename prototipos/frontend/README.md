
# S.I.G.S.M. — Frontend

Interfaz web del **Sistema Integrado de Gestión de Servicios Médicos (S.I.G.S.M.)**, desarrollado por **Empre S.A.S.** como parte del proyecto académico de UTU.

El frontend permite a los funcionarios interactuar con los distintos módulos del sistema desde una interfaz web, mientras que el backend se encarga de procesar las solicitudes, aplicar las reglas de negocio y comunicarse con la base de datos.

## 1. Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| React 19 | Desarrollo de interfaces mediante componentes |
| Vite 8 | Servidor de desarrollo y compilación |
| JavaScript (JSX) | Lógica y componentes del frontend |
| Material UI 9 | Componentes visuales y diseño |
| React Router 7 | Navegación y rutas protegidas |
| i18next | Internacionalización |
| React i18next | Integración de traducciones con React |
| dnd-kit | Interacciones de arrastrar y soltar |
| Vitest | Pruebas automatizadas |
| ESLint | Análisis estático del código |

La aplicación utiliza componentes funcionales de React y hooks para gestionar estados, efectos y comportamiento de la interfaz.

---

## 2. Requisitos previos

Para ejecutar el frontend en un entorno de desarrollo se necesita:

- Node.js y npm.
- Git.
- Un editor de código, por ejemplo Visual Studio Code.
- Un navegador web actualizado.
- Acceso al backend de S.I.G.S.M. para utilizar las funcionalidades que requieren datos reales.

Se recomienda utilizar **Node.js 22**, versión utilizada también durante la construcción de la imagen Docker del frontend.

Comprobar la instalación:

```bash
node --version
npm --version
git --version
```

No es necesario instalar PHP ni MariaDB en el equipo del frontend cuando estos servicios se ejecutan en otra computadora o máquina virtual.

---

## 3. Obtener el proyecto

### 3.1 Clonar el repositorio

```bash
git clone https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU.git
```

Acceder al frontend:

```bash
cd S.I.G.S.M---Proyecto-UTU/prototipos/frontend
```

### 3.2 Instalar las dependencias

Desde `prototipos/frontend`:

```bash
npm ci
```

Este comando instala las dependencias definidas en `package-lock.json`, respetando sus versiones.

Para el desarrollo habitual también puede utilizarse:

```bash
npm install
```

La carpeta `node_modules` se genera automáticamente y no debe subirse al repositorio.

### 3.3 Ejecutar en modo desarrollo

```bash
npm run dev
```

Vite mostrará una dirección local, normalmente:

```text
http://localhost:5173
```

Abrirla en el navegador para acceder a la aplicación.

El frontend puede iniciarse aunque el backend no esté disponible, pero las operaciones que requieren consultar o modificar datos fallarán hasta que exista conexión con la API.

---

## 4. Configuración de la conexión con el backend

El frontend utiliza peticiones HTTP para comunicarse con la API PHP.

Las llamadas se encuentran organizadas en `src/apiCalls/`.

### 4.1 Proxy de Vite

Durante el desarrollo, Vite utiliza un proxy configurado en `vite.config.js`.

La configuración actual es:

```javascript
server: {
  proxy: {
    "/api": {
      target: "http://192.168.56.10:8080",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
},
```

Esta dirección corresponde al entorno de desarrollo con el backend ejecutándose en una máquina virtual.

Cuando React realiza una petición a:

```text
/api/transfers
```

Vite la redirige al servidor PHP:

```text
http://192.168.56.10:8080/transfers
```

La reescritura elimina el prefijo `/api` porque el servidor PHP de desarrollo utiliza directamente la carpeta `public` como raíz.

### 4.2 Utilizar otro servidor

Si el backend utiliza otra dirección IP, modificar `target` en `vite.config.js`.

Por ejemplo, si el backend se ejecuta en la misma computadora:

```javascript
target: "http://127.0.0.1:8080",
```

Si se utiliza otra máquina virtual o servidor:

```javascript
target: "http://IP_DEL_SERVIDOR:8080",
```

Después de modificar la configuración, reiniciar Vite.

**Importante:** la dirección actual es específica del entorno de desarrollo y no debe considerarse válida para cualquier instalación.

### 4.3 Peticiones autenticadas

Las solicitudes al backend utilizan, cuando corresponde:

```javascript
credentials: "include"
```

Esto permite que el navegador envíe la cookie de sesión de PHP junto con las peticiones.

El frontend no necesita conocer directamente las credenciales de MariaDB.

La autenticación y las comprobaciones de permisos se realizan desde el backend.

---

## 5. Estructura del proyecto

La estructura principal es:

```text
frontend/
├── public/
├── src/
│   ├── apiCalls/
│   │   ├── access/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── documents/
│   │   ├── surveys/
│   │   ├── transfers/
│   │   ├── users/
│   │   └── vehicles/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── access/
│   │   │   ├── ambulances/
│   │   │   │   ├── followUp/
│   │   │   │   ├── history/
│   │   │   │   └── transfer/
│   │   │   ├── documents/
│   │   │   ├── general/
│   │   │   ├── users/
│   │   │   └── vehicles/
│   │   ├── auth/
│   │   ├── modals/
│   │   └── utils/
│   │
│   ├── hooks/
│   ├── locales/
│   │   ├── es/
│   │   └── en/
│   ├── mockData/
│   ├── pages/
│   │   └── admin/
│   ├── utils/
│   │
│   ├── App.jsx
│   ├── i18n.js
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

### 5.1 apiCalls

Contiene las funciones responsables de realizar peticiones a la API.

Están agrupadas según el módulo al que pertenecen.

Por ejemplo:

```text
apiCalls/transfers/transfersApi.js
apiCalls/documents/documentsApi.js
apiCalls/auth/authApi.js
```

Esta separación permite reutilizar las llamadas desde distintos componentes y evita concentrar la lógica HTTP dentro de las interfaces.

### 5.2 components

Contiene los componentes de la aplicación.

Se organizan por funcionalidad:

- `admin/documents`: gestión de documentación, categorías y encuestas.
- `admin/ambulances`: solicitudes, seguimiento e historial de traslados.
- `admin/vehicles`: administración de vehículos.
- `admin/users`: gestión de funcionarios.
- `admin/access`: solicitudes de acceso.
- `auth`: protección de rutas.
- `modals`: diálogos y formularios.
- `utils`: componentes visuales reutilizables.

### 5.3 pages

Contiene las páginas principales, como el inicio de sesión y el dashboard administrativo.

### 5.4 hooks

Contiene hooks reutilizables.

Por ejemplo, `useNotification` centraliza el manejo de notificaciones para mostrar mensajes de éxito, advertencia y error.

### 5.5 utils

Contiene funciones auxiliares utilizadas por distintas secciones, como la configuración de permisos y redirecciones según el rol del funcionario.

### 5.6 locales

Contiene las traducciones organizadas por idioma y módulo.

Actualmente se incluyen español e inglés.

---

## 6. Funcionalidades principales

### 6.1 Autenticación y acceso

La aplicación incluye:

- Inicio y cierre de sesión.
- Consulta de la sesión actual.
- Solicitud de registro.
- Protección de rutas privadas.
- Restricción de funcionalidades según roles.
- Redirección a módulos habilitados.

La autenticación depende de la sesión gestionada por el backend.

Los componentes `ProtectedRoute` y `RoleRoute` controlan el acceso a las distintas páginas.

### 6.2 Documentación

Permite:

- Consultar categorías.
- Crear y editar categorías.
- Gestionar documentos PDF.
- Visualizar y descargar documentos.
- Crear y modificar encuestas.
- Administrar preguntas y opciones.
- Consultar respuestas y resultados.
- Acceder a contenidos públicos mediante las vistas habilitadas.

### 6.3 Traslados

El módulo de traslados se divide en tres secciones principales.

**Nueva solicitud**

Permite registrar una solicitud con información como:

- Tipo de traslado.
- Paciente o elemento.
- Origen y destino.
- Prioridad.
- Fecha requerida.
- Observaciones.

**Seguimiento**

Permite consultar y gestionar traslados activos.

Incluye:

- Búsqueda y filtros.
- Visualización de detalles.
- Asignación de recursos disponibles.
- Horarios estimados.
- Actualización de estados.
- Cancelación de solicitudes que cumplan las condiciones establecidas.
- Actualización manual de la información.

**Historial**

Permite consultar traslados terminados.

Incluye:

- Traslados completados.
- Traslados cancelados.
- Filtros por estado.
- Búsqueda general.
- Filtros por fecha y recursos.
- Paginación.
- Consulta del detalle e historial del traslado.

### 6.4 Vehículos

Incluye una sección de administración de los vehículos utilizados por el servicio de traslados.

### 6.5 Funcionarios y solicitudes de acceso

Los administradores pueden consultar funcionarios, gestionar sus roles y estados, y tramitar solicitudes de acceso.

### 6.6 Internacionalización

La aplicación admite español e inglés mediante i18next.

El idioma seleccionado se conserva en el navegador utilizando la clave:

```text
sigsm-language
```

Las traducciones están separadas por módulos para facilitar su mantenimiento.

---

## 7. Rutas de la aplicación

Las rutas principales se definen en `src/App.jsx`.

| Ruta | Funcionalidad |
|---|---|
| `/login` | Inicio de sesión |
| `/documents/view` | Vista pública de documentación |
| `/documents/dashboard` | Panel de documentación |
| `/documents/categories` | Categorías |
| `/documents/files` | Documentos |
| `/documents/surveys` | Encuestas |
| `/ambulances/new` | Nueva solicitud de traslado |
| `/ambulances/follow-up` | Seguimiento de traslados |
| `/ambulances/history` | Historial de traslados |
| `/ambulances/vehicles` | Gestión de vehículos |
| `/admin/users` | Gestión de funcionarios |
| `/admin/access` | Solicitudes de acceso |
| `/no-access` | Usuario sin acceso a módulos |

Las rutas privadas requieren autenticación y, según el caso, uno o varios roles.

Los permisos de navegación se definen en:

```text
src/utils/permissions.js
```

Estas restricciones del frontend complementan las comprobaciones de autorización realizadas por el backend, pero no las sustituyen.

---

## 8. Comunicación con la API

Las funciones HTTP se encuentran en `src/apiCalls/`.

Ejemplo simplificado:

```javascript
export async function getTransfers() {
  const response = await fetch("/api/transfers", {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  return data;
}
```

Este ejemplo ilustra el funcionamiento general.

En el proyecto se utiliza además `processResponse` para centralizar el tratamiento de las respuestas y los errores de la API.

El flujo habitual es:

1. El usuario interactúa con un componente.
2. El componente invoca una función de `apiCalls`.
3. Se realiza la petición HTTP.
4. El backend valida la petición y ejecuta la operación.
5. El frontend recibe la respuesta.
6. Se actualiza el estado del componente.
7. Se muestra el resultado o la notificación correspondiente.

---

## 9. Estilos y componentes reutilizables

El frontend utiliza Material UI para mantener una interfaz consistente.

También dispone de estilos globales y variables CSS definidas en `src/index.css`.

Entre los componentes reutilizables se encuentran:

- Botones de actualización.
- Notificaciones.
- Tarjetas informativas.
- Diálogos.
- Tablas y filtros.
- Componentes de detalles.
- Indicadores visuales de estados.

Se recomienda reutilizar componentes y variables existentes antes de crear estilos independientes para una nueva sección.

Esto facilita mantener un diseño uniforme entre los módulos.

---

## 10. Compilación y pruebas

### 10.1 Compilar el frontend

```bash
npm run build
```

Vite genera una versión compilada de la aplicación dentro de:

```text
dist/
```

Esta carpeta contiene los archivos estáticos que pueden ser servidos por Nginx u otro servidor web compatible.

### 10.2 Previsualizar la compilación

```bash
npm run preview
```

La previsualización comprueba la versión compilada, pero no sustituye a un servidor configurado para el despliegue definitivo.

### 10.3 Ejecutar pruebas automatizadas

```bash
npm run test:run
```

Este comando ejecuta Vitest una vez y finaliza.

Para ejecutar Vitest en modo interactivo:

```bash
npm run test
```

Actualmente existen pruebas para determinadas utilidades de traslados y tratamiento de fechas.

Estas pruebas no sustituyen las pruebas de integración con el backend.

### 10.4 Ejecutar ESLint

```bash
npm run lint
```

Permite detectar determinados problemas de calidad del código y uso de React.

### 10.5 Comprobaciones recomendadas

Antes de incorporar cambios importantes:

```bash
npm run lint
npm run test:run
npm run build
```

La ejecución satisfactoria de estos comandos permite detectar errores antes de desplegar una nueva versión.

---

## 11. Despliegue mediante Docker

El proyecto incluye una configuración Docker para ejecutar la aplicación completa.

La documentación está disponible en:

```text
prototipos/docker/README.md
```

En este despliegue:

- Vite compila el frontend durante la construcción de la imagen.
- Nginx sirve los archivos generados.
- Nginx redirige `/api/` hacia Apache.
- El backend y MariaDB se ejecutan en contenedores independientes.

Para construir y ejecutar la aplicación completa:

```bash
cd ../docker
docker compose up -d --build
```

Para utilizar los datos de demostración durante una instalación limpia:

```bash
docker compose --profile demo up -d --build
```

### 11.1 Actualizar únicamente el frontend

Después de publicar los cambios en `main`, desde `prototipos/docker`:

```bash
docker compose build --no-cache frontend
docker compose up -d --no-deps frontend
```

No es necesario reconstruir el backend ni la base de datos cuando únicamente se modifican archivos del frontend.

**Importante:** los Dockerfiles actuales descargan el código desde GitHub durante la construcción. Los cambios locales sin publicar no se incorporan automáticamente a la imagen.

---

## 12. Comandos útiles

Todos los comandos siguientes, salvo los de Docker, se ejecutan desde `prototipos/frontend`.

| Comando | Función |
|---|---|
| `npm ci` | Instalar dependencias usando el lockfile |
| `npm install` | Instalar o actualizar dependencias |
| `npm run dev` | Iniciar Vite |
| `npm run build` | Generar compilación |
| `npm run preview` | Previsualizar compilación |
| `npm run test` | Ejecutar Vitest |
| `npm run test:run` | Ejecutar pruebas una vez |
| `npm run lint` | Ejecutar ESLint |

Actualizar código local:

```bash
git pull origin main
```

Consultar la rama actual:

```bash
git branch --show-current
```

Consultar el estado de los cambios:

```bash
git status
```

---

## 13. Resolución de problemas

### 13.1 El frontend no inicia

Comprobar que Node.js y npm estén instalados:

```bash
node --version
npm --version
```

Reinstalar las dependencias:

```bash
npm ci
```

Volver a ejecutar:

```bash
npm run dev
```

### 13.2 El frontend abre, pero no carga los datos

Comprobar:

- Que el backend esté funcionando.
- Que `vite.config.js` apunte a la dirección correcta.
- Que la máquina virtual o servidor sea accesible.
- Que MariaDB esté disponible.
- Que la sesión del usuario siga siendo válida.

Las peticiones pueden inspeccionarse desde las herramientas de desarrollo del navegador, en la pestaña **Network**.

### 13.3 La API devuelve 401 o 403

Un código `401` normalmente indica que la petición requiere autenticación.

Un código `403` indica que el usuario autenticado no tiene autorización para realizar la operación.

Verificar la sesión y los roles asignados al funcionario.

### 13.4 La API devuelve 500

Un código `500` indica un error interno del backend.

Consultar los logs del servidor PHP o del contenedor Docker correspondiente.

### 13.5 Los cambios no aparecen

En desarrollo:

- Comprobar que se guardó el archivo.
- Revisar los errores de la terminal de Vite.
- Actualizar la página.

En Docker:

- Confirmar que los cambios se publicaron en `main`.
- Reconstruir la imagen del frontend.
- Recrear el contenedor.
- Forzar la recarga del navegador si persiste una versión anterior.

### 13.6 El puerto de Vite está ocupado

Vite puede utilizar otro puerto disponible.

También es posible especificar uno manualmente:

```bash
npm run dev -- --port 5174
```

---

## 14. Información del proyecto

**Proyecto:** S.I.G.S.M. — Sistema Integrado de Gestión de Servicios Médicos.

**Empresa:** Empre S.A.S.

**Institución:** UTU.

**Repositorio:** https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU

**Directorio del frontend:** `prototipos/frontend`

El frontend forma parte de una aplicación de mayor alcance que incluye una API PHP, una base de datos MariaDB y una configuración de despliegue mediante Docker Compose.
