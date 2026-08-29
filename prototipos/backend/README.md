# Instrucciones de configuración de la base de datos

En este README se detallan los pasos necesarios para crear y configurar la base de datos utilizada por el backend de S.I.G.S.M.

El proyecto utiliza MariaDB como sistema gestor de base de datos y XAMPP para disponer de Apache, PHP y MariaDB dentro de la máquina virtual GNU/Linux.

El esquema de la base de datos se encuentra definido mediante scripts SQL dentro del repositorio. Estos scripts crean la base de datos `sigsm`, sus tablas, claves primarias, claves foráneas y demás restricciones necesarias para el funcionamiento del sistema.

## Requisitos previos

Antes de comenzar, es necesario contar con:

- Una máquina virtual GNU/Linux correctamente configurada.
- XAMPP instalado en la máquina virtual.
- Apache y MariaDB disponibles mediante XAMPP.
- Git instalado.
- El repositorio de S.I.G.S.M. clonado dentro de la máquina virtual.
- Una dirección IP estática (192.168.56.10) configurada en la máquina virtual.

La configuración de la máquina virtual, incluyendo la instalación de XAMPP y la asignación de una dirección IP estática, se encuentra documentada en el trabajo correspondiente a la asignatura **Administración de Sistemas Operativos** en la carpeta **Segunda Entrega**.

La IP estática es importante para que el equipo anfitrión pueda comunicarse siempre con la misma dirección del servidor y para que el frontend pueda realizar solicitudes al backend sin que la dirección cambie entre reinicios.

## 1. Iniciar XAMPP

Antes de crear la base de datos se deben iniciar los servicios de XAMPP.

Desde una terminal de la máquina virtual ejecutar:

```bash
sudo /opt/lampp/lampp start
```

Si los servicios se iniciaron correctamente, se mostrará una salida similar a:

```text
Starting XAMPP...
XAMPP: Starting Apache...ok.
XAMPP: Starting MySQL...ok.
```

También se puede consultar el estado de los servicios mediante:

```bash
sudo /opt/lampp/lampp status
```

Apache y MySQL/MariaDB deben aparecer activos antes de continuar.

## 2. Obtener el proyecto

En caso de no tener todavía el repositorio en la máquina virtual, se puede clonar utilizando Git:

```bash
git clone https://github.com/MrGalletah/S.I.G.S.M---Proyecto-UTU.git
```

Luego se debe ingresar a la carpeta correspondiente al backend.

Por ejemplo:

```bash
cd S.I.G.S.M---Proyecto-UTU/Proyecto/backend
```

> La ruta puede variar dependiendo del directorio donde se haya clonado el repositorio.

Dentro del proyecto se encuentran los archivos SQL utilizados para generar la estructura de la base de datos.

# Creación de la base de datos

La base de datos puede crearse de dos maneras:

1. Desde la terminal de la máquina virtual.
2. Utilizando phpMyAdmin.

Ambos métodos generan la misma estructura. Se incluyen las dos alternativas para facilitar la instalación y permitir utilizar el procedimiento que resulte más cómodo.

---

# Opción 1 - Crear la base de datos desde la terminal

## 3. Acceder a MariaDB

Desde la máquina virtual ejecutar:

```bash
/opt/lampp/bin/mysql -u root
```

Si el usuario `root` de MariaDB posee contraseña:

```bash
/opt/lampp/bin/mysql -u root -p
```

Se solicitará la contraseña antes de ingresar.

Si la conexión fue exitosa aparecerá la consola de MariaDB:

```text
MariaDB [(none)]>
```

Para salir se puede utilizar:

```sql
EXIT;
```

## 4. Ejecutar los scripts SQL

La forma más sencilla es ejecutar directamente los archivos SQL desde la terminal.

Es importante ejecutar los esquemas en orden para evitar problemas con claves foráneas.

Si los esquemas se encuentran en:

```text
backend/database
```

se puede ejecutar:

```bash
/opt/lampp/bin/mysql -u root < database/dbSchema_{NumeroDelEsquema}.sql
```

Si el usuario `root` tiene contraseña:

```bash
/opt/lampp/bin/mysql -u root -p < database/dbSchema_{NumeroDelEsquema}.sql
```

Los scripts se encargarán de crear la base de datos `sigsm` y las tablas necesarias.

También es posible ejecutarlo desde dentro de MariaDB.

Primero ingresar:

```bash
/opt/lampp/bin/mysql -u root
```

Luego utilizar:

```sql
SOURCE /ruta/completa/al/proyecto/database/dbSchema_{NumeroDelEsquema}.sql;
```

Por ejemplo:

```sql
SOURCE /home/admin/S.I.G.S.M---Proyecto-UTU/Proyecto/backend/database/dbSchema_01.sql;
```

## 5. Verificar la creación

Una vez ejecutado el script se puede comprobar que la base de datos fue creada mediante:

```sql
SHOW DATABASES;
```

Debe aparecer:

```text
sigsm
```

Luego seleccionar la base:

```sql
USE sigsm;
```

Y consultar las tablas:

```sql
SHOW TABLES;
```

Deberán aparecer las tablas correspondientes a los diferentes módulos del sistema, entre ellas las relacionadas con:

- Funcionarios y roles.
- Categorías y documentos.
- Encuestas y respuestas.
- Vehículos y traslados.
- Estados e historial de traslados.

Para comprobar la estructura de una tabla concreta puede utilizarse, por ejemplo:

```sql
DESCRIBE funcionario;
```

---

# Opción 2 - Crear la base de datos mediante phpMyAdmin

Como alternativa a la terminal, los scripts también pueden cargarse utilizando la interfaz gráfica de phpMyAdmin.

## 6. Acceder a phpMyAdmin

Primero se debe comprobar que XAMPP se encuentre iniciado:

```bash
sudo /opt/lampp/lampp start
```

Desde un navegador web acceder a:

```text
http://IP_DE_LA_VM/phpmyadmin
```

Por ejemplo:

```text
http://192.168.56.10/phpmyadmin
```

La dirección exacta dependerá de la IP estática configurada en la máquina virtual.

> Si phpMyAdmin se encuentra configurado para aceptar únicamente conexiones locales, será necesario habilitar el acceso desde la red utilizada entre el equipo anfitrión y la máquina virtual.

## 7. Importar los archivos SQL

Una vez dentro de phpMyAdmin:

1. Seleccionar la pestaña **Importar**.
2. Presionar **Seleccionar archivo**.
3. Elegir el archivo.
4. Mantener el formato seleccionado como **SQL**.
5. Presionar **Importar**.

No es necesario crear previamente la base `sigsm` si el script contiene las instrucciones:

```sql
CREATE DATABASE IF NOT EXISTS sigsm
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sigsm;
```

Al finalizar, phpMyAdmin deberá mostrar un mensaje indicando que las consultas se ejecutaron correctamente.

## 8. Verificar las tablas desde phpMyAdmin

En el panel izquierdo deberá aparecer la base de datos:

```text
sigsm
```

Al seleccionarla se podrá visualizar la lista de tablas creadas.

Desde esta interfaz también es posible:

- Consultar la estructura de las tablas.
- Visualizar registros.
- Ejecutar consultas SQL.
- Comprobar claves primarias y foráneas.
- Insertar datos de prueba.
- Modificar registros durante el desarrollo.

# Configuración de conexión del backend

Una vez creada la base de datos, el backend debe disponer de las credenciales necesarias para conectarse a MariaDB.

El proyecto utiliza variables de entorno para almacenar esta configuración.

El archivo `.env` deberá contener valores similares a los siguientes:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sigsm
DB_USER=sigsm_app
DB_PASSWORD=CONTRASEÑA
```

La contraseña debe coincidir con la configurada para el usuario de MariaDB.

> El archivo `.env` contiene información propia de cada instalación y no debe subirse al repositorio.

## 9. Crear el usuario utilizado por el backend

Si el usuario `sigsm_app` todavía no existe, puede crearse desde MariaDB.

Ingresar como administrador:

```bash
/opt/lampp/bin/mysql -u root
```

Y ejecutar:

```sql
CREATE USER IF NOT EXISTS 'sigsm_app'@'127.0.0.1'
IDENTIFIED BY 'CONTRASEÑA';

GRANT SELECT, INSERT, UPDATE, DELETE
ON sigsm.*
TO 'sigsm_app'@'127.0.0.1';

FLUSH PRIVILEGES;
```

La contraseña utilizada debe ser la misma configurada posteriormente en el archivo `.env`.

Se utiliza un usuario independiente para la aplicación en lugar de conectar el backend directamente utilizando `root`.

# Verificación de la conexión

Una vez configurada la base de datos y el archivo `.env`, se deben iniciar los servicios:

```bash
sudo /opt/lampp/lampp start
```

Se puede comprobar nuevamente su estado con:

```bash
sudo /opt/lampp/lampp status
```

Una vez iniciado XAMPP es necesario moverse a la carpeta `api` y ejecutar el siguiente comando para que nuestra API empiece a escuchar:

```bash
sudo /opt/lampp/bin/php -S 0.0.0.0:8080 -t public
```

Después se puede acceder a alguno de los endpoints del backend desde el equipo anfitrión utilizando la IP estática de la máquina virtual.

Por ejemplo:

```text
http://IP_DE_LA_VM:8080/categorias
```

Si la configuración es correcta, el backend deberá poder consultar MariaDB y devolver la respuesta correspondiente.

A partir de este momento el frontend podrá consumir la API utilizando la dirección del servidor configurada para el proyecto.

# Datos de prueba

El proyecto incluye archivos SQL destinados únicamente a cargar datos de prueba.

Por ejemplo:

```text
database/data/dataSchema_01.sql
```

Para ejecutarlo desde la terminal:

```bash
/opt/lampp/bin/mysql -u root sigsm < database/dataSchema_01.sql
```

Si el usuario `root` posee contraseña:

```bash
/opt/lampp/bin/mysql -u root -p sigsm < database/dataSchema_01.sql
```

De esta forma se mantiene separada la creación de la estructura de la base de datos de la carga de información utilizada durante las pruebas.

# Comandos útiles

Iniciar XAMPP:

```bash
sudo /opt/lampp/lampp start
```

Detener XAMPP:

```bash
sudo /opt/lampp/lampp stop
```

Reiniciar XAMPP:

```bash
sudo /opt/lampp/lampp restart
```

Consultar el estado:

```bash
sudo /opt/lampp/lampp status
```

Acceder a MariaDB:

```bash
/opt/lampp/bin/mysql -u root
```

Acceder solicitando contraseña:

```bash
/opt/lampp/bin/mysql -u root -p
```

Ejecutar el esquema de la base de datos:

```bash
/opt/lampp/bin/mysql -u root < database/schema.sql
```

Ejecutar datos de prueba:

```bash
/opt/lampp/bin/mysql -u root sigsm < database/seed.sql
```

Ver las bases de datos:

```sql
SHOW DATABASES;
```

Seleccionar S.I.G.S.M.:

```sql
USE sigsm;
```

Ver las tablas:

```sql
SHOW TABLES;
```

Consultar la estructura de una tabla:

```sql
DESCRIBE funcionario;
```

# Solución de problemas

Si MariaDB no se encuentra iniciado:

```bash
sudo /opt/lampp/lampp startmysql
```

Si se realizaron cambios en la configuración de Apache:

```bash
sudo /opt/lampp/lampp restart
```

Si el frontend no puede comunicarse con el backend, comprobar:

- Que la máquina virtual se encuentre encendida.
- Que mantenga la IP estática configurada.
- Que Apache esté iniciado.
- Que MariaDB esté iniciado.
- Que el firewall permita las conexiones necesarias.
- Que la URL utilizada por el frontend corresponda con la IP de la máquina virtual.
- Que las credenciales del archivo `.env` sean correctas.
- Que la base de datos `sigsm` y sus tablas hayan sido creadas correctamente.
